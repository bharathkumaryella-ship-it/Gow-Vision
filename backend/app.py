"""
GowVision - Cattle Breed Detection API
Simplified version with only breed detection functionality
"""

from flask import Flask, request, jsonify, g, has_request_context
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_limiter.errors import RateLimitExceeded

import os
import uuid
import time
from datetime import datetime, timezone
from pathlib import Path
from dotenv import load_dotenv

from errors import (
    GowVisionError, ValidationError, ModelNotLoadedError, 
    ImageProcessingError, PredictionError, UnsupportedFileTypeError, 
    FileSizeError, InvalidImageError, InternalServerError
)
from logging_utils import (
    setup_logging, RequestLogger, SecurityLogger, OperationLogger,
    PerformanceLogger, ErrorAnalytics
)
from env_validator import validate_env_on_startup

load_dotenv(override=True)

# Validate environment variables on startup
validate_env_on_startup()

# Set up cattle dataset path
if not os.getenv('CATTLE_DATASET_PATH'):
    cattle_dataset_path = Path(__file__).parent.parent / 'Cattle Breeds' / 'CATTLE_DATASET.md'
    os.environ['CATTLE_DATASET_PATH'] = str(cattle_dataset_path)

from breed_detection_blueprint import breed_bp
from ear_tag_blueprint import ear_tag_bp
from health_analysis_blueprint import health_analysis_bp
from government_schemes_blueprint import schemes_bp
from stats_blueprint import stats_bp
from tts_blueprint import tts_bp
from models import db
from scheduler import init_scheduler, shutdown_scheduler

app = Flask(__name__)

# Initialize SQLAlchemy
basedir = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', f'sqlite:///{os.path.join(basedir, "gowvision.db")}')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)

# Create database tables and initialize if needed
with app.app_context():
    db.create_all()
    # Initialize schemes if database is empty
    from models import GovernmentScheme
    try:
        if GovernmentScheme.query.count() == 0:
            from government_schemes_blueprint import initialize_default_schemes
            initialize_default_schemes()
    except Exception as e:
        print(f"Error initializing database: {e}")

# Configure CORS with environment-aware origins
cors_origins_str = os.getenv('CORS_ORIGINS', 'http://localhost:5173,http://localhost:5174,http://localhost:3000,http://127.0.0.1:5173,http://127.0.0.1:5174')
# Ensure development ports are always included
dev_origins = {'http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000', 'http://127.0.0.1:5173', 'http://127.0.0.1:5174'}
cors_origins_list = [o.strip() for o in cors_origins_str.split(',')]
cors_origins_list = list(set(cors_origins_list + list(dev_origins)))  # Merge and remove duplicates

if os.getenv('FLASK_ENV') == 'production' and all(o in dev_origins for o in cors_origins_list):
    logger.warning("[WARNING] Using development CORS origins in production! Set CORS_ORIGINS environment variable.")

CORS(app, resources={
    r"/api/*": {
        "origins": cors_origins_list if cors_origins_str != '*' else '*',
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type"],
        "expose_headers": ["Content-Type"],
        "supports_credentials": True,
        "max_age": 3600,
        "automatic_options": True,
        "vary_header": True
    }
})

log_file = os.getenv('LOG_FILE', 'logs/gowvision.log')
log_level = os.getenv('LOG_LEVEL', 'INFO')
use_json_logging = os.getenv('USE_JSON_LOGGING', 'False').lower() == 'true'

log_dir = os.path.dirname(log_file) if os.path.dirname(log_file) else 'logs'
os.makedirs(log_dir, exist_ok=True)

logger = setup_logging(__name__, log_file, log_level, use_json_logging)

request_logger = RequestLogger(logger)
security_logger = SecurityLogger(logger)
operation_logger = OperationLogger(logger)
performance_logger = PerformanceLogger(logger)
error_analytics = ErrorAnalytics(logger)

logger.info("=" * 60)
logger.info("GowVision Breed Detection API Started")
logger.info(f"Environment: {os.getenv('FLASK_ENV', 'production')}")
logger.info(f"Logging level: {log_level}")
logger.info("=" * 60)

try:
    import sys
    if sys.stdout and hasattr(sys.stdout, 'reconfigure'):
        sys.stdout.reconfigure(encoding='utf-8')
except (AttributeError, UnicodeError):
    pass

app.config['ENV'] = os.getenv('FLASK_ENV', 'production')
app.config['DEBUG'] = app.config['ENV'] == 'development'
app.config['MAX_CONTENT_LENGTH'] = int(os.getenv('MAX_CONTENT_LENGTH', 16 * 1024 * 1024))

try:
    limiter = Limiter(
        app=app,
        key_func=get_remote_address,
        default_limits=["200 per day", "50 per hour"],
        storage_uri=os.getenv('RATE_LIMIT_STORAGE_URL', 'memory://'),
        strategy="moving-window"
    )
    logger.info("[OK] Rate limiter initialized")
except Exception as e:
    logger.warning(f"[WARNING] Rate limiter initialization failed: {e}")
    class DummyLimiter:
        def limit(self, *args, **kwargs):
            def decorator(f):
                return f
            return decorator
    limiter = DummyLimiter()

logger.info(f"[OK] Application initialized in {app.config['ENV']} mode")

@app.before_request
def before_request():
    """Track request metadata"""
    g.request_id = str(uuid.uuid4())
    g.start_time = time.time()
    
    if app.config['DEBUG']:
        logger.debug(f"[{g.request_id}] {request.method} {request.path}")


@app.after_request
def after_request(response):
    """Log response metrics"""
    if hasattr(g, 'start_time'):
        duration_ms = (time.time() - g.start_time) * 1000
        if duration_ms > 1000:
            performance_logger.log_slow_request(
                request.endpoint or 'unknown',
                request.method,
                duration_ms
            )
    return response


@app.errorhandler(GowVisionError)
def handle_gowvision_error(error):
    """Handle custom GowVision errors"""
    error_dict = error.to_dict()
    
    if error.status_code >= 500:
        logger.error(f"[{g.request_id if has_request_context() else 'N/A'}] {error}")
        error_analytics.track_error(error.code)
    else:
        logger.warning(f"[{g.request_id if has_request_context() else 'N/A'}] {error}")
    
    return jsonify(error_dict), error.status_code


@app.errorhandler(ValidationError)
def handle_validation_error(error):
    """Handle validation errors"""
    error_dict = error.to_dict()
    logger.warning(f"[{g.request_id if has_request_context() else 'N/A'}] Validation error: {error}")
    error_analytics.track_error('VALIDATION_ERROR')
    return jsonify(error_dict), error.status_code


@app.errorhandler(RateLimitExceeded)
def handle_rate_limit(error):
    """Handle rate limit exceeded"""
    security_logger.log_rate_limit_hit()
    error_analytics.track_error('RATE_LIMIT_EXCEEDED')
    return jsonify({
        'error': 'RATE_LIMIT_EXCEEDED',
        'message': 'Too many requests. Please try again later.',
        'status_code': 429
    }), 429


@app.errorhandler(404)
def handle_not_found(error):
    """Handle 404 errors"""
    logger.debug(f"[{g.request_id if has_request_context() else 'N/A'}] 404: {request.path}")
    return jsonify({
        'error': 'NOT_FOUND',
        'message': f'Endpoint {request.method} {request.path} not found',
        'status_code': 404
    }), 404


@app.errorhandler(500)
def handle_internal_error(error):
    """Handle 500 errors"""
    logger.error(f"[{g.request_id if has_request_context() else 'N/A'}] Internal error: {str(error)}", exc_info=True)
    error_analytics.track_error('INTERNAL_ERROR')
    return jsonify({
        'error': 'INTERNAL_SERVER_ERROR',
        'message': 'An internal error occurred. Please try again later.',
        'status_code': 500,
        'request_id': g.request_id if has_request_context() else 'N/A'
    }), 500


@app.route('/', methods=['GET'])
def root():
    """Root endpoint - API information"""
    return jsonify({
        'name': 'GowVision Breed Detection API',
        'version': '1.0.0',
        'description': 'Cattle breed detection using machine learning',
        'status': 'running',
        'endpoints': {
            'health': '/api/health',
            'breed_detection': '/api/cattle/detect',
            'breed_detection_base64': '/api/cattle/detect-base64',
            'breed_health': '/api/cattle/health',
            'health_analysis': '/api/health-analysis/analyze',
            'government_schemes': '/api/schemes',
            'stats_overview': '/api/stats/overview',
            'stats_breed': '/api/stats/breed-detection',
            'stats_health': '/api/stats/health-monitoring',
            'stats_schemes': '/api/stats/government-schemes',
            'stats_ear_tag': '/api/stats/ear-tag-search',
            'ear_tag_search': '/api/cattle-search/tag/<tag_id>'
        }
    }), 200


@app.route('/api/health', methods=['GET'])
@limiter.limit("100 per hour")
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'version': '1.0.0',
        'timestamp': datetime.now(timezone.utc).isoformat()
    }), 200


@app.route('/api/health/models', methods=['GET'])
@limiter.limit("50 per hour")
def health_check_models():
    """Check if ML models are properly loaded and functional"""
    try:
        import torch
        from ml_detector import MLBreedDetector
        
        # Attempt to verify model is loaded
        detector = MLBreedDetector()
        
        models_status = {
            'status': 'healthy',
            'models': {
                'breed_classifier': 'loaded',
                'class_labels': 'loaded' if hasattr(detector, 'class_labels') and detector.class_labels else 'missing'
            },
            'device': str(detector.device),
            'cuda_available': torch.cuda.is_available()
        }
        
        # Check Ollama availability
        from health_analysis_blueprint import check_ollama_available
        ollama_available = check_ollama_available()
        models_status['ollama'] = 'available' if ollama_available else 'unavailable'
        
        all_healthy = all(v == 'loaded' or v == 'available' for v in 
                         [models_status['models'].get('breed_classifier'), 
                          models_status['models'].get('class_labels'),
                          models_status['ollama']])
        
        return jsonify({
            'status': 'healthy' if all_healthy else 'degraded',
            'models': models_status,
            'timestamp': datetime.now(timezone.utc).isoformat()
        }), 200 if all_healthy else 503
        
    except Exception as e:
        logger.error(f"Model health check failed: {str(e)}", exc_info=True)
        return jsonify({
            'status': 'unhealthy',
            'error': str(e),
            'timestamp': datetime.now(timezone.utc).isoformat()
        }), 503


app.register_blueprint(health_analysis_bp)
app.register_blueprint(ear_tag_bp, url_prefix='/api/cattle-search')
app.register_blueprint(breed_bp)
app.register_blueprint(schemes_bp)
app.register_blueprint(stats_bp)
logger.info("[OK] About to register TTS blueprint")
app.register_blueprint(tts_bp)
logger.info("[OK] TTS blueprint registered successfully")

# Create database tables and initialize if needed
# (Already handled at startup)

if __name__ == '__main__':
    logger.info("="*50)
    logger.info("[STARTUP] GowVision Breed Detection API Starting")
    logger.info("="*50)
    logger.info(f"Environment: {app.config['ENV']}")
    logger.info(f"Debug Mode: {app.config['DEBUG']}")
    logger.info("="*50)
    
    # Initialize scheduler for daily scheme updates
    init_scheduler(app)
    
    try:
        app.run(
            host='0.0.0.0',
            port=5000,
            debug=app.config['DEBUG'],
            use_reloader=app.config['DEBUG']
        )
    finally:
        shutdown_scheduler()

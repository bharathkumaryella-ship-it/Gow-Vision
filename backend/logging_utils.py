"""
GowVision - Advanced Logging Utilities
Request/Response logging, Performance monitoring, Error analytics
"""

import logging
import json
import time
from datetime import datetime
from functools import wraps
from flask import request, g, has_request_context


class RequestIDFilter(logging.Filter):
    """Add request ID to all log records"""
    
    def filter(self, record):
        if has_request_context():
            record.request_id = g.get('request_id', 'N/A')
        else:
            record.request_id = 'N/A'
        return True


class JSONFormatter(logging.Formatter):
    """Format logs as JSON for better parsing"""
    
    def format(self, record):
        log_data = {
            'timestamp': datetime.fromtimestamp(record.created).isoformat(),
            'level': record.levelname,
            'logger': record.name,
            'message': record.getMessage(),
            'request_id': getattr(record, 'request_id', 'N/A')
        }
        
        # Add extra fields if present
        if hasattr(record, 'user_id'):
            log_data['user_id'] = record.user_id
        if hasattr(record, 'endpoint'):
            log_data['endpoint'] = record.endpoint
        if hasattr(record, 'method'):
            log_data['method'] = record.method
        if hasattr(record, 'status_code'):
            log_data['status_code'] = record.status_code
        if hasattr(record, 'duration_ms'):
            log_data['duration_ms'] = record.duration_ms
        if hasattr(record, 'ip_address'):
            log_data['ip_address'] = record.ip_address
        
        return json.dumps(log_data)


def setup_logging(logger_name, log_file, log_level='INFO', use_json=False):
    """
    Setup advanced logging configuration
    
    Args:
        logger_name: Logger name
        log_file: Path to log file
        log_level: Logging level (DEBUG, INFO, WARNING, ERROR)
        use_json: Whether to use JSON formatting
    
    Returns:
        Configured logger instance
    """
    logger = logging.getLogger(logger_name)
    logger.setLevel(getattr(logging, log_level))
    
    # Remove existing handlers
    logger.handlers = []
    
    # File handler
    file_handler = logging.FileHandler(log_file)
    file_handler.setLevel(getattr(logging, log_level))
    file_handler.addFilter(RequestIDFilter())
    
    if use_json:
        formatter = JSONFormatter()
    else:
        formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - [%(request_id)s] - %(message)s'
        )
    
    file_handler.setFormatter(formatter)
    logger.addHandler(file_handler)
    
    # Console handler
    console_handler = logging.StreamHandler()
    console_handler.setLevel(getattr(logging, log_level))
    console_handler.addFilter(RequestIDFilter())
    
    if use_json:
        console_handler.setFormatter(JSONFormatter())
    else:
        console_handler.setFormatter(logging.Formatter(
            '%(asctime)s - %(levelname)s - [%(request_id)s] - %(message)s'
        ))
    
    logger.addHandler(console_handler)
    
    return logger


# ============================================
# REQUEST/RESPONSE LOGGING
# ============================================

class RequestLogger:
    """Log and track HTTP requests"""
    
    def __init__(self, logger):
        self.logger = logger
    
    def log_request(self, method, endpoint, user_id=None, request_data=None):
        """Log incoming request"""
        ip_address = request.remote_addr
        
        log_entry = {
            'event': 'REQUEST_RECEIVED',
            'method': method,
            'endpoint': endpoint,
            'ip_address': ip_address,
            'timestamp': datetime.utcnow().isoformat()
        }
        
        if user_id:
            log_entry['user_id'] = user_id
        
        if request_data and isinstance(request_data, dict):
            # Don't log sensitive data
            safe_data = {k: v for k, v in request_data.items() 
                        if k not in ['password', 'token', 'secret']}
            if safe_data:
                log_entry['data'] = safe_data
        
        self.logger.debug(f"Incoming request: {json.dumps(log_entry)}")
        return log_entry
    
    def log_response(self, endpoint, method, status_code, duration_ms, user_id=None):
        """Log outgoing response"""
        log_entry = {
            'event': 'RESPONSE_SENT',
            'method': method,
            'endpoint': endpoint,
            'status_code': status_code,
            'duration_ms': duration_ms,
            'timestamp': datetime.utcnow().isoformat()
        }
        
        if user_id:
            log_entry['user_id'] = user_id
        
        # Log level based on status code
        if 400 <= status_code < 500:
            self.logger.warning(f"Client error response: {json.dumps(log_entry)}")
        elif status_code >= 500:
            self.logger.error(f"Server error response: {json.dumps(log_entry)}")
        else:
            self.logger.info(f"Successful response: {json.dumps(log_entry)}")


# ============================================
# PERFORMANCE MONITORING
# ============================================

class PerformanceLogger:
    """Monitor and log performance metrics"""
    
    def __init__(self, logger):
        self.logger = logger
        self.slow_request_threshold_ms = 1000  # 1 second
    
    def log_slow_request(self, endpoint, method, duration_ms, user_id=None):
        """Log slow requests"""
        if duration_ms > self.slow_request_threshold_ms:
            log_entry = {
                'event': 'SLOW_REQUEST',
                'endpoint': endpoint,
                'method': method,
                'duration_ms': duration_ms,
                'threshold_ms': self.slow_request_threshold_ms
            }
            if user_id:
                log_entry['user_id'] = user_id
            
            self.logger.warning(f"Slow request detected: {json.dumps(log_entry)}")
    
    def log_database_query(self, query, duration_ms, user_id=None):
        """Log database queries"""
        if duration_ms > 100:  # Log queries taking more than 100ms
            log_entry = {
                'event': 'SLOW_QUERY',
                'query_type': query,
                'duration_ms': duration_ms
            }
            if user_id:
                log_entry['user_id'] = user_id
            
            self.logger.debug(f"Database query: {json.dumps(log_entry)}")


# ============================================
# SECURITY LOGGING
# ============================================

class SecurityLogger:
    """Log security-related events"""
    
    def __init__(self, logger):
        self.logger = logger
    
    def log_login_attempt(self, mobile_number, success=True, reason=None):
        """Log login attempts"""
        log_entry = {
            'event': 'LOGIN_ATTEMPT',
            'mobile_number': mobile_number,
            'success': success,
            'ip_address': request.remote_addr if has_request_context() else 'N/A',
            'timestamp': datetime.utcnow().isoformat()
        }
        
        if reason:
            log_entry['reason'] = reason
        
        level = self.logger.info if success else self.logger.warning
        level(f"Login attempt: {json.dumps(log_entry)}")
    
    def log_failed_login(self, mobile_number, attempt_number=None, locked=False):
        """Log failed login with attempt tracking"""
        log_entry = {
            'event': 'FAILED_LOGIN',
            'mobile_number': mobile_number,
            'ip_address': request.remote_addr if has_request_context() else 'N/A',
            'timestamp': datetime.utcnow().isoformat()
        }
        
        if attempt_number:
            log_entry['attempt_number'] = attempt_number
        if locked:
            log_entry['account_locked'] = True
        
        self.logger.warning(f"Failed login: {json.dumps(log_entry)}")
    
    def log_registration(self, mobile_number, success=True):
        """Log user registration"""
        log_entry = {
            'event': 'USER_REGISTRATION',
            'mobile_number': mobile_number,
            'success': success,
            'ip_address': request.remote_addr if has_request_context() else 'N/A',
            'timestamp': datetime.utcnow().isoformat()
        }
        
        level = self.logger.info if success else self.logger.warning
        level(f"User registration: {json.dumps(log_entry)}")
    
    def log_rate_limit_hit(self, mobile_number=None, user_id=None):
        """Log rate limit exceeded"""
        log_entry = {
            'event': 'RATE_LIMIT_EXCEEDED',
            'endpoint': request.endpoint if has_request_context() else 'N/A',
            'ip_address': request.remote_addr if has_request_context() else 'N/A',
            'timestamp': datetime.utcnow().isoformat()
        }
        
        if mobile_number:
            log_entry['mobile_number'] = mobile_number
        if user_id:
            log_entry['user_id'] = user_id
        
        self.logger.warning(f"Rate limit: {json.dumps(log_entry)}")
    
    def log_invalid_request(self, reason, user_id=None):
        """Log invalid/suspicious requests"""
        log_entry = {
            'event': 'INVALID_REQUEST',
            'reason': reason,
            'ip_address': request.remote_addr if has_request_context() else 'N/A',
            'endpoint': request.endpoint if has_request_context() else 'N/A',
            'timestamp': datetime.utcnow().isoformat()
        }
        
        if user_id:
            log_entry['user_id'] = user_id
        
        self.logger.warning(f"Invalid request: {json.dumps(log_entry)}")


# ============================================
# OPERATION LOGGING
# ============================================

class OperationLogger:
    """Log business operations"""
    
    def __init__(self, logger):
        self.logger = logger
    
    def log_prediction(self, user_id, breed, confidence, success=True):
        """Log breed prediction"""
        log_entry = {
            'event': 'BREED_PREDICTION',
            'user_id': user_id,
            'breed': breed,
            'confidence': confidence,
            'success': success,
            'timestamp': datetime.utcnow().isoformat()
        }
        
        level = self.logger.info if success else self.logger.warning
        level(f"Breed prediction: {json.dumps(log_entry)}")
    
    def log_data_deletion(self, user_id, resource_type, resource_id):
        """Log data deletion"""
        log_entry = {
            'event': 'DATA_DELETED',
            'user_id': user_id,
            'resource_type': resource_type,
            'resource_id': resource_id,
            'timestamp': datetime.utcnow().isoformat()
        }
        
        self.logger.warning(f"Data deletion: {json.dumps(log_entry)}")


# ============================================
# DECORATORS FOR AUTOMATIC LOGGING
# ============================================

def log_operation(operation_name, log_sensitive_data=False):
    """Decorator to automatically log operations"""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            from flask import g
            
            logger = logging.getLogger(__name__)
            start_time = time.time()
            
            try:
                result = f(*args, **kwargs)
                duration_ms = (time.time() - start_time) * 1000
                
                log_entry = {
                    'operation': operation_name,
                    'duration_ms': f"{duration_ms:.2f}",
                    'status': 'success'
                }
                
                logger.info(f"Operation completed: {json.dumps(log_entry)}")
                return result
            
            except Exception as e:
                duration_ms = (time.time() - start_time) * 1000
                
                log_entry = {
                    'operation': operation_name,
                    'duration_ms': f"{duration_ms:.2f}",
                    'status': 'error',
                    'error': str(e)
                }
                
                logger.error(f"Operation failed: {json.dumps(log_entry)}")
                raise
        
        return decorated_function
    return decorator


def track_request():
    """Decorator to track request metrics"""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            from flask import g
            
            logger = logging.getLogger(__name__)
            start_time = time.time()
            
            result = f(*args, **kwargs)
            
            duration_ms = (time.time() - start_time) * 1000
            
            # Log slow requests
            if duration_ms > 1000:
                logger.warning(f"Slow request: {request.endpoint} took {duration_ms:.2f}ms")
            
            return result
        
        return decorated_function
    return decorator


# ============================================
# ERROR ANALYTICS
# ============================================

class ErrorAnalytics:
    """Collect and analyze error statistics"""
    
    def __init__(self, logger):
        self.logger = logger
        self.error_counts = {}
        self.user_errors = {}
    
    def track_error(self, error_type, user_id=None):
        """Track error occurrences"""
        # Global error tracking
        if error_type not in self.error_counts:
            self.error_counts[error_type] = 0
        self.error_counts[error_type] += 1
        
        # Per-user error tracking
        if user_id:
            if user_id not in self.user_errors:
                self.user_errors[user_id] = {}
            if error_type not in self.user_errors[user_id]:
                self.user_errors[user_id][error_type] = 0
            self.user_errors[user_id][error_type] += 1
    
    def get_error_summary(self):
        """Get error statistics"""
        return {
            'global_errors': self.error_counts,
            'total_errors': sum(self.error_counts.values()),
            'unique_errors': len(self.error_counts)
        }
    
    def log_error_summary(self):
        """Log error statistics"""
        summary = self.get_error_summary()
        self.logger.info(f"Error analytics: {json.dumps(summary)}")
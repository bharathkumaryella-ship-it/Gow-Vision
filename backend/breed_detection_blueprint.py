"""
Breed Detection API Blueprint
Handles cattle breed detection using ML model
"""

from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename
import os
import logging
from ml_detector import MLBreedDetector

breed_bp = Blueprint('breed_detection', __name__, url_prefix='/api/cattle')
logger = logging.getLogger(__name__)

# Breed details database
BREED_DETAILS = {
    "Gir": {
        "origin": "Gujarat, India",
        "description": "The Gir is one of the principal Zebu breeds originating in India. It has been used locally in the improvement of other breeds including the Red Sindhi and the Sahiwal.",
        "characteristics": [
            "High milk production capacity",
            "Long, pendulous ears",
            "Convex forehead",
            "Resistant to tropical diseases and hot temperatures"
        ],
        "status": "Currently being trained in AI model"
    },
    "Sahiwal": {
        "origin": "Punjab, Pakistan/India",
        "description": "Sahiwal is a breed of Zebu cattle, primarily used in dairy production. They are widely kept in India and Pakistan and have been exported to many countries.",
        "characteristics": [
            "Reddish brown color",
            "Large hump in males",
            "Heavy dewlap",
            "Best indigenous dairy breed in India"
        ],
        "status": "Currently being trained in AI model"
    },
    "Holstein Friesian": {
        "origin": "Netherlands",
        "description": "Holstein Friesians are a breed of dairy cattle originating from the Dutch provinces of North Holland and Friesland. They are known as the world's highest-production dairy animals.",
        "characteristics": [
            "Distinctive black and white markings",
            "Very high milk yield",
            "Large body size",
            "Efficient converter of forage to milk"
        ],
        "status": "AI Model Supported ✓"
    },
    "Jersey": {
        "origin": "Jersey, Channel Islands",
        "description": "The Jersey is a British breed of small dairy cattle from Jersey, in the Channel Islands. It is highly productive and its milk is high in butterfat.",
        "characteristics": [
            "Fawn or light brown color",
            "Small stature",
            "High butterfat content in milk",
            "Heat tolerant and adaptable"
        ],
        "status": "AI Model Supported ✓"
    },
    "Red Sindhi": {
        "origin": "Sindh, Pakistan",
        "description": "Red Sindhi cattle are the most popular of all Zebu dairy breeds. The breed originated in the Sindh province of Pakistan, and they are widely kept for milk production across India.",
        "characteristics": [
            "Deep red color",
            "High heat tolerance",
            "Resistant to ticks",
            "Good milk yield for indigenous breeds"
        ],
        "status": "Currently being trained in AI model"
    },
    "Ayrshire": {
        "origin": "Ayrshire, Scotland",
        "description": "Ayrshire cattle are a breed of dairy cattle from Ayrshire in southwest Scotland. They are known for their ability to produce quality milk and their hardiness.",
        "characteristics": [
            "Red and white markings",
            "Strong, well-attached udders",
            "Hardy and adaptable to different climates",
            "Excellent foraging ability"
        ],
        "status": "AI Model Supported ✓"
    },
    "Brown Swiss": {
        "origin": "Switzerland",
        "description": "The Brown Swiss is a North American breed of dairy cattle, derived from the Braunvieh of Switzerland. It is large and robust, and its milk is ideal for cheese making.",
        "characteristics": [
            "Solid brown color",
            "Large, sturdy frame",
            "Docile temperament",
            "High protein-to-fat ratio in milk"
        ],
        "status": "AI Model Supported ✓"
    },
    "Red Dane": {
        "origin": "Denmark",
        "description": "Red Dane cattle, also known as Red Danish, are a major dairy breed in northern Europe. They were developed in Denmark from local cattle crossed with Angeln and Schleswig cattle.",
        "characteristics": [
            "Solid red color",
            "High milk production",
            "Good fat and protein content",
            "Strong and hardy"
        ],
        "status": "AI Model Supported ✓"
    }
}

ml_detector = None

def init_ml_detector():
    """Initialize the ML breed detector"""
    global ml_detector
    try:
        ml_detector = MLBreedDetector()
        if ml_detector.model is not None:
            logger.info("ML breed detector initialized successfully")
        else:
            logger.warning("ML model failed to load")
            ml_detector = None
    except Exception as e:
        logger.error(f"Failed to initialize ML breed detector: {str(e)}")
        ml_detector = None

def get_ml_detector():
    """Get or initialize the ML detector"""
    global ml_detector
    if ml_detector is None:
        init_ml_detector()
    return ml_detector

MAX_FILE_SIZE = 16 * 1024 * 1024

def allowed_file(filename):
    """Check if file has an allowed extension"""
    ALLOWED_EXTENSIONS = {'jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'}
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@breed_bp.route('/detect', methods=['POST'])
def detect_cattle_breed():
    """
    Detect cattle breed from uploaded image
    
    Expected:
    - multipart/form-data with 'image' file
    
    Returns:
    - breed_name: String
    - confidence: String (High/Medium/Low)
    - confidence_score: Float
    - predictions: List of top predictions
    """
    try:
        if 'image' not in request.files:
            return jsonify({
                'error': 'No image provided',
                'message': 'Please upload a cattle image',
                'status': 400
            }), 400
        
        file = request.files['image']
        
        if file.filename == '':
            return jsonify({
                'error': 'No file selected',
                'message': 'Please select a file',
                'status': 400
            }), 400
        
        if not allowed_file(file.filename):
            return jsonify({
                'error': 'Invalid file type',
                'message': 'Allowed types: JPG, JPEG, PNG, GIF, BMP, WEBP',
                'status': 400
            }), 400
        
        detector = get_ml_detector()
        if detector is None or detector.model is None:
            return jsonify({
                'error': 'Service unavailable',
                'message': 'ML model not available. Please contact support.',
                'status': 503
            }), 503
        
        temp_dir = os.path.join(os.path.dirname(__file__), 'temp_uploads')
        os.makedirs(temp_dir, exist_ok=True)
        
        filename = secure_filename(file.filename)
        filepath = os.path.join(temp_dir, filename)
        
        file.save(filepath)
        
        # Check if user wants TTA (Test-Time Augmentation) - default: True for better confidence
        use_tta = request.form.get('use_tta', 'true').lower() == 'true'
        
        # Use strict cattle validation
        result = detector.detect_breed_with_validation(filepath, use_tta=use_tta)
        
        try:
            os.remove(filepath)
        except:
            pass
        
        status_code = result.get('status', 500)
        
        if status_code == 200:
            breed_name = result.get('breed_name')
            success = result.get('success', True)
            
            if not success:
                return jsonify({
                    'success': False,
                    'message': result.get('message', 'Detection failed to meet confidence threshold'),
                    'confidence_score': result.get('confidence_score'),
                    'status': 200
                }), 200
                
            details = BREED_DETAILS.get(breed_name, {
                "origin": "Unknown",
                "description": f"Information for {breed_name} breed is being updated.",
                "characteristics": []
            })
            
            return jsonify({
                'success': True,
                'breed': breed_name,
                'breed_name': breed_name,
                'confidence': result.get('confidence'),
                'confidence_score': result.get('confidence_score'),
                'origin': details.get('origin'),
                'description': details.get('description'),
                'characteristics': details.get('characteristics'),
                'inference_mode': result.get('inference_mode', 'TTA (Test-Time Augmentation)'),
                'model_info': result.get('model_info', {})
            }), 200
        elif status_code == 400:
            return jsonify({
                'error': result.get('error', 'Invalid input'),
                'message': result.get('message', 'Please provide a valid cattle image'),
                'status': 400
            }), 400
        else:
            return jsonify({
                'error': result.get('error', 'Detection failed'),
                'message': result.get('message', 'Failed to detect cattle breed'),
                'status': 500
            }), 500
        
    except Exception as e:
        logger.error(f"Error in cattle detection endpoint: {str(e)}", exc_info=True)
        return jsonify({
            'error': 'Internal server error',
            'message': str(e),
            'status': 500
        }), 500

@breed_bp.route('/detect-base64', methods=['POST'])
def detect_cattle_breed_base64():
    """
    Detect cattle breed from base64 encoded image
    
    Expected JSON:
    {
        "image_data": "base64 encoded image",
        "image_format": "jpeg|png|gif|webp" (optional, default: jpeg)
    }
    
    Returns:
    - breed_name: String
    - confidence: String (High/Medium/Low)
    - confidence_score: Float
    - predictions: List of top predictions
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                'error': 'No JSON data provided',
                'message': 'Please send image data as JSON',
                'status': 400
            }), 400
        
        if 'image_data' not in data:
            return jsonify({
                'error': 'Missing image_data',
                'message': 'Please provide base64 encoded image',
                'status': 400
            }), 400
        
        image_data = data.get('image_data')
        image_format = data.get('image_format', 'jpeg').lower()
        
        if not isinstance(image_data, str):
            return jsonify({
                'error': 'Invalid image_data',
                'message': 'image_data must be a string',
                'status': 400
            }), 400
        
        detector = get_ml_detector()
        if detector is None or detector.model is None:
            return jsonify({
                'error': 'Service unavailable',
                'message': 'ML model not available. Please contact support.',
                'status': 503
            }), 503
        
        # Check if user wants TTA (Test-Time Augmentation) - default: True for better confidence
        use_tta = data.get('use_tta', True)
        if isinstance(use_tta, str):
            use_tta = use_tta.lower() == 'true'
        
        # Use strict cattle validation
        result = detector.detect_breed_from_base64_with_validation(image_data, image_format, use_tta=use_tta)
        
        status_code = result.get('status', 500)
        
        if status_code == 200:
            breed_name = result.get('breed_name')
            success = result.get('success', True)
            
            if not success:
                return jsonify({
                    'success': False,
                    'message': result.get('message', 'Detection failed to meet confidence threshold'),
                    'confidence_score': result.get('confidence_score'),
                    'status': 200
                }), 200
                
            details = BREED_DETAILS.get(breed_name, {
                "origin": "Unknown",
                "description": f"Information for {breed_name} breed is being updated.",
                "characteristics": []
            })
            
            return jsonify({
                'success': True,
                'breed': breed_name,
                'breed_name': breed_name,
                'confidence': result.get('confidence'),
                'confidence_score': result.get('confidence_score'),
                'origin': details.get('origin'),
                'description': details.get('description'),
                'characteristics': details.get('characteristics'),
                'inference_mode': result.get('inference_mode', 'TTA (Test-Time Augmentation)'),
                'model_info': result.get('model_info', {})
            }), 200
        elif status_code == 400:
            return jsonify({
                'error': result.get('error', 'Invalid input'),
                'message': result.get('message', 'Please provide a valid cattle image'),
                'status': 400
            }), 400
        else:
            return jsonify({
                'error': result.get('error', 'Detection failed'),
                'message': result.get('message', 'Failed to detect cattle breed'),
                'status': 500
            }), 500
        
    except Exception as e:
        logger.error(f"Error in base64 cattle detection endpoint: {str(e)}", exc_info=True)
        return jsonify({
            'error': 'Internal server error',
            'message': str(e),
            'status': 500
        }), 500

@breed_bp.route('/supported-breeds', methods=['GET'])
def get_supported_breeds():
    """Get list of all supported cattle breeds and their AI model support status"""
    try:
        detector = get_ml_detector()
        
        # Get the breeds that the AI model can detect
        ai_supported_breeds = set()
        if detector and detector.class_labels:
            for label in detector.class_labels.values():
                # Clean up label (remove " cattle" suffix)
                clean_label = label.replace(' cattle', '').strip()
                ai_supported_breeds.add(clean_label)
        
        # Build response with all breeds and their support status
        breeds_response = []
        for breed_name, breed_info in BREED_DETAILS.items():
            breeds_response.append({
                'name': breed_name,
                'origin': breed_info.get('origin'),
                'ai_supported': breed_name in ai_supported_breeds,
                'status': breed_info.get('status', 'Unknown'),
                'characteristics': breed_info.get('characteristics', [])
            })
        
        return jsonify({
            'success': True,
            'total_breeds': len(breeds_response),
            'ai_model_capacity': len(ai_supported_breeds),
            'breeds': breeds_response,
            'message': 'Indian breeds (Gir, Sahiwal, Red Sindhi) are being trained. Currently supports European dairy breeds.'
        }), 200
    except Exception as e:
        logger.error(f"Error fetching supported breeds: {str(e)}")
        return jsonify({
            'error': 'Failed to fetch supported breeds',
            'message': str(e)
        }), 500

@breed_bp.route('/health', methods=['GET'])
def health_check():
    """Health check for cattle detection service"""
    detector = get_ml_detector()
    ml_healthy = detector is not None and detector.model is not None
    
    return jsonify({
        'service': 'cattle_detection',
        'status': 'healthy' if ml_healthy else 'unavailable',
        'ready': ml_healthy,
        'ml_model': 'available' if ml_healthy else 'unavailable',
        'classes': len(detector.class_labels) if detector else 0
    }), 200 if ml_healthy else 503

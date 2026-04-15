"""
Health and Disease Analysis Blueprint
Handles cattle health and disease analysis using Ollama with Qwen model (multimodal support)
Includes voice-based analysis with Speech-to-Text (Whisper) and Text-to-Speech
"""

from flask import Blueprint, request, jsonify
from ollama import Client
from werkzeug.utils import secure_filename
import logging
import os
import base64
import io
import tempfile
import whisper
import pyttsx3
from pathlib import Path
from PIL import Image
import torch
from torchvision import transforms

# Import ML detector for cattle verification
try:
    from ml_detector import MLBreedDetector
except ImportError:
    MLBreedDetector = None

health_analysis_bp = Blueprint('health_analysis', __name__, url_prefix='/api/health-analysis')
logger = logging.getLogger(__name__)

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'webp'}
AUDIO_EXTENSIONS = {'wav', 'mp3', 'm4a', 'ogg', 'flac'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def allowed_audio_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in AUDIO_EXTENSIONS

# ==================== Cattle Verification ====================

_ml_detector = None

def get_ml_detector_for_verification():
    """Get or initialize the ML detector for cattle verification"""
    global _ml_detector
    if _ml_detector is None and MLBreedDetector is not None:
        try:
            _ml_detector = MLBreedDetector()
            logger.info("ML detector initialized for cattle verification in health analysis")
        except Exception as e:
            logger.warning(f"Failed to initialize ML detector for verification: {str(e)}")
            _ml_detector = False  # Mark as attempted but failed
    return _ml_detector if _ml_detector is not False else None

def verify_cattle_image(image_bytes):
    """
    Verify if the image contains cattle using ML detector
    
    Args:
        image_bytes: Image file bytes
    
    Returns:
        Tuple of (is_cattle, confidence, reason)
    """
    try:
        detector = get_ml_detector_for_verification()
        if detector is None:
            logger.warning("ML detector not available for cattle verification, accepting image")
            return True, 1.0, "Verification model not available"
        
        # Load image from bytes
        image = Image.open(io.BytesIO(image_bytes)).convert('RGB')
        
        # Preprocess image for verification
        image_tensor = detector._preprocess_image(image)
        
        # Strict cattle verification
        is_cattle, confidence, reason = detector.verify_is_cattle_strict(image_tensor)
        
        logger.info(f"Cattle verification result: {is_cattle} ({reason})")
        return is_cattle, confidence, reason
        
    except Exception as e:
        logger.error(f"Error during cattle verification: {str(e)}")
        # Fail open - allow image if verification fails (but log warning)
        logger.warning("Cattle verification failed, accepting image anyway")
        return True, 0.5, f"Verification error: {str(e)}"

# ==================== Voice Processing Functions ====================

def transcribe_audio(audio_path, language='en'):
    """
    Transcribe audio file to text using Whisper
    
    Args:
        audio_path: Path to audio file
        language: Language code (en, hi, te, etc.)
    
    Returns:
        Transcribed text or None if failed
    """
    try:
        # Check if file exists and is readable
        if not os.path.exists(audio_path):
            logger.error(f"Audio file not found: {audio_path}")
            return None
        
        file_size = os.path.getsize(audio_path)
        logger.info(f"Audio file size: {file_size} bytes")
        
        logger.info(f"Loading Whisper model (base)...")
        model = whisper.load_model('base', device='cpu')
        logger.info(f"Whisper model loaded successfully")
        
        logger.info(f"Transcribing audio from: {audio_path} (language: {language})")
        result = model.transcribe(audio_path, language=language, fp16=False)
        
        text = result.get('text', '').strip()
        if not text:
            logger.warning(f"Transcription returned empty text")
            return None
            
        logger.info(f"Transcription complete: {text[:100]}...")
        
        return text
    except ImportError as e:
        logger.error(f"Import error - Whisper or ffmpeg not available: {str(e)}")
        logger.error(f"Please install: pip install openai-whisper ffmpeg-python")
        return None
    except Exception as e:
        logger.error(f"Whisper transcription failed: {str(e)}", exc_info=True)
        return None

def audio_to_voice_health_analysis(audio_bytes, breed='Unknown', age='Unknown', language='en', image_data=None):
    """
    Convert voice input to health analysis with voice output
    
    Workflow:
    1. Transcribe audio (Whisper) → symptoms text
    2. Analyze health (Ollama/LLaVA multimodal) → analysis text
    3. Detect severity and image requirements
    4. Synthesize response (TTS) → audio output
    
    Args:
        audio_bytes: Audio file bytes
        breed: Cattle breed
        age: Cattle age in months
        language: Language code
        image_data: Optional image bytes
    
    Returns:
        Dict with analysis text, severity, image_needed flag, audio response, and metadata
    """
    try:
        # Step 1: Save audio temporarily and transcribe with Whisper
        logger.info(f"Received audio input: {len(audio_bytes)} bytes, image_data: {image_data is not None}")
        
        with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as tmp_audio:
            tmp_audio_path = tmp_audio.name
            tmp_audio.write(audio_bytes)
            tmp_audio.flush()
        
        logger.info(f"Audio saved to: {tmp_audio_path}")
        
        # Transcribe audio to text
        symptoms = transcribe_audio(tmp_audio_path, language)
        
        if not symptoms:
            logger.error(f"Transcription returned None or empty for language: {language}")
            return {
                'success': False,
                'error': 'Failed to transcribe audio. Please check microphone and try again.',
                'analysis': None,
                'audio_response': None,
                'debug': 'Whisper transcription failed'
            }
        
        logger.info(f"Voice input transcribed: {symptoms}")
        
        # Step 2: Perform health analysis with transcribed symptoms (in selected language)
        analysis_result = perform_health_analysis(symptoms, breed, age, language, image_data)
        
        if not analysis_result['success']:
            return analysis_result
        
        analysis_text = analysis_result['analysis']
        needs_image = check_if_image_needed(analysis_text)
        
        # Step 3: Convert analysis response to speech
        audio_response = text_to_voice(analysis_text, language)
        
        # Clean up temporary audio file
        try:
            os.remove(tmp_audio_path)
        except:
            pass
        
        return {
            'success': True,
            'transcribed_symptoms': symptoms,
            'analysis': analysis_text,
            'image_needed': needs_image,
            'audio_response': audio_response,
            'language': language,
            'breed': breed,
            'age': age,
            'model': 'whisper + ollama + tts'
        }
        
    except Exception as e:
        logger.error(f"Voice health analysis failed: {str(e)}", exc_info=True)
        return {
            'success': False,
            'error': str(e),
            'analysis': None,
            'audio_response': None,
            'debug': str(e)
        }
        
        if not analysis_result['success']:
            return analysis_result
        
        analysis_text = analysis_result['analysis']
        
        # Step 3: Convert analysis response to speech
        audio_response = text_to_voice(analysis_text, language)
        
        # Clean up temporary audio file
        try:
            os.remove(tmp_audio_path)
        except:
            pass
        
        return {
            'success': True,
            'transcribed_symptoms': symptoms,
            'analysis': analysis_text,
            'audio_response': audio_response,
            'language': language,
            'breed': breed,
            'age': age,
            'model': 'whisper + ollama + tts'
        }
        
    except Exception as e:
        logger.error(f"Voice health analysis failed: {str(e)}")
        return {
            'success': False,
            'error': str(e),
            'analysis': None,
            'audio_response': None
        }

def text_to_voice(text, language='en', rate=150):
    """
    Convert text to voice using Piper TTS for Hindi/Telugu (high quality)
    Falls back to pyttsx3 for other languages
    
    Args:
        text: Text to convert to speech
        language: Language code
        rate: Speech rate in WPM (for pyttsx3, ignored for Piper)
    
    Returns:
        Base64 encoded WAV audio or None if failed
    """
    try:
        # Use Piper TTS for Hindi and Telugu (better quality)
        if language in ['hi', 'te']:
            return text_to_voice_piper(text, language)
        
        # Fall back to pyttsx3 for other languages
        engine = pyttsx3.init()
        engine.setProperty('rate', rate)
        engine.setProperty('volume', 1.0)
        
        # Set voice based on language
        voices = engine.getProperty('voices')
        if voices:
            language_patterns = {
                'hi': ['hindi', 'hi_'],
                'te': ['telugu', 'te_'],
                'en': ['english', 'en_'],
            }
            
            search_patterns = language_patterns.get(language, ['english', 'en_'])
            voice_selected = False
            
            for voice in voices:
                voice_name = voice.name.lower()
                voice_lang = voice.languages[0].lower() if voice.languages else ""
                
                for pattern in search_patterns:
                    if pattern in voice_name or pattern in voice_lang:
                        engine.setProperty('voice', voice.id)
                        voice_selected = True
                        logger.info(f"Selected voice for {language}: {voice.name}")
                        break
                
                if voice_selected:
                    break
            
            if not voice_selected and voices:
                engine.setProperty('voice', voices[0].id)
                logger.warning(f"Language {language} not found, using default voice")
        
        # Save to temporary WAV file
        with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as tmp_file:
            tmp_path = tmp_file.name
        
        engine.save_to_file(text, tmp_path)
        engine.runAndWait()
        
        # Read audio bytes
        with open(tmp_path, 'rb') as audio_file:
            audio_bytes = audio_file.read()
        
        # Encode to base64
        audio_base64 = base64.b64encode(audio_bytes).decode('utf-8')
        
        # Clean up
        try:
            os.remove(tmp_path)
        except:
            pass
        
        return audio_base64
    
    except Exception as e:
        logger.error(f"Text-to-voice conversion failed: {e}")
        return None

def text_to_voice_piper(text, language='en'):
    """
    Convert text to voice using Piper TTS (high-quality synthesis)
    
    Args:
        text: Text to convert to speech
        language: Language code (hi, te, en, etc.)
    
    Returns:
        Base64 encoded WAV audio or None if failed
    """
    try:
        from piper.voice import PiperVoice
        from piper import SynthesisConfig
        import wave
        
        # Voice models mapping
        # Using English model for all languages for better pronunciation accuracy
        voice_models = {
            'en': 'en_US-amy-medium',
            'hi': 'en_US-amy-medium',          # English model for Hindi
            'te': 'en_US-amy-medium',          # English model for Telugu
        }
        
        voice_model = voice_models.get(language, 'en_US-amy-medium')
        
        # Get path to voice model
        from pathlib import Path
        data_dir = Path.home() / '.piper' / 'voices'
        model_path = data_dir / f"{voice_model}.onnx"
        
        if not model_path.exists():
            logger.error(f"Voice model not found: {model_path}")
            return None
        
        # Load voice and synthesize
        logger.info(f"Using Piper TTS for {language} with model: {voice_model}")
        voice = PiperVoice.load(str(model_path))
        
        # Create synthesis config
        syn_config = SynthesisConfig(
            length_scale=1.0,  # Normal speed
            normalize_audio=True,
            volume=1.0
        )
        
        # Generate speech
        audio_bytes = b""
        for audio_chunk in voice.synthesize(text, syn_config=syn_config):
            audio_bytes += audio_chunk.audio_int16_bytes
        
        if not audio_bytes:
            logger.error("No audio generated from Piper TTS")
            return None
        
        # Convert to WAV format
        import io
        wav_buffer = io.BytesIO()
        with wave.open(wav_buffer, 'wb') as wav_file:
            wav_file.setnchannels(1)  # Mono
            wav_file.setsampwidth(2)  # 16-bit
            wav_file.setframerate(voice.config.sample_rate)
            wav_file.writeframes(audio_bytes)
        
        wav_data = wav_buffer.getvalue()
        audio_base64 = base64.b64encode(wav_data).decode('utf-8')
        
        logger.info(f"Successfully generated {len(wav_data)} bytes of speech using Piper TTS ({language})")
        return audio_base64
        
    except ImportError:
        logger.error("Piper TTS is not installed. Install with: pip install piper-tts")
        return None
    except Exception as e:
        logger.error(f"Piper TTS synthesis failed: {e}")
        return None

def translate_text(text_to_translate, target_language='en'):
    """
    Translate text to target language using Ollama
    
    Args:
        text_to_translate: English text to translate
        target_language: Target language code (en, hi, te)
    
    Returns:
        Translated text or original if translation fails
    """
    if target_language == 'en':
        return text_to_translate
    
    language_names = {
        'en': 'English',
        'hi': 'Hindi (हिंदी)',
        'te': 'Telugu (తెలుగు)'
    }
    
    target_lang_name = language_names.get(target_language, 'English')
    
    try:
        if not check_ollama_available():
            logger.warning(f"Ollama not available for translation to {target_language}")
            return text_to_translate
        
        client = get_ollama_client()
        model_name = get_model_name()
        
        translation_prompt = f"""Translate the following English text to {target_lang_name}. 
Keep the exact format, sections, and structure. Only translate the content, not the markdown formatting.

ENGLISH TEXT:
{text_to_translate}

Provide ONLY the translated text, with no additional explanation."""
        
        try:
            logger.info(f"Translating to {target_language} using {model_name}")
            response = client.generate(model=model_name, prompt=translation_prompt, stream=False)
            translated = response['response'].strip()
            logger.info(f"Translation successful")
            return translated
        except Exception as e:
            logger.warning(f"Translation failed: {str(e)}, returning original English text")
            return text_to_translate
            
    except Exception as e:
        logger.error(f"Translation error: {str(e)}")
        return text_to_translate

def perform_health_analysis(symptoms, breed='Unknown', age='Unknown', language='en', image_data=None):
    """
    Core health analysis logic (extracted for reuse)
    Strategy:
    - For English: Use AI model if available, or rule-based fallback
    - For other languages (hi, te): Use rule-based fallback (comprehensive translations already available)
    Returns the same format as analyze_health endpoint
    """
    try:
        if not symptoms and not image_data:
            return {
                'success': False,
                'error': 'Missing symptoms and image',
                'analysis': None
            }
        
        # For non-English languages, use the rule-based fallback which has full translations
        if language != 'en':
            logger.info(f"Using multilingual fallback analysis for {language}")
            analysis = get_fallback_analysis(symptoms, breed, age, language)
            return {
                'success': True,
                'analysis': analysis,
                'model': 'rule-based-fallback-multilingual',
                'language': language
            }
        
        # For English, try AI model first
        image_context = " An image of the cattle has also been provided for your visual inspection." if image_data else ""
        prompt = f"""
        You are a veterinary expert specialized in cattle health and disease analysis.
        
        Analyze the following cattle health situation:{image_context}
        - Breed: {breed}
        - Age: {age} months
        - Health observations: {symptoms}
        
        IMPORTANT INSTRUCTIONS:
        Provide assessment in this EXACT format with THREE main sections. NO bullet points, NO dashes, NO asterisks, NO special symbols. Write in clear paragraphs only.
        
        1. WHAT IS THE PROBLEM?
        Write a detailed paragraph (5-6 lines) describing the main health issues and diseases identified from the symptoms. Be specific about potential conditions. If the cattle appears healthy, clearly state that it appears healthy.
        
        2. WHAT PRECAUTIONS SHOULD WE TAKE?
        Write a detailed paragraph (5-6 lines) describing immediate care steps, preventive measures, feeding adjustments, hygiene practices if applicable, and practical recommendations. Include any recommended veterinary tests if needed.
        
        3. URGENCY LEVEL
        State the urgency level clearly: CRITICAL, URGENT, MONITOR, or NORMAL. Then provide specific warning signs to watch for. If MONITOR or NORMAL, state that no urgent veterinary visit is needed but monitoring is important.
        
        Use plain text only. Write in clear, easy to understand language. No markdown formatting, no bullet points, no special symbols. Just paragraphs.
        """
        
        model_name = get_model_name()
        
        if not check_ollama_available():
            logger.warning("Ollama not available, using rule-based fallback")
            analysis = get_fallback_analysis(symptoms, breed, age, 'en')
            return {
                'success': True,
                'analysis': analysis,
                'model': 'rule-based-fallback',
                'language': 'en'
            }
        
        client = get_ollama_client()
        
        # Try to generate with the selected model
        response = None
        attempted_models = [model_name]
        
        # Prepare generation options
        gen_args = {
            'model': model_name,
            'prompt': prompt,
            'stream': False
        }
        
        if image_data:
            gen_args['images'] = [image_data]
        
        try:
            logger.info(f"Attempting analysis with model: {model_name}, images: {image_data is not None}")
            response = client.generate(**gen_args)
        except Exception as model_error:
            logger.error(f"Model error with {model_name}: {str(model_error)}")
            
            # Try fallback models
            available_models = get_available_models()
            fallback_models = [m for m in available_models if m not in attempted_models]
            
            for fallback_model in fallback_models:
                try:
                    logger.info(f"Attempting fallback with model: {fallback_model}")
                    gen_args['model'] = fallback_model
                    response = client.generate(**gen_args)
                    model_name = fallback_model  # Update model name for response
                    attempted_models.append(fallback_model)
                    break
                except Exception as e:
                    logger.warning(f"Fallback model {fallback_model} failed: {str(e)}")
                    attempted_models.append(fallback_model)
                    continue
            
            if response is None:
                error_msg = f"All models failed. Attempted: {attempted_models}. Available: {available_models}"
                logger.error(error_msg)
                # Fall back to rule-based analysis
                analysis = get_fallback_analysis(symptoms, breed, age, 'en')
                return {
                    'success': True,
                    'analysis': analysis,
                    'model': 'rule-based-fallback-after-error',
                    'language': 'en'
                }
        
        # Return AI analysis in English
        return {
            'success': True,
            'analysis': response['response'],
            'model': model_name,
            'language': 'en',
            'attempted_models': attempted_models
        }
        
    except Exception as e:
        logger.error(f"Health analysis failed: {str(e)}")
        return {
            'success': False,
            'error': str(e),
            'analysis': None
        }

def get_ollama_client():
    host = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
    return Client(host=host)

def get_available_models():
    """
    Get list of available models from Ollama
    Returns: List of model names or empty list if Ollama unavailable
    """
    try:
        client = get_ollama_client()
        response = client.list()
        # Extract model names from response
        models = []
        if hasattr(response, 'models'):
            models = [m.model if hasattr(m, 'model') else m.get('name', '') for m in response.models]
        elif isinstance(response, dict) and 'models' in response:
            models = [m.get('name', '') if isinstance(m, dict) else m for m in response['models']]
        
        logger.info(f"Available Ollama models: {models}")
        return [m for m in models if m]  # Filter out empty strings
    except Exception as e:
        logger.error(f"Failed to get available models: {e}")
        return []

def get_best_available_model():
    """
    Get the best available model from Ollama
    Priority: configured model > mistral > neural-chat > llama2 > any available model
    Returns: Model name or None if no models available
    """
    try:
        configured_model = os.getenv("OLLAMA_MODEL", "mistral")
        available_models = get_available_models()
        
        if not available_models:
            logger.warning("No models available in Ollama")
            return None
        
        # Check if configured model exists
        if configured_model in available_models:
            logger.info(f"Using configured model: {configured_model}")
            return configured_model
        
        # Fallback priority
        priority_models = ["mistral", "neural-chat", "llama2", "dolphin-mixtral"]
        for model in priority_models:
            if model in available_models:
                logger.warning(f"Configured model '{configured_model}' not found. Using fallback: {model}")
                return model
        
        # Use any available model
        best_model = available_models[0]
        logger.warning(f"Configured model '{configured_model}' not found. Using: {best_model}")
        return best_model
        
    except Exception as e:
        logger.error(f"Error getting best available model: {e}")
        return None

def get_model_name():
    """Get the appropriate model based on available system memory and available models"""
    try:
        best_model = get_best_available_model()
        if best_model:
            return best_model
        # If no models available, return default (will fail later with helpful error)
        return os.getenv("OLLAMA_MODEL", "mistral")
    except Exception as e:
        logger.error(f"Error in get_model_name: {e}")
        return os.getenv("OLLAMA_MODEL", "mistral")

def check_ollama_available():
    """Test connection to Ollama server"""
    try:
        client = get_ollama_client()
        client.list()
        return True
    except Exception as e:
        logger.error(f"Ollama server not available: {e}")
        return False


    """
    Check if image analysis would be helpful based on analysis
    Returns: True if image would be valuable, False otherwise
    """
    text_lower = analysis_text.lower()
    image_keywords = [
        "visual", "appearance", "skin", "lesion", "spot", "wound", "rash",
        "external disease", "lumpy skin", "mange", "eczema", "abscess",
        "eye discharge", "nasal discharge", "swelling", "inflammation",
        "lameness", "hoof", "udder", "mastitis", "photograph", "image",
        "picture", "inspect visually", "external examination"
    ]
    
    return any(keyword in text_lower for keyword in image_keywords)

def get_fallback_analysis(symptoms, breed, age, language='en'):
    """Rule-based health analysis fallback when AI is unavailable"""
    symptoms_lower = symptoms.lower()
    
    # Language templates
    lang_config = {
        'en': {
            'offline': '*(Offline Analysis - AI service unavailable)*',
            'section1': '1. WHAT IS THE PROBLEM?',
            'section2': '2. WHAT PRECAUTIONS SHOULD WE TAKE?',
            'section3': '3. URGENCY LEVEL',
            'suffering_from': 'Based on the symptoms provided, the cattle appears to be suffering from',
            'conditions_cause': 'These conditions can cause significant health complications and discomfort to the animal. The cattle may experience difficulty in eating, reduced productivity, and risk of transmission to other animals in the herd. Immediate observation and care are essential to prevent further deterioration of the health condition.',
            'good_health': 'Based on the symptoms provided, the cattle appears to be in generally good health. However, continued monitoring is recommended to ensure no underlying health issues develop. Regular check-ups and observation of behavior, appetite, and general well-being are important for early detection of any potential health problems.',
            'precautions_text': 'Ensure fresh water and high-quality feed are provided regularly. Monitor temperature and behavior closely on a daily basis. Keep the shelter clean and well-ventilated. Ensure the animal is isolated from other cattle if contagious disease is suspected. Seek veterinary advice if symptoms persist or worsen. Provide adequate nutrition and clean drinking water at all times.',
            'urgency_critical': 'Urgency Level: CRITICAL. This condition requires urgent professional medical attention and intervention immediately.',
            'urgency_urgent': 'Urgency Level: URGENT. Contact veterinarian immediately for diagnosis and treatment. This condition requires professional veterinary attention within the next few hours.',
            'urgency_monitor': 'Urgency Level: MONITOR. No urgent veterinary visit needed, but monitor closely. Continue observing the animal daily for any changes. If new symptoms develop or existing symptoms worsen, contact a veterinarian.',
            'warning_signs': 'Watch for these warning signs:',
            'brdc': 'Bovine Respiratory Disease (BRD)',
            'pneumonia': 'Pneumonia or Lungworm',
            'bvd': 'Bovine Viral Diarrhea (BVD) or Coccidiosis',
            'lsd': 'Lumpy Skin Disease (LSD)',
            'fever': 'High fever (>104°F)',
            'breathing': 'Rapid breathing',
            'nasal': 'Nasal discharge',
            'bloody': 'Bloody stools',
            'dehydration': 'Dehydration signs',
            'lumps': 'Spreading lumps on skin',
        },
        'hi': {
            'offline': '*(ऑफलाइन विश्लेषण - AI सेवा उपलब्ध नहीं)*',
            'section1': '1. समस्या क्या है?',
            'section2': '2. हमें कौन सी सावधानियां लेनी चाहिए?',
            'section3': '3. आपातकालीनता का स्तर',
            'suffering_from': 'प्रदान किए गए लक्षणों के आधार पर, पशु निम्नलिखित से पीड़ित प्रतीत होता है',
            'conditions_cause': 'ये स्थितियां पशु को महत्वपूर्ण स्वास्थ्य जटिलताएं और असुविधा पहुंचा सकती हैं। पशु को खाने में कठिनाई, उत्पादकता में कमी और झुंड के अन्य पशुओं को संचरण का जोखिम हो सकता है। स्वास्थ्य स्थिति में और बिगड़ने को रोकने के लिए तत्काल अवलोकन और देखभाल आवश्यक है।',
            'good_health': 'प्रदान किए गए लक्षणों के आधार पर, पशु आम तौर पर अच्छे स्वास्थ्य में प्रतीत होता है। हालांकि, यह सुनिश्चित करने के लिए निरंतर निगरानी की सिफारिश की जाती है कि कोई अंतर्निहित स्वास्थ्य समस्या विकसित न हो। नियमित जांच और व्यवहार, भूख और सामान्य कल्याण का अवलोकन किसी भी संभावित स्वास्थ्य समस्या के प्रारंभिक पता लगाने के लिए महत्वपूर्ण है।',
            'precautions_text': 'ताजा पानी और उच्च गुणवत्ता का चारा नियमित रूप से प्रदान करें। दैनिक आधार पर तापमान और व्यवहार की सावधानीपूर्वक निगरानी करें। आश्रय को स्वच्छ और अच्छी तरह हवादार रखें। यदि संक्रामक रोग का संदेह हो तो पशु को अन्य मवेशियों से अलग रखें। यदि लक्षण बने रहें या बदतर हो जाएं तो पशु चिकित्सक से सलाह लें। सभी समय पर पर्याप्त पोषण और स्वच्छ पानी प्रदान करें।',
            'urgency_critical': 'आपातकालीनता का स्तर: गंभीर। इस स्थिति में तत्काल पेशेवर चिकित्सा सहायता और हस्तक्षेप की आवश्यकता है।',
            'urgency_urgent': 'आपातकालीनता का स्तर: आपातकालीन। निदान और उपचार के लिए तत्काल पशु चिकित्सक से संपर्क करें। इस स्थिति के लिए अगले कुछ घंटों में पेशेवर पशु चिकित्सा सहायता की आवश्यकता है।',
            'urgency_monitor': 'आपातकालीनता का स्तर: निगरानी करें। कोई आपातकालीन पशु चिकित्सक यात्रा की आवश्यकता नहीं है, लेकिन सावधानीपूर्वक निगरानी करें। पशु के किसी भी परिवर्तन के लिए दैनिक अवलोकन जारी रखें। यदि नए लक्षण विकसित हों या मौजूदा लक्षण बदतर हो जाएं तो पशु चिकित्सक से संपर्क करें।',
            'warning_signs': 'इन चेतावनी संकेतों पर ध्यान दें:',
            'brdc': 'गोजो श्वसन रोग (BRD)',
            'pneumonia': 'निमोनिया या फेफड़ों में कृमि',
            'bvd': 'गोजो वायरल दस्त (BVD) या कोकिडिओसिस',
            'lsd': 'गूजा त्वचा रोग (LSD)',
            'fever': 'उच्च बुखार (>104°F)',
            'breathing': 'तेजी से सांस लेना',
            'nasal': 'नाक से स्राव',
            'bloody': 'खूनी मल',
            'dehydration': 'निर्जलीकरण के संकेत',
            'lumps': 'त्वचा पर फैलने वाले उभार',
        },
        'te': {
            'offline': '*(ఆఫ్‌లైన్ విశ్లేషణ - AI సేవ సందర్భించబడలేదు)*',
            'problem': '**1. సమస్య ఏమిటి?**',
            'healthy': 'అందించిన లక్షణాల ఆధారంగా పశువు సాధారణంగా ఆరోగ్యంగా ఉంది.',
            'no_disease': 'నిర్దిష్ట వ్యాధి గుర్తించబడలేదు',
            'precautions': '**2. మనం ఏ జాగ్రత్తలు తీసుకోవాలి?**',
            'ensure_water': 'తాజా నీరు మరియు అధిక నాణ్యత గల చేనపూస నిర్ధారించండి.',
            'monitor': 'ఉష్ణోగ్రత మరియు ప్రవర్తనను జాగ్రత్తగా పర్యవేక్షించండి.',
            'isolate': 'సంక్రమణ వ్యాప్తిని నిరోధించడానికి మిగిలిన పశువుల నుండి వేరుచేయండి.',
            'tests': 'సిఫార్సు చేయబడిన పরీక్షలు:',
            'general_exam': 'సాధారణ శారీరక పరీక్ష',
            'blood_count': 'రక్త గణన',
            'doctor': '**3. తీవ్రమైనట్లయితే, వెంటనే డాక్టర్‌ను కలవండి**',
            'urgency': 'తరurgency ప్రమాణం:',
            'contact': 'వెంటనే పశువైద్య వైద్యుడिని సంటాకించండి',
            'yes_contact': 'అవును - వెంటనే పశువైద్య వైద్యుడిని సంటాకించండి',
            'no_contact': 'తరургెంట్ పశువైద్య సందర్శన అవసరమైన.,కానీ. చక్రంగా పర్యవేక్షించండి',
            'watch': 'ఈ హెచ్చరిక సంకేతాలను చూడండి:',
            'brdc': 'పశు శ్వాసకోశ వ్యాధి (BRD)',
            'pneumonia': 'న్యుమోనియా లేదా ఊపిరితిత్తుల పురుగు',
            'bvd': 'పశు వైరల్ విరేచనం (BVD) లేదా కోకిడియోసిస్',
            'lsd': 'గుంపు చర్మ వ్యాధి (LSD)',
            'chest': 'ఛాతీ విచారణ',
            'fecal': 'మలం నమూనా విశ్లేషణ',
            'skin': 'చర్మ జీవక చర్య లేదా పीసीఆర్ పరీక్ష',
            'fever': 'అధిక ఖం (>104°F)',
            'breathing': 'వేగవంతమైన శ్వాస',
            'nasal': 'నాసికా ద్రవం',
            'bloody': 'ఖాళీ రక్తాన్ని',
            'dehydration': 'నీటిరహిత సంకేతాలు',
            'lumps': 'వ్యాపించిన గడ్డలు',
        }
    }
    
    config = lang_config.get(language, lang_config['en'])
    
    # Ensure all required keys exist (for backward compatibility with old language configs)
    required_keys = ['section1', 'section2', 'section3', 'suffering_from', 'conditions_cause', 'good_health', 'precautions_text', 'urgency_critical', 'urgency_urgent', 'urgency_monitor', 'warning_signs']
    for key in required_keys:
        if key not in config:
            # Use English as fallback for missing keys
            config[key] = lang_config['en'][key]  
    diseases = []
    warning_signs = []
    urgency_level = "MONITOR"
    
    if "fever" in symptoms_lower or "temperature" in symptoms_lower or "stand" in symptoms_lower or "weak" in symptoms_lower:
        diseases.append(config['brdc'])
        warning_signs.extend([config['fever'], config['breathing'], config['nasal']])
        urgency_level = "URGENT"
        
    if "cough" in symptoms_lower or "breathing" in symptoms_lower:
        if config['pneumonia'] not in diseases:
            diseases.append(config['pneumonia'])
        warning_signs.extend([config['breathing']])
        urgency_level = "URGENT"
        
    if "diarrhea" in symptoms_lower or "scour" in symptoms_lower:
        diseases.append(config['bvd'])
        warning_signs.extend([config['bloody'], config['dehydration']])
        urgency_level = "URGENT"
        
    if "lump" in symptoms_lower or "skin" in symptoms_lower or "nodule" in symptoms_lower:
        diseases.append(config['lsd'])
        warning_signs.extend([config['lumps']])
        urgency_level = "CRITICAL"

    # Build the analysis in plain text paragraph format (completely in requested language)
    analysis = config['offline'] + "\n\n"
    
    # Section 1: WHAT IS THE PROBLEM?
    analysis += config['section1'] + "\n"
    if diseases:
        problem_text = config['suffering_from'] + " " + ", ".join(diseases[:-1])
        if len(diseases) > 1:
            problem_text += ", and " + diseases[-1]
        problem_text += ". " + config['conditions_cause']
    else:
        problem_text = config['good_health']
    analysis += problem_text + "\n\n"
    
    # Section 2: WHAT PRECAUTIONS SHOULD WE TAKE?
    analysis += config['section2'] + "\n"
    analysis += config['precautions_text'] + "\n\n"
    
    # Section 3: URGENCY LEVEL
    analysis += config['section3'] + "\n"
    if urgency_level == "CRITICAL":
        urgency_text = config['urgency_critical']
    elif urgency_level == "URGENT":
        urgency_text = config['urgency_urgent']
    else:
        urgency_text = config['urgency_monitor']
    
    if warning_signs:
        urgency_text += " " + config['warning_signs'] + " " + ", ".join(warning_signs) + "."
    analysis += urgency_text + "\n"
    
    return analysis

@health_analysis_bp.route('/analyze', methods=['POST'])
def analyze_health():
    """
    Analyze cattle health symptoms/images and provide disease analysis
    
    Supports:
    1. JSON with 'symptoms', 'breed', 'age', 'language'
    2. Multipart with 'image' and 'symptoms', 'breed', 'age', 'language'
    """
    try:
        symptoms = ""
        breed = "Unknown"
        age = "Unknown"
        language = "en"
        images = []
        
        # 1. Handle Multipart/Form-Data (Image upload)
        if request.content_type and 'multipart/form-data' in request.content_type:
            symptoms = request.form.get('symptoms', '')
            breed = request.form.get('breed', 'Unknown')
            age = request.form.get('age', 'Unknown')
            language = request.form.get('language', 'en')
            
            if 'image' in request.files:
                file = request.files['image']
                if file and allowed_file(file.filename):
                    image_data = file.read()
                    
                    # STRICT: Verify cattle before processing
                    is_cattle, cattle_conf, cattle_reason = verify_cattle_image(image_data)
                    if not is_cattle:
                        logger.warning(f"Non-cattle image rejected in health analysis: {cattle_reason}")
                        return jsonify({
                            'error': 'Not a cattle image',
                            'message': f'This image does not contain cattle. Please upload a cattle photo for health analysis. ({cattle_reason})',
                            'status': 400
                        }), 400
                    
                    images.append(image_data)
                    logger.info(f"Image verified as cattle for analysis: {file.filename}")

        
        # 2. Handle JSON
        elif request.is_json:
            data = request.get_json()
            symptoms = data.get('symptoms', '')
            breed = data.get('breed', 'Unknown')
            age = data.get('age', 'Unknown')
            language = data.get('language', 'en')
            
            # Base64 image support in JSON
            if 'image_data' in data:
                try:
                    image_data = base64.b64decode(data['image_data'])
                    
                    # STRICT: Verify cattle before processing
                    is_cattle, cattle_conf, cattle_reason = verify_cattle_image(image_data)
                    if not is_cattle:
                        logger.warning(f"Non-cattle image rejected in health analysis: {cattle_reason}")
                        return jsonify({
                            'error': 'Not a cattle image',
                            'message': f'This image does not contain cattle. Please upload a cattle photo for health analysis. ({cattle_reason})',
                            'status': 400
                        }), 400
                    
                    images.append(image_data)
                    logger.info(f"Base64 image verified as cattle for analysis")
                except Exception as e:
                    logger.warning(f"Failed to decode base64 image: {str(e)}")

        # Validate language
        valid_languages = ['en', 'hi', 'te']
        if language not in valid_languages:
            language = 'en'

        if not symptoms and not images:
            return jsonify({
                'error': 'Missing input',
                'message': 'Please provide symptoms or an image for analysis',
                'status': 400
            }), 400
        
        # Use the refactored health analysis function with language support
        result = perform_health_analysis(symptoms, breed, age, language, images[0] if images else None)
        
        if not result['success']:
            return jsonify({
                'error': 'Analysis failed',
                'message': result.get('error', 'Unknown error'),
                'status': 500
            }), 500
        
        return jsonify({
            'success': True,
            'analysis': result['analysis'],
            'model': result.get('model', 'unknown'),
            'language': language,
            'status': 200
        }), 200
        
    except Exception as e:
        logger.error(f"Error in health analysis: {str(e)}", exc_info=True)
        return jsonify({
            'error': 'Analysis failed',
            'message': str(e),
            'status': 500
        }), 500

@health_analysis_bp.route('/voice-analyze', methods=['POST'])
def voice_analyze_health():
    """
    Voice-based health analysis with integrated workflow:
    🎤 Voice Input → 🧠 Whisper (STT) → 🧠 Ollama Analysis → 🔊 TTS → Voice Output
    
    Accepts:
    - Audio file (wav, mp3, m4a, ogg, flac)
    - Breed (optional, default: "Unknown")
    - Age (optional, default: "Unknown")
    - Language (optional, default: "en")
    
    Returns:
    - Transcribed symptoms (from voice)
    - Health analysis (from Ollama)
    - Audio response (base64 encoded WAV)
    """
    try:
        breed = request.form.get('breed', 'Unknown')
        age = request.form.get('age', 'Unknown')
        language = request.form.get('language', 'en')
        
        # Validate language
        valid_languages = ['en', 'hi', 'te']
        if language not in valid_languages:
            language = 'en'
        
        # Check if audio file is provided
        if 'audio' not in request.files:
            return jsonify({
                'success': False,
                'error': 'Missing audio file',
                'message': 'Please provide an audio file with key "audio"',
                'status': 400
            }), 400
        
        audio_file = request.files['audio']
        
        if not audio_file or not allowed_audio_file(audio_file.filename):
            return jsonify({
                'success': False,
                'error': 'Invalid audio format',
                'message': f'Allowed formats: {", ".join(AUDIO_EXTENSIONS)}',
                'supported_formats': list(AUDIO_EXTENSIONS),
                'status': 400
            }), 400
        
        # Check for optional image
        image_data = None
        if 'image' in request.files:
            image_file = request.files['image']
            if image_file and allowed_file(image_file.filename):
                image_data = image_file.read()
                
                # STRICT: Verify cattle before processing
                is_cattle, cattle_conf, cattle_reason = verify_cattle_image(image_data)
                if not is_cattle:
                    logger.warning(f"Non-cattle image rejected in voice analysis: {cattle_reason}")
                    return jsonify({
                        'success': False,
                        'error': 'Not a cattle image',
                        'message': f'The provided image does not contain cattle. Please provide a cattle photo. ({cattle_reason})',
                        'status': 400
                    }), 400
                
                logger.info(f"Image verified as cattle for voice analysis: {image_file.filename}")
        
        # Read audio bytes
        audio_bytes = audio_file.read()
        
        logger.info(f"Voice analysis requested: breed={breed}, age={age}, language={language}, audio_size={len(audio_bytes)} bytes, image_present={image_data is not None}")
        
        # Process voice input through the complete workflow
        voice_result = audio_to_voice_health_analysis(audio_bytes, breed, age, language, image_data)
        
        if not voice_result['success']:
            return jsonify({
                'success': False,
                'error': voice_result.get('error', 'Unknown error'),
                'message': voice_result.get('error', 'Voice analysis failed'),
                'status': 500
            }), 500
        
        # Return complete workflow results
        return jsonify({
            'success': True,
            'transcribed_symptoms': voice_result['transcribed_symptoms'],
            'analysis': voice_result['analysis'],
            'audio_response': voice_result['audio_response'],
            'language': language,
            'breed': breed,
            'age': age,
            'workflow': '🎤 Voice → Whisper STT → Ollama Analysis → TTS Voice Output',
            'status': 200
        }), 200
        
    except Exception as e:
        logger.error(f"Error in voice health analysis: {str(e)}", exc_info=True)
        return jsonify({
            'success': False,
            'error': 'Voice analysis failed',
            'message': str(e),
            'status': 500
        }), 500

@health_analysis_bp.route('/voice-analyze/stream', methods=['POST'])
def voice_analyze_stream():
    """
    Streaming voice analysis endpoint for real-time processing
    
    Supports audio/wav, audio/mp3, etc.
    Returns audio response as binary stream
    """
    try:
        breed = request.args.get('breed', 'Unknown')
        age = request.args.get('age', 'Unknown')
        language = request.args.get('language', 'en')
        
        if not request.data:
            return jsonify({
                'success': False,
                'error': 'No audio data received'
            }), 400
        
        logger.info(f"Streaming voice analysis: breed={breed}, age={age}, language={language}")
        
        # Process the audio
        voice_result = audio_to_voice_health_analysis(request.data, breed, age, language)
        
        if not voice_result['success']:
            return jsonify({
                'success': False,
                'error': voice_result.get('error', 'Analysis failed')
            }), 500
        
        # Return audio as binary response
        if voice_result['audio_response']:
            audio_bytes = base64.b64decode(voice_result['audio_response'])
            return audio_bytes, 200, {'Content-Type': 'audio/wav'}
        
        return jsonify({
            'success': False,
            'error': 'Failed to generate audio response'
        }), 500
        
    except Exception as e:
        logger.error(f"Streaming voice analysis error: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@health_analysis_bp.route('/translate-test', methods=['POST'])
def translate_test():
    """Test translation functionality"""
    try:
        data = request.get_json()
        text = data.get('text', '')
        language = data.get('language', 'en')
        
        if not text:
            return jsonify({'error': 'Missing text'}), 400
        
        if language == 'en':
            return jsonify({
                'success': True,
                'original': text,
                'translated': text,
                'language': 'en',
                'note': 'English - no translation needed'
            }), 200
        
        translated = translate_text(text, language)
        
        return jsonify({
            'success': True,
            'original': text,
            'translated': translated,
            'language': language,
            'translator_model': get_model_name()
        }), 200
        
    except Exception as e:
        logger.error(f"Translation test failed: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@health_analysis_bp.route('/status', methods=['GET'])
def get_status():
    """Check if Ollama is available and services are ready"""
    try:
        available_models = get_available_models()
        model_name = get_model_name()
        
        # Check Whisper availability
        whisper_available = False
        try:
            import whisper
            whisper_available = True
        except:
            pass
        
        # Check pyttsx3 availability  
        tts_available = False
        try:
            import pyttsx3
            tts_available = True
        except:
            pass
        
        ollama_connected = len(available_models) > 0
        
        return jsonify({
            'service': 'health_analysis',
            'ollama_status': 'connected' if ollama_connected else 'disconnected',
            'configured_model': model_name,
            'available_models': available_models,
            'models_count': len(available_models),
            'model_available': model_name in available_models if available_models else False,
            'whisper_available': whisper_available,
            'tts_available': tts_available,
            'voice_analysis_enabled': ollama_connected and whisper_available and tts_available,
            'supported_audio_formats': list(AUDIO_EXTENSIONS),
            'supported_languages': ['en', 'hi', 'te'],
            'setup_required': {
                'ollama': not ollama_connected,
                'whisper': not whisper_available,
                'tts': not tts_available
            }
        }), 200 if ollama_connected else 207
    except Exception as e:
        logger.error(f"Status check failed: {str(e)}")
        return jsonify({
            'service': 'health_analysis',
            'ollama_status': 'error',
            'error': str(e),
            'voice_analysis_enabled': False,
            'message': 'Failed to check service status. Make sure Ollama is running.'
        }), 503


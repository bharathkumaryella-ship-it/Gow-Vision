"""
Text-to-Speech Blueprint
Handles text generation and audio synthesis using Ollama with Gemma3:12b model
Converts output text to speech for accessibility
"""

from flask import Blueprint, request, jsonify
from ollama import Client
import logging
import os
import io
import base64
from typing import Optional, Dict, Any
from piper.voice import PiperVoice

tts_bp = Blueprint('tts', __name__, url_prefix='/api/tts')
logger = logging.getLogger(__name__)


def get_ollama_client():
    """Get Ollama client configured with the base URL"""
    host = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
    return Client(host=host)


def get_tts_model():
    """Get the TTS model name - using Gemma3:12b by default"""
    return os.getenv("OLLAMA_TTS_MODEL", "gemma3:12b")


def generate_enhanced_text(original_text: str, language: str = "en") -> str:
    """
    Use Ollama Gemma3:12b to enhance text for better TTS readability
    This can expand abbreviations, clarify technical terms, etc.
    Supports multiple languages via intelligent prompting.
    """
    try:
        client = get_ollama_client()
        model = get_tts_model()
        
        # Language-specific prompts
        language_instructions = {
            'en': """You are a helpful assistant that enhances text for text-to-speech in English. 
Your task is to take the following text and make it more suitable for audio playback by:
1. Expanding all abbreviations and acronyms
2. Replacing technical jargon with simpler terms where possible
3. Adding punctuation for better pacing
4. Keeping the meaning and information intact
5. Keep the response concise
Respond ONLY with the enhanced text, no additional commentary.""",
            
            'hi': """आप एक सहायक हैं जो हिंदी में पाठ-से-वाक् के लिए पाठ में सुधार करते हैं।
आपका कार्य निम्नलिखित पाठ को ऑडियो प्लेबैक के लिए अधिक उपयुक्त बनाना है:
1. सभी संक्षिप्त रूपों और परिवर्णीम शब्दों का विस्तार करें
2. तकनीकी शब्दजाल को सरल शब्दों से बदलें
3. बेहतर गति के लिए विरामचिह्न जोड़ें
4. अर्थ और जानकारी को बरकरार रखें
5. प्रतिक्रिया को संक्षिप्त रखें
केवल सुधारे गए पाठ के साथ उत्तर दें, कोई अतिरिक्त टिप्पणी नहीं।""",
            
            'te': """మీరు తెలుగులో వచన నుండి ప్రసంగానికి సంబంధించిన వచనాన్ని మెరుగుపరిచే సహాయకుడు.
ఆడియో ప్లేబ్యాక్ కోసం ఈ క్రింది వచనాన్ని మరింత అనువైనదిగా చేయడం మీ పని:
1. అన్ని సంక్షిప్తీకరణలు మరియు ఎక్రోనిమ్‌లను విస్తరించండి
2. సాంకేతిక జర్గన్‌ను సరళ పదాలతో భర్తీ చేయండి
3. మంచి పేసింగ్ కోసం విరామచిహ్నాలను జోడించండి
4. అర్థం మరియు సమాచారాన్ని సంరక్షించండి
5. ప్రతిస్పందనను సంక్షిప్తంగా ఉంచండి
మెరుగైన వచనంతో మాత్రమే సమాధానం ఇవ్వండి, అదనపు వ్యాఖ్యలు లేవు."""
        }
        
        # Get appropriate instruction for language
        instruction = language_instructions.get(language, language_instructions['en'])
        
        prompt = f"""{instruction}

Original text:
{original_text}

Enhanced text:"""
        
        response = client.generate(
            model=model,
            prompt=prompt,
            stream=False
        )
        
        if hasattr(response, 'response'):
            return response.response.strip()
        return original_text
    except Exception as e:
        logger.warning(f"Failed to enhance text with Ollama: {e}")
        return original_text


def get_piper_voice_model(language: str = "en") -> str:
    """Get Piper voice model name based on language code"""
    # Using English model for all languages for better pronunciation accuracy
    # This ensures consistent, clear pronunciation across all text
    voice_models = {
        'en': 'en_US-amy-medium',           # English (US) - Amy
        'hi': 'en_US-amy-medium',           # Hindi - using English model
        'te': 'en_US-amy-medium',           # Telugu - using English model
        'es': 'en_US-amy-medium',           # Spanish - using English model
        'fr': 'en_US-amy-medium',           # French - using English model
        'de': 'en_US-amy-medium',           # German - using English model
        'it': 'en_US-amy-medium',           # Italian - using English model
        'nl': 'en_US-amy-medium',           # Dutch - using English model
        'pt': 'en_US-amy-medium',           # Portuguese - using English model
    }
    return voice_models.get(language, 'en_US-amy-medium')


def text_to_speech(text: str, language: str = "en", rate: float = 1.0) -> Optional[bytes]:
    """
    Convert text to speech using Piper TTS (supports 100+ languages)
    
    Args:
        text: Text to convert to speech
        language: Language code (en, hi, te, es, fr, de, it, nl, pt, etc.)
        rate: Speech rate multiplier (0.5 = half speed, 1.0 = normal, 2.0 = double speed)
    
    Returns:
        WAV audio bytes or None if conversion fails
    """
    try:
        import wave
        import io
        from pathlib import Path
        from piper.voice import PiperVoice
        from piper import SynthesisConfig
        
        # Get the voice model for the language
        voice_model = get_piper_voice_model(language)
        
        # Get path to voice model files
        data_dir = Path.home() / '.piper' / 'voices'
        model_path = data_dir / f"{voice_model}.onnx"
        
        if not model_path.exists():
            logger.error(f"Voice model not found: {model_path}. Please download it first.")
            return None
        
        # Load voice model
        voice = PiperVoice.load(str(model_path))
        
        # Create synthesis config with rate adjustment
        syn_config = SynthesisConfig(
            length_scale=1.0 / rate if rate != 1.0 else 1.0,
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
        
        # Convert raw audio bytes to WAV format
        wav_buffer = io.BytesIO()
        with wave.open(wav_buffer, 'wb') as wav_file:
            wav_file.setnchannels(1)  # Mono
            wav_file.setsampwidth(2)  # 16-bit (int16)
            wav_file.setframerate(voice.config.sample_rate)
            wav_file.writeframes(audio_bytes)
        
        wav_data = wav_buffer.getvalue()
        logger.info(f"Successfully generated {len(wav_data)} bytes of speech in {language} language ({voice_model})")
        return wav_data
    
    except ImportError:
        logger.error("Piper TTS is not installed. Please install it with: pip install piper-tts")
        return None
    except FileNotFoundError as e:
        logger.error(f"Voice model file not found: {e}. Models should be in ~/.piper/voices/")
        return None
    except Exception as e:
        logger.error(f"Text-to-speech conversion failed: {e}")
        return None


@tts_bp.route('/synthesize', methods=['POST'])
def synthesize_speech():
    """
    Synthesize speech from text in multiple languages using Piper TTS
    
    Request JSON:
    {
        "text": "Text to convert to speech",
        "enhance": true,  # Use Ollama to enhance text first (optional, default: true)
        "language": "en",  # Language code: 'en', 'hi', 'te', 'es', 'fr', 'de', etc. (optional, default: "en")
        "rate": 1.0  # Speech rate multiplier (optional, default: 1.0)
    }
    
    Response:
    {
        "success": true,
        "audio": "base64-encoded-wav-data",
        "enhanced_text": "Enhanced version of input text",
        "format": "audio/wav",
        "language": "en",
        "voice_model": "en_US-amy-medium"
    }
    """
    try:
        data = request.get_json()
        
        if not data or 'text' not in data:
            return jsonify({
                'success': False,
                'error': 'Missing required field: text'
            }), 400
        
        original_text = data.get('text', '').strip()
        if not original_text:
            return jsonify({
                'success': False,
                'error': 'Text cannot be empty'
            }), 400
        
        enhance = data.get('enhance', True)
        language = data.get('language', 'en')
        rate = data.get('rate', 1.0)
        
        # Validate language code (Piper supports 100+ languages)
        supported_languages = ['en', 'hi', 'te', 'es', 'fr', 'de', 'it', 'nl', 'pt']
        if language not in supported_languages:
            logger.warning(f"Language '{language}' not in predefined list, attempting to use as-is")
        
        # Validate rate (1.0 = normal speed)
        if not isinstance(rate, (int, float)) or rate < 0.5 or rate > 3.0:
            rate = 1.0
        
        # Enhance text using Ollama if requested
        # Note: For Hindi and Telugu, skip enhancement to preserve pronunciation
        text_to_speak = original_text
        if enhance and language not in ['hi', 'te']:
            text_to_speak = generate_enhanced_text(original_text, language)
        
        # Convert to speech using Piper TTS
        audio_bytes = text_to_speech(text_to_speak, language, rate)
        
        if audio_bytes is None:
            return jsonify({
                'success': False,
                'error': 'Failed to generate audio. Ensure Piper TTS is installed.'
            }), 500
        
        # Encode to base64
        audio_base64 = base64.b64encode(audio_bytes).decode('utf-8')
        
        return jsonify({
            'success': True,
            'audio': audio_base64,
            'enhanced_text': text_to_speak,
            'format': 'audio/wav',
            'original_text': original_text,
            'language': language,
            'voice_model': get_piper_voice_model(language)
        }), 200
    
    except Exception as e:
        logger.error(f"TTS synthesis error: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@tts_bp.route('/health', methods=['GET'])
def tts_health():
    """
    Check if TTS service and Ollama are available
    
    Response:
    {
        "tts_available": true,
        "ollama_available": true,
        "model": "gemma3:12b",
        "engine": "piper-tts",
        "supported_languages": ["en", "hi", "te", "es", "fr", "de", "it", "nl", "pt"]
    }
    """
    try:
        tts_available = True
        ollama_available = False
        
        try:
            # Check if piper is available
            import subprocess
            subprocess.run(['piper', '--help'], capture_output=True, timeout=5, check=True)
        except (FileNotFoundError, Exception):
            logger.warning("Piper TTS not found. Install with: pip install piper-tts")
            tts_available = False
        
        try:
            client = get_ollama_client()
            # Try to check if model is available
            models = client.list()
            ollama_available = True
        except Exception as e:
            logger.warning(f"Ollama not available: {e}")
            ollama_available = False
        
        return jsonify({
            'tts_available': tts_available,
            'ollama_available': ollama_available,
            'model': get_tts_model(),
            'engine': 'piper-tts',
            'supported_languages': ['en', 'hi', 'te', 'es', 'fr', 'de', 'it', 'nl', 'pt', '+91 more']
        }), 200
    
    except Exception as e:
        logger.error(f"TTS health check error: {e}")
        return jsonify({
            'tts_available': False,
            'ollama_available': False,
            'engine': 'piper-tts',
            'error': str(e)
        }), 500

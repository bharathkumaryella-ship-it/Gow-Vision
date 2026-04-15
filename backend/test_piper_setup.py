#!/usr/bin/env python3
"""
Test script to verify Piper TTS setup and functionality
"""

import sys
from pathlib import Path
import json

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent))

def test_imports():
    """Test that all required modules are installed"""
    print("=" * 60)
    print("Testing imports...")
    print("=" * 60)
    
    try:
        from piper.voice import PiperVoice
        print("✓ Piper voice module imported successfully")
    except ImportError as e:
        print(f"✗ Failed to import piper.voice: {e}")
        return False
    
    try:
        from piper.download_voices import download_voice
        print("✓ Piper download module imported successfully")
    except ImportError as e:
        print(f"✗ Failed to import piper.download_voices: {e}")
        return False
    
    return True


def test_voice_models():
    """Test that voice models are downloaded and accessible"""
    print("\n" + "=" * 60)
    print("Testing voice models...")
    print("=" * 60)
    
    from pathlib import Path
    
    data_dir = Path.home() / '.piper' / 'voices'
    models = [
        'en_US-amy-medium',
        'hi_IN-pratham-medium',
        'te_IN-maya-medium'
    ]
    
    all_present = True
    for model in models:
        model_path = data_dir / f"{model}.onnx"
        config_path = data_dir / f"{model}.onnx.json"
        
        has_model = model_path.exists()
        has_config = config_path.exists()
        
        if has_model and has_config:
            size_mb = model_path.stat().st_size / (1024 * 1024)
            print(f"✓ {model}: {size_mb:.1f} MB")
        else:
            print(f"✗ {model}: MISSING")
            if not has_model:
                print(f"  - Model file: {model_path}")
            if not has_config:
                print(f"  - Config file: {config_path}")
            all_present = False
    
    return all_present


def test_piper_voice_loading():
    """Test loading a Piper voice model"""
    print("\n" + "=" * 60)
    print("Testing Piper voice loading...")
    print("=" * 60)
    
    from piper.voice import PiperVoice
    from pathlib import Path
    
    data_dir = Path.home() / '.piper' / 'voices'
    model_path = data_dir / 'en_US-amy-medium.onnx'
    
    try:
        voice = PiperVoice.load(str(model_path))
        print(f"✓ Voice loaded successfully")
        print(f"  - Sample rate: {voice.config.sample_rate} Hz")
        return True
    except Exception as e:
        print(f"✗ Failed to load voice: {e}")
        return False


def test_speech_synthesis():
    """Test actual speech synthesis"""
    print("\n" + "=" * 60)
    print("Testing speech synthesis...")
    print("=" * 60)
    
    from piper.voice import PiperVoice
    from pathlib import Path
    
    data_dir = Path.home() / '.piper' / 'voices'
    model_path = data_dir / 'en_US-amy-medium.onnx'
    
    try:
        voice = PiperVoice.load(str(model_path))
        
        # Generate speech
        text = "Hello, this is a test of Piper TTS"
        audio_bytes = b""
        
        for audio_chunk in voice.synthesize(text):
            audio_bytes += audio_chunk.audio_int16_bytes
        
        if audio_bytes:
            duration = (len(audio_bytes) / 2) / voice.config.sample_rate
            print(f"✓ Speech synthesized successfully")
            print(f"  - Text: '{text}'")
            print(f"  - Audio size: {len(audio_bytes)} bytes")
            print(f"  - Duration: ~{duration:.2f} seconds")
            return True
        else:
            print(f"✗ No audio generated")
            return False
    
    except Exception as e:
        print(f"✗ Speech synthesis failed: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_tts_blueprint():
    """Test the TTS blueprint functions"""
    print("\n" + "=" * 60)
    print("Testing TTS blueprint functions...")
    print("=" * 60)
    
    try:
        from tts_blueprint import get_piper_voice_model, text_to_speech
        
        # Test get_piper_voice_model
        model_en = get_piper_voice_model('en')
        model_hi = get_piper_voice_model('hi')
        model_te = get_piper_voice_model('te')
        
        print(f"✓ get_piper_voice_model() works")
        print(f"  - English: {model_en}")
        print(f"  - Hindi: {model_hi}")
        print(f"  - Telugu: {model_te}")
        
        # Test text_to_speech
        print(f"\n  Testing text_to_speech() for English...")
        audio_bytes = text_to_speech("Hello world", language="en")
        
        if audio_bytes:
            print(f"✓ text_to_speech() generated {len(audio_bytes)} bytes")
            return True
        else:
            print(f"✗ text_to_speech() returned None")
            return False
    
    except Exception as e:
        print(f"✗ TTS blueprint test failed: {e}")
        import traceback
        traceback.print_exc()
        return False


def main():
    """Run all tests"""
    print("\n")
    print("=" * 60)
    print("  PIPER TTS SETUP VERIFICATION")
    print("=" * 60)
    
    results = {}
    
    results['imports'] = test_imports()
    results['voice_models'] = test_voice_models()
    results['piper_loading'] = test_piper_voice_loading()
    results['synthesis'] = test_speech_synthesis()
    results['blueprint'] = test_tts_blueprint()
    
    # Summary
    print("\n" + "=" * 60)
    print("TEST SUMMARY")
    print("=" * 60)
    
    total = len(results)
    passed = sum(1 for v in results.values() if v)
    
    for test_name, result in results.items():
        status = "✓ PASS" if result else "✗ FAIL"
        print(f"{test_name:30} {status}")
    
    print("-" * 60)
    print(f"Total: {passed}/{total} tests passed")
    print("=" * 60)
    
    if passed == total:
        print("\n✓ All tests passed! Piper TTS is ready to use.")
        return 0
    else:
        print(f"\n✗ {total - passed} test(s) failed. Please check above for details.")
        return 1


if __name__ == '__main__':
    exit_code = main()
    sys.exit(exit_code)

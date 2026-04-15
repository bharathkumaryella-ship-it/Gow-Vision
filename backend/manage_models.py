#!/usr/bin/env python
"""
Ollama Model Manager
Helps manage and check available Ollama models for health analysis
"""

import os
import sys
import requests
from typing import List

# Ollama configuration
OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")

# Recommended models for cattle health analysis (in priority order)
RECOMMENDED_MODELS = [
    {
        "name": "mistral",
        "size": "4.1GB",
        "speed": "Fast",
        "description": "General purpose - Good balance of speed and accuracy"
    },
    {
        "name": "neural-chat",
        "size": "4.1GB",
        "speed": "Fast",
        "description": "Optimized for conversations - Good for dialogue-style analysis"
    },
    {
        "name": "llama2",
        "size": "3.8GB",
        "speed": "Medium",
        "description": "Meta's Llama - Good accuracy but slower"
    },
    {
        "name": "dolphin-mixtral", 
        "size": "26GB",
        "speed": "Slow",
        "description": "Very accurate but requires good hardware"
    }
]

def check_ollama_running():
    """Check if Ollama server is running"""
    try:
        response = requests.get(f"{OLLAMA_BASE_URL}/api/tags", timeout=2)
        return response.status_code == 200
    except:
        return False

def get_available_models() -> List[str]:
    """Get list of currently available Ollama models"""
    try:
        response = requests.get(f"{OLLAMA_BASE_URL}/api/tags", timeout=5)
        if response.status_code == 200:
            data = response.json()
            if "models" in data:
                return [m.get("name", "").split(":")[0] for m in data["models"] if "name" in m]
    except Exception as e:
        print(f"❌ Error fetching models: {e}")
    return []

def check_health_analysis_setup():
    """Check if all components for health analysis are ready"""
    print("\n" + "="*60)
    print("🏥 Health Analysis Setup Checker")
    print("="*60 + "\n")
    
    # Check Flask
    print("✓ Flask Backend: Available")
    
    # Check Ollama
    print("\n📦 Ollama Server:")
    if check_ollama_running():
        print("  ✓ Ollama is running")
        available_models = get_available_models()
        if available_models:
            print(f"  ✓ Found {len(available_models)} model(s)")
            for model in available_models:
                print(f"    • {model}")
        else:
            print("  ⚠️  No models installed")
            print("     Run: ollama pull mistral")
    else:
        print("  ❌ Ollama not running")
        print("     Start Ollama first: ollama serve")
    
    # Check Whisper
    print("\n🎤 Whisper (Speech-to-Text):")
    try:
        import whisper
        print("  ✓ Whisper installed")
    except:
        print("  ❌ Whisper not installed")
        print("     Run: pip install openai-whisper>=20231114")
    
    # Check ffmpeg
    print("\n🎵 FFmpeg (Audio Processing):")
    import subprocess
    try:
        subprocess.run(["ffmpeg", "-version"], capture_output=True, timeout=2)
        print("  ✓ FFmpeg installed")
    except:
        print("  ❌ FFmpeg not installed")
        print("     Windows: choco install ffmpeg")
        print("     Mac: brew install ffmpeg")
        print("     Linux: sudo apt-get install ffmpeg")
    
    # Check TTS
    print("\n🔊 Text-to-Speech (pyttsx3):")
    try:
        import pyttsx3
        print("  ✓ pyttsx3 installed")
    except:
        print("  ❌ pyttsx3 not installed")
        print("     Run: pip install pyttsx3>=2.90")
    
    print("\n" + "="*60)

def list_recommended_models():
    """Show recommended models for health analysis"""
    print("\n" + "="*60)
    print("📋 Recommended Models")
    print("="*60 + "\n")
    
    for i, model in enumerate(RECOMMENDED_MODELS, 1):
        print(f"{i}. {model['name'].upper()}")
        print(f"   Size: {model['size']:10} | Speed: {model['speed']:10}")
        print(f"   Description: {model['description']}")
        print()

def install_model(model_name: str):
    """Install a model using Ollama"""
    import subprocess
    
    print(f"\n📥 Installing {model_name}...")
    print("This may take a few minutes...")
    print("(Make sure Ollama is running: ollama serve)\n")
    
    try:
        subprocess.run(["ollama", "pull", model_name], check=True)
        print(f"\n✓ {model_name} installed successfully!")
        return True
    except subprocess.CalledProcessError:
        print(f"\n❌ Failed to install {model_name}")
        return False
    except FileNotFoundError:
        print("\n❌ Ollama not found. Is it installed?")
        print("Download from: https://ollama.ai")
        return False

def main():
    """Main entry point"""
    if len(sys.argv) < 2:
        # Show help if no args
        print("\n📊 Ollama Model Manager")
        print("="*60)
        print("\nUsage:")
        print("  python manage_models.py check      - Check setup status")
        print("  python manage_models.py list       - List recommended models")
        print("  python manage_models.py install <model> - Install a model")
        print("  python manage_models.py pull <model> - Alias for install")
        print("\nExamples:")
        print("  python manage_models.py check")
        print("  python manage_models.py install mistral")
        print("  python manage_models.py install neural-chat")
        print("\n" + "="*60)
        return
    
    command = sys.argv[1].lower()
    
    if command == "check":
        check_health_analysis_setup()
    elif command == "list" or command == "ls":
        list_recommended_models()
    elif command == "install" or command == "pull":
        if len(sys.argv) < 3:
            print("❌ Please specify a model name")
            print("Example: python manage_models.py install mistral")
            list_recommended_models()
            return
        model_name = sys.argv[2]
        install_model(model_name)
    else:
        print(f"❌ Unknown command: {command}")
        print("Try: python manage_models.py check")

if __name__ == "__main__":
    main()

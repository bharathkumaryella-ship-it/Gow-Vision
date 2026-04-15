#!/usr/bin/env python3
"""
Download high-quality Piper voice models for Hindi and Telugu
"""

import os
import urllib.request
import urllib.error
from pathlib import Path
import json

def download_voice_model(voice_name: str, model_url: str) -> bool:
    """Download a voice model from Piper voice repository"""
    
    # Create .piper/voices directory if it doesn't exist
    voice_dir = Path.home() / '.piper' / 'voices'
    voice_dir.mkdir(parents=True, exist_ok=True)
    
    # Model file path
    model_path = voice_dir / f"{voice_name}.onnx"
    json_path = voice_dir / f"{voice_name}.onnx.json"
    
    print(f"\nDownloading: {voice_name}")
    print(f"Location: {model_path}")
    
    try:
        # Download model file
        print(f"  Downloading model file...")
        urllib.request.urlretrieve(model_url, model_path)
        print(f"  ✓ Model file downloaded ({model_path.stat().st_size / (1024*1024):.1f} MB)")
        
        # Download JSON config file
        json_url = model_url.replace('.onnx', '.onnx.json')
        print(f"  Downloading config...")
        try:
            urllib.request.urlretrieve(json_url, json_path)
            print(f"  ✓ Config file downloaded")
        except urllib.error.HTTPError:
            print(f"  ! Config file not found (continuing anyway)")
        
        return True
        
    except urllib.error.URLError as e:
        print(f"  ✗ Download failed: {e}")
        return False
    except Exception as e:
        print(f"  ✗ Error: {e}")
        return False


def main():
    """Download all required voice models"""
    
    print("=" * 70)
    print("PIPER VOICE MODELS DOWNLOADER")
    print("=" * 70)
    
    # Piper voices are hosted via the project's voice repository
    base_url = "https://huggingface.co/rhasspy/piper-voices/resolve/main"
    
    models_to_download = [
        # Hindi models - using Priyamvada (natural female voice)
        ("hi_IN-priyamvada-medium", f"{base_url}/hi/hi_IN/priyamvada/medium/hi_IN-priyamvada-medium.onnx"),
        
        # Telugu models - using Padmavathi (natural female voice)
        ("te_IN-padmavathi-medium", f"{base_url}/te/te_IN/padmavathi/medium/te_IN-padmavathi-medium.onnx"),
    ]
    
    print("\nStarting downloads...\n")
    results = {}
    
    for voice_name, model_url in models_to_download:
        results[voice_name] = download_voice_model(voice_name, model_url)
    
    # Summary
    print("\n" + "=" * 70)
    print("DOWNLOAD SUMMARY")
    print("=" * 70)
    
    success_count = sum(1 for v in results.values() if v)
    total_count = len(results)
    
    for voice_name, success in results.items():
        status = "✓ SUCCESS" if success else "✗ FAILED"
        print(f"{voice_name:30} {status}")
    
    print(f"\nCompleted: {success_count}/{total_count}")
    
    if success_count == total_count:
        print("\n✓ All voice models downloaded successfully!")
        print("  The TTS system will now use the new high-quality models for:")
        print("  - Hindi: Priyamvada (natural female voice)")
        print("  - Telugu: Padmavathi (natural female voice)")
        return 0
    else:
        print(f"\n! {total_count - success_count} download(s) failed")
        print("  Check your internet connection and try again")
        return 1


if __name__ == "__main__":
    exit(main())

# Voice Health Analysis - Complete Setup & Integration Guide

## 🎯 Quick Start (5 minutes)

### Prerequisites
✅ Already installed (you mentioned):
- OpenAI Whisper
- TTS (Coqui TTS or pyttsx3)
- PyTorch
- Ollama

### Step 1: Verify Backend is Ready
```bash
cd backend

# Check if all voice dependencies are available
python test_voice_analysis.py

# Expected output:
# ✅ All dependencies available!
# ✅ API Status: OK
# ✅ ALL TESTS PASSED - Voice Analysis System is Ready!
```

### Step 2: Start the Backend
```bash
# Terminal 1: Start Flask backend
python app.py

# You should see:
# * Running on http://localhost:5000
# * Debugger is active!
```

### Step 3: Start Ollama (if not already running)
```bash
# Terminal 2: Start Ollama
ollama serve

# Verify model is downloaded
ollama list

# Expected:
# NAME          ID              SIZE    MODIFIED
# mistral       2a4...          4.1 GB  2 hours ago
```

### Step 4: Integrate Frontend Component
```bash
# Copy the component to your React app
cp frontend/src/app/components/VoiceHealthAnalysis.tsx \
   frontend/src/app/components/

# In your router (routes.tsx), add:
import VoiceHealthAnalysis from './components/VoiceHealthAnalysis';

// Add to routes:
{
  path: '/health/voice',
  element: <VoiceHealthAnalysis />
}
```

### Step 5: Test the Complete Workflow
```bash
# Terminal 3: Run test suite
cd backend
python test_voice_analysis.py --skip-cleanup

# This will:
# 1. Check all dependencies
# 2. Verify API health
# 3. Create test audio
# 4. Send to voice analysis endpoint
# 5. Return results with audio response
```

---

## 📋 Component Overview

### Backend (Health Analysis Blueprint)
**File:** `backend/health_analysis_blueprint.py`

**New Functions:**
- `transcribe_audio()` - Whisper integration
- `audio_to_voice_health_analysis()` - Complete workflow
- `text_to_voice()` - TTS synthesis
- `perform_health_analysis()` - Refactored core logic

**New Endpoints:**
- `POST /api/health-analysis/voice-analyze` - Main voice endpoint
- `POST /api/health-analysis/voice-analyze/stream` - Streaming endpoint
- `GET /api/health-analysis/status` - Enhanced health check

### Frontend Component
**File:** `frontend/src/app/components/VoiceHealthAnalysis.tsx`

**Features:**
- 🎤 Real-time voice recording
- 📊 Live recording timer
- 🌍 Multi-language support (English, Hindi, Telugu)
- 🎵 Audio playback of responses
- ♿ Accessible UI with proper labels

---

## 🔧 Configuration

### Environment Variables
Create or update `.env` in the backend directory:

```env
# Ollama Configuration
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=mistral

# Flask Configuration
FLASK_ENV=development
FLASK_DEBUG=1

# CORS Configuration
CORS_ORIGINS=http://localhost:5173,http://localhost:5174

# Database
DATABASE_URL=sqlite:///gowvision.db

# Logging
LOG_LEVEL=INFO
```

### Troubleshooting Configuration

**Issue: Ollama connection error**
```bash
# Verify Ollama is running
curl http://localhost:11434/api/tags

# Should return list of models
```

**Issue: Whisper model not downloaded**
```bash
# Download the base model (fastest)
python -c "import whisper; whisper.load_model('base')"

# This downloads ~140MB model automatically
```

**Issue: TTS voice not found**
```bash
# List available voices
python -c "import pyttsx3; engine = pyttsx3.init(); print([v.name for v in engine.getProperty('voices')])"
```

---

## 📊 API Workflow Diagram

```plaintext
┌─────────────────────────────────────────────────────────────────┐
│                      FARMER (Frontend)                           │
│  🎤 Speaks about cattle health symptoms in native language     │
└──────────────────────────┬──────────────────────────────────────┘
                          │ Audio File (WAV, MP3, etc.)
                          │ + Breed, Age, Language
                          ▼
┌──────────────────────────────────────────────────────────────────┐
│               VOICE ANALYSIS API ENDPOINT                        │
│           /api/health-analysis/voice-analyze                    │
└──────────────┬──────────────────────────────────────────────────┘
               │
        ┌──────┴──────┬───────────────────┬──────────────┐
        │             │                   │              │
        ▼             ▼                   ▼              ▼
   ┌────────┐  ┌──────────┐       ┌───────────┐  ┌──────────┐
   │ Whisper│  │  Ollama  │       │   TTS     │  │ Response │
   │  STT   │  │  Analysis│       │ Synthesis │  │ Assembly │
   └────────┘  └──────────┘       └───────────┘  └──────────┘
        │             │                   │              │
        │   {text}    │                   │              │
        └────────────▶│{symptoms,breed}   │              │
                      │────────────{analysis}────────────▶
                                         │{text} ────────▶
                                         │{audio_base64}──┐
                                                         │
                                                         │
                                  ┌──────────────────────┘
                                  │
                                  ▼
                    ┌─────────────────────────┐
                    │ Response JSON:          │
                    │ - transcribed_symptoms  │
                    │ - analysis (text)       │
                    │ - audio_response (b64)  │
                    │ - language              │
                    │ - breed, age            │
                    └──────────────┬──────────┘
                                   │
                                   ▼
                    ┌─────────────────────────┐
                    │ Display Results:        │
                    │ - Show transcribed text │
                    │ - Display analysis      │
                    │ - Play audio response   │
                    └─────────────────────────┘
```

---

## 🧪 Testing the Voice Workflow

### Test 1: API Health Check
```bash
curl http://localhost:5000/api/health-analysis/status | jq '.'

# Expected response shows voice capabilities:
# {
#   "service": "health_analysis",
#   "ollama_status": "connected",
#   "whisper_available": true,
#   "tts_available": true,
#   "voice_analysis_enabled": true,
#   "supported_audio_formats": ["wav", "mp3", "m4a", "ogg", "flac"],
#   "supported_languages": ["en", "hi", "te"]
# }
```

### Test 2: Send Audio File
```bash
# Create test audio or use existing WAV file
curl -X POST http://localhost:5000/api/health-analysis/voice-analyze \
  -F "audio=@test_audio.wav" \
  -F "breed=Holstein" \
  -F "age=36" \
  -F "language=en" | jq '.'
```

### Test 3: Automated Test Suite
```bash
cd backend
python test_voice_analysis.py

# Options:
# --api http://localhost:5000    # Custom API URL
# --audio my_audio.wav           # Use existing file
# --skip-cleanup                 # Keep test files
# --quick                        # Skip dependency check
```

### Test 4: Manual Recording and Analysis (Python)
```python
import requests
import wave
import pyaudio

# Record audio
CHUNK = 1024
FORMAT = pyaudio.paFloat32
CHANNELS = 1
RATE = 16000
RECORD_SECONDS = 5

p = pyaudio.PyAudio()
stream = p.open(format=FORMAT, channels=CHANNELS, rate=RATE,
                input=True, frames_per_buffer=CHUNK)

print("Recording...")
frames = []
for _ in range(0, int(RATE / CHUNK * RECORD_SECONDS)):
    data = stream.read(CHUNK)
    frames.append(data)

stream.stop_stream()
stream.close()
p.terminate()

# Save audio
with wave.open('my_audio.wav', 'wb') as wf:
    wf.setnchannels(CHANNELS)
    wf.setsampwidth(p.get_sample_size(FORMAT))
    wf.setframerate(RATE)
    wf.writeframes(b''.join(frames))

# Send to API
with open('my_audio.wav', 'rb') as f:
    response = requests.post(
        'http://localhost:5000/api/health-analysis/voice-analyze',
        files={'audio': f},
        data={'breed': 'Gir', 'age': '24', 'language': 'en'}
    )

result = response.json()
print("Transcribed:", result['transcribed_symptoms'])
print("Analysis:", result['analysis'])
```

---

## 🚀 Performance Optimization

### For Production Deployment

1. **Use GPU for Ollama** (10x faster inference)
```bash
# Check GPU availability
ollama list --gpu

# Run with GPU
CUDA_VISIBLE_DEVICES=0 ollama serve
```

2. **Use Lightweight Models**
```bash
# Faster than mistral (7B parameters)
ollama pull neural-chat  # 4.1GB
ollama pull orca-mini    # 3.3GB
```

3. **Enable Caching**
```python
# Add to app.py
from flask_caching import Cache

cache = Cache(app, config={'CACHE_TYPE': 'simple'})

@app.route('/api/health-analysis/status')
@cache.cached(timeout=60)
def get_status():
    # ...
```

4. **Compress Audio**
```python
# In audio recording, use MP3 instead of WAV
# Reduces file size by 90%
```

### Expected Performance
- **Whisper (STT)**: 5-15 sec per request
- **Ollama (Analysis)**: 10-30 sec per request
- **TTS (Synthesis)**: 2-5 sec per request
- **Total**: 20-50 seconds (acceptable for farmer use)

---

## 📱 Mobile Compatibility

### Browser Requirements
- Chrome/Edge: Full support
- Safari: Partial support (iOS 14.5+)
- Firefox: Full support

### Mobile Recording
```javascript
// Add to VoiceHealthAnalysis.tsx for mobile

const isMobile = /iPhone|iPad|Android|Windows Phone/i.test(navigator.userAgent);

// Adjust recording parameters for mobile
const constraints = {
  audio: {
    echoCancellation: true,
    noiseSuppression: true,
    sampleRate: isMobile ? 8000 : 16000,  // Lower sample rate for mobile
  }
};
```

---

## 🔐 Security Considerations

### Input Validation
✅ Already implemented in endpoints:
- Audio file size check
- Supported format validation
- Language code validation
- Sanitized form inputs

### Privacy
- Audio files are **never stored** by default
- Add user consent before recording:
```jsx
<Alert>
  <AlertTriangle className="w-4 h-4" />
  <AlertDescription>
    By continuing, you agree that your voice may be processed by AI.
  </AlertDescription>
</Alert>
```

### Rate Limiting
```python
# Add to app.py for production
from flask_limiter.util import get_remote_address

limiter = Limiter(
    app=app,
    key_func=get_remote_address,
    default_limits=["200 per day", "50 per hour"]
)

@health_analysis_bp.route('/voice-analyze', methods=['POST'])
@limiter.limit("10 per day")  # 10 voice analyses per day per IP
def voice_analyze_health():
    # ...
```

---

## 📚 Additional Resources

### API Documentation
- Main Documentation: `doc/VOICE_HEALTH_ANALYSIS_API.md`
- OpenAI Whisper: https://github.com/openai/whisper
- Ollama Models: https://ollama.ai/library
- pyttsx3 Docs: https://pyttsx3.readthedocs.io

### Example Usage Files
- Test Script: `backend/test_voice_analysis.py`
- React Component: `frontend/src/app/components/VoiceHealthAnalysis.tsx`

### Debugging

Enable verbose logging:
```python
# In backend/logging_utils.py
logger.setLevel(logging.DEBUG)

# Or set environment variable
export LOG_LEVEL=DEBUG
```

Check logs:
```bash
# View recent logs
tail -f backend/logs/app.log

# Filter for voice analysis
grep "voice\|transcrib\|whisper" backend/logs/app.log
```

---

## ✅ Implementation Checklist

- [ ] Backend updated with voice endpoints
- [ ] Dependencies verified (Whisper, TTS, Ollama)
- [ ] Test script runs successfully
- [ ] API health endpoint shows voice_analysis_enabled: true
- [ ] Frontend component added to routes
- [ ] Microphone permissions working
- [ ] Audio file upload and processing working
- [ ] Transcription returning correct text
- [ ] Health analysis generating responses
- [ ] TTS generating audio responses
- [ ] Audio playback working in browser
- [ ] Multi-language support tested
- [ ] Error handling tested
- [ ] Performance acceptable (< 1 minute for full workflow)
- [ ] Documentation reviewed

---

## 🎓 Next Steps

1. **For Farmers:**
   - Navigate to `/health/voice`
   - Click microphone to start recording
   - Speak about cattle symptoms
   - Get instant analysis and audio response

2. **For Developers:**
   - Review `health_analysis_blueprint.py` for API structure
   - Check `VoiceHealthAnalysis.tsx` for frontend patterns
   - Extend with additional languages
   - Add video recording for visual analysis

3. **For Deployment:**
   - Test with real farmers (user acceptance testing)
   - Optimize audio processing pipelines
   - Add offline support for areas with poor connectivity
   - Set up monitoring for API performance

---

## 🐛 Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| "Microphone access denied" | Browser permission | Check browser settings, restart browser |
| "Ollama service not found" | Service not running | Run `ollama serve` in terminal |
| "Whisper not installed" | Missing dependency | Run `pip install openai-whisper` |
| "Audio not recording" | Device not configured | Check system audio settings |
| "Analysis takes >2 minutes" | Slow CPU/GPU | Use lighter model or upgrade hardware |
| "Response audio very slow" | TTS language issue | Try different language or voice |

---

**Last Updated:** April 2026  
**Version:** 2.1  
**Status:** ✅ Ready for Production

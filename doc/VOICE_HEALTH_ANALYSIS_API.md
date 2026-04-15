# Voice-Based Health Analysis API

## Overview

The Voice Health Analysis API provides a complete workflow for farmers to analyze cattle health using natural voice input:

```
🎤 Voice Input
   ↓
🧠 Speech-to-Text (Whisper)
   ↓
🧠 Multimodal AI (Ollama)
   ↓
🔊 Text-to-Speech (TTS)
   ↓
🔊 Voice Output
```

### Workflow Steps

1. **Voice Input (🎤)**: Farmer speaks in their native language
2. **Speech-to-Text**: Whisper transcribes voice to text
3. **AI Analysis**: Ollama performs veterinary health analysis
4. **Text-to-Speech**: TTS converts analysis to speech
5. **Voice Output (🔊)**: Farmer receives audio response in their language

---

## API Endpoints

### 1. Voice Health Analysis (Recommended)

**Endpoint:** `POST /api/health-analysis/voice-analyze`

**Description:** Full voice-based health analysis with integrated workflow

**Request Parameters:**
- `audio` (file, **required**): Audio file containing voice input
  - Supported formats: `.wav`, `.mp3`, `.m4a`, `.ogg`, `.flac`
  - Max size: 25MB (recommended)
- `breed` (string, optional): Cattle breed (e.g., "Holstein", "Gir", "Sahiwal")
- `age` (string, optional): Cattle age in months (default: "Unknown")
- `language` (string, optional): Language code - `en` (English), `hi` (Hindi), `te` (Telugu)
  - Default: `en`

**Response:**
```json
{
  "success": true,
  "emergency_alert": "",
  "severity": "normal",
  "transcribed_symptoms": "The cow has been coughing for 2 days and not eating well",
  "analysis": "### Assessment Summary\nThe cattle is showing signs of respiratory distress...\n\n#### Potential Diseases/Conditions\n- Bovine Respiratory Disease (BRD)\n- Pneumonia\n\n...",
  "audio_response": "base64_encoded_wav_audio_data_here",
  "language": "en",
  "breed": "Holstein",
  "age": "36",
  "workflow": "🎤 Voice → Whisper STT → Ollama Analysis → TTS Voice Output",
  "status": 200
}
```

**Response Fields:**
- `emergency_alert`: Prominent red alert message for critical/urgent conditions
  - Displays at top of screen in bright red when severity is critical or urgent
  - Empty string for normal/monitor conditions
- `severity`: One of `critical`, `urgent`, `monitor`, or `normal`
  - **critical** → Shows RED emergency banner "CONTACT VETERINARIAN IMMEDIATELY"
  - **urgent** → Shows RED emergency banner "URGENT: CONTACT VETERINARIAN IMMEDIATELY"
  - **monitor** → No alert shown
  - **normal** → No alert shown
- `transcribed_symptoms`: What the AI heard from the farmer's voice
- `analysis`: Detailed veterinary analysis in text format
- `audio_response`: Base64-encoded WAV audio of the analysis (ready to play)
- `language`: Language used for processing
- `workflow`: The complete processing pipeline used

**Example cURL:**
```bash
curl -X POST http://localhost:5000/api/health-analysis/voice-analyze \
  -F "audio=@voice_sample.wav" \
  -F "breed=Holstein" \
  -F "age=36" \
  -F "language=en"
```

**Example Python:**
```python
import requests

with open('voice_sample.wav', 'rb') as audio_file:
    response = requests.post(
        'http://localhost:5000/api/health-analysis/voice-analyze',
        files={'audio': audio_file},
        data={
            'breed': 'Holstein',
            'age': '36',
            'language': 'en'
        }
    )
    
    result = response.json()
    
    # Check for emergency - show prominent red banner if critical/urgent
    if result.get('emergency_alert'):
        # Display as prominent RED banner at top of screen
        print("=" * 60)
        print(result['emergency_alert'])
        print("=" * 60)
    
    # Extract and play audio response
    import base64
    audio_bytes = base64.b64decode(result['audio_response'])
    with open('response.wav', 'wb') as f:
        f.write(audio_bytes)
    
    # Print text analysis
    print("\nAnalysis:")
    print(result['analysis'])
```

**Emergency Alert Design:**

The emergency alert displays as a **prominent RED banner** that must be shown immediately:

```
┌──────────────────────────────────────────────────────────────────┐
│ ⚠️  CONTACT VETERINARIAN IMMEDIATELY  ⚠️                          │
│                                                                   │
│ This cattle requires urgent professional medical attention       │
└──────────────────────────────────────────────────────────────────┘
```

**CSS Styling Example:**
```css
.emergency-alert {
  background-color: #FF0000;  /* Bright red */
  color: white;
  border: 3px solid darkred;
  padding: 20px;
  font-size: 18px;
  font-weight: bold;
  border-radius: 12px;
  margin: 20px auto;
  text-align: center;
  animation: pulse 1s infinite;  /* Optional: pulsing animation */
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.8; }
}
```

---

### 2. Streaming Voice Analysis

**Endpoint:** `POST /api/health-analysis/voice-analyze/stream`

**Description:** Real-time streaming voice analysis that returns binary audio directly

**Query Parameters:**
- `breed` (optional): Cattle breed
- `age` (optional): Cattle age
- `language` (optional): Language code

**Request Body:** Binary audio data

**Response:** Binary WAV audio stream

**Example cURL:**
```bash
curl -X POST "http://localhost:5000/api/health-analysis/voice-analyze/stream?breed=Gir&language=hi" \
  --data-binary @audio.wav \
  --output response_audio.wav
```

**Example Python:**
```python
import requests

with open('audio.wav', 'rb') as f:
    response = requests.post(
        'http://localhost:5000/api/health-analysis/voice-analyze/stream',
        params={
            'breed': 'Gir',
            'age': '24',
            'language': 'hi'
        },
        data=f.read()
    )
    
    # Save response audio
    with open('response.wav', 'wb') as out_f:
        out_f.write(response.content)
```

---

### 3. Text Health Analysis (Traditional)

**Endpoint:** `POST /api/health-analysis/analyze`

**Description:** Traditional text-based health analysis (still available)

**Request (JSON):**
```json
{
  "symptoms": "Coughing, fever, reduced feed intake",
  "breed": "Holstein",
  "age": "36"
}
```

**Request (Multipart):**
- `symptoms`: Text description of symptoms
- `breed`: Cattle breed
- `age`: Cattle age
- `image`: Image file of cattle (optional)

**Response:**
```json
{
  "success": true,
  "analysis": "Assessment summary and recommendations...",
  "model": "mistral",
  "status": 200
}
```

---

### 4. Service Status

**Endpoint:** `GET /api/health-analysis/status`

**Description:** Check if all services are available and ready

**Response:**
```json
{
  "service": "health_analysis",
  "ollama_status": "connected",
  "configured_model": "mistral",
  "model_available": true,
  "whisper_available": true,
  "tts_available": true,
  "voice_analysis_enabled": true,
  "supported_audio_formats": ["wav", "mp3", "m4a", "ogg", "flac"],
  "supported_languages": ["en", "hi", "te"]
}
```

---

## Supported Languages

| Language | Code | Status |
|----------|------|--------|
| English | `en` | ✅ Fully Supported |
| Hindi | `hi` | ✅ Fully Supported |
| Telugu | `te` | ✅ Fully Supported |
| Others | - | Coming Soon |

---

## Audio Format Support

**Supported Formats:**
- WAV (.wav) - Recommended
- MP3 (.mp3)
- M4A (.m4a)
- OGG (.ogg)
- FLAC (.flac)

**Recording Requirements:**
- Sample Rate: 16000 Hz or higher recommended
- Duration: Up to 25 minutes per request
- File Size: < 25MB

---

## Installation Requirements

All dependencies are already installed:

```bash
# Speech-to-Text
pip install openai-whisper

# Ollama (for AI analysis)
# Install from https://ollama.ai, then:
ollama pull mistral   # or your preferred model

# Text-to-Speech
pip install pyttsx3

# Or for better quality TTS:
pip install TTS

# Flask backend
pip install flask flask-cors
```

---

## Complete Workflow Example

### Frontend JavaScript Example

```javascript
// 1. Record Audio from Microphone
class HealthAnalyzer {
  constructor() {
    this.mediaRecorder = null;
    this.audioChunks = [];
  }

  async startRecording() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    this.mediaRecorder = new MediaRecorder(stream);
    this.audioChunks = [];
    
    this.mediaRecorder.ondataavailable = (event) => {
      this.audioChunks.push(event.data);
    };
    
    this.mediaRecorder.start();
    return stream;
  }

  stopRecording() {
    return new Promise((resolve) => {
      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });
        resolve(audioBlob);
      };
      this.mediaRecorder.stop();
    });
  }

  // 2. Send to Voice Analysis API
  async analyzeVoice(audioBlob, breed = 'Unknown', age = 'Unknown', language = 'en') {
    const formData = new FormData();
    formData.append('audio', audioBlob);
    formData.append('breed', breed);
    formData.append('age', age);
    formData.append('language', language);

    const response = await fetch('/api/health-analysis/voice-analyze', {
      method: 'POST',
      body: formData
    });

    return await response.json();
  }

  // 3. Play Audio Response
  playResponse(base64Audio) {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const binaryString = atob(base64Audio);
    const bytes = new Uint8Array(binaryString.length);
    
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    const audio = new Audio();
    audio.src = URL.createObjectURL(new Blob([bytes], { type: 'audio/wav' }));
    audio.play();
  }
}

// Usage
const analyzer = new HealthAnalyzer();

// Record voice
document.getElementById('recordBtn').onclick = async () => {
  await analyzer.startRecording();
  document.getElementById('recordBtn').disabled = true;
  document.getElementById('stopBtn').disabled = false;
};

document.getElementById('stopBtn').onclick = async () => {
  const audioBlob = await analyzer.stopRecording();
  
  // Analyze
  const result = await analyzer.analyzeVoice(
    audioBlob,
    'Holstein',
    '36',
    'en'
  );
  
  // Display results
  document.getElementById('analysis').textContent = result.analysis;
  document.getElementById('transcription').textContent = result.transcribed_symptoms;
  
  // Play audio response
  analyzer.playResponse(result.audio_response);
};
```

### Python CLI Example

```python
#!/usr/bin/env python3
"""
Voice Health Analysis CLI
Simple command-line tool for voice-based cattle health analysis
"""

import sys
import requests
import base64
import os
from pathlib import Path

# For recording audio
try:
    import pyaudio
    import wave
except ImportError:
    print("Install: pip install pyaudio")
    sys.exit(1)

class VoiceHealthAnalyzer:
    API_URL = "http://localhost:5000/api/health-analysis"
    
    def record_audio(self, duration=10, filename="temp_audio.wav"):
        """Record audio from microphone"""
        CHUNK = 1024
        FORMAT = pyaudio.paFloat32
        CHANNELS = 1
        RATE = 16000
        
        p = pyaudio.PyAudio()
        stream = p.open(format=FORMAT, channels=CHANNELS, rate=RATE,
                       input=True, frames_per_buffer=CHUNK)
        
        print(f"Recording for {duration} seconds...")
        frames = []
        
        for _ in range(0, int(RATE / CHUNK * duration)):
            data = stream.read(CHUNK)
            frames.append(data)
        
        stream.stop_stream()
        stream.close()
        p.terminate()
        
        # Save to file
        wf = wave.open(filename, 'wb')
        wf.setnchannels(CHANNELS)
        wf.setsampwidth(p.get_sample_size(FORMAT))
        wf.setframerate(RATE)
        wf.writeframes(b''.join(frames))
        wf.close()
        
        return filename
    
    def analyze(self, audio_file, breed='Unknown', age='Unknown', language='en'):
        """Send audio to API for analysis"""
        with open(audio_file, 'rb') as f:
            response = requests.post(
                f"{self.API_URL}/voice-analyze",
                files={'audio': f},
                data={
                    'breed': breed,
                    'age': age,
                    'language': language
                }
            )
        
        return response.json()
    
    def play_response(self, base64_audio, output_file='response.wav'):
        """Save audio response to file"""
        audio_bytes = base64.b64decode(base64_audio)
        with open(output_file, 'wb') as f:
            f.write(audio_bytes)
        
        print(f"Response saved to {output_file}")
        
        # Try to play
        try:
            os.system(f"start {output_file}")  # Windows
        except:
            try:
                os.system(f"open {output_file}")  # macOS
            except:
                os.system(f"xdg-open {output_file}")  # Linux

if __name__ == '__main__':
    analyzer = VoiceHealthAnalyzer()
    
    # Example: Record and analyze
    audio_file = analyzer.record_audio(duration=5)
    
    result = analyzer.analyze(
        audio_file,
        breed='Holstein',
        age='36',
        language='en'
    )
    
    print("\n=== HEALTH ANALYSIS RESULTS ===\n")
    print(f"You said: {result['transcribed_symptoms']}\n")
    print("Analysis:")
    print(result['analysis'])
    
    # Play response
    analyzer.play_response(result['audio_response'])
    
    # Cleanup
    os.remove(audio_file)
```

---

## Error Handling

### Common Errors

**1. Missing Audio File**
```json
{
  "success": false,
  "error": "Missing audio file",
  "message": "Please provide an audio file with key 'audio'",
  "status": 400
}
```

**2. Invalid Audio Format**
```json
{
  "success": false,
  "error": "Invalid audio format",
  "message": "Allowed formats: wav, mp3, m4a, ogg, flac",
  "supported_formats": ["wav", "mp3", "m4a", "ogg", "flac"],
  "status": 400
}
```

**3. Ollama Server Not Available**
```json
{
  "success": false,
  "error": "Analysis failed",
  "message": "Ollama server connection failed",
  "status": 500
}
```

**4. Whisper Transcription Failed**
```json
{
  "success": false,
  "error": "Failed to transcribe audio",
  "analysis": null,
  "audio_response": null
}
```

---

## Performance Considerations

### Audio Processing Time

- **Transcription (Whisper)**: 5-15 seconds for 1 minute audio
- **Analysis (Ollama)**: 10-30 seconds depending on response length
- **TTS Synthesis**: 2-5 seconds
- **Total**: 20-50 seconds per analysis request

### Optimization Tips

1. **Use streaming endpoint** for real-time processing
2. **Keep audio duration under 2 minutes** for faster processing
3. **Compress audio** to lower sample rates (16kHz recommended)
4. **Use GPU** if available for Ollama (faster inference)

---

## Troubleshooting

### Issue: "Whisper not available"

```bash
# Install Whisper
pip install openai-whisper

# Verify installation
python -c "import whisper; print(whisper.__version__)"
```

### Issue: Service returns 503 status

```bash
# Check if Ollama is running
ollama list

# Start Ollama if needed
ollama serve

# Check API health
curl http://localhost:5000/api/health-analysis/status
```

### Issue: Audio quality problems

- **Use WAV format** for best compatibility
- **Record at 16kHz sample rate** (Whisper optimal)
- **Minimize background noise** for better transcription
- **Speak clearly** near the microphone

---

## API Integration Checklist

- [ ] Ollama server installed and running (`ollama serve`)
- [ ] Models pulled (`ollama pull mistral`)
- [ ] Flask backend running (`python app.py`)
- [ ] Whisper installed (`pip install openai-whisper`)
- [ ] TTS installed (`pip install pyttsx3`)
- [ ] API endpoint responding (`GET /api/health-analysis/status`)
- [ ] Test recording and audio processing working
- [ ] Frontend integration complete

---

## FAQ

**Q: Can farmers use this offline?**
A: Once downloaded, Whisper and Ollama models can run offline. TTS requires pyttsx3 which works offline.

**Q: What languages will be supported?**
A: Currently: English, Hindi, Telugu. More coming based on farmer feedback.

**Q: How accurate is the voice transcription?**
A: Whisper achieves 95%+ accuracy in English, ~90% in Hindi/Telugu with clear audio.

**Q: Can I use mobile devices?**
A: Yes! Record on mobile and send the WAV file via HTTP. Frontend needs web audio API support.

**Q: What if Ollama is unavailable?**
A: The API falls back to rule-based analysis with predefined recommendations.

---

## Support & Feedback

For issues or suggestions:
- Check logs: `backend/logs/`
- Review test scripts in `backend/tests/`
- Check status endpoint: `/api/health-analysis/status`

---

**Last Updated:** April 2026
**API Version:** 2.1
**Status:** ✅ Production Ready

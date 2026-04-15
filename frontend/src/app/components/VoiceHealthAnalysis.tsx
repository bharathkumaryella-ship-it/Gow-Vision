import React, { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Mic, StopCircle, Volume2, Loader2, CheckCircle2, AlertCircle, AlertTriangle, Zap, Camera, Image as ImageIcon, X } from 'lucide-react';

interface VoiceAnalysisResult {
  success: boolean;
  transcribed_symptoms: string;
  analysis: string;
  audio_response: string;
  language: string;
  breed: string;
  age: string;
  workflow: string;
  status: number;
  message?: string;
}

interface AnalysisState {
  isRecording: boolean;
  isAnalyzing: boolean;
  isProcessing: boolean;
  transcript: string;
  analysis: string;
  audioUrl: string | null;
  error: string | null;
  success: boolean;
}

const VoiceHealthAnalysis: React.FC = () => {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);

  const [state, setState] = useState<AnalysisState>({
    isRecording: false,
    isAnalyzing: false,
    isProcessing: false,
    transcript: '',
    analysis: '',
    audioUrl: null,
    error: null,
    success: false,
  });

  const [breed, setBreed] = useState('Unknown');
  const [age, setAge] = useState('');
  const [language, setLanguage] = useState('en');
  const [recordingTime, setRecordingTime] = useState(0);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recordingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Language options
  const languages = [
    { code: 'en', label: '🇬🇧 English' },
    { code: 'hi', label: '🇮🇳 Hindi (हिंदी)' },
    { code: 'te', label: '🇮🇳 Telugu (తెలుగు)' },
  ];

  const breeds = ['Unknown', 'Holstein', 'Gir', 'Sahiwal', 'Brahman', 'Jersey', 'Simmental'];

  useEffect(() => {
    return () => {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      setState((prev) => ({ ...prev, error: null }));

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000,
        },
      });

      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/wav',
      });

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();

      setState((prev) => ({ ...prev, isRecording: true }));
      setRecordingTime(0);

      // Update recording time
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);

      console.log('🎤 Recording started');
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to access microphone';
      setState((prev) => ({
        ...prev,
        error: `Microphone error: ${errorMessage}`,
      }));
      console.error('Microphone error:', err);
    }
  };

  const stopRecording = async () => {
    return new Promise<void>((resolve) => {
      if (mediaRecorderRef.current && state.isRecording) {
        mediaRecorderRef.current.onstop = () => {
          // Stop recording timer
          if (recordingIntervalRef.current) {
            clearInterval(recordingIntervalRef.current);
            recordingIntervalRef.current = null;
          }

          // Stop all tracks
          mediaRecorderRef.current?.stream.getTracks().forEach((track) => {
            track.stop();
          });

          setState((prev) => ({ ...prev, isRecording: false }));
          console.log('⏹️  Recording stopped');
          resolve();
        };

        mediaRecorderRef.current.stop();
      } else {
        resolve();
      }
    });
  };

  const analyzeVoice = async () => {
    if (audioChunksRef.current.length === 0) {
      setState((prev) => ({
        ...prev,
        error: 'No audio recorded. Please record your voice first.',
      }));
      return;
    }

    setState((prev) => ({
      ...prev,
      isAnalyzing: true,
      isProcessing: true,
      error: null,
      success: false,
    }));

    try {
      const blob = new Blob(audioChunksRef.current, { type: 'audio/wav' });

      const formData = new FormData();
      formData.append('audio', blob);
      formData.append('breed', breed);
      formData.append('age', age || 'Unknown');
      formData.append('language', language);
      if (selectedImage) {
        formData.append('image', selectedImage);
      }

      console.log('📤 Sending audio to API...');
      const response = await fetch('/api/health-analysis/voice-analyze', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `API error: ${response.status}`);
      }

      const result: VoiceAnalysisResult = await response.json();

      if (result.success) {
        // Create audio URL from base64
        const binaryString = atob(result.audio_response);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const blob = new Blob([bytes], { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(blob);

        setState((prev) => ({
          ...prev,
          isAnalyzing: false,
          success: true,
          transcript: result.transcribed_symptoms,
          analysis: result.analysis,
          audioUrl,
          error: null,
        }));

        console.log('✅ Analysis complete');
      } else {
        throw new Error(result.message || 'Analysis failed');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Analysis failed';
      setState((prev) => ({
        ...prev,
        isAnalyzing: false,
        error: errorMessage,
        success: false,
      }));
      console.error('Analysis error:', err);
    } finally {
      setState((prev) => ({ ...prev, isProcessing: false }));
    }
  };

  const playAudio = () => {
    if (state.audioUrl) {
      const audio = new Audio(state.audioUrl);
      audio.play();
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setState((prev) => ({ ...prev, error: 'Image size should be less than 5MB' }));
        return;
      }
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const resetAnalysis = () => {
    audioChunksRef.current = [];
    setRecordingTime(0);
    removeImage();
    setState({
      isRecording: false,
      isAnalyzing: false,
      isProcessing: false,
      transcript: '',
      analysis: '',
      audioUrl: null,
      error: null,
      success: false,
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4 space-y-6">
      <Card>
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center gap-2">
            <Mic className="w-6 h-6 text-blue-600" />
            <div>
              <CardTitle>🎤 Voice Health Analysis</CardTitle>
              <CardDescription>
                Describe your cattle's symptoms in your own voice
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-6 space-y-6">
          {/* Workflow Diagram */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg">
            <p className="text-sm font-semibold text-gray-700 mb-3">Complete Workflow:</p>
            <div className="flex items-center justify-between text-xs font-medium text-gray-600">
              <div className="text-center">
                <Mic className="w-4 h-4 mx-auto mb-1" />
                <span>Voice</span>
              </div>
              <div className="text-xs">→</div>
              <div className="text-center">
                <span>Whisper</span>
              </div>
              <div className="text-xs">→</div>
              <div className="text-center">
                <Zap className="w-4 h-4 mx-auto mb-1" />
                <span>Ollama</span>
              </div>
              <div className="text-xs">→</div>
              <div className="text-center">
                <Volume2 className="w-4 h-4 mx-auto mb-1" />
                <span>TTS</span>
              </div>
              <div className="text-xs">→</div>
              <div className="text-center">
                <span>Audio</span>
              </div>
            </div>
          </div>

          {/* Settings */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Cattle Breed</label>
              <Select value={breed} onValueChange={setBreed}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {breeds.map((b) => (
                    <SelectItem key={b} value={b}>
                      {b}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Age (months)</label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="e.g., 36"
                className="w-full px-3 py-2 border rounded-md bg-white"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Language</label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      {lang.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Image Upload Section */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Add Photo (Optional)</label>
            <div className="flex items-center gap-4">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                ref={fileInputRef}
                className="hidden"
              />
              {!imagePreview ? (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-24 border-dashed flex flex-col gap-2"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Camera className="w-6 h-6 text-gray-400" />
                  <span className="text-sm text-gray-500">Click to upload photo of symptoms</span>
                </Button>
              ) : (
                <div className="relative w-full h-40 group">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover rounded-md border"
                  />
                  <button
                    onClick={removeImage}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                    Photo added
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Recording Section */}
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-6 text-center space-y-4">
              {state.isRecording && (
                <div className="flex items-center justify-center gap-2 animate-pulse">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-sm font-medium text-red-600">Recording...</span>
                  <span className="text-sm font-semibold text-gray-600">
                    {formatTime(recordingTime)}
                  </span>
                </div>
              )}

              <div className="flex gap-3 justify-center">
                {!state.isRecording ? (
                  <Button
                    onClick={startRecording}
                    disabled={state.isProcessing}
                    className="bg-red-600 hover:bg-red-700"
                    size="lg"
                  >
                    <Mic className="w-5 h-5 mr-2" />
                    Start Recording
                  </Button>
                ) : (
                  <Button
                    onClick={stopRecording}
                    className="bg-orange-600 hover:bg-orange-700"
                    size="lg"
                  >
                    <StopCircle className="w-5 h-5 mr-2" />
                    Stop Recording
                  </Button>
                )}
              </div>

              <p className="text-xs text-gray-600">
                {state.isRecording
                  ? `Speak clearly about your cattle's health symptoms (max 5 minutes)`
                  : 'Press "Start Recording" and describe your cattle\'s condition'}
              </p>
            </div>

            {/* Analyze Button */}
            {!state.isRecording && audioChunksRef.current.length > 0 && (
              <Button
                onClick={analyzeVoice}
                disabled={state.isProcessing}
                className="w-full bg-blue-600 hover:bg-blue-700"
                size="lg"
              >
                {state.isAnalyzing ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Analyzing... (this takes 20-50 seconds)
                  </>
                ) : (
                  '🔍 Analyze Voice'
                )}
              </Button>
            )}
          </div>

          {/* Error Alert */}
          {state.error && (
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <AlertDescription className="text-red-800">{state.error}</AlertDescription>
            </Alert>
          )}

          {/* Results Section */}
          {state.success && (
            <div className="space-y-4">
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  ✅ Analysis complete! Review the results below.
                </AlertDescription>
              </Alert>

              {/* EMERGENCY ALERT - Check if doctor visit is urgent/critical */}
              {(() => {
                const analysis = state.analysis.toLowerCase();
                const isEmergency = 
                  analysis.includes("urgent") || 
                  analysis.includes("critical") || 
                  (analysis.includes("immediately") && analysis.includes("doctor"));
                
                if (isEmergency) {
                  return (
                    <div className="border-4 border-red-600 bg-red-600 rounded-lg p-4 shadow-lg">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="w-8 h-8 text-white flex-shrink-0 mt-0.5 animate-pulse" />
                        <div>
                          <h3 className="text-xl font-bold text-white">
                            CONTACT VETERINARIAN IMMEDIATELY
                          </h3>
                          <p className="text-red-100 text-sm font-semibold mt-1">
                            This cattle requires urgent professional medical attention
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              })()}

              {/* Transcription */}
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-900">📝 What We Heard:</h3>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-gray-800">{state.transcript}</p>
                </div>
              </div>

              {/* Analysis */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">🔍 Veterinary Analysis:</h3>
                
                {(() => {
                  const analysis = state.analysis;
                  const section1Match = analysis.match(/1\.\s*WHAT IS THE PROBLEM\?([\s\S]*?)(?=2\.\s*WHAT PRECAUTIONS|$)/i);
                  const section2Match = analysis.match(/2\.\s*WHAT PRECAUTIONS SHOULD WE TAKE\?([\s\S]*?)(?=3\.\s*URGENCY|$)/i);
                  const section3Match = analysis.match(/3\.\s*URGENCY LEVEL([\s\S]*?)$/i);

                  const section1 = section1Match ? section1Match[1].trim() : null;
                  const section2 = section2Match ? section2Match[1].trim() : null;
                  const section3 = section3Match ? section3Match[1].trim() : null;

                  if (section1 || section2 || section3) {
                    return (
                      <div className="space-y-4">
                        {/* Section 1: Problem */}
                        {section1 && (
                          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
                            <h4 className="font-semibold text-red-900 mb-2">What is the Problem?</h4>
                            <p className="text-sm text-red-800 leading-relaxed">
                              {section1}
                            </p>
                          </div>
                        )}

                        {/* Section 2: Precautions */}
                        {section2 && (
                          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                            <h4 className="font-semibold text-blue-900 mb-2">What Precautions Should We Take?</h4>
                            <p className="text-sm text-blue-800 leading-relaxed">
                              {section2}
                            </p>
                          </div>
                        )}

                        {/* Section 3: Urgency */}
                        {section3 && (
                          <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                            <h4 className="font-semibold text-green-900 mb-2">Urgency Level</h4>
                            <p className="text-sm text-green-800 leading-relaxed">
                              {section3}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  }

                  // Fallback
                  return (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 max-h-96 overflow-y-auto">
                      <div className="text-sm text-gray-800 leading-relaxed">
                        {state.analysis}
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Audio Response */}
              {state.audioUrl && (
                <div className="space-y-2">
                  <h3 className="font-semibold text-gray-900">🔊 Listen to Analysis:</h3>
                  <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                    <Button
                      onClick={playAudio}
                      className="w-full bg-indigo-600 hover:bg-indigo-700"
                    >
                      <Volume2 className="w-5 h-5 mr-2" />
                      Play Audio Response
                    </Button>
                    <p className="text-xs text-gray-600 mt-2 text-center">
                      Language: {language.toUpperCase()}
                    </p>
                  </div>
                </div>
              )}

              {/* Metadata */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <h3 className="font-semibold text-sm text-gray-900">📊 Details:</h3>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-gray-600">Breed:</span>
                    <p className="font-medium">{breed}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Age:</span>
                    <p className="font-medium">{age || 'Unknown'} months</p>
                  </div>
                  <div className="col-span-2">
                    <Badge variant="secondary">
                      ✨ AI: Whisper + Ollama + TTS
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Reset Button */}
              <Button
                onClick={resetAnalysis}
                variant="outline"
                className="w-full"
              >
                ➕ New Analysis
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info Section */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-base">ℹ️ How to Use</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-gray-700 space-y-2">
          <ol className="list-decimal list-inside space-y-1">
            <li>Select your cattle's breed and age</li>
            <li>Choose your preferred language</li>
            <li>Click "Start Recording" and speak clearly about your cattle's symptoms</li>
            <li>Click "Stop Recording" when done (2-30 seconds recommended)</li>
            <li>Click "Analyze Voice" to get the AI analysis</li>
            <li>Read the analysis and listen to the audio response</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
};

export default VoiceHealthAnalysis;

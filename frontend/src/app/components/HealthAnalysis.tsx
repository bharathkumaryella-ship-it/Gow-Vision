import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useLanguage } from "./LanguageContext";
import {
  HeartPulse, Mic, MicOff, Upload, AlertTriangle, CheckCircle2, XCircle,
  ChevronRight, Zap, Stethoscope, AlertCircle, Phone, X, Download,
  Volume2, Square
} from "lucide-react";
import { analyzeHealthByVoice, analyzeHealthWithImage, analyzeHealth } from "../../lib/api";
import TTSButton from "./ui/TTSButton";
import type { HealthAnalysisResult } from "../../lib/types";

type WorkflowStep = "modeSelection" | "voiceInput" | "recording" | "voiceRecorded" | "transcribed" | "needsImage" | "imageUpload" | "analyzing" | "results" | "manualInput" | "imageOnly";

export default function HealthAnalysis() {
  const { t } = useLanguage();

  const symptomsList = [
    "Loss of Appetite", "Lethargy / Low Activity", "Nasal Discharge",
    "Coughing / Labored Breathing", "Diarrhea / Loose Stools",
    "Swollen Limbs or Joints", "Eye Discharge / Redness",
    "Unusual Skin / Coat Condition", "Reduced Milk Production",
    "Fever (Warm to Touch)",
  ];

  // State Management
  const [step, setStep] = useState<WorkflowStep>("modeSelection");
  const [selectedMode, setSelectedMode] = useState<"voice" | "manual" | "image" | null>(null);
  
  // Voice Recording
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  
  // Cattle Info
  const [breed, setBreed] = useState("Holstein Friesian");
  const [ageMonths, setAgeMonths] = useState("36");
  const [language, setLanguage] = useState("en");
  
  // Analysis Flow
  const [transcribedSymptoms, setTranscribedSymptoms] = useState("");
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [needsImageForAnalysis, setNeedsImageForAnalysis] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  
  // UI
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize voice recording
  useEffect(() => {
    if (isRecording && step === "recording") {
      const timer = setInterval(() => {
        setRecordingTime(t => t + 1);
      }, 1000);
      recordingIntervalRef.current = timer;
      return () => clearInterval(timer);
    }
  }, [isRecording, step]);

  // Start voice recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setAudioBlob(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      setError(null);
      setStep("recording");
    } catch (err) {
      setError("Microphone access denied. Please enable microphone permissions.");
      console.error("Microphone error:", err);
    }
  };

  // Stop voice recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
      setStep("voiceRecorded");
    }
  };

  // Process voice analysis
  const processVoiceAnalysis = async () => {
    if (!audioBlob) {
      setError("No audio recorded. Please record again.");
      return;
    }

    setStep("analyzing");
    setProgress(0);
    setError(null);

    try {
      const progressInterval = setInterval(() => {
        setProgress(p => {
          if (p >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return p + Math.random() * 30;
        });
      }, 500);

      // Create File object from blob
      const audioFile = new File([audioBlob], 'voice-input.wav', { type: 'audio/wav' });

      // Call voice analysis API
      const response = await analyzeHealthByVoice(audioFile, breed, ageMonths, language);

      clearInterval(progressInterval);
      setProgress(100);

      // Parse response
      if (response.success) {
        setTranscribedSymptoms(response.transcribed_symptoms);
        setAnalysisResult(response);

        // If user provided an image, analyze it with the transcribed symptoms
        if (imageFile) {
          try {
            const imageAnalysisInterval = setInterval(() => {
              setProgress(p => {
                if (p >= 95) {
                  clearInterval(imageAnalysisInterval);
                  return 95;
                }
                return p + Math.random() * 5;
              });
            }, 500);

            const imageResponse = await analyzeHealthWithImage(
              response.transcribed_symptoms,
              breed,
              ageMonths,
              imageFile,
              language
            );

            clearInterval(imageAnalysisInterval);
            setProgress(100);

            if (imageResponse.success) {
              setAnalysisResult({
                ...response,
                analysis: imageResponse.analysis,
                with_image: true
              });
            }
          } catch (imgErr) {
            console.warn("Image analysis failed, using voice analysis only:", imgErr);
            // Continue with voice analysis if image analysis fails
          }
        }

        setNeedsImageForAnalysis(false);
        setStep("results");
      } else {
        throw new Error(response.error || "Analysis failed");
      }
    } catch (err) {
      console.error("Voice analysis error:", err);
      setError(err instanceof Error ? err.message : "Voice analysis failed. Please try again.");
      setStep("voiceRecorded");
      setProgress(0);
    }
  };

  // Handle image upload
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
        setError('Please upload a valid image file (PNG, JPG, WEBP)');
        return;
      }

      setImageFile(file);
      setError(null);

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Analyze with image follow-up
  const analyzeWithImage = async () => {
    if (!imageFile || !transcribedSymptoms) {
      setError("Please provide an image for analysis.");
      return;
    }

    setStep("analyzing");
    setProgress(0);
    setError(null);

    try {
      const progressInterval = setInterval(() => {
        setProgress(p => {
          if (p >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return p + Math.random() * 30;
        });
      }, 500);

      // Analyze with image
      const response = await analyzeHealthWithImage(transcribedSymptoms, breed, ageMonths, imageFile, language);

      clearInterval(progressInterval);
      setProgress(100);

      if (response.success) {
        setAnalysisResult({
          ...analysisResult,
          analysis: response.analysis,
          with_image: true
        });
        setNeedsImageForAnalysis(false);
        setStep("results");
      } else {
        throw new Error(response.error || "Analysis with image failed");
      }
    } catch (err) {
      console.error("Image analysis error:", err);
      setError(err instanceof Error ? err.message : "Image analysis failed.");
      setStep("imageUpload");
      setProgress(0);
    }
  };

  // Remove image
  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Check severity level
  const getSeverityLevel = () => {
    if (!analysisResult?.analysis) return null;
    const analysis = analysisResult.analysis.toLowerCase();
    if (analysis.includes("immediately") || analysis.includes("emergency") || analysis.includes("critical")) return "critical";
    if (analysis.includes("within 24") || analysis.includes("urgent")) return "urgent";
    if (analysis.includes("monitor") || analysis.includes("observe")) return "monitor";
    return "normal";
  };

  const getSeverityStyles = (level: string | null) => {
    switch (level) {
      case "critical":
        return "bg-red-50 border-red-300 text-red-800";
      case "urgent":
        return "bg-orange-50 border-orange-300 text-orange-800";
      case "monitor":
        return "bg-yellow-50 border-yellow-300 text-yellow-800";
      default:
        return "bg-green-50 border-green-300 text-green-800";
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Function to translate common labels in analysis text
  const translateAnalysisContent = (text: string): string => {
    let translatedText = text;
    
    // Replace common English labels with translated versions
    const labelMappings = [
      { en: 'Recommended Tests:', key: 'recommendedTests' },
      { en: 'Urgency Level:', key: 'urgencyLevel' },
      { en: 'Watch for these warning signs:', key: 'watchForWarningSigns' },
      { en: 'Potential Issues:', key: 'potentialDiseases' },
      { en: 'Treatment Recommendations:', key: 'treatmentRecommendations' },
      { en: 'Preventive Measures:', key: 'preventiveMeasures' },
      { en: 'Dietary Advisory:', key: 'dietaryAdvisory' },
      { en: 'YES - Contact veterinarian immediately', key: 'yesContactVetImmediately' },
      { en: 'NO - Monitor at home with care', key: 'noMonitorAtHome' },
    ];

    labelMappings.forEach(mapping => {
      const regex = new RegExp(mapping.en, 'g');
      translatedText = translatedText.replace(regex, t(mapping.key));
    });

    return translatedText;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-emerald-50/30 to-stone-50 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-sm font-semibold mb-4">
            <HeartPulse className="w-4 h-4" />
            {t("aiPoweredDiagnostics")}
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-emerald-950 mb-3 tracking-tight">
            {t("healthAnalysisTitle")}
          </h1>
          <p className="text-stone-500 max-w-xl mx-auto leading-relaxed">
            {t("speakAboutCattleHealth")}
          </p>
        </motion.div>

        <AnimatePresence mode="popLayout">
          {/* ── MODE SELECTION ── */}
          {step === "modeSelection" && (
            <motion.div
              key="modeSelection"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              className="space-y-6"
            >
              <div className="bg-white rounded-2xl shadow-lg border border-stone-100 p-8">
                <h2 className="text-2xl font-bold text-stone-800 mb-8 text-center">
                  {t("chooseAnalysisMethod")}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Voice Option */}
                  <motion.button
                    onClick={() => {
                      setSelectedMode("voice");
                      setStep("voiceInput");
                      setError(null);
                    }}
                    whileHover={{ scale: 1.05, y: -5 }}
                    whileTap={{ scale: 0.95 }}
                    className="group relative overflow-hidden rounded-2xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-emerald-100/50 p-8 text-center hover:border-emerald-400 transition-all"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/0 via-emerald-400/10 to-emerald-400/0 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative">
                      <div className="mx-auto mb-4 w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center group-hover:bg-emerald-200 transition-colors">
                        <Mic className="w-8 h-8 text-emerald-600" />
                      </div>
                      <h3 className="font-bold text-stone-800 mb-2">{t("voiceAnalysisTitle")}</h3>
                      <p className="text-sm text-stone-600">
                        {t("speakAboutSymptoms")}
                      </p>
                    </div>
                  </motion.button>

                  {/* Manual Option */}
                  <motion.button
                    onClick={() => {
                      setSelectedMode("manual");
                      setStep("manualInput");
                      setError(null);
                      setSelectedSymptoms([]);
                    }}
                    whileHover={{ scale: 1.05, y: -5 }}
                    whileTap={{ scale: 0.95 }}
                    className="group relative overflow-hidden rounded-2xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100/50 p-8 text-center hover:border-blue-400 transition-all"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400/0 via-blue-400/10 to-blue-400/0 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative">
                      <div className="mx-auto mb-4 w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                        <Stethoscope className="w-8 h-8 text-blue-600" />
                      </div>
                      <h3 className="font-bold text-stone-800 mb-2">{t("manualEntryTitle")}</h3>
                      <p className="text-sm text-stone-600">
                        {t("selectSymptoms")}
                      </p>
                    </div>
                  </motion.button>

                  {/* Image Option */}
                  <motion.button
                    onClick={() => {
                      setSelectedMode("image");
                      setStep("imageOnly");
                      setError(null);
                      setImageFile(null);
                      setImagePreview(null);
                    }}
                    whileHover={{ scale: 1.05, y: -5 }}
                    whileTap={{ scale: 0.95 }}
                    className="group relative overflow-hidden rounded-2xl border-2 border-sky-200 bg-gradient-to-br from-sky-50 to-sky-100/50 p-8 text-center hover:border-sky-400 transition-all"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-sky-400/0 via-sky-400/10 to-sky-400/0 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative">
                      <div className="mx-auto mb-4 w-16 h-16 bg-sky-100 rounded-full flex items-center justify-center group-hover:bg-sky-200 transition-colors">
                        <Upload className="w-8 h-8 text-sky-600" />
                      </div>
                      <h3 className="font-bold text-stone-800 mb-2">{t("imageOnlyTitle")}</h3>
                      <p className="text-sm text-stone-600">
                        {t("uploadCattleImageAnalysis")}
                      </p>
                    </div>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── VOICE INPUT SETUP ── */}
          {step === "voiceInput" && !isRecording && <VoiceInputSetup
            breed={breed}
            setBreed={setBreed}
            ageMonths={ageMonths}
            setAgeMonths={setAgeMonths}
            language={language}
            setLanguage={setLanguage}
            onStart={startRecording}
            onBack={() => setStep("modeSelection")}
          />}

          {/* ── RECORDING ── */}
          {step === "recording" && (
            <motion.div
              key="recording"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-3xl shadow-2xl border border-stone-100 p-12 text-center"
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="inline-block mb-8"
              >
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center">
                  <Mic className="w-10 h-10 text-white" />
                </div>
              </motion.div>

              <h2 className="text-3xl font-bold text-stone-800 mb-2">Recording...</h2>
              <p className="text-stone-500 mb-6">
                Speak naturally about your cattle's health concerns
              </p>

              <div className="text-5xl font-mono font-bold text-red-600 mb-8">
                {formatTime(recordingTime)}
              </div>

              <motion.button
                onClick={stopRecording}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="mx-auto mb-8 w-20 h-20 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow-lg"
              >
                <Square className="w-8 h-8" />
              </motion.button>

              <p className="text-sm text-stone-400">
                Click to stop recording
              </p>
            </motion.div>
          )}

          {/* ── VOICE RECORDED - PHOTO UPLOAD OPTION ── */}
          {step === "voiceRecorded" && audioBlob && (
            <motion.div
              key="voiceRecorded"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="bg-white rounded-2xl shadow-lg border border-stone-100 p-8">
                <h2 className="text-2xl font-bold text-stone-800 mb-6">
                  {t("voiceInputReady")}
                </h2>

                <div className="bg-emerald-50 rounded-xl p-4 mb-6 border border-emerald-200">
                  <p className="text-sm text-stone-600 mb-2">{t("recordingDuration")}</p>
                  <p className="text-2xl font-bold text-emerald-700">{formatTime(recordingTime)}</p>
                </div>

                {/* ── OPTIONAL PHOTO UPLOAD SECTION ── */}
                <div className="bg-blue-50 rounded-xl p-6 mb-6 border border-blue-200">
                  <div className="flex items-start gap-3 mb-4">
                    <Upload className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-blue-900 mb-1">Enhance Analysis with Photo (Optional)</h3>
                      <p className="text-sm text-blue-700">
                        Upload a photo of your cattle to get a more detailed analysis of external symptoms and health conditions.
                      </p>
                    </div>
                  </div>

                  <div className="mt-4">
                    {imagePreview ? (
                      <div className="relative rounded-lg overflow-hidden">
                        <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover" />
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          onClick={removeImage}
                          className="absolute top-3 right-3 bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 shadow-lg"
                        >
                          <X className="w-5 h-5" />
                        </motion.button>
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center border-2 border-dashed border-blue-300 rounded-lg py-8 cursor-pointer hover:border-blue-400 hover:bg-blue-100/50 transition-all">
                        <Upload className="w-8 h-8 text-blue-400 mb-2" />
                        <span className="text-blue-700 text-sm font-semibold">Click to upload a photo</span>
                        <span className="text-blue-500 text-xs mt-1">PNG, JPG, or WEBP format</span>
                        <input
                          ref={fileInputRef}
                          type="file"
                          className="hidden"
                          accept="image/png,image/jpeg,image/webp"
                          onChange={handleImageChange}
                        />
                      </label>
                    )}
                  </div>
                </div>

                {error && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                    <p className="text-red-700 text-sm font-semibold">{error}</p>
                  </motion.div>
                )}

                <div className="flex gap-4">
                  <motion.button
                    onClick={() => startRecording()}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 py-3 bg-stone-100 text-stone-700 font-semibold rounded-xl hover:bg-stone-200 transition-colors"
                  >
                    {t("recordAgain")}
                  </motion.button>
                  <motion.button
                    onClick={processVoiceAnalysis}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Zap className="w-5 h-5" />
                    {t("analyze")} {imageFile && "(with Photo)"}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── TRANSCRIBED (Legacy - kept for compatibility) ── */}
          {step === "transcribed" && audioBlob && (
            <motion.div
              key="transcribed"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="bg-white rounded-2xl shadow-lg border border-stone-100 p-8">
                <h2 className="text-2xl font-bold text-stone-800 mb-6">
                  {t("voiceInputReady")}
                </h2>

                <div className="bg-emerald-50 rounded-xl p-4 mb-6 border border-emerald-200">
                  <p className="text-sm text-stone-600 mb-2">{t("recordingDuration")}</p>
                  <p className="text-2xl font-bold text-emerald-700">{formatTime(recordingTime)}</p>
                </div>

                {error && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                    <p className="text-red-700 text-sm font-semibold">{error}</p>
                  </motion.div>
                )}

                <div className="flex gap-4">
                  <motion.button
                    onClick={() => startRecording()}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 py-3 bg-stone-100 text-stone-700 font-semibold rounded-xl hover:bg-stone-200 transition-colors"
                  >
                    {t("recordAgain")}
                  </motion.button>
                  <motion.button
                    onClick={processVoiceAnalysis}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Zap className="w-5 h-5" />
                    {t("analyze")}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── NEEDS IMAGE ── */}
          {step === "needsImage" && (
            <motion.div
              key="needsImage"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="bg-white rounded-2xl shadow-lg border border-stone-100 p-8">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <AlertCircle className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-stone-800">Image Would Help</h2>
                    <p className="text-stone-600 mt-2">
                      To provide a more accurate analysis, please upload a photo of your cattle. This helps identify external symptoms.
                    </p>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
                  <h3 className="font-semibold text-yellow-800 mb-2">Voice Input Transcribed:</h3>
                  <p className="text-sm text-yellow-700 italic">"{transcribedSymptoms}"</p>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-semibold text-stone-700 mb-3">Upload Photo (Optional)</label>
                  {imagePreview ? (
                    <div className="relative rounded-xl overflow-hidden mb-4">
                      <img src={imagePreview} alt="Preview" className="w-full h-64 object-cover" />
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={removeImage}
                        className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-lg hover:bg-red-600"
                      >
                        <X className="w-5 h-5" />
                      </motion.button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center border-2 border-dashed border-stone-200 rounded-xl py-10 cursor-pointer hover:border-emerald-400 hover:bg-emerald-50/50 transition-all">
                      <Upload className="w-8 h-8 text-stone-300 mb-2" />
                      <span className="text-stone-400 text-sm">{t("clickToUploadCattleImage")}</span>
                      <input
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        accept="image/png,image/jpeg,image/webp"
                        onChange={handleImageChange}
                      />
                    </label>
                  )}
                </div>

                <div className="flex gap-4">
                  <motion.button
                    onClick={() => {
                      setStep("results");
                      setNeedsImageForAnalysis(false);
                    }}
                    whileHover={{ scale: 1.02 }}
                    className="flex-1 py-3 bg-stone-100 text-stone-700 font-semibold rounded-xl hover:bg-stone-200"
                  >
                    Skip Image
                  </motion.button>
                  <motion.button
                    onClick={analyzeWithImage}
                    disabled={!imageFile}
                    whileHover={{ scale: 1.02 }}
                    className="flex-1 py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Analyze with Image
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── MANUAL INPUT ── */}
          {step === "manualInput" && (
            <motion.div
              key="manualInput"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="bg-white rounded-2xl shadow-lg border border-stone-100 p-8">
                <h2 className="text-2xl font-bold text-stone-800 mb-8">Cattle Information</h2>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-2">Breed</label>
                    <select
                      value={breed}
                      onChange={(e) => setBreed(e.target.value)}
                      className="w-full border border-stone-200 rounded-lg px-4 py-3 text-stone-700 bg-stone-50 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                      {["Holstein Friesian", "Gir", "Sahiwal", "Jersey", "Red Sindhi", "Murrah Buffalo"].map(b => (
                        <option key={b}>{b}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-2">Age (months)</label>
                    <input
                      type="number"
                      value={ageMonths}
                      onChange={(e) => setAgeMonths(e.target.value)}
                      className="w-full border border-stone-200 rounded-lg px-4 py-3 text-stone-700 bg-stone-50 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-2">Language</label>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="w-full border border-stone-200 rounded-lg px-4 py-3 text-stone-700 bg-stone-50 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                      <option value="en">English</option>
                      <option value="hi">Hindi</option>
                      <option value="te">Telugu</option>
                    </select>
                  </div>
                </div>

                <h2 className="text-xl font-bold text-stone-800 mb-4">{t("selectObservedSymptoms")}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                  {symptomsList.map(s => (
                    <motion.button
                      key={s}
                      onClick={() => {
                        setSelectedSymptoms(prev =>
                          prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]
                        );
                      }}
                      whileTap={{ scale: 0.97 }}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left transition-all duration-200 text-sm font-medium ${
                        selectedSymptoms.includes(s)
                          ? "border-blue-500 bg-blue-50 text-blue-800"
                          : "border-stone-200 bg-stone-50 text-stone-600 hover:border-blue-300"
                      }`}
                    >
                      {selectedSymptoms.includes(s)
                        ? <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0" />
                        : <XCircle className="w-4 h-4 text-stone-300 shrink-0" />}
                      {t(s)}
                    </motion.button>
                  ))}
                </div>

                {error && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                    <p className="text-red-700 text-sm font-semibold">{error}</p>
                  </motion.div>
                )}

                <div className="flex gap-4">
                  <motion.button
                    onClick={() => setStep("modeSelection")}
                    whileHover={{ scale: 1.02 }}
                    className="flex-1 py-3 border-2 border-stone-200 text-stone-700 font-semibold rounded-lg hover:bg-stone-50"
                  >
                    {t("back")}
                  </motion.button>
                  <motion.button
                    onClick={async () => {
                      if (selectedSymptoms.length === 0) {
                        setError("Please select at least one symptom");
                        return;
                      }
                      const symptomsText = selectedSymptoms.join(", ");
                      setTranscribedSymptoms(symptomsText);
                      setStep("analyzing");
                      setProgress(0);
                      setError(null);

                      try {
                        const progressInterval = setInterval(() => {
                          setProgress(p => {
                            if (p >= 90) {
                              clearInterval(progressInterval);
                              return 90;
                            }
                            return p + Math.random() * 30;
                          });
                        }, 500);

                        const response = await analyzeHealth(symptomsText, breed, ageMonths, language);

                        clearInterval(progressInterval);
                        setProgress(100);

                        if (response.success) {
                          setAnalysisResult(response);
                          setStep("results");
                        } else {
                          throw new Error(response.error || "Analysis failed");
                        }
                      } catch (err) {
                        console.error("Analysis error:", err);
                        setError(err instanceof Error ? err.message : "Analysis failed. Please try again.");
                        setStep("manualInput");
                        setProgress(0);
                      }
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Zap className="w-5 h-5" />
                    {t("analyzeSymptoms")}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── IMAGE ONLY MODE ── */}
          {step === "imageOnly" && (
            <motion.div
              key="imageOnly"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="bg-white rounded-2xl shadow-lg border border-stone-100 p-8">
                <h2 className="text-2xl font-bold text-stone-800 mb-8">{t("externalDiseaseAnalysis")}</h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-2">Breed</label>
                    <select
                      value={breed}
                      onChange={(e) => setBreed(e.target.value)}
                      className="w-full border border-stone-200 rounded-lg px-4 py-3 text-stone-700 bg-stone-50 focus:outline-none focus:ring-2 focus:ring-sky-400"
                    >
                      {["Holstein Friesian", "Gir", "Sahiwal", "Jersey", "Red Sindhi", "Murrah Buffalo"].map(b => (
                        <option key={b}>{b}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-2">Age (months)</label>
                    <input
                      type="number"
                      value={ageMonths}
                      onChange={(e) => setAgeMonths(e.target.value)}
                      className="w-full border border-stone-200 rounded-lg px-4 py-3 text-stone-700 bg-stone-50 focus:outline-none focus:ring-2 focus:ring-sky-400"
                    />
                  </div>
                </div>

                <div className="mb-8">
                  <label className="block text-sm font-semibold text-stone-700 mb-4">{t("uploadCattleImage")}</label>
                  {imagePreview ? (
                    <div className="relative rounded-xl overflow-hidden mb-4">
                      <img src={imagePreview} alt="Preview" className="w-full h-64 object-cover" />
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={removeImage}
                        className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-lg hover:bg-red-600"
                      >
                        <X className="w-5 h-5" />
                      </motion.button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center border-2 border-dashed border-stone-200 rounded-xl py-10 cursor-pointer hover:border-sky-400 hover:bg-sky-50/50 transition-all">
                      <Upload className="w-8 h-8 text-stone-300 mb-2" />
                      <span className="text-stone-400 text-sm font-semibold">{t("clickToUploadCattleImage")}</span>
                      <span className="text-stone-300 text-xs mt-1">{t("supportedFormats")}</span>
                      <input 
                        ref={fileInputRef}
                        type="file" 
                        className="hidden" 
                        accept="image/png,image/jpeg,image/webp" 
                        onChange={handleImageChange}
                      />
                    </label>
                  )}
                </div>

                {error && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                    <p className="text-red-700 text-sm font-semibold">{error}</p>
                  </motion.div>
                )}

                <div className="flex gap-4">
                  <motion.button
                    onClick={() => setStep("modeSelection")}
                    whileHover={{ scale: 1.02 }}
                    className="flex-1 py-3 border-2 border-stone-200 text-stone-700 font-semibold rounded-lg hover:bg-stone-50"
                  >
                    {t("back")}
                  </motion.button>
                  <motion.button
                    onClick={async () => {
                      if (!imageFile) {
                        setError("Please upload an image for analysis");
                        return;
                      }
                      setStep("analyzing");
                      setProgress(0);
                      setError(null);

                      try {
                        const progressInterval = setInterval(() => {
                          setProgress(p => {
                            if (p >= 90) {
                              clearInterval(progressInterval);
                              return 90;
                            }
                            return p + Math.random() * 30;
                          });
                        }, 500);

                        const response = await analyzeHealthWithImage(
                          "External disease analysis from image",
                          breed,
                          ageMonths,
                          imageFile,
                          language
                        );

                        clearInterval(progressInterval);
                        setProgress(100);

                        if (response.success) {
                          setAnalysisResult(response);
                          setTranscribedSymptoms("Image-based external disease analysis");
                          setStep("results");
                        } else {
                          throw new Error(response.error || "Analysis failed");
                        }
                      } catch (err) {
                        console.error("Image analysis error:", err);
                        setError(err instanceof Error ? err.message : "Image analysis failed. Please try again.");
                        setStep("imageOnly");
                        setProgress(0);
                      }
                    }}
                    disabled={!imageFile}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 py-3 bg-sky-600 text-white font-semibold rounded-lg hover:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                  >
                    <Zap className="w-5 h-5" />
                    Analyze Image
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── ANALYZING ── */}
          {step === "analyzing" && (
            <motion.div
              key="analyzing"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-3xl shadow-2xl border border-stone-100 p-12 text-center"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="inline-block mb-6"
              >
                <div className="w-20 h-20 rounded-full border-4 border-emerald-100 border-t-emerald-500 mx-auto" />
              </motion.div>
              <h2 className="text-2xl font-bold text-emerald-950 mb-2">Analyzing Health Data</h2>
              <p className="text-stone-400 mb-8">
                Ollama is analyzing your cattle's symptoms and health condition...
              </p>
              <div className="w-full bg-stone-100 rounded-full h-3 overflow-hidden mb-2">
                <motion.div
                  className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600"
                  style={{ width: `${progress}%` }}
                  transition={{ duration: 0.1 }}
                />
              </div>
              <p className="text-sm text-stone-400">{Math.round(progress)}% complete</p>
            </motion.div>
          )}

          {/* ── RESULTS ── */}
          {step === "results" && analysisResult && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >

              {/* EMERGENCY ALERT - Check if doctor visit is urgent/critical */}
              {(() => {
                const analysis = analysisResult.analysis.toLowerCase();
                const isEmergency = 
                  analysis.includes("urgent") || 
                  analysis.includes("critical") || 
                  (analysis.includes("immediately") && analysis.includes("doctor"));
                
                if (isEmergency) {
                  return (
                    <motion.div
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.3 }}
                      className="relative overflow-hidden rounded-3xl border-4 border-red-600 bg-red-600 p-6 shadow-2xl"
                    >
                      {/* Pulsing background animation */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                        animate={{ x: [-100, 100] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                      
                      <div className="relative flex items-center gap-4">
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 1, repeat: Infinity }}
                          className="flex-shrink-0"
                        >
                          <AlertTriangle className="w-12 h-12 text-white drop-shadow-lg" />
                        </motion.div>
                        
                        <div>
                          <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight drop-shadow-lg">
                            CONTACT VETERINARIAN IMMEDIATELY
                          </h2>
                          <p className="text-red-100 text-sm font-semibold mt-2">
                            This cattle requires urgent professional medical attention
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  );
                }
                return null;
              })()}

              {/* Analysis Result */}
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="space-y-4"
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-xl font-bold text-emerald-950">{t("healthAnalysisResult")}</h3>
                  <TTSButton
                    text={translateAnalysisContent(analysisResult.analysis)}
                    enhance={true}
                    rate={150}
                  />
                </div>

                {/* Parse and display the three sections */}
                {(() => {
                  const analysis = analysisResult.analysis;
                  // Match new plain text format without markdown
                  const section1Match = analysis.match(/1\.\s*WHAT IS THE PROBLEM\?([\s\S]*?)(?=2\.\s*WHAT PRECAUTIONS|$)/i);
                  const section2Match = analysis.match(/2\.\s*WHAT PRECAUTIONS SHOULD WE TAKE\?([\s\S]*?)(?=3\.\s*URGENCY|$)/i);
                  const section3Match = analysis.match(/3\.\s*URGENCY LEVEL([\s\S]*?)$/i);

                  const section1 = section1Match ? section1Match[1].trim() : null;
                  const section2 = section2Match ? section2Match[1].trim() : null;
                  const section3 = section3Match ? section3Match[1].trim() : null;

                  if (section1 || section2 || section3) {
                    return (
                      <>
                        {/* Section 1: Problem */}
                        {section1 && (
                          <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-200 rounded-2xl p-6"
                          >
                            <div className="flex items-start gap-3 mb-3">
                              <AlertCircle className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
                              <h4 className="text-lg font-bold text-red-900">What is the Problem?</h4>
                            </div>
                            <div className="ml-9 prose prose-sm max-w-none text-stone-700">
                              <p className="text-sm bg-white rounded-lg p-4 border border-red-100 leading-relaxed">
                                {translateAnalysisContent(section1)}
                              </p>
                            </div>
                          </motion.div>
                        )}

                        {/* Section 2: Precautions */}
                        {section2 && (
                          <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-2xl p-6"
                          >
                            <div className="flex items-start gap-3 mb-3">
                              <Zap className="w-6 h-6 text-blue-600 shrink-0 mt-0.5" />
                              <h4 className="text-lg font-bold text-blue-900">What Precautions Should We Take?</h4>
                            </div>
                            <div className="ml-9 prose prose-sm max-w-none text-stone-700">
                              <p className="text-sm bg-white rounded-lg p-4 border border-blue-100 leading-relaxed">
                                {translateAnalysisContent(section2)}
                              </p>
                            </div>
                          </motion.div>
                        )}

                        {section3 && (
                          <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 rounded-2xl p-6"
                          >
                            <div className="flex items-start gap-3 mb-3">
                              <CheckCircle2 className="w-6 h-6 text-green-600 shrink-0 mt-0.5" />
                              <h4 className="text-lg font-bold text-green-900">Urgency Level</h4>
                            </div>
                            <div className="ml-9 prose prose-sm max-w-none text-stone-700">
                              <p className="text-sm rounded-lg p-4 border bg-white border-green-100 leading-relaxed">
                                {translateAnalysisContent(section3)}
                              </p>
                            </div>
                          </motion.div>
                        )}
                      </>
                    );
                  }

                  // Fallback: show original text if sections not found
                  return (
                    <div className="bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200 rounded-2xl p-8">
                      <div className="prose prose-sm max-w-none text-stone-700 leading-relaxed">
                        <p className="text-sm bg-white rounded-lg p-4 border border-emerald-200 leading-relaxed">
                          {translateAnalysisContent(analysisResult.analysis)}
                        </p>
                      </div>
                    </div>
                  );
                })()}
              </motion.div>

              {/* Transcribed Symptoms */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-xl p-4 border border-stone-200"
              >
                <p className="text-xs text-stone-500 font-semibold mb-2">{t("voiceInputTranscribed")}</p>
                <p className="text-sm text-stone-700 italic">"{transcribedSymptoms}"</p>
              </motion.div>

              {/* Reset */}
              <motion.button
                onClick={() => {
                  setStep("modeSelection");
                  setSelectedMode(null);
                  setAudioBlob(null);
                  setTranscribedSymptoms("");
                  setSelectedSymptoms([]);
                  setAnalysisResult(null);
                  setImageFile(null);
                  setImagePreview(null);
                  setError(null);
                  setProgress(0);
                  setNeedsImageForAnalysis(false);
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-4 border-2 border-emerald-300 text-emerald-700 font-bold rounded-2xl hover:bg-emerald-50 transition-all"
              >
                {t("runNewAnalysis")}
              </motion.button>
            </motion.div>
          )}

          {/* Error State */}
          {error && step !== "modeSelection" && step !== "voiceInput" && step !== "manualInput" && step !== "imageOnly" && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3"
            >
              <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-700 text-sm">{t("error")}</p>
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// Voice Input Setup Component
function VoiceInputSetup({
  breed,
  setBreed,
  ageMonths,
  setAgeMonths,
  language,
  setLanguage,
  onStart,
  onBack
}: any) {
  const { t } = useLanguage();
  
  return (
    <motion.div
      key="voiceSetup"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      className="space-y-6"
    >
      <div className="bg-white rounded-2xl shadow-lg border border-stone-100 p-8">
        <h2 className="text-2xl font-bold text-stone-800 mb-6">Cattle Information</h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div>
            <label className="block text-sm font-semibold text-stone-700 mb-2">Breed</label>
            <select
              value={breed}
              onChange={(e) => setBreed(e.target.value)}
              className="w-full border border-stone-200 rounded-lg px-4 py-3 text-stone-700 bg-stone-50 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            >
              {["Holstein Friesian", "Gir", "Sahiwal", "Jersey", "Red Sindhi", "Murrah Buffalo"].map(b => (
                <option key={b}>{b}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-stone-700 mb-2">Age (months)</label>
            <input
              type="number"
              value={ageMonths}
              onChange={(e) => setAgeMonths(e.target.value)}
              className="w-full border border-stone-200 rounded-lg px-4 py-3 text-stone-700 bg-stone-50 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-stone-700 mb-2">Language</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full border border-stone-200 rounded-lg px-4 py-3 text-stone-700 bg-stone-50 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            >
              <option value="en">English</option>
              <option value="hi">Hindi</option>
              <option value="te">Telugu</option>
            </select>
          </div>
        </div>

        <div className="flex gap-4">
          <motion.button
            onClick={onBack}
            whileHover={{ scale: 1.02 }}
            className="flex-1 py-3 border-2 border-stone-200 text-stone-700 font-semibold rounded-lg hover:bg-stone-50"
          >
            {t("back")}
          </motion.button>
          <motion.button
            onClick={onStart}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-bold rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <Mic className="w-5 h-5" />
            {t("startRecording")}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

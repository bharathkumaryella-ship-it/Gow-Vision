import { useState, useRef } from "react";
import { Volume2, Loader2, AlertCircle } from "lucide-react";
import { useLanguage } from "../LanguageContext";

interface TTSButtonProps {
  text: string;
  enhance?: boolean;
  rate?: number;
  disabled?: boolean;
}

export default function TTSButton({ text, enhance = true, rate = 150, disabled = false }: TTSButtonProps) {
  const { language } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const handleTextToSpeech = async () => {
    if (!text.trim() || isLoading || disabled) return;

    setIsLoading(true);
    setHasError(false);

    try {
      // Call the TTS API endpoint with current language
      const response = await fetch(`/api/tts/synthesize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text,
          enhance: enhance,
          rate: rate,
          language: language
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate speech');
      }

      const data = await response.json();

      if (data.success && data.audio) {
        // Decode base64 audio and play it
        const binaryString = atob(data.audio);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }

        const audioBlob = new Blob([bytes], { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);

        if (audioRef.current) {
          audioRef.current.src = audioUrl;
          audioRef.current.play();
          setIsPlaying(true);
          
          audioRef.current.onended = () => {
            setIsPlaying(false);
          };
        }
      } else {
        throw new Error(data.error || 'Failed to generate speech');
      }
    } catch (error) {
      console.error('TTS Error:', error);
      setHasError(true);
      // Auto-hide error after 3 seconds
      setTimeout(() => setHasError(false), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleTextToSpeech}
        disabled={disabled || !text.trim() || isLoading}
        className={`
          flex items-center justify-center
          w-10 h-10 rounded-full
          transition-all duration-200
          ${isLoading || isPlaying
            ? 'bg-blue-500 text-white scale-110'
            : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
          }
          ${disabled || !text.trim()
            ? 'opacity-50 cursor-not-allowed'
            : 'cursor-pointer'
          }
          shadow-md hover:shadow-lg
        `}
        title="Listen to this content"
        aria-label="Listen to this content"
      >
        {isLoading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <Volume2 className="w-5 h-5" />
        )}
      </button>

      {/* Error indicator */}
      {hasError && (
        <div className="flex items-center gap-1 bg-red-50 text-red-600 px-3 py-1 rounded-full text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>Unable to generate speech</span>
        </div>
      )}

      {/* Hidden audio element */}
      <audio ref={audioRef} />
    </div>
  );
}

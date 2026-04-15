import { useState, useRef } from "react";
import { Upload, X, Check, ScanEye, AlertCircle } from "lucide-react";
import { motion } from "motion/react";
import { detectBreed } from "../../lib/api";
import { useLanguage } from "./LanguageContext";
import TTSButton from "./ui/TTSButton";
import type { BreedDetectionResult } from "../../lib/types";

export default function BreedDetection() {
  const [image, setImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<BreedDetectionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { t } = useLanguage();

  const validateImage = (file: File) => {
    const maxSize = 16 * 1024 * 1024; // 16MB
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    
    if (file.size > maxSize) throw new Error(t("imageTooLarge") || 'Image exceeds 16MB');
    if (!validTypes.includes(file.type)) throw new Error(t("invalidFormat") || 'Invalid image format. Please upload JPEG, PNG or WEBP.');
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        validateImage(file);
        setImageFile(file);
        const reader = new FileReader();
        reader.onload = (e) => {
          setImage(e.target?.result as string);
          setResult(null);
          setError(null);
        };
        reader.readAsDataURL(file);
      } catch (err: any) {
        setError(err.message);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      try {
        validateImage(file);
        setImageFile(file);
        const reader = new FileReader();
        reader.onload = (e) => {
          setImage(e.target?.result as string);
          setResult(null);
          setError(null);
        };
        reader.readAsDataURL(file);
      } catch (err: any) {
        setError(err.message);
      }
    }
  };

  const analyzeImage = async () => {
    if (!image || !imageFile) return;
    setIsAnalyzing(true);
    setError(null);
    
    try {
      const response = await detectBreed(imageFile, true);
      if (response.success === false) {
        setError(t("unableToIdentify"));
        setResult(null);
      } else {
        setResult(response);
      }
    } catch (err) {
      setError(t("failedToAnalyze"));
      console.error('Breed detection error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const clearImage = () => {
    setImage(null);
    setImageFile(null);
    setResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-stone-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="relative text-center mb-12">
          <div className="flex justify-center items-start">
            <div className="inline-flex items-center justify-center p-3 bg-emerald-100 rounded-full mb-4">
              <ScanEye className="w-8 h-8 text-emerald-700" />
            </div>
            {/* TTS Button positioned at top right */}
            {result && (
              <div className="absolute right-0 top-0">
                <TTSButton 
                  text={`${t(result.breed)}. ${result.description ? t(result.description) : ''}`}
                  enhance={true}
                  rate={150}
                />
              </div>
            )}
          </div>
          <h1 className="text-4xl font-extrabold text-stone-900 mb-4 tracking-tight">{t("aiBreedDetectionTitle")}</h1>
          <p className="text-lg text-stone-600 max-w-2xl mx-auto">
            {t("aiBreedDetectionDesc")}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="col-span-1 lg:col-span-2 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3"
            >
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
              <div>
                <h3 className="font-bold text-red-900 mb-1">{t("errorTitle")}</h3>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="ml-auto text-red-600 hover:text-red-900"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}

          {/* Upload Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-3xl shadow-xl border border-stone-100 overflow-hidden p-8"
          >
            {!image ? (
              <div 
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="border-3 border-dashed border-emerald-200 hover:border-emerald-400 bg-emerald-50/30 rounded-2xl h-96 flex flex-col items-center justify-center cursor-pointer transition-all group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-emerald-100/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500 rounded-2xl" />
                
                <div className="relative z-10 p-5 bg-white rounded-full shadow-lg mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Upload className="w-10 h-10 text-emerald-600" />
                </div>
                <p className="relative z-10 text-stone-700 font-bold text-lg mb-2">{t("clickOrDrop")}</p>
                <p className="relative z-10 text-sm text-stone-500">{t("supportsFormats")}</p>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </div>
            ) : (
              <div className="relative h-96 bg-stone-900 rounded-2xl overflow-hidden group shadow-inner">
                <img src={image} alt="Uploaded cattle" className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                
                {isAnalyzing && (
                    <div className="absolute inset-0 bg-emerald-950/80 backdrop-blur-sm flex flex-col items-center justify-center z-20">
                        <div className="relative w-24 h-24">
                            <motion.div 
                                className="absolute inset-0 border-4 border-t-emerald-400 border-r-emerald-400 border-b-transparent border-l-transparent rounded-full"
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            />
                            <div className="absolute inset-2 bg-emerald-900 rounded-full flex items-center justify-center">
                                <ScanEye className="w-10 h-10 text-emerald-400 animate-pulse" />
                            </div>
                        </div>
                        <p className="text-emerald-100 mt-6 font-bold tracking-widest text-sm uppercase">{t("analyzingFeatures")}</p>
                    </div>
                )}

                {!isAnalyzing && !result && (
                    <button 
                        onClick={clearImage}
                        className="absolute top-4 right-4 bg-white/90 text-stone-800 p-2 rounded-full hover:bg-red-50 hover:text-red-600 transition-all shadow-lg backdrop-blur-sm"
                    >
                        <X className="w-5 h-5" />
                    </button>
                )}
              </div>
            )}

            <div className="mt-8">
              <button
                onClick={analyzeImage}
                disabled={!image || isAnalyzing || !!result}
                className={`w-full py-4 px-6 rounded-xl font-bold text-lg shadow-lg transition-all flex items-center justify-center gap-2 ${
                  !image || isAnalyzing || result
                    ? "bg-stone-200 text-stone-400 cursor-not-allowed shadow-none"
                    : "bg-emerald-600 text-white hover:bg-emerald-700 hover:shadow-emerald-200 hover:-translate-y-1 active:scale-95"
                }`}
              >
                {result ? (
                    <>
                        <Check className="w-6 h-6" /> {t("detectionComplete")}
                    </>
                ) : isAnalyzing ? (
                    t("processing") 
                ) : (
                    <>
                        <ScanEye className="w-6 h-6" /> {t("identifyBreed")}
                    </>
                )}
              </button>
            </div>
          </motion.div>

          {/* Results Section */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-3xl shadow-xl border border-stone-100 overflow-hidden h-full flex flex-col"
          >
            {!result ? (
               <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-12 bg-stone-50/50">
                    <div className="mb-6 bg-white p-6 rounded-full shadow-sm border border-stone-100">
                        <AlertCircle className="w-16 h-16 text-stone-300" />
                    </div>
                    <h3 className="text-xl font-bold text-stone-400 mb-2">{t("readyToAnalyze")}</h3>
                    <p className="text-stone-400 max-w-xs">{t("resultsAppearHere")}</p>
               </div>
            ) : (
                <div className="flex flex-col h-full">
                    <div className="bg-emerald-900 text-white p-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500 rounded-full blur-3xl opacity-20 -translate-y-1/2 translate-x-1/2" />
                        
                        <div className="relative z-10">
                            <h2 className="text-4xl font-extrabold mb-1 tracking-tight">{t(result.breed)}</h2>
                            {result.origin && (
                                <p className="text-emerald-300 font-medium flex items-center gap-2">
                                    {t("origin")}: {t(result.origin)}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="p-8 flex-grow space-y-8 bg-white">
                        {result.description && (
                            <div>
                                <h4 className="font-bold text-stone-900 mb-3 text-lg border-b border-stone-100 pb-2">{t("description")}</h4>
                                <p className="text-stone-600 leading-relaxed">
                                    {t(result.description)}
                                </p>
                            </div>
                        )}

                        {result.characteristics && result.characteristics.length > 0 && (
                            <div>
                                <h4 className="font-bold text-stone-900 mb-3 text-lg border-b border-stone-100 pb-2">{t("keyCharacteristics")}</h4>
                                <ul className="grid grid-cols-1 gap-3">
                                    {result.characteristics.map((char: string, index: number) => (
                                        <li key={index} className="flex items-start bg-emerald-50 p-3 rounded-lg border border-emerald-100">
                                            <div className="bg-emerald-200 rounded-full p-1 mr-3 mt-0.5 shrink-0">
                                                <Check className="w-3 h-3 text-emerald-800" />
                                            </div>
                                            <span className="text-emerald-900 font-medium text-sm">{t(char)}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>

                    <div className="p-8 pt-0 mt-auto">
                        <button className="w-full border-2 border-emerald-600 text-emerald-700 py-3 rounded-xl font-bold hover:bg-emerald-50 transition-colors mb-3">
                            {t("saveToRecords")}
                        </button>
                         <button 
                            onClick={clearImage}
                            className="w-full text-stone-500 py-2 text-sm hover:text-stone-800 hover:underline"
                        >
                            {t("scanAnother")}
                        </button>
                    </div>
                </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

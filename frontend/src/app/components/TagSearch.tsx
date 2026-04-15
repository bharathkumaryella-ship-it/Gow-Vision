import { useState } from "react";
import { Search, MapPin, Phone, Calendar, ShieldCheck, HeartPulse, User, BadgeCheck, FileCheck, CircleUserRound, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useLanguage } from "./LanguageContext";
import TTSButton from "./ui/TTSButton";

/**
 * Cattle Tag Search Component
 * Connects to: GET /api/cattle-search/tag/<tag_id>
 */

// Breed to image mapping - Local cattle breed images
const BREED_IMAGES: Record<string, string> = {
  "Gir": "/breed-gir.jpg",
  "Sahiwal": "/breed-sahiwal.jpg",
  "Holstein Friesian": "/breed-holstein.jpg",
  "Jersey": "/breed-jersey.jpg",
  "Red Sindhi": "/breed-red-sindhi.jpg",
  "Ayrshire": "/breed-ayrshire.jpg",
  "Brown Swiss": "/breed-brown-swiss.jpg"
};

const getBreedImage = (breed: string): string => {
  return BREED_IMAGES[breed] || "/breed-jersey.jpg"; // Default cattle image
};

export default function TagSearch() {
  const [tagInput, setTagInput] = useState("");
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { t } = useLanguage();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tagInput.trim()) return;
    
    setLoading(true);
    setError("");
    setResult(null);
    console.log("Searching for tag:", tagInput.trim());

    try {
      const response = await fetch(`/api/cattle-search/tag/${tagInput.trim()}`);
      console.log("API Response Status:", response.status);
      const data = await response.json();
      console.log("API Response Data:", data);

      if (response.ok && data.status === 'success') {
        const cattle = data.data;
        console.log("Cattle found:", cattle.animal_name);
        
        // Get breed-specific image
        const breedImage = getBreedImage(cattle.breed);
        
        // Map backend CSV fields to frontend state
        setResult({
          tagId: cattle.ear_tag_id,
          pashuId: cattle.pashu_id,
          breed: cattle.breed,
          gender: cattle.sex,
          age: `${cattle.age_years} Years`,
          births: cattle.total_calvings,
          owner: cattle.owner_name,
          contact: cattle.mobile_number,
          location: `${cattle.village}, ${cattle.state}`,
          vaccinationStatus: `FMD: ${cattle.vaccination_fmd}, PPR: ${cattle.vaccination_ppr}`,
          insuranceStatus: `${cattle.insurance_type} (Policy: ${cattle.insurance_policy_number})`,
          lastCheckup: cattle.vet_checkup_date,
          healthStatus: cattle.health_status,
          image: breedImage
        });
      } else if (response.status === 404) {
        setError(t("noCattleFound") || `No cattle found with tag ID: ${tagInput.trim()}`);
      } else if (response.status === 500) {
        setError(data.message || "Server error: Unable to access cattle database. Please try again later.");
      } else {
        setError(data.message || t("failedToAnalyze"));
      }
    } catch (err) {
      console.error("Search error:", err);
      setError("Network error: Unable to connect to server. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12 relative">
          <div className="inline-flex items-center justify-center p-4 bg-emerald-100 rounded-full mb-4">
            <Search className="w-8 h-8 text-emerald-700" />
          </div>
          <h1 className="text-4xl font-extrabold text-stone-900 mb-4 tracking-tight">{t("cattleTagSearchTitle")}</h1>
          <p className="text-lg text-stone-600 max-w-2xl mx-auto">{t("cattleTagSearchDesc")}</p>
          {/* TTS Button positioned at top right */}
          {result && (
            <div className="absolute right-0 top-0">
              <TTSButton 
                text={`${t(result.breed)} aged ${result.age}, owned by ${result.owner}, located in ${result.location}`}
                enhance={true}
                rate={150}
              />
            </div>
          )}
        </div>

        {/* Search Box */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-12 border border-stone-100 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-amber-400" />
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4 relative z-10">
            <div className="flex-grow relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <BadgeCheck className="h-6 w-6 text-emerald-400 group-focus-within:text-emerald-600 transition-colors" />
                </div>
                <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder={t("enterTagId")}
                    className="block w-full pl-12 pr-4 py-4 bg-stone-50 border-2 border-stone-200 rounded-xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 transition-all text-lg font-medium placeholder-stone-400 text-stone-800"
                />
            </div>
            <button
                type="submit"
                disabled={loading}
                className={`sm:w-auto px-10 py-4 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 hover:shadow-lg hover:-translate-y-0.5 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
            >
                {loading ? (
                    <>
                        <motion.div 
                            className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, ease: "linear", duration: 1 }}
                        />
                        {t("searching")}
                    </>
                ) : (
                    <>
                        {t("searchRecords")}
                    </>
                )}
            </button>
          </form>
          <AnimatePresence>
            {error && (
                <motion.div 
                    initial={{ opacity: 0, height: 0 }} 
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 flex items-center gap-3"
                >
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <p className="font-medium">{error}</p>
                </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Result Card */}
        <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
            className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-stone-100"
          >
            {/* Header with Image and Basic Info */}
            <div className="bg-emerald-950 p-8 sm:p-10 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5 mix-blend-overlay pointer-events-none">
                    <FileCheck className="w-96 h-96 transform rotate-12" />
                </div>
                
                <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center md:items-start">
                    <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-emerald-400 to-amber-400 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                        <img 
                            src={result.image} 
                            alt={result.breed} 
                            className="relative w-40 h-40 rounded-full border-4 border-emerald-900 object-cover shadow-2xl"
                        />
                        <div className="absolute bottom-0 right-0 bg-emerald-500 border-4 border-emerald-900 rounded-full p-2">
                             <BadgeCheck className="w-6 h-6 text-white" />
                        </div>
                    </div>
                    
                    <div className="text-center md:text-left flex-grow">
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-4">
                             <span className="bg-emerald-800/50 backdrop-blur-md text-emerald-200 text-xs px-3 py-1.5 rounded-full uppercase tracking-wider font-bold border border-emerald-700/50 shadow-sm">
                                {t("tagIdLabel")}: {result.tagId}
                             </span>
                             {result.pashuId && (
                                <span className="bg-emerald-800/50 backdrop-blur-md text-emerald-200 text-xs px-3 py-1.5 rounded-full uppercase tracking-wider font-bold border border-emerald-700/50 shadow-sm">
                                    Pashu Aadhaar: {result.pashuId}
                                </span>
                             )}
                             <span className={`text-xs px-3 py-1.5 rounded-full uppercase tracking-wider font-bold shadow-sm flex items-center gap-1 ${
                                 result.insuranceStatus.includes("Active") 
                                 ? "bg-emerald-500 text-white" 
                                 : "bg-red-500 text-white"
                             }`}>
                                {result.insuranceStatus.includes("Active") ? <ShieldCheck className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                                {result.insuranceStatus.includes("Active") ? t("insured") : t("uninsured")}
                             </span>
                        </div>
                        
                        <h2 className="text-4xl font-extrabold mb-2 text-white tracking-tight">{t(result.breed)} <span className="text-emerald-400 font-light">{t("breedLabel")}</span></h2>
                        
                        <div className="flex flex-col md:flex-row items-center md:items-start gap-4 text-emerald-200/80 text-sm font-medium">
                            <span className="flex items-center gap-2 bg-emerald-900/50 px-3 py-1 rounded-lg">
                                <MapPin className="w-4 h-4 text-amber-400" /> {t(result.location)}
                            </span>
                            <span className="hidden md:inline text-emerald-700">•</span>
                            <span className="flex items-center gap-2 bg-emerald-900/50 px-3 py-1 rounded-lg">
                                <Calendar className="w-4 h-4 text-amber-400" /> {t("lastCheckup")}: {t(result.lastCheckup)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Detailed Info Grid */}
            <div className="p-8 sm:p-12 bg-stone-50/50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-12">
                    
                    {/* Owner Info Block */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100 hover:shadow-md transition-shadow">
                        <h3 className="text-emerald-900 font-bold text-lg mb-6 flex items-center gap-2">
                            <CircleUserRound className="w-6 h-6 text-amber-500" />
                            {t("ownerDetails")}
                        </h3>
                        <div className="space-y-6">
                            <div className="flex items-center justify-between border-b border-stone-100 pb-4">
                                <span className="text-stone-500 text-sm font-medium">{t("name")}</span>
                                <span className="text-stone-900 font-bold text-lg">{result.owner}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-stone-500 text-sm font-medium">{t("contact")}</span>
                                <a href={`tel:${result.contact}`} className="text-emerald-600 font-bold text-lg hover:underline flex items-center gap-2">
                                    <Phone className="w-4 h-4" />
                                    {result.contact}
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Vitals Block */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100 hover:shadow-md transition-shadow">
                        <h3 className="text-emerald-900 font-bold text-lg mb-6 flex items-center gap-2">
                            <HeartPulse className="w-6 h-6 text-amber-500" />
                            {t("vitalStatistics")}
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-stone-50 p-4 rounded-xl text-center border border-stone-100">
                                <span className="block text-xs text-stone-400 uppercase tracking-wider font-bold mb-1">{t("age")}</span>
                                <span className="block text-xl font-bold text-stone-800">{t(result.age)}</span>
                            </div>
                             <div className="bg-stone-50 p-4 rounded-xl text-center border border-stone-100">
                                <span className="block text-xs text-stone-400 uppercase tracking-wider font-bold mb-1">{t("gender")}</span>
                                <span className="block text-xl font-bold text-stone-800">{t(result.gender)}</span>
                            </div>
                             <div className="bg-stone-50 p-4 rounded-xl text-center border border-stone-100">
                                <span className="block text-xs text-stone-400 uppercase tracking-wider font-bold mb-1">{t("births")}</span>
                                <span className="block text-xl font-bold text-stone-800">{result.births}</span>
                            </div>
                             <div className="bg-stone-50 p-4 rounded-xl text-center border border-stone-100">
                                <span className="block text-xs text-stone-400 uppercase tracking-wider font-bold mb-1">{t("lactation")}</span>
                                <span className="block text-xl font-bold text-stone-800">{t("active")}</span>
                            </div>
                        </div>
                    </div>

                    {/* Full Width Statuses */}
                    <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-emerald-50/50 p-6 rounded-2xl border border-emerald-100 flex items-center gap-5 relative overflow-hidden group">
                            <div className="absolute right-0 top-0 w-24 h-24 bg-emerald-100 rounded-bl-full opacity-50 group-hover:scale-110 transition-transform origin-top-right" />
                            <div className="bg-white p-3 rounded-full shadow-sm z-10">
                                <ShieldCheck className="w-8 h-8 text-emerald-600" />
                            </div>
                            <div className="z-10">
                                <p className="text-xs text-emerald-600 font-bold uppercase tracking-wider mb-1">{t("vaccinationStatus")}</p>
                                <p className="text-emerald-900 font-extrabold text-lg">{t(result.vaccinationStatus)}</p>
                            </div>
                        </div>

                         <div className={`p-6 rounded-2xl border flex items-center gap-5 relative overflow-hidden group ${
                             result.insuranceStatus.includes("Active") 
                             ? "bg-blue-50/50 border-blue-100" 
                             : "bg-red-50/50 border-red-100"
                         }`}>
                             <div className={`absolute right-0 top-0 w-24 h-24 rounded-bl-full opacity-50 transition-transform origin-top-right group-hover:scale-110 ${
                                 result.insuranceStatus.includes("Active") ? "bg-blue-100" : "bg-red-100"
                             }`} />
                            <div className="bg-white p-3 rounded-full shadow-sm z-10">
                                <HeartPulse className={`w-8 h-8 ${result.insuranceStatus.includes("Active") ? "text-blue-600" : "text-red-600"}`} />
                            </div>
                            <div className="z-10">
                                <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${result.insuranceStatus.includes("Active") ? "text-blue-600" : "text-red-600"}`}>{t("insuranceStatusLabel")}</p>
                                <p className={`font-extrabold text-lg ${result.insuranceStatus.includes("Active") ? "text-blue-900" : "text-red-900"}`}>{t(result.insuranceStatus)}</p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
          </motion.div>
        )}
        </AnimatePresence>
      </div>
    </div>
  );
}

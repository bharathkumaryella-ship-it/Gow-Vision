import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown, ExternalLink, Info, CheckCircle, FileCheck, HandCoins, Building2, Wallet, Shield, Clock } from "lucide-react";
import { useLanguage } from "./LanguageContext";
import TTSButton from "./ui/TTSButton";
import { API_BASE_URL } from "@/lib/api";
import type { GovernmentScheme } from "@/lib/types";

// Helper function to determine if a scheme is verified and secure
function isSchemeVerifiedAndSecure(scheme: GovernmentScheme): boolean {
  // Only show schemes that are:
  // 1. Active and not expired
  // 2. From official government sources or verified APIs
  return (
    scheme.is_active && 
    !scheme.is_expired &&
    (scheme.source === 'api' || scheme.source === 'manual' || scheme.source === 'government')
  );
}

function getVerificationBadge(scheme: GovernmentScheme) {
  if (!isSchemeVerifiedAndSecure(scheme)) return null;
  
  const isApiVerified = scheme.source === 'api';
  return {
    isApiVerified: isApiVerified,
    color: 'bg-green-100 text-green-700',
    icon: Shield
  };
}

export default function Schemes() {
  const { t } = useLanguage();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch schemes from API
  const fetchSchemes = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/api/schemes/`);
      
      if (!response.ok) {
        throw new Error(`${t("failedToFetchSchemes")}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setSchemes(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("failedToFetchSchemes"));
      console.error(t("errorFetchingSchemes"), err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchemes();
    // Refresh schemes every 30 minutes
    const interval = setInterval(fetchSchemes, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const toggleScheme = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mb-4" />
          <p className="text-stone-600 font-medium">{t("loading")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center p-4 bg-emerald-100 rounded-full mb-4">
            <HandCoins className="w-8 h-8 text-emerald-700" />
          </div>
          <h1 className="text-4xl font-extrabold text-stone-900 mb-4 tracking-tight">{t("govWelfareSchemes")}</h1>
          <p className="text-lg text-stone-600 max-w-2xl mx-auto leading-relaxed">
            {t("unlockBenefits")}
          </p>
          <p className="text-sm text-stone-500 mt-4">
            {t("schemsUpdatedDaily")}
          </p>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}
        
        <div className="space-y-6">
          {/* Filter to show only valid and secure schemes */}
          {schemes.filter(isSchemeVerifiedAndSecure).length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-stone-200">
              <HandCoins className="w-12 h-12 text-stone-400 mx-auto mb-4" />
              <p className="text-stone-600 font-medium">{t("noVerifiedSchemes")}</p>
            </div>
          ) : (
            schemes.filter(isSchemeVerifiedAndSecure).map((scheme, index) => {
              const badge = getVerificationBadge(scheme);
              const BadgeIcon = badge?.icon;
              
              return (
            <motion.div
                key={scheme.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`bg-white rounded-2xl border transition-all duration-300 overflow-hidden shadow-sm border-stone-200 hover:shadow-lg hover:border-emerald-200 ${
                  expandedId === scheme.id 
                    ? "shadow-2xl border-emerald-500 ring-1 ring-emerald-500 transform scale-[1.02]" 
                    : ""
                }`}
              >
                <button
                  onClick={() => toggleScheme(scheme.id)}
                  className="w-full text-left p-6 sm:p-8 focus:outline-none relative overflow-hidden group"
                >
                  {/* Background Decoration */}
                  <div className={`absolute left-0 top-0 bottom-0 w-1.5 transition-colors duration-300 ${
                    expandedId === scheme.id 
                      ? scheme.color 
                      : "bg-stone-200 group-hover:bg-emerald-300"
                  }`} />
                  
                  <div className="flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-6 flex-1">
                      <div className={`p-4 rounded-xl shadow-sm transition-transform duration-300 group-hover:scale-110 ${scheme.color} flex-shrink-0`}>
                        {getIconComponent(scheme.icon)}
                      </div>
                    <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className={`text-xl font-bold transition-colors duration-300 ${expandedId === scheme.id ? "text-emerald-900" : "text-stone-800"}`}>
                              {scheme.title}
                            </h3>
                            {badge && (
                              <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${badge.color} shrink-0`}>
                                {BadgeIcon && <BadgeIcon className="w-3.5 h-3.5" />}
                                {badge.isApiVerified ? t("governmentVerified") : t("officialScheme")}
                              </div>
                            )}
                          </div>
                          <p className="text-stone-500 mt-1 line-clamp-1 font-medium">{scheme.description}</p>
                      </div>
                    </div>
                    <div className={`p-2 rounded-full transition-colors duration-300 ${expandedId === scheme.id ? "bg-emerald-100 text-emerald-600" : "bg-stone-100 text-stone-400 group-hover:bg-emerald-50 group-hover:text-emerald-500"}`}>
                      <ChevronDown
                          className={`w-6 h-6 transition-transform duration-300 ${
                          expandedId === scheme.id ? "transform rotate-180" : ""
                          }`}
                      />
                    </div>
                  </div>
                </button>

                <AnimatePresence>
                  {expandedId === scheme.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-stone-100 bg-stone-50/50"
                    >
                      <div className="p-8 space-y-8 relative">
                        {/* TTS Button positioned at top right */}
                        <div className="absolute right-8 top-8 z-10">
                          <TTSButton 
                            text={`${scheme.title}. ${scheme.details}`}
                            enhance={true}
                            rate={150}
                          />
                        </div>
                        
                          <div className="bg-white p-6 rounded-xl border border-stone-100 shadow-sm pt-12">
                              <h4 className="font-bold text-stone-900 flex items-center gap-2 mb-3 text-lg">
                                  <Info className="w-5 h-5 text-amber-500" />
                                  {t("schemeDetails")}
                              </h4>
                              <p className="text-stone-600 leading-relaxed">
                                  {scheme.details}
                              </p>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                              <div>
                                  <h4 className="font-bold text-stone-900 flex items-center gap-2 mb-4 uppercase tracking-wider text-sm">
                                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                                      {t("eligibilityCriteria")}
                                  </h4>
                                  <ul className="space-y-3">
                                      {scheme.eligibility.map((item, idx) => (
                                          <li key={idx} className="flex items-start text-stone-600 bg-white p-3 rounded-lg border border-stone-100 shadow-sm">
                                              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-2 mr-3 shrink-0" />
                                              {item}
                                          </li>
                                      ))}
                                  </ul>
                              </div>
                              <div>
                                  <h4 className="font-bold text-stone-900 flex items-center gap-2 mb-4 uppercase tracking-wider text-sm">
                                      <HandCoins className="w-4 h-4 text-emerald-600" />
                                      {t("keyBenefits")}
                                  </h4>
                                  <ul className="space-y-3">
                                      {scheme.benefits.map((item, idx) => (
                                          <li key={idx} className="flex items-start text-stone-600 bg-white p-3 rounded-lg border border-stone-100 shadow-sm">
                                              <span className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-2 mr-3 shrink-0" />
                                              {item}
                                          </li>
                                      ))}
                                </ul>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center justify-between pt-6 border-t border-stone-200 mt-6 gap-6">
                            <div className="flex flex-col gap-2 w-full">
                              <div className="flex items-center gap-2 text-stone-500 font-medium bg-stone-100 px-4 py-2 rounded-lg">
                                  <FileCheck className="w-4 h-4" />
                                  <span className="font-bold text-stone-700">{t("deadline")}</span> 
                                  {scheme.deadline ? new Date(scheme.deadline).toLocaleDateString() : t("notSpecified")}
                              </div>
                              <div className="flex items-center gap-2 text-stone-500 font-medium bg-green-50 px-4 py-2 rounded-lg border border-green-200">
                                  <Shield className="w-4 h-4 text-green-600" />
                                  <span className="font-bold text-green-700">{t("verifiedAndSecure")}</span>
                                  {scheme.last_verified_at && (
                                    <>
                                      <span className="text-green-600 mx-1">•</span>
                                      <Clock className="w-3 h-3 text-green-600" />
                                      <span className="text-xs text-green-600">
                                        {new Date(scheme.last_verified_at).toLocaleDateString()}
                                      </span>
                                    </>
                                  )}
                              </div>
                            </div>
                            {scheme.link && (
                              <a 
                                  href={scheme.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-bold rounded-xl text-white bg-emerald-600 hover:bg-emerald-700 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all"
                              >
                                  {t("applyNowPortal")}
                                  <ExternalLink className="ml-2 -mr-1 w-4 h-4" />
                              </a>
                            )}
                        </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
            );
            })
          )}
        </div>
        
        <div className="mt-16 bg-emerald-900 rounded-3xl p-10 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            <div className="relative z-10">
                <h3 className="text-2xl font-bold text-white mb-4">{t("needHelpApplying")}</h3>
                <p className="text-emerald-200 mb-8 max-w-xl mx-auto">{t("supportTeamGuide")}</p>
                <button className="bg-amber-400 text-emerald-950 font-bold px-8 py-3 rounded-xl hover:bg-amber-300 transition-colors shadow-lg">
                    {t("contactHelpline")}
                </button>
            </div>
        </div>
      </div>
    </div>
  );
}

// Helper function to render icon components based on icon name
function getIconComponent(iconName: string) {
  const iconMap: { [key: string]: any } = {
    'Building2': <Building2 className="w-6 h-6 text-white" />,
    'HandCoins': <HandCoins className="w-6 h-6 text-white" />,
    'Wallet': <Wallet className="w-6 h-6 text-white" />,
    'CheckCircle': <CheckCircle className="w-6 h-6 text-white" />,
    'Shield': <Shield className="w-6 h-6 text-white" />,
  };
  
  return iconMap[iconName] || <Building2 className="w-6 h-6 text-white" />;
}

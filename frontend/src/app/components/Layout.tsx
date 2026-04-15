import { Outlet, Link, useLocation } from "react-router";
import { Search, FileText, Menu, X, ScanEye, Sprout, HeartPulse, Zap } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import LanguageSelector from "./LanguageSelector";
import { useLanguage } from "./LanguageContext";

export default function Layout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { t } = useLanguage();

  const navItems = [
    { path: "/", label: t("home"), icon: <Sprout className="w-5 h-5" /> },
    { path: "/detect", label: t("breedDetection"), icon: <ScanEye className="w-5 h-5" /> },
    { path: "/search", label: t("tagSearch"), icon: <Search className="w-5 h-5" /> },
    { path: "/health", label: t("healthAnalysis"), icon: <HeartPulse className="w-5 h-5" /> },
    { path: "/schemes", label: t("govSchemes"), icon: <FileText className="w-5 h-5" /> },
  ];

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col font-sans text-stone-900 selection:bg-amber-200 selection:text-emerald-900">
      {/* Navbar */}
      <nav className="bg-emerald-950 text-white sticky top-0 z-50 shadow-2xl border-b border-emerald-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-amber-500 rounded-lg blur opacity-25 group-hover:opacity-50 transition-opacity duration-300"></div>
                <div className="bg-emerald-800 p-2.5 rounded-lg border border-emerald-700 relative z-10 group-hover:bg-emerald-700 transition-colors">
                   <ScanEye className="w-7 h-7 text-amber-400 group-hover:scale-110 transition-transform duration-300" />
                </div>
                <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 border border-emerald-900 z-20">
                    <Zap className="w-3 h-3 text-emerald-900" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-white to-emerald-200 bg-clip-text text-transparent">Gow Vision</span>
                <span className="text-[10px] text-emerald-400 font-medium tracking-widest uppercase">{t("smartDairyTech")}</span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex space-x-2 items-center">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`relative px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center gap-2 overflow-hidden group ${
                      isActive
                        ? "bg-emerald-800/50 text-amber-400 shadow-inner border border-emerald-700/50"
                        : "text-emerald-100 hover:text-white hover:bg-emerald-800/30"
                    }`}
                  >
                    <span className={`relative z-10 transition-transform duration-300 ${isActive ? "scale-110" : "group-hover:scale-110"}`}>{item.icon}</span>
                    <span className="relative z-10">{item.label}</span>
                    {isActive && (
                        <motion.div
                            layoutId="activeTab"
                            className="absolute inset-0 bg-emerald-800/50 rounded-xl"
                            initial={false}
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        />
                    )}
                  </Link>
                );
              })}
              <div className="h-6 w-px bg-emerald-800/50 mx-2" />
              <LanguageSelector />
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-emerald-100 hover:text-amber-400 focus:outline-none p-2 transition-colors"
              >
                {isMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-emerald-900 border-t border-emerald-800 overflow-hidden"
            >
              <div className="px-4 pt-4 pb-6 space-y-2">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-4 rounded-xl text-base font-semibold transition-all ${
                      location.pathname === item.path
                        ? "bg-emerald-800 text-amber-400 border border-emerald-700"
                        : "text-emerald-100 hover:bg-emerald-800/50 hover:text-white"
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                ))}
                <div className="pt-2">
                  <LanguageSelector isMobile />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
      
      {/* Main Content */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-emerald-950 text-emerald-400 py-12 border-t border-emerald-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                <div className="col-span-1 md:col-span-2">
                    <div className="flex items-center space-x-3 mb-4">
                        <div className="bg-emerald-800 p-2 rounded-lg border border-emerald-700">
                           <ScanEye className="w-6 h-6 text-amber-400" />
                        </div>
                        <span className="text-xl font-bold text-white tracking-tight">Gow Vision</span>
                    </div>
                    <p className="text-emerald-500 max-w-sm leading-relaxed">
                        {t("smartDairyTechFooter")}
                    </p>
                </div>
                <div>
                    <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-sm">{t("quickLinks")}</h4>
                    <ul className="space-y-2">
                        <li><Link to="/" className="hover:text-amber-400 transition-colors">{t("home")}</Link></li>
                        <li><Link to="/detect" className="hover:text-amber-400 transition-colors">{t("breedDetection")}</Link></li>
                        <li><Link to="/search" className="hover:text-amber-400 transition-colors">{t("tagSearch")}</Link></li>
                    </ul>
                </div>
                <div>
                    <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-sm">{t("resources")}</h4>
                    <ul className="space-y-2">
                        <li><Link to="/schemes" className="hover:text-amber-400 transition-colors">{t("govSchemes")}</Link></li>
                        <li><a href="#" className="hover:text-amber-400 transition-colors">{t("supportCenter")}</a></li>
                        <li><a href="#" className="hover:text-amber-400 transition-colors">{t("privacyPolicy")}</a></li>
                    </ul>
                </div>
            </div>
            <div className="border-t border-emerald-900 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-emerald-600">
                <div>© {new Date().getFullYear()} Gow Vision. {t("allRightsReserved")}</div>
                <div className="mt-4 md:mt-0 flex space-x-4">
                    <span>{t("madeWithLove")}</span>
                </div>
            </div>
        </div>
      </footer>
    </div>
  );
}
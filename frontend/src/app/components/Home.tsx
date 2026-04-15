import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { Link } from "react-router";
import { useLanguage } from "./LanguageContext";
import {
  ScanEye, Search, HandCoins, ArrowRight,
  ChevronRight, Sprout, HeartPulse, Sparkles,
  Star, Users, TrendingUp, Award
} from "lucide-react";
import breedDetectImg from "../../assets/breed-detect.jpeg";
import tagSearchImg from "../../assets/tag-search.jpeg";
import heroCow from "../../assets/hero-cow.jpg";
import healthAnalysisImg from "../../assets/health-analysis.jpeg";
import govSchemesImg from "../../assets/gov-schemes.jpeg";
import StatsSection from "./StatsSection";

const HERO_BG = heroCow;
const HEALTH_IMG = healthAnalysisImg;
const SCHEMES_IMG = govSchemesImg;

interface Feature {
  titleKey: string;
  icon: React.ReactNode;
  link: string;
  image: string;
  ctaKey: string;
  accent: string;
  badgeKey: string;
  badgeIcon: React.ReactNode;
  glow: string;
}

const features: Feature[] = [
  {
    titleKey: "aiBreedTitle",
    icon: <ScanEye className="w-9 h-9" />,
    link: "/detect",
    image: breedDetectImg,
    ctaKey: "analyzeNow",
    accent: "from-emerald-500 to-teal-600",
    badgeKey: "accuracyBadge",
    badgeIcon: <Star className="w-3 h-3" />,
    glow: "shadow-emerald-200",
  },
  {
    titleKey: "smartTagTitle",
    icon: <Search className="w-9 h-9" />,
    link: "/search",
    image: tagSearchImg,
    ctaKey: "searchTag",
    accent: "from-sky-500 to-indigo-600",
    badgeKey: "instantLookup",
    badgeIcon: <TrendingUp className="w-3 h-3" />,
    glow: "shadow-sky-200",
  },
  {
    titleKey: "healthAnalysisTitle",
    icon: <HeartPulse className="w-9 h-9" />,
    link: "/health",
    image: HEALTH_IMG,
    ctaKey: "checkHealth",
    accent: "from-rose-500 to-pink-600",
    badgeKey: "earlyDetection",
    badgeIcon: <Award className="w-3 h-3" />,
    glow: "shadow-rose-200",
  },
  {
    titleKey: "govSchemesTitle",
    icon: <HandCoins className="w-9 h-9" />,
    link: "/schemes",
    image: SCHEMES_IMG,
    ctaKey: "exploreBenefits",
    accent: "from-amber-500 to-orange-600",
    badgeKey: "subsidiesBadge",
    badgeIcon: <Users className="w-3 h-3" />,
    glow: "shadow-amber-200",
  },
];



export default function Home() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const bgY = useTransform(scrollY, [0, 700], ["0%", "20%"]);
  const opacity = useTransform(scrollY, [0, 500], [1, 0]);
  const { t } = useLanguage();

  return (
    <div className="bg-stone-50 overflow-hidden min-h-screen flex flex-col">

      {/* ─── HERO ─── */}
      <section ref={heroRef} className="relative min-h-[92vh] flex items-center justify-center overflow-hidden">

        {/* Parallax Background */}
        <motion.div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url('${HERO_BG}')`, y: bgY, scale: 1.12 }}
        />

        {/* Layered overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />

        {/* Animated floating particles */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-amber-400/20 blur-xl"
            style={{
              width: `${80 + i * 40}px`,
              height: `${80 + i * 40}px`,
              left: `${10 + i * 15}%`,
              top: `${20 + (i % 3) * 20}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 4 + i,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.5,
            }}
          />
        ))}

        <motion.div style={{ opacity }} className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-24">
          <div className="max-w-3xl">

            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-800/50 backdrop-blur-sm border border-emerald-500/40 text-emerald-100 text-sm font-semibold mb-6 shadow-lg"
            >
              <Sprout className="w-4 h-4 text-amber-400" />
              <span className="text-amber-100">{t("innovatingAgriculture")}</span>
              <Sparkles className="w-4 h-4 text-amber-300" />
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-4xl md:text-5xl font-extrabold text-white mb-6 leading-[1.08] tracking-tight drop-shadow-2xl"
            >
              {t("smartSolutions")} <br />
              <motion.span
                className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-300 to-emerald-300"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 0.6 }}
              >
                {t("modernCattleCare")}
              </motion.span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-base md:text-lg text-emerald-100 mb-10 leading-relaxed font-light max-w-2xl drop-shadow-md"
            >
              {t("heroSubtitle")}
            </motion.p>

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <Link
                to="/detect"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/20 backdrop-blur-sm text-white font-semibold rounded-xl border border-white/30 hover:bg-white/30 hover:border-white/50 transition-all duration-300"
              >
                <span>Get Started</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </motion.div>

          </div>
        </motion.div>

      </section>

      {/* ─── FULL PAGE VIDEO SECTION ─── */}
      <section className="relative min-h-screen w-full flex flex-col items-center justify-center bg-stone-50 overflow-hidden py-32">
        
        {/* Animated background gradients */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 0.6 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          viewport={{ once: true }}
          className="absolute inset-0 bg-gradient-to-br from-emerald-100/50 via-transparent to-amber-100/50 blur-3xl pointer-events-none"
        />

        <motion.div
          initial={{ scale: 1, opacity: 0.3 }}
          whileInView={{ scale: 1.2, opacity: 0.5 }}
          transition={{ duration: 3, ease: "easeInOut" }}
          viewport={{ once: true }}
          className="absolute inset-0 bg-gradient-to-tl from-teal-50/50 via-transparent to-orange-50/50 blur-3xl pointer-events-none"
        />

        {/* Content container */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          viewport={{ once: true }}
          className="relative z-10 w-full px-4 sm:px-6 lg:px-8 flex items-center justify-center"
        >
          <div className="w-full max-w-5xl">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              className="text-center mb-12 relative"
            >
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-emerald-400/20 blur-[60px] rounded-full pointer-events-none" />

              <motion.span 
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1, duration: 0.5 }}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-stone-100 text-emerald-800 text-xs font-bold tracking-wider uppercase mb-5 border border-stone-200 shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Live Demo
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              </motion.span>

              <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-emerald-950 mb-4 tracking-tight drop-shadow-sm">
                See It <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-amber-500">in Action</span>
              </h2>
              <p className="text-lg sm:text-xl text-stone-600 max-w-2xl mx-auto relative z-10">
                Experience our AI-powered platform transforming cattle care
              </p>
            </motion.div>

            {/* Video Container with Glowing Border */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              viewport={{ once: true }}
              className="relative group w-full"
            >
              <motion.div
                animate={{ y: [-8, 8, -8] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="relative"
              >
                {/* Animated Glowing Border Effect */}
                <motion.div
                  animate={{
                    boxShadow: [
                      "0 0 20px rgba(16, 185, 129, 0.4)",
                      "0 0 40px rgba(245, 158, 11, 0.4)",
                      "0 0 20px rgba(16, 185, 129, 0.4)",
                    ],
                  }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute inset-0 rounded-2xl sm:rounded-3xl"
                />

                {/* Video Player */}
                <div className="relative bg-black rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border border-stone-200">
                  <video
                    controls
                    className="w-full h-auto rounded-2xl sm:rounded-3xl block"
                    style={{
                      aspectRatio: "16/9",
                    }}
                  >
                    <source src="/demo-video.mp4" type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                </div>
              </motion.div>
            </motion.div>

            {/* Info Text Below Video */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              viewport={{ once: true }}
              className="mt-8 text-center"
            >
              <p className="text-stone-600 text-sm sm:text-base font-medium">
                ✨ Watch how our platform simplifies cattle management with cutting-edge AI technology
              </p>
            </motion.div>
          </div>
        </motion.div>

        {/* Floating Particles */}
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            initial={{
              x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
              y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800),
              opacity: 0,
              scale: Math.random() * 0.5 + 0.5,
            }}
            animate={{
              y: [0, -200, -400],
              x: i % 2 === 0 ? [0, 30, -30, 0] : [0, -30, 30, 0],
              opacity: [0, 0.8, 0],
            }}
            transition={{
              duration: 5 + Math.random() * 5,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: "easeInOut",
            }}
            className={`absolute rounded-full blur-[2px] pointer-events-none ${i % 3 === 0 ? 'bg-emerald-400 w-4 h-4' : i % 3 === 1 ? 'bg-amber-400 w-3 h-3' : 'bg-teal-300 w-5 h-5'}`}
          />
        ))}
      </section>

      {/* ─── PRODUCT FEATURES SECTION ─── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">

        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-700 text-sm font-bold tracking-wide uppercase mb-4 border border-emerald-200">
            {t("ourFeatures")}
          </span>
          <h2 className="text-4xl md:text-5xl font-extrabold text-emerald-950 tracking-tight">
            {t("everythingYouNeed")}
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-amber-500"> {t("manageYourHerd")}</span>
          </h2>
        </motion.div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.titleKey}
              initial={{ opacity: 0, y: 60, scale: 0.92 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{
                duration: 0.65,
                delay: index * 0.13,
                ease: [0.22, 1, 0.36, 1],
              }}
              whileHover={{ y: -8, transition: { duration: 0.3, ease: "easeOut" } }}
            >
              <Link
                to={feature.link}
                className={`group relative bg-white rounded-[1.75rem] shadow-xl ${feature.glow} hover:shadow-2xl transition-shadow duration-500 overflow-hidden flex flex-col border border-stone-100 cursor-pointer h-full`}
              >
              {/* Card image */}
              <div className="h-52 overflow-hidden relative shrink-0">
                <motion.img
                  src={feature.image as string}
                  alt={t(feature.titleKey)}
                  className="w-full h-full object-cover"
                  whileHover={{ scale: 1.08 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent z-10" />

                {/* Badge */}
                <motion.div
                  initial={{ x: 20, opacity: 0 }}
                  whileInView={{ x: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + index * 0.13 }}
                  className="absolute top-4 right-4 z-20 flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 backdrop-blur-sm text-xs font-bold text-stone-700 shadow"
                >
                  {feature.badgeIcon}
                  {t(feature.badgeKey)}
                </motion.div>

                {/* Icon + Title */}
                <div className="absolute bottom-0 left-0 right-0 z-20 p-4 flex items-end gap-3">
                  <motion.div
                    className={`bg-gradient-to-br ${feature.accent} p-2.5 rounded-xl shadow-lg text-white shrink-0`}
                    whileHover={{ rotate: [0, -10, 10, 0], transition: { duration: 0.4 } }}
                  >
                    {feature.icon}
                  </motion.div>
                  <h3 className="text-white font-extrabold text-lg leading-tight drop-shadow-md">{t(feature.titleKey)}</h3>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 flex flex-col flex-grow">
                {/* Animated divider */}
                <motion.div
                  className={`h-0.5 rounded-full bg-gradient-to-r ${feature.accent} mb-4`}
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 + index * 0.13, duration: 0.6 }}
                  style={{ originX: 0 }}
                />

                <div className="inline-flex items-center gap-2 font-bold text-sm">
                  <span className={`text-transparent bg-clip-text bg-gradient-to-r ${feature.accent}`}>
                    {t(feature.ctaKey)}
                  </span>
                  <motion.span
                    className={`flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-br ${feature.accent} text-white shadow-md`}
                    whileHover={{ x: 4, transition: { duration: 0.2 } }}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </motion.span>
                </div>
              </div>

              {/* Shimmer on hover */}
              <motion.div
                className="absolute inset-0 pointer-events-none"
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
              </motion.div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── CAPABILITIES STATS SECTION ─── */}
      <StatsSection />

      {/* ─── CTA BANNER ─── */}
      <section className="py-20 px-4">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="max-w-4xl mx-auto bg-gradient-to-br from-emerald-800 to-emerald-950 rounded-3xl p-12 text-center relative overflow-hidden shadow-2xl"
        >
          {/* Decorative blobs */}
          <div className="absolute -top-12 -right-12 w-56 h-56 bg-amber-400/15 rounded-full blur-3xl" />
          <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-emerald-400/15 rounded-full blur-3xl" />

          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="inline-block mb-4"
          >
            <Sparkles className="w-10 h-10 text-amber-400 mx-auto" />
          </motion.div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4 relative z-10">
            {t("readyToTransform")}
          </h2>
          <p className="text-emerald-300 mb-8 max-w-xl mx-auto relative z-10">
            {t("joinFarmers")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10 bg-emerald-900/30 backdrop-blur-sm rounded-2xl p-6">
            <Link
              to="/detect"
              className="group relative px-8 py-4 bg-amber-500 text-emerald-950 font-bold rounded-xl shadow-[0_0_25px_rgba(245,158,11,0.55)] hover:shadow-[0_0_40px_rgba(245,158,11,0.75)] transition-all overflow-hidden"
            >
              <span className="relative z-10 flex items-center justify-center gap-3">
                <ScanEye className="w-5 h-5" />
                {t("tryBreedDetection")}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
              <motion.div
                className="absolute inset-0 bg-white/25"
                initial={{ x: "-100%" }}
                whileHover={{ x: "100%" }}
                transition={{ duration: 0.5 }}
              />
            </Link>

            <Link
              to="/schemes"
              className="group px-8 py-4 bg-white/10 backdrop-blur-md border border-white/25 text-white font-semibold rounded-xl hover:bg-white/20 transition-all shadow-lg flex items-center justify-center gap-3"
            >
              <HandCoins className="w-5 h-5 text-amber-300 group-hover:rotate-12 transition-transform duration-300" />
              {t("viewGovtSchemes")}
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </motion.div>
      </section>

    </div>
  );
}
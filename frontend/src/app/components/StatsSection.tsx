import { motion } from "motion/react";
import { useState, useEffect } from "react";
import { TrendingUp, CheckCircle2, Activity, Award } from "lucide-react";
import { useLanguage } from "./LanguageContext";

interface Stat {
  label: string;
  value: string | number;
  suffix?: string;
  icon: React.ReactNode;
  color: string;
  subtext?: string;
  trend?: string;
}

interface AnimatedCounterProps {
  target: number;
  duration?: number;
  suffix?: string;
}

function AnimatedCounter({ target, duration = 2.5, suffix = "" }: AnimatedCounterProps) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / (duration * 1000), 1);

      setCount(Math.floor(progress * target));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [target, duration]);

  return (
    <span>
      {count}
      {suffix}
    </span>
  );
}

export default function StatsSection() {
  const [statsData, setStatsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  // Fetch stats from backend
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/stats/overview");
        if (response.ok) {
          const data = await response.json();
          setStatsData(data.data);
        }
      } catch (error) {
        console.warn("Could not fetch stats from backend, using defaults", error);
      } finally {
        setLoading(false);
      }
    };

    // Fetch with a slight delay to ensure component is mounted
    const timer = setTimeout(fetchStats, 100);
    return () => clearTimeout(timer);
  }, []);

  // Use backend data if available, otherwise use fallback values
  const breedData = statsData?.breed_detection || { breed_accuracy: 95, breeds_supported: 5 };
  const healthData = statsData?.health_monitoring || { monitoring_status: t("realTime") };
  const schemesData = statsData?.government_schemes || { total_schemes: 4 };

  const stats: Stat[] = [
    {
      label: t("breedAccuracy"),
      value: "95%+",
      icon: <CheckCircle2 className="w-6 h-6" />,
      color: "from-emerald-500 to-teal-600",
      subtext: t("aiDetectionRate"),
      trend: t("quarterTrend"),
    },
    {
      label: t("breedsSupported"),
      value: <AnimatedCounter target={breedData.breeds_supported || 5} duration={2.5} />,
      icon: <TrendingUp className="w-6 h-6" />,
      color: "from-amber-500 to-orange-600",
      subtext: "European Breeds (Detection Model)",
      trend: t("expandingMonthly"),
    },
    {
      label: t("healthMonitoring"),
      value: healthData.monitoring_status || t("realTime"),
      icon: <Activity className="w-6 h-6" />,
      color: "from-rose-500 to-pink-600",
      subtext: t("continuousAnalysis"),
      trend: t("available247"),
    },
    {
      label: t("schemesListed"),
      value: <AnimatedCounter target={schemesData.total_schemes || 4} duration={2.5} />,
      icon: <Award className="w-6 h-6" />,
      color: "from-sky-500 to-indigo-600",
      subtext: t("govBenefits"),
      trend: t("updatedWeekly"),
    },
  ];

  return (
    <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-stone-50 to-emerald-50 overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-300/10 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-300/10 rounded-full blur-3xl -z-10" />

      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-700 text-sm font-bold tracking-wide uppercase mb-4 border border-emerald-200">
            {t("ourCapabilities")}
          </span>
          <h2 className="text-4xl md:text-5xl font-extrabold text-emerald-950 tracking-tight mb-4">
            {t("powerfulTech")} <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-amber-500">
              {t("modernCattleMgmt")}
            </span>
          </h2>
          <p className="text-lg text-stone-600 max-w-2xl mx-auto">
            {t("trustedByFarmers")}
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 40, scale: 0.92 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{
                duration: 0.6,
                delay: index * 0.12,
                ease: [0.22, 1, 0.36, 1],
              }}
              whileHover={{
                y: -8,
                transition: { duration: 0.3, ease: "easeOut" },
              }}
              className="group relative"
            >
              {/* Card Background with gradient border */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-400 to-amber-400 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 blur-sm -z-10" />

              <div
                className={`relative h-full bg-white rounded-2xl p-8 shadow-lg group-hover:shadow-2xl transition-shadow duration-500 border border-stone-100 overflow-hidden`}
              >
                {/* Animated gradient background on hover */}
                <motion.div
                  className={`absolute inset-0 opacity-0 group-hover:opacity-5 bg-gradient-to-br ${stat.color} -z-5`}
                  whileHover={{ opacity: 0.08 }}
                  transition={{ duration: 0.3 }}
                />

                {/* Icon container */}
                <motion.div
                  whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                  transition={{ duration: 0.5 }}
                  className="mb-6"
                >
                  <div
                    className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${stat.color} text-white flex items-center justify-center shadow-lg`}
                  >
                    {stat.icon}
                  </div>
                </motion.div>

                {/* Label and value container */}
                <div className="mb-4">
                  <p className="text-sm font-semibold text-stone-500 uppercase tracking-wide mb-2">
                    {stat.label}
                  </p>

                  {/* Main value with animation */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + index * 0.12 }}
                    className={`text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r ${stat.color}`}
                  >
                    {stat.value}
                  </motion.div>
                </div>

                {/* Divider */}
                <motion.div
                  className={`h-1 w-12 rounded-full bg-gradient-to-r ${stat.color} mb-4`}
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{
                    delay: 0.5 + index * 0.12,
                    duration: 0.6,
                  }}
                  style={{ originX: 0 }}
                />

                {/* Subtext and trend */}
                <div className="space-y-2">
                  <p className="text-sm text-stone-600">{stat.subtext}</p>
                  {stat.trend && (
                    <motion.p
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{
                        delay: 0.6 + index * 0.12,
                      }}
                      className={`text-xs font-semibold text-transparent bg-clip-text bg-gradient-to-r ${stat.color}`}
                    >
                      {stat.trend}
                    </motion.p>
                  )}
                </div>

                {/* Shimmer effect on hover */}
                <motion.div
                  className="absolute inset-0 pointer-events-none"
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom accent bar */}
        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8, duration: 0.8 }}
          style={{ originX: 0.5 }}
          className="h-1.5 w-24 mx-auto rounded-full bg-gradient-to-r from-emerald-500 via-amber-500 to-emerald-500"
        />
      </div>
    </section>
  );
}

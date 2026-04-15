import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { ChevronRight, Volume2, VolumeX } from "lucide-react";

export default function VideoDemo() {
  const navigate = useNavigate();
  const [isMuted, setIsMuted] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const handleProceed = () => {
    navigate("/detect");
  };

  return (
    <div className="relative min-h-screen bg-black flex items-center justify-center overflow-hidden">
      {/* Animated Background Gradient */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.3 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="absolute inset-0 bg-gradient-to-br from-emerald-500 via-black to-purple-900 blur-3xl"
      />

      {/* Main Container */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={isLoaded ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 w-full max-w-4xl px-4 sm:px-6 lg:px-8"
      >
        {/* Video Container with Animated Border */}
        <div className="relative group">
          {/* Glowing Border Effect */}
          <motion.div
            animate={{
              boxShadow: [
                "0 0 20px rgba(16, 185, 129, 0.5)",
                "0 0 40px rgba(139, 92, 246, 0.5)",
                "0 0 20px rgba(16, 185, 129, 0.5)",
              ],
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 rounded-2xl"
          />

          {/* Video Player */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={isLoaded ? { scale: 1, opacity: 1 } : {}}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative bg-black rounded-2xl overflow-hidden shadow-2xl"
          >
            <video
              controls
              muted={isMuted}
              className="w-full h-auto rounded-2xl"
              src="/demo-video.mp4"
              style={{
                aspectRatio: "16/9",
                display: "block",
              }}
            >
              Your browser does not support the video tag.
            </video>

            {/* Mute Toggle Button */}
            <motion.button
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsMuted(!isMuted)}
              className="absolute top-4 right-4 z-20 bg-emerald-500 hover:bg-emerald-600 text-white p-2.5 rounded-full shadow-lg transition-colors"
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? (
                <VolumeX className="w-5 h-5" />
              ) : (
                <Volume2 className="w-5 h-5" />
              )}
            </motion.button>
          </motion.div>
        </div>

        {/* Text Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isLoaded ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-8 text-center"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Watch Our Platform in Action
          </h2>
          <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
            Experience the power of AI-driven cattle breed detection, smart tag
            searching, health analysis, and access to government schemes - all
            in one intelligent platform.
          </p>
        </motion.div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isLoaded ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-8 flex justify-center"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleProceed}
            className="group relative inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-emerald-500/50 transition-shadow"
          >
            <span>Explore Features</span>
            <motion.div
              animate={{ x: [0, 4, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <ChevronRight className="w-5 h-5" />
            </motion.div>
          </motion.button>
        </motion.div>

        {/* Info Cards */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isLoaded ? { opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4"
        >
          {[
            { label: "AI-Powered", value: "99% Accurate" },
            { label: "Instant Results", value: "< 2 seconds" },
            { label: "Secure & Safe", value: "Privacy First" },
          ].map((item, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -4 }}
              className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-4 text-center hover:border-emerald-500/50 transition-colors"
            >
              <p className="text-sm text-gray-400">{item.label}</p>
              <p className="text-lg font-semibold text-emerald-400">
                {item.value}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* Floating Particles Effect */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          initial={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            opacity: 0,
          }}
          animate={{
            y: [0, -100, -200],
            opacity: [0, 0.5, 0],
          }}
          transition={{
            duration: 3 + i,
            repeat: Infinity,
            delay: i * 0.5,
          }}
          className="absolute w-1 h-1 bg-emerald-400 rounded-full blur-sm"
        />
      ))}
    </div>
  );
}

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Brain, BarChart3, Zap, Shield } from "lucide-react";
import { motion } from "framer-motion";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";

export default function Landing() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const authenticated = await base44.auth.isAuthenticated();
        setIsAuthenticated(authenticated);
      } catch (error) {
        setIsAuthenticated(false);
      }
    };
    checkAuth();
  }, []);

  const handleStartLearning = () => {
    if (isAuthenticated) {
      navigate(createPageUrl("Dashboard"));
    } else {
      base44.auth.redirectToLogin(window.location.origin + createPageUrl("Dashboard"));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 relative overflow-hidden">
      {/* Animated Background Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute -top-24 -left-24 w-96 h-96 bg-purple-300 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute top-1/3 -right-32 w-[32rem] h-[32rem] bg-blue-300 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{ duration: 12, repeat: Infinity }}
          className="absolute -bottom-32 left-1/4 w-[28rem] h-[28rem] bg-pink-300 rounded-full blur-3xl"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          {/* Logo */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="mb-8 flex justify-center"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 rounded-3xl blur-xl opacity-60 animate-pulse" />
              <div className="relative bg-white/90 backdrop-blur-sm p-8 rounded-3xl shadow-2xl border border-white/50">
                <Brain className="w-24 h-24 text-transparent bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500 bg-clip-text" style={{ filter: 'drop-shadow(0 0 20px rgba(168, 85, 247, 0.4))' }} />
              </div>
            </div>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-6xl md:text-8xl font-bold mb-6 text-transparent bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text"
          >
            ML4YOU
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="text-xl md:text-2xl text-gray-700 mb-4 font-light"
          >
            Interactive Machine Learning for Everyone
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto mb-12"
          >
            Train models, visualize results, and explore machine learning with stunning real-time analytics
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1, duration: 0.6 }}
            className="flex flex-col gap-4"
          >
            <Button
              onClick={handleStartLearning}
              size="lg"
              className="group relative px-12 py-7 text-lg font-semibold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 hover:from-purple-700 hover:via-pink-700 hover:to-blue-700 text-white rounded-2xl shadow-2xl hover:shadow-purple-500/50 transition-all duration-300"
            >
              <span className="flex items-center gap-3">
                {isAuthenticated ? "Go to Dashboard" : "Start Learning"}
                <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform duration-300" />
              </span>
            </Button>

            <Button
              onClick={() => navigate(createPageUrl("AdminLogin"))}
              variant="outline"
              size="lg"
              className="px-8 py-6 text-base font-semibold bg-white/80 hover:bg-white border-2 border-purple-300 hover:border-purple-500 rounded-2xl shadow-lg transition-all duration-300"
            >
              <Shield className="w-5 h-5 mr-2 text-purple-600" />
              Login as Admin
            </Button>
          </motion.div>
        </motion.div>

        {/* Feature Cards */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full"
        >
          {[
            { icon: Sparkles, title: "10+ Datasets", desc: "Curated datasets ready to explore" },
            { icon: BarChart3, title: "Real-time Training", desc: "Watch your models learn live" },
            { icon: Zap, title: "Instant Results", desc: "Beautiful metrics & visualizations" },
          ].map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.4 + idx * 0.2, duration: 0.6 }}
              className="bg-white/60 backdrop-blur-md p-6 rounded-2xl border border-white/50 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
            >
              <feature.icon className="w-12 h-12 mb-4 text-purple-600" />
              <h3 className="text-xl font-semibold mb-2 text-gray-800">{feature.title}</h3>
              <p className="text-gray-600">{feature.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
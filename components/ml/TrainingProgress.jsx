import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Loader2, CheckCircle2, Zap, Database, Brain, BarChart3, Activity, TrendingUp } from "lucide-react";

const TRAINING_STEPS = [
  { icon: Database, label: "Loading Dataset", threshold: 15, detail: "Reading and preprocessing data..." },
  { icon: Activity, label: "Data Validation", threshold: 25, detail: "Checking data quality..." },
  { icon: Brain, label: "Initializing Model", threshold: 35, detail: "Setting up neural architecture..." },
  { icon: TrendingUp, label: "Training Epochs", threshold: 85, detail: "Optimizing model parameters..." },
  { icon: BarChart3, label: "Generating Metrics", threshold: 95, detail: "Computing performance indicators..." },
  { icon: CheckCircle2, label: "Complete", threshold: 100, detail: "Model ready for deployment!" },
];

export default function TrainingProgress({ progress, dataset, model }) {
  const [currentEpoch, setCurrentEpoch] = useState(0);
  const [currentLoss, setCurrentLoss] = useState(null);
  const [currentAccuracy, setCurrentAccuracy] = useState(null);
  
  const currentStep = TRAINING_STEPS.findIndex(step => progress < step.threshold);
  const activeStepIndex = currentStep === -1 ? TRAINING_STEPS.length - 1 : Math.max(0, currentStep);

  useEffect(() => {
    if (progress >= 35 && progress < 85) {
      const epoch = Math.floor(((progress - 35) / 50) * 20);
      setCurrentEpoch(epoch);
      setCurrentLoss((0.5 - (epoch / 20) * 0.45).toFixed(4));
      setCurrentAccuracy((0.7 + (epoch / 20) * 0.28).toFixed(4));
    }
  }, [progress]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-4xl mx-auto"
    >
      <Card className="bg-white/90 backdrop-blur-md border-white/50 shadow-2xl">
        <CardContent className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="text-5xl mb-4">{dataset.icon}</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Training {model}</h2>
            <p className="text-gray-600">on {dataset.name} • {dataset.samples} samples</p>
          </div>

          {/* Real-time Metrics */}
          {progress >= 35 && progress < 95 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-3 gap-4 mb-6"
            >
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl text-center">
                <p className="text-xs text-blue-600 font-medium mb-1">Current Epoch</p>
                <p className="text-2xl font-bold text-blue-700">{currentEpoch}/20</p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl text-center">
                <p className="text-xs text-purple-600 font-medium mb-1">Training Loss</p>
                <p className="text-2xl font-bold text-purple-700">{currentLoss}</p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl text-center">
                <p className="text-xs text-green-600 font-medium mb-1">Accuracy</p>
                <p className="text-2xl font-bold text-green-700">{(currentAccuracy * 100).toFixed(1)}%</p>
              </div>
            </motion.div>
          )}

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-3">
              <div>
                <span className="text-sm font-semibold text-gray-700">
                  {TRAINING_STEPS[activeStepIndex].label}
                </span>
                <p className="text-xs text-gray-500 mt-1">
                  {TRAINING_STEPS[activeStepIndex].detail}
                </p>
              </div>
              <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-1">
                {Math.round(progress)}%
              </Badge>
            </div>
            <Progress value={progress} className="h-4" />
          </div>

          {/* Training Steps */}
          <div className="space-y-3">
            {TRAINING_STEPS.map((step, index) => {
              const StepIcon = step.icon;
              const isCompleted = progress >= step.threshold;
              const isActive = index === activeStepIndex;

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex items-center gap-4 p-4 rounded-xl transition-all duration-300 ${
                    isActive
                      ? "bg-gradient-to-r from-purple-100 via-pink-100 to-blue-100 shadow-md scale-105"
                      : isCompleted
                      ? "bg-green-50"
                      : "bg-gray-50"
                  }`}
                >
                  <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center shadow-md ${
                    isCompleted
                      ? "bg-gradient-to-br from-green-500 to-emerald-500 text-white"
                      : isActive
                      ? "bg-gradient-to-br from-purple-500 to-pink-500 text-white"
                      : "bg-gray-300 text-gray-600"
                  }`}>
                    {isActive && !isCompleted ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                      <StepIcon className="w-6 h-6" />
                    )}
                  </div>
                  <div className="flex-1">
                    <span className={`font-semibold text-sm ${
                      isCompleted ? "text-green-700" : isActive ? "text-purple-700" : "text-gray-600"
                    }`}>
                      {step.label}
                    </span>
                    {isActive && (
                      <p className="text-xs text-gray-600 mt-1">{step.detail}</p>
                    )}
                  </div>
                  {isCompleted && (
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  )}
                </motion.div>
              );
            })}
          </div>

          {progress === 100 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-6 p-6 bg-gradient-to-r from-green-100 via-emerald-100 to-teal-100 rounded-xl text-center border-2 border-green-300"
            >
              <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-3" />
              <p className="text-xl font-bold text-green-800 mb-1">
                🎉 Training Completed Successfully!
              </p>
              <p className="text-sm text-green-700">
                Analyzing results and preparing visualizations...
              </p>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
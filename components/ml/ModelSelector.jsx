import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { motion } from "framer-motion";

const LEARNING_TYPES = {
  "Supervised": {
    models: ["Linear Regression", "Logistic Regression", "Decision Tree", "Random Forest"],
    description: "Learn from labeled data",
    icon: "🎯"
  },
  "Unsupervised": {
    models: ["KMeans", "PCA", "Hierarchical Clustering"],
    description: "Find patterns in unlabeled data",
    icon: "🔍"
  },
  "Semi-Supervised": {
    models: ["Label Propagation", "Label Spreading"],
    description: "Combine labeled & unlabeled data",
    icon: "⚖️"
  },
  "Ensemble": {
    models: ["Bagging", "Boosting", "Stacking"],
    description: "Combine multiple models",
    icon: "🎪"
  },
  "Reinforcement": {
    models: ["Q-Learning", "Deep Q-Network"],
    description: "Learn through interaction",
    icon: "🎮"
  }
};

const VISUALIZATIONS = [
  { id: "accuracy", label: "Training & Validation Accuracy", description: "Line chart showing model accuracy over epochs" },
  { id: "loss", label: "Training & Validation Loss", description: "Line chart showing loss over epochs" },
  { id: "confusion", label: "Confusion Matrix", description: "Heatmap of prediction accuracy" },
  { id: "metrics", label: "Key Metrics Cards", description: "Accuracy, precision, recall, F1 score" },
  { id: "roc", label: "ROC Curve", description: "Receiver Operating Characteristic curve" },
  { id: "feature", label: "Feature Importance", description: "Bar chart of feature weights" },
];

export default function ModelSelector({ 
  selectedLearningType, 
  selectedModel, 
  onSelectLearningType, 
  onSelectModel,
  selectedVisualizations,
  onSelectVisualizations
}) {
  const [localVisualizations, setLocalVisualizations] = useState(selectedVisualizations || ["accuracy", "loss", "confusion", "metrics"]);

  const handleVisualizationToggle = (vizId) => {
    const updated = localVisualizations.includes(vizId)
      ? localVisualizations.filter(id => id !== vizId)
      : [...localVisualizations, vizId];
    setLocalVisualizations(updated);
    onSelectVisualizations?.(updated);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="bg-white/80 backdrop-blur-sm border-white/50 shadow-xl">
        <CardContent className="p-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Learning Type Selection */}
            <div>
              <Label className="text-lg font-semibold mb-3 block text-gray-800">
                Learning Type
              </Label>
              <Select value={selectedLearningType} onValueChange={onSelectLearningType}>
                <SelectTrigger className="h-12 text-base">
                  <SelectValue placeholder="Choose learning type..." />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(LEARNING_TYPES).map(([type, info]) => (
                    <SelectItem key={type} value={type}>
                      <div className="flex items-center gap-2">
                        <span>{info.icon}</span>
                        <div>
                          <div className="font-medium">{type}</div>
                          <div className="text-xs text-gray-500">{info.description}</div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Model Selection */}
            <div>
              <Label className="text-lg font-semibold mb-3 block text-gray-800">
                Model Algorithm
              </Label>
              <Select 
                value={selectedModel} 
                onValueChange={onSelectModel}
                disabled={!selectedLearningType}
              >
                <SelectTrigger className="h-12 text-base">
                  <SelectValue placeholder="Choose model algorithm..." />
                </SelectTrigger>
                <SelectContent>
                  {selectedLearningType && LEARNING_TYPES[selectedLearningType].models.map((model) => (
                    <SelectItem key={model} value={model}>
                      {model}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Visualization Selection */}
          {selectedModel && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mt-6"
            >
              <Label className="text-lg font-semibold mb-3 block text-gray-800">
                Select Visualizations
              </Label>
              <div className="grid md:grid-cols-2 gap-3">
                {VISUALIZATIONS.map((viz) => (
                  <div
                    key={viz.id}
                    className="flex items-start space-x-3 p-3 rounded-lg border border-gray-200 hover:bg-purple-50 transition-colors cursor-pointer"
                    onClick={() => handleVisualizationToggle(viz.id)}
                  >
                    <Checkbox
                      id={viz.id}
                      checked={localVisualizations.includes(viz.id)}
                      onCheckedChange={() => handleVisualizationToggle(viz.id)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <label
                        htmlFor={viz.id}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {viz.label}
                      </label>
                      <p className="text-xs text-gray-500 mt-1">{viz.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {selectedLearningType && selectedModel && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mt-6 p-4 bg-gradient-to-r from-purple-100 via-pink-100 to-blue-100 rounded-xl"
            >
              <p className="text-sm text-gray-700">
                <span className="font-semibold">Selected Configuration:</span> {selectedModel} ({selectedLearningType}) • {localVisualizations.length} visualizations
              </p>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
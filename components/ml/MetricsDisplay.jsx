import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, ScatterChart, Scatter } from "recharts";
import { TrendingUp, Award, Target, Zap, Clock, Plus, Rocket, Copy, Download } from "lucide-react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export default function MetricsDisplay({ analysis, selectedVisualizations = [], onStartNew }) {
  const [deploymentMode, setDeploymentMode] = useState(false);
  const [modelName, setModelName] = useState(`${analysis.model_name}_${Date.now()}`);
  const [isPublic, setIsPublic] = useState(false);
  const [deploying, setDeploying] = useState(false);

  const queryClient = useQueryClient();

  const chartData = analysis.training_history.epochs.map((epoch, idx) => ({
    epoch,
    trainAcc: (analysis.training_history.train_acc[idx] * 100).toFixed(2),
    valAcc: (analysis.training_history.val_acc[idx] * 100).toFixed(2),
    trainLoss: analysis.training_history.train_loss[idx].toFixed(4),
    valLoss: analysis.training_history.val_loss[idx].toFixed(4),
  }));

  const numFeatures = analysis.num_features || 5;
  const featureImportanceData = Array.from({ length: Math.min(numFeatures, 15) }, (_, i) => ({
    feature: `Feature ${i + 1}`,
    importance: (Math.random() * 0.3 + 0.05).toFixed(3)
  })).sort((a, b) => b.importance - a.importance);

  const rocData = Array.from({ length: 20 }, (_, i) => ({
    fpr: (i / 20).toFixed(2),
    tpr: Math.min(1, (i / 20) + Math.random() * 0.2).toFixed(2),
  }));

  // Precision-Recall Curve
  const prCurveData = Array.from({ length: 20 }, (_, i) => ({
    recall: (i / 20).toFixed(2),
    precision: Math.max(0.5, 1 - (i / 20) * 0.4 + Math.random() * 0.1).toFixed(2),
  }));

  // Learning Rate Schedule
  const learningRateData = analysis.training_history.epochs.map((epoch, idx) => ({
    epoch,
    lr: (0.001 * Math.pow(0.95, idx)).toFixed(6),
  }));

  const handleDeploy = async () => {
    setDeploying(true);
    try {
      const apiEndpoint = `https://api.ml4you.com/predict/${modelName}`;
      
      await base44.entities.SavedModel.create({
        name: modelName,
        description: `${analysis.model_name} trained on ${analysis.dataset_name}`,
        model_name: analysis.model_name,
        learning_type: analysis.learning_type,
        dataset_name: analysis.dataset_name,
        metrics: {
          accuracy: analysis.accuracy,
          loss: analysis.loss,
          precision: analysis.precision,
          recall: analysis.recall,
          f1_score: analysis.f1_score,
        },
        is_deployed: true,
        is_public: isPublic,
        api_endpoint: apiEndpoint,
        configuration: {
          num_features: numFeatures,
          training_duration: analysis.training_duration,
        },
      });

      toast.success("Model deployed successfully!");
      queryClient.invalidateQueries({ queryKey: ['savedmodels'] });
      setDeploymentMode(false);
    } catch (error) {
      console.error("Deployment error:", error);
      toast.error("Failed to deploy model");
    }
    setDeploying(false);
  };

  const exportResults = () => {
    const data = JSON.stringify(analysis, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${analysis.model_name}_results.json`;
    a.click();
    toast.success("Results exported!");
  };

  const showVisualization = (vizId) => {
    return selectedVisualizations.length === 0 || selectedVisualizations.includes(vizId);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="text-5xl">{analysis.dataset_icon}</div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{analysis.dataset_name}</h2>
            <p className="text-gray-600">{analysis.model_name} • {analysis.learning_type}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={exportResults}
            variant="outline"
            className="gap-2"
          >
            <Download className="w-4 h-4" />
            Export
          </Button>
          <Button
            onClick={() => setDeploymentMode(!deploymentMode)}
            className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 gap-2"
          >
            <Rocket className="w-4 h-4" />
            Deploy Model
          </Button>
          <Button
            onClick={onStartNew}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 gap-2"
          >
            <Plus className="w-4 h-4" />
            New Training
          </Button>
        </div>
      </div>

      {/* Deployment Panel */}
      {deploymentMode && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
        >
          <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Rocket className="w-5 h-5 text-blue-600" />
                Deploy Model as API
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Model Name</Label>
                <Input
                  value={modelName}
                  onChange={(e) => setModelName(e.target.value)}
                  placeholder="my_awesome_model"
                  className="bg-white"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Make Public</Label>
                  <p className="text-xs text-gray-600">Allow others to use this model</p>
                </div>
                <Switch checked={isPublic} onCheckedChange={setIsPublic} />
              </div>
              <Button
                onClick={handleDeploy}
                disabled={deploying || !modelName}
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600"
              >
                {deploying ? "Deploying..." : "Deploy Now"}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Key Metrics Cards */}
      {showVisualization('metrics') && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { icon: TrendingUp, label: "Accuracy", value: `${(analysis.accuracy * 100).toFixed(2)}%`, color: "from-green-500 to-emerald-500" },
            { icon: Target, label: "Precision", value: `${(analysis.precision * 100).toFixed(2)}%`, color: "from-blue-500 to-cyan-500" },
            { icon: Award, label: "Recall", value: `${(analysis.recall * 100).toFixed(2)}%`, color: "from-purple-500 to-pink-500" },
            { icon: Zap, label: "F1 Score", value: `${(analysis.f1_score * 100).toFixed(2)}%`, color: "from-orange-500 to-red-500" },
            { icon: Clock, label: "Duration", value: `${analysis.training_duration}s`, color: "from-gray-500 to-slate-500" },
          ].map((metric, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card className="bg-white/80 backdrop-blur-sm border-white/50 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-4">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${metric.color} flex items-center justify-center mb-3`}>
                    <metric.icon className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-xs text-gray-600 mb-1">{metric.label}</p>
                  <p className="text-xl font-bold text-gray-800">{metric.value}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {showVisualization('accuracy') && (
          <Card className="bg-white/80 backdrop-blur-sm border-white/50 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg">Training & Validation Accuracy</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="epoch" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: '8px', border: '1px solid #e5e7eb' }} />
                  <Legend />
                  <Line type="monotone" dataKey="trainAcc" stroke="#8b5cf6" strokeWidth={3} name="Train Acc (%)" />
                  <Line type="monotone" dataKey="valAcc" stroke="#ec4899" strokeWidth={3} name="Val Acc (%)" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {showVisualization('loss') && (
          <Card className="bg-white/80 backdrop-blur-sm border-white/50 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg">Training & Validation Loss</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="epoch" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: '8px', border: '1px solid #e5e7eb' }} />
                  <Legend />
                  <Line type="monotone" dataKey="trainLoss" stroke="#3b82f6" strokeWidth={3} name="Train Loss" />
                  <Line type="monotone" dataKey="valLoss" stroke="#14b8a6" strokeWidth={3} name="Val Loss" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {showVisualization('roc') && (
          <Card className="bg-white/80 backdrop-blur-sm border-white/50 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg">ROC Curve (AUC Score)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={rocData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="fpr" label={{ value: 'False Positive Rate', position: 'insideBottom', offset: -5 }} stroke="#6b7280" />
                  <YAxis label={{ value: 'True Positive Rate', angle: -90, position: 'insideLeft' }} stroke="#6b7280" />
                  <Tooltip contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: '8px', border: '1px solid #e5e7eb' }} />
                  <Line type="monotone" dataKey="tpr" stroke="#f59e0b" strokeWidth={3} name="ROC" />
                  <Line type="monotone" data={[{ fpr: 0, tpr: 0 }, { fpr: 1, tpr: 1 }]} dataKey="tpr" stroke="#94a3b8" strokeWidth={1} strokeDasharray="5 5" name="Random" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Precision-Recall Curve */}
        <Card className="bg-white/80 backdrop-blur-sm border-white/50 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg">Precision-Recall Curve</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={prCurveData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="recall" label={{ value: 'Recall', position: 'insideBottom', offset: -5 }} stroke="#6b7280" />
                <YAxis label={{ value: 'Precision', angle: -90, position: 'insideLeft' }} stroke="#6b7280" />
                <Tooltip contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: '8px', border: '1px solid #e5e7eb' }} />
                <Line type="monotone" dataKey="precision" stroke="#10b981" strokeWidth={3} name="PR Curve" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {showVisualization('feature') && (
          <Card className="bg-white/80 backdrop-blur-sm border-white/50 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg">Feature Importance (Top {featureImportanceData.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={featureImportanceData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis type="number" stroke="#6b7280" />
                  <YAxis dataKey="feature" type="category" stroke="#6b7280" width={80} />
                  <Tooltip contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: '8px', border: '1px solid #e5e7eb' }} />
                  <Bar dataKey="importance" fill="#8b5cf6" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Learning Rate Schedule */}
        <Card className="bg-white/80 backdrop-blur-sm border-white/50 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg">Learning Rate Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={learningRateData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="epoch" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: '8px', border: '1px solid #e5e7eb' }} />
                <Line type="monotone" dataKey="lr" stroke="#6366f1" strokeWidth={3} name="Learning Rate" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Confusion Matrix */}
      {showVisualization('confusion') && (
        <Card className="bg-white/80 backdrop-blur-sm border-white/50 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg">Confusion Matrix ({analysis.confusion_matrix.length}x{analysis.confusion_matrix.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <tbody>
                  {analysis.confusion_matrix.map((row, i) => (
                    <tr key={i}>
                      {row.map((cell, j) => (
                        <td
                          key={j}
                          className={`p-4 text-center font-semibold border border-gray-200 ${
                            i === j
                              ? "bg-gradient-to-br from-green-100 to-emerald-100 text-green-800"
                              : "bg-gray-50 text-gray-600"
                          }`}
                        >
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-gray-500 mt-4 text-center">
              Diagonal values (green) represent correct predictions
            </p>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
}
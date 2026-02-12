import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Rocket, Share2, Download, Trash2, Globe, Lock } from "lucide-react";
import { motion } from "framer-motion";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

export default function ModelCard({ model, index }) {
  const queryClient = useQueryClient();

  const toggleDeployMutation = useMutation({
    mutationFn: (data) => base44.entities.SavedModel.update(model.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-models'] });
      queryClient.invalidateQueries({ queryKey: ['deployed-models'] });
      toast.success(model.is_deployed ? "Model undeployed" : "Model deployed successfully!");
    },
  });

  const togglePublicMutation = useMutation({
    mutationFn: (data) => base44.entities.SavedModel.update(model.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-models'] });
      toast.success(model.is_public ? "Model is now private" : "Model is now public!");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => base44.entities.SavedModel.delete(model.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-models'] });
      toast.success("Model deleted");
    },
  });

  const handleDeploy = () => {
    const endpoint = `https://api.ml4you.app/predict/${model.id}`;
    toggleDeployMutation.mutate({
      is_deployed: !model.is_deployed,
      api_endpoint: model.is_deployed ? null : endpoint
    });
  };

  const handleExport = () => {
    const config = {
      name: model.name,
      model_name: model.model_name,
      learning_type: model.learning_type,
      configuration: model.configuration,
      metrics: model.metrics
    };
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${model.name.replace(/\s+/g, '_')}_config.json`;
    a.click();
    toast.success("Model configuration exported!");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card className="bg-white hover:shadow-lg transition-all duration-300">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <CardTitle className="text-lg">{model.name}</CardTitle>
              <p className="text-sm text-gray-500 mt-1">{model.description}</p>
            </div>
            {model.is_public ? (
              <Globe className="w-4 h-4 text-green-600" />
            ) : (
              <Lock className="w-4 h-4 text-gray-400" />
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">{model.model_name}</Badge>
            <Badge variant="outline">{model.learning_type}</Badge>
            {model.is_deployed && (
              <Badge className="bg-green-600">Deployed</Badge>
            )}
          </div>

          {model.metrics && (
            <div className="grid grid-cols-2 gap-2 text-xs">
              {model.metrics.accuracy && (
                <div className="p-2 bg-gray-50 rounded">
                  <p className="text-gray-500">Accuracy</p>
                  <p className="font-semibold">{(model.metrics.accuracy * 100).toFixed(2)}%</p>
                </div>
              )}
              {model.metrics.f1_score && (
                <div className="p-2 bg-gray-50 rounded">
                  <p className="text-gray-500">F1 Score</p>
                  <p className="font-semibold">{model.metrics.f1_score.toFixed(4)}</p>
                </div>
              )}
            </div>
          )}

          {model.is_deployed && model.api_endpoint && (
            <div className="p-2 bg-blue-50 rounded text-xs">
              <p className="text-gray-600 mb-1">API Endpoint:</p>
              <code className="text-blue-600 break-all">{model.api_endpoint}</code>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              size="sm"
              variant={model.is_deployed ? "destructive" : "default"}
              onClick={handleDeploy}
              className="flex-1"
              disabled={toggleDeployMutation.isPending}
            >
              <Rocket className="w-3 h-3 mr-1" />
              {model.is_deployed ? "Undeploy" : "Deploy"}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => togglePublicMutation.mutate({ is_public: !model.is_public })}
              disabled={togglePublicMutation.isPending}
            >
              <Share2 className="w-3 h-3" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleExport}
            >
              <Download className="w-3 h-3" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => deleteMutation.mutate()}
              disabled={deleteMutation.isPending}
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
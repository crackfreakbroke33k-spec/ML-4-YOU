import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, Share2, Trash2, Globe, Lock, FileText } from "lucide-react";
import { motion } from "framer-motion";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

export default function DatasetCard({ dataset, index }) {
  const queryClient = useQueryClient();

  const togglePublicMutation = useMutation({
    mutationFn: (data) => base44.entities.Dataset.update(dataset.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['datasets'] });
      toast.success(dataset.is_public ? "Dataset is now private" : "Dataset is now public!");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => base44.entities.Dataset.delete(dataset.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['datasets'] });
      toast.success("Dataset deleted");
    },
  });

  const formatFileSize = (bytes) => {
    if (!bytes) return "N/A";
    const mb = bytes / (1024 * 1024);
    return mb < 1 ? `${(bytes / 1024).toFixed(1)} KB` : `${mb.toFixed(1)} MB`;
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
            <div className="flex items-center gap-3 flex-1">
              <div className="text-3xl">{dataset.icon || "📊"}</div>
              <div>
                <CardTitle className="text-lg">{dataset.name}</CardTitle>
                <p className="text-sm text-gray-500 mt-1">{dataset.description}</p>
              </div>
            </div>
            {dataset.is_public ? (
              <Globe className="w-4 h-4 text-green-600" />
            ) : (
              <Lock className="w-4 h-4 text-gray-400" />
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">{dataset.category}</Badge>
            <Badge variant="outline">{dataset.format || "CSV"}</Badge>
            <Badge variant="outline">v{dataset.version || "1.0"}</Badge>
          </div>

          {dataset.tags && dataset.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {dataset.tags.map((tag, i) => (
                <Badge key={i} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 bg-gray-50 rounded">
              <p className="text-gray-500">Samples</p>
              <p className="font-semibold">{dataset.samples_count?.toLocaleString() || "N/A"}</p>
            </div>
            <div className="p-2 bg-gray-50 rounded">
              <p className="text-gray-500">Features</p>
              <p className="font-semibold">{dataset.features_count || "N/A"}</p>
            </div>
            <div className="p-2 bg-gray-50 rounded">
              <p className="text-gray-500">Size</p>
              <p className="font-semibold">{formatFileSize(dataset.file_size)}</p>
            </div>
            <div className="p-2 bg-gray-50 rounded">
              <p className="text-gray-500">Created</p>
              <p className="font-semibold">{new Date(dataset.created_date).toLocaleDateString()}</p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              size="sm"
              variant="default"
              className="flex-1"
              onClick={() => window.open(dataset.file_url, '_blank')}
            >
              <Download className="w-3 h-3 mr-1" />
              Download
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => togglePublicMutation.mutate({ is_public: !dataset.is_public })}
              disabled={togglePublicMutation.isPending}
            >
              <Share2 className="w-3 h-3" />
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
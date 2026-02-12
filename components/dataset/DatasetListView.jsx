import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, Share2, Trash2, Globe, Lock } from "lucide-react";
import { motion } from "framer-motion";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

export default function DatasetListView({ datasets }) {
  const queryClient = useQueryClient();

  const togglePublicMutation = useMutation({
    mutationFn: ({ id, is_public }) => base44.entities.Dataset.update(id, { is_public }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['datasets'] });
      toast.success("Dataset visibility updated!");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Dataset.delete(id),
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
    <div className="space-y-2">
      {datasets.map((dataset, index) => (
        <motion.div
          key={dataset.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.03 }}
        >
          <Card className="p-4 hover:shadow-md transition-all duration-300">
            <div className="flex items-center gap-4">
              <div className="text-3xl">{dataset.icon || "📊"}</div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-gray-900 truncate">{dataset.name}</h3>
                  {dataset.is_public ? (
                    <Globe className="w-4 h-4 text-green-600 flex-shrink-0" />
                  ) : (
                    <Lock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  )}
                </div>
                <p className="text-sm text-gray-500 truncate">{dataset.description}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Badge variant="outline" className="text-xs">{dataset.category}</Badge>
                  <Badge variant="outline" className="text-xs">{dataset.format || "CSV"}</Badge>
                  <span className="text-xs text-gray-500">
                    {dataset.samples_count?.toLocaleString() || "N/A"} samples
                  </span>
                  <span className="text-xs text-gray-500">•</span>
                  <span className="text-xs text-gray-500">
                    {formatFileSize(dataset.file_size)}
                  </span>
                </div>
              </div>

              <div className="flex gap-2 flex-shrink-0">
                <Button
                  size="sm"
                  variant="default"
                  onClick={() => window.open(dataset.file_url, '_blank')}
                >
                  <Download className="w-3 h-3 mr-1" />
                  Download
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => togglePublicMutation.mutate({ id: dataset.id, is_public: !dataset.is_public })}
                  disabled={togglePublicMutation.isPending}
                >
                  <Share2 className="w-3 h-3" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => deleteMutation.mutate(dataset.id)}
                  disabled={deleteMutation.isPending}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
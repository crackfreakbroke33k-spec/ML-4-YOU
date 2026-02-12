import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Shield, Trash2, TrendingUp, Clock, RefreshCw, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function TrainingLogs({ isSuperAdmin }) {
  const queryClient = useQueryClient();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [analysisToDelete, setAnalysisToDelete] = useState(null);

  const { data: analyses, refetch, isLoading } = useQuery({
    queryKey: ['all-training-logs'],
    queryFn: async () => {
      try {
        const allAnalyses = await base44.entities.MLAnalysis.list('-created_date', 1000);
        console.log('Admin View - All Training Logs:', allAnalyses.length);
        return allAnalyses || [];
      } catch (error) {
        console.error('Error fetching training logs:', error);
        return [];
      }
    },
    initialData: [],
    refetchInterval: 1000, // Real-time every 1 second
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });

  const deleteAnalysisMutation = useMutation({
    mutationFn: (id) => base44.entities.MLAnalysis.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-training-logs'] });
      refetch();
      toast.success("Training log deleted successfully!");
    },
    onError: (error) => {
      console.error('Delete error:', error);
      toast.error("Failed to delete training log: " + error.message);
    },
  });

  const createActivityLogMutation = useMutation({
    mutationFn: (logData) => base44.entities.ActivityLog.create(logData),
  });

  const handleDelete = (analysis) => {
    setAnalysisToDelete(analysis);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!analysisToDelete) return;

    await deleteAnalysisMutation.mutateAsync(analysisToDelete.id);
    await createActivityLogMutation.mutateAsync({
      user_email: analysisToDelete.created_by,
      action_type: 'analysis_delete',
      details: `Admin deleted training: ${analysisToDelete.model_name} on ${analysisToDelete.dataset_name}`,
      metadata: {
        dataset: analysisToDelete.dataset_name,
        model: analysisToDelete.model_name,
        accuracy: analysisToDelete.accuracy,
      }
    });

    setDeleteDialogOpen(false);
    setAnalysisToDelete(null);
  };

  return (
    <>
      <Card className="bg-white/70 backdrop-blur-sm border-white/50 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-purple-600" />
            Training Logs
            <Badge variant="outline" className="ml-auto">
              Real-time • {analyses.length} Trainings
            </Badge>
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={() => refetch()}
              disabled={isLoading}
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {isLoading && analyses.length === 0 ? (
              <div className="text-center py-8">
                <Loader2 className="w-12 h-12 mx-auto mb-3 text-purple-600 animate-spin" />
                <p className="text-gray-500">Loading training logs...</p>
              </div>
            ) : analyses.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Shield className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p>No training logs yet</p>
              </div>
            ) : (
              analyses.map((analysis, index) => (
                <motion.div
                  key={analysis.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="flex items-start gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:shadow-md transition-all duration-300"
                >
                  <div className="text-3xl flex-shrink-0">{analysis.dataset_icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-gray-800 truncate">{analysis.dataset_name}</h3>
                        <p className="text-sm text-gray-600 truncate">{analysis.model_name}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(analysis)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 flex-shrink-0"
                        disabled={deleteAnalysisMutation.isPending}
                      >
                        {deleteAnalysisMutation.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <Badge variant="outline">{analysis.learning_type}</Badge>
                      <div className="flex items-center gap-1 text-sm text-green-600">
                        <TrendingUp className="w-3 h-3" />
                        {(analysis.accuracy * 100).toFixed(2)}%
                      </div>
                      <span className="text-xs text-gray-500">•</span>
                      <span className="text-xs text-gray-500">Loss: {analysis.loss?.toFixed(4)}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span className="truncate">User: {analysis.created_by}</span>
                      <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                        <Clock className="w-3 h-3" />
                        {format(new Date(analysis.created_date), "MMM d, yyyy • HH:mm")}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the training log for{" "}
              <span className="font-semibold">{analysisToDelete?.model_name}</span> on{" "}
              <span className="font-semibold">{analysisToDelete?.dataset_name}</span>.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
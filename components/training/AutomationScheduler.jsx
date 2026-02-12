import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Clock, Play, Pause, Trash2, Plus } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function AutomationScheduler() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    dataset_id: "",
    model_name: "",
    learning_type: "Supervised",
    schedule: "once",
    auto_deploy: false
  });

  const { data: jobs } = useQuery({
    queryKey: ['training-jobs'],
    queryFn: () => base44.entities.TrainingJob.list('-created_date', 100),
    initialData: [],
  });

  const { data: datasets } = useQuery({
    queryKey: ['datasets-for-jobs'],
    queryFn: () => base44.entities.Dataset.list('-created_date', 100),
    initialData: [],
  });

  const createJobMutation = useMutation({
    mutationFn: (data) => base44.entities.TrainingJob.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['training-jobs'] });
      toast.success("Training job scheduled!");
      setShowForm(false);
      setFormData({
        name: "",
        dataset_id: "",
        model_name: "",
        learning_type: "Supervised",
        schedule: "once",
        auto_deploy: false
      });
    },
  });

  const deleteJobMutation = useMutation({
    mutationFn: (id) => base44.entities.TrainingJob.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['training-jobs'] });
      toast.success("Job deleted");
    },
  });

  const statusColors = {
    pending: "bg-gray-500",
    running: "bg-blue-500",
    completed: "bg-green-500",
    failed: "bg-red-500",
    cancelled: "bg-gray-400"
  };

  return (
    <Card className="bg-white/70 backdrop-blur-sm">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-purple-600" />
            Training Automation
          </CardTitle>
          <Button onClick={() => setShowForm(!showForm)} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Schedule Job
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="p-4 bg-gray-50 rounded-lg space-y-3"
          >
            <div>
              <Label>Job Name</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Daily training job"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Dataset</Label>
                <select
                  value={formData.dataset_id}
                  onChange={(e) => setFormData({...formData, dataset_id: e.target.value})}
                  className="w-full px-3 py-2 rounded-lg border"
                >
                  <option value="">Select dataset</option>
                  {datasets.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Model</Label>
                <select
                  value={formData.model_name}
                  onChange={(e) => setFormData({...formData, model_name: e.target.value})}
                  className="w-full px-3 py-2 rounded-lg border"
                >
                  <option value="">Select model</option>
                  <option value="Random Forest">Random Forest</option>
                  <option value="Neural Network">Neural Network</option>
                  <option value="SVM">SVM</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Schedule</Label>
                <select
                  value={formData.schedule}
                  onChange={(e) => setFormData({...formData, schedule: e.target.value})}
                  className="w-full px-3 py-2 rounded-lg border"
                >
                  <option value="once">Run Once</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
              <div className="flex items-center gap-2 pt-6">
                <input
                  type="checkbox"
                  checked={formData.auto_deploy}
                  onChange={(e) => setFormData({...formData, auto_deploy: e.target.checked})}
                  className="w-4 h-4"
                />
                <Label>Auto-deploy</Label>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
              <Button size="sm" onClick={() => createJobMutation.mutate(formData)}>
                Schedule
              </Button>
            </div>
          </motion.div>
        )}

        <div className="space-y-2">
          {jobs.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No scheduled jobs</p>
          ) : (
            jobs.map((job, idx) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="flex items-center justify-between p-3 bg-white rounded-lg border"
              >
                <div className="flex-1">
                  <p className="font-medium">{job.name}</p>
                  <p className="text-sm text-gray-500">
                    {job.model_name} • {job.schedule}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={statusColors[job.status]}>
                    {job.status}
                  </Badge>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => deleteJobMutation.mutate(job.id)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
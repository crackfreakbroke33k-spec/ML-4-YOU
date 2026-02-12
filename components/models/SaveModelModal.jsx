import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

export default function SaveModelModal({ isOpen, onClose }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    model_name: "",
    learning_type: "Supervised",
    dataset_name: "",
    configuration: {},
    metrics: {},
    tags: []
  });

  const saveMutation = useMutation({
    mutationFn: (data) => base44.entities.SavedModel.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-models'] });
      toast.success("Model saved successfully!");
      onClose();
      setFormData({
        name: "",
        description: "",
        model_name: "",
        learning_type: "Supervised",
        dataset_name: "",
        configuration: {},
        metrics: {},
        tags: []
      });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Save New Model</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Model Name *</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="My Awesome Model"
              required
            />
          </div>

          <div>
            <Label>Description</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Describe your model..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Algorithm *</Label>
              <select
                value={formData.model_name}
                onChange={(e) => setFormData({...formData, model_name: e.target.value})}
                className="w-full px-3 py-2 rounded-lg border border-gray-300"
                required
              >
                <option value="">Select algorithm</option>
                <option value="Random Forest">Random Forest</option>
                <option value="Neural Network">Neural Network</option>
                <option value="SVM">SVM</option>
                <option value="Logistic Regression">Logistic Regression</option>
                <option value="Decision Tree">Decision Tree</option>
              </select>
            </div>

            <div>
              <Label>Learning Type *</Label>
              <select
                value={formData.learning_type}
                onChange={(e) => setFormData({...formData, learning_type: e.target.value})}
                className="w-full px-3 py-2 rounded-lg border border-gray-300"
                required
              >
                <option value="Supervised">Supervised</option>
                <option value="Unsupervised">Unsupervised</option>
                <option value="Semi-Supervised">Semi-Supervised</option>
                <option value="Ensemble">Ensemble</option>
                <option value="Reinforcement">Reinforcement</option>
              </select>
            </div>
          </div>

          <div>
            <Label>Dataset Name</Label>
            <Input
              value={formData.dataset_name}
              onChange={(e) => setFormData({...formData, dataset_name: e.target.value})}
              placeholder="Dataset used for training"
            />
          </div>

          <div>
            <Label>Tags (comma-separated)</Label>
            <Input
              placeholder="classification, healthcare, high-accuracy"
              onChange={(e) => setFormData({...formData, tags: e.target.value.split(',').map(t => t.trim())})}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={saveMutation.isPending}>
              {saveMutation.isPending ? "Saving..." : "Save Model"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
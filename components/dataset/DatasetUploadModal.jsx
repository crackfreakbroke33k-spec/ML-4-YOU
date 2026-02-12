import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Upload, Loader2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

export default function DatasetUploadModal({ isOpen, onClose }) {
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    icon: "📊",
    category: "Other",
    tags: [],
    version: "1.0",
    file: null
  });

  const createDatasetMutation = useMutation({
    mutationFn: (data) => base44.entities.Dataset.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['datasets'] });
      toast.success("Dataset uploaded successfully!");
      onClose();
      setFormData({
        name: "",
        description: "",
        icon: "📊",
        category: "Other",
        tags: [],
        version: "1.0",
        file: null
      });
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.file) {
      toast.error("Please select a file");
      return;
    }

    setUploading(true);

    try {
      // Upload file
      const { file_url } = await base44.integrations.Core.UploadFile({ file: formData.file });
      
      // Create dataset record
      await createDatasetMutation.mutateAsync({
        name: formData.name,
        description: formData.description,
        icon: formData.icon,
        file_url: file_url,
        category: formData.category,
        tags: formData.tags,
        version: formData.version,
        file_size: formData.file.size,
        format: formData.file.name.split('.').pop().toUpperCase(),
        samples_count: 0,
        features_count: 0
      });
    } catch (error) {
      toast.error("Upload failed: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Upload New Dataset</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Dataset Name *</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="My Dataset"
              required
            />
          </div>

          <div>
            <Label>Description</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Describe your dataset..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Icon (Emoji)</Label>
              <Input
                value={formData.icon}
                onChange={(e) => setFormData({...formData, icon: e.target.value})}
                placeholder="📊"
                maxLength={2}
              />
            </div>

            <div>
              <Label>Version</Label>
              <Input
                value={formData.version}
                onChange={(e) => setFormData({...formData, version: e.target.value})}
                placeholder="1.0"
              />
            </div>
          </div>

          <div>
            <Label>Category *</Label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
              className="w-full px-3 py-2 rounded-lg border border-gray-300"
              required
            >
              <option value="Healthcare">Healthcare</option>
              <option value="Finance">Finance</option>
              <option value="Retail">Retail</option>
              <option value="Gaming">Gaming</option>
              <option value="Education">Education</option>
              <option value="Research">Research</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <Label>Tags (comma-separated)</Label>
            <Input
              placeholder="classification, medical, imaging"
              onChange={(e) => setFormData({...formData, tags: e.target.value.split(',').map(t => t.trim())})}
            />
          </div>

          <div>
            <Label>Upload File (CSV, JSON, Excel) *</Label>
            <div className="mt-2 flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 mb-2 text-gray-500" />
                  <p className="mb-2 text-sm text-gray-500">
                    {formData.file ? formData.file.name : "Click to upload or drag and drop"}
                  </p>
                  <p className="text-xs text-gray-500">CSV, JSON, or Excel files</p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept=".csv,.json,.xlsx,.xls"
                  onChange={(e) => setFormData({...formData, file: e.target.files[0]})}
                  required
                />
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={uploading}>
              Cancel
            </Button>
            <Button type="submit" disabled={uploading}>
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                "Upload Dataset"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
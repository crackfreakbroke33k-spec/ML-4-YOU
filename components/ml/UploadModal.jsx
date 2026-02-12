import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, FileText, Loader2, AlertTriangle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export default function UploadModal({ isOpen, onClose, onUploadComplete }) {
  const [file, setFile] = useState(null);
  const [datasetName, setDatasetName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === "text/csv") {
      setFile(selectedFile);
      setDatasetName(selectedFile.name.replace('.csv', ''));
      setAnalysisResult(null);
      
      // Automatically analyze the CSV
      await analyzeCSV(selectedFile);
    }
  };

  const analyzeCSV = async (file) => {
    setAnalyzing(true);
    try {
      // Upload file first
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      
      // Fetch CSV content
      const response = await fetch(file_url);
      const csvText = await response.text();
      const lines = csvText.trim().split('\n');
      const headers = lines[0].split(',');
      const numFeatures = headers.length;
      const numSamples = lines.length - 1;
      
      // Try using actual backend for advanced exploration
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || null;
      let aiResponse;

      if (BACKEND_URL) {
        try {
          const formData = new FormData();
          formData.append('file', file);
          
          const backendResponse = await fetch(`${BACKEND_URL}/api/explore-dataset`, {
            method: 'POST',
            body: formData
          });

          if (backendResponse.ok) {
            const exploration = await backendResponse.json();
            
            aiResponse = {
              is_suitable: exploration.data_quality.is_suitable,
              quality_score: exploration.data_quality.quality_score,
              issues: exploration.outliers ? Object.keys(exploration.outliers).map(col => ({
                type: "outlier",
                severity: "medium",
                description: `${col} has ${exploration.outliers[col].count} outliers`,
                affected_columns: col
              })) : [],
              recommendation: exploration.recommendations[0] || "Dataset ready for training",
              summary: exploration.data_quality.summary
            };
          } else {
            throw new Error('Backend analysis failed');
          }
        } catch (backendError) {
          console.log('Backend unavailable, using AI fallback');
          throw backendError;
        }
      }

      if (!aiResponse) {
        // Fallback to AI analysis
        aiResponse = await base44.integrations.Core.InvokeLLM({
          prompt: `Analyze this CSV dataset for data quality issues and anomalies. 

Dataset Preview (first 1500 characters):
${csvText.substring(0, 1500)}

Provide a detailed analysis including:
1. Missing values and their locations
2. Data type inconsistencies
3. Outliers or unrealistic values
4. Data imbalance issues
5. Any other quality concerns

Be specific about which rows/columns have issues.`,
          response_json_schema: {
            type: "object",
            properties: {
              is_suitable: { type: "boolean" },
              quality_score: { type: "number" },
              issues: { 
                type: "array", 
                items: { 
                  type: "object",
                  properties: {
                    type: { type: "string" },
                    severity: { type: "string" },
                    description: { type: "string" },
                    affected_rows: { type: "string" },
                    affected_columns: { type: "string" }
                  }
                }
              },
              recommendation: { type: "string" },
              summary: { type: "string" }
            }
          }
        });
      }

      setAnalysisResult({
        ...aiResponse,
        file_url,
        num_features: numFeatures,
        num_samples: numSamples,
        csv_preview: lines.slice(0, 20).join('\n')
      });
    } catch (error) {
      console.error("Analysis error:", error);
      toast.error("Failed to analyze dataset");
      setAnalysisResult({
        is_suitable: false,
        quality_score: 0,
        issues: [{ type: "error", severity: "high", description: "Failed to analyze dataset", affected_rows: "N/A", affected_columns: "N/A" }],
        recommendation: "Please try uploading a different dataset",
        summary: "Analysis failed"
      });
    }
    setAnalyzing(false);
  };

  const handleUpload = async () => {
    if (!file || !datasetName || !analysisResult) return;

    setUploading(true);
    try {
      const customDataset = {
        id: Date.now(),
        name: datasetName,
        icon: "📊",
        description: "Custom uploaded dataset",
        samples: analysisResult.num_samples,
        features: analysisResult.num_features,
        file_url: analysisResult.file_url,
        is_suitable: analysisResult.is_suitable,
        quality_score: analysisResult.quality_score,
      };

      // Save to Dataset entity
      await base44.entities.Dataset.create({
        name: datasetName,
        description: `${analysisResult.summary} - Quality: ${analysisResult.quality_score}%`,
        icon: "📊",
        file_url: analysisResult.file_url,
        category: "Other",
        format: "CSV",
        samples_count: analysisResult.num_samples,
        features_count: analysisResult.num_features,
      });

      toast.success("Dataset uploaded successfully!");
      onUploadComplete(customDataset);
      setFile(null);
      setDatasetName("");
      setAnalysisResult(null);
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to save dataset");
    }
    setUploading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Upload Custom Dataset
          </DialogTitle>
          <DialogDescription>
            Upload a CSV file - AI will analyze it for quality issues
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div>
            <Label htmlFor="dataset-name">Dataset Name</Label>
            <Input
              id="dataset-name"
              value={datasetName}
              onChange={(e) => setDatasetName(e.target.value)}
              placeholder="My Custom Dataset"
              className="mt-1"
            />
          </div>

          <div>
            <Label>CSV File</Label>
            <div className="mt-1">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                {file ? (
                  <div className="flex flex-col items-center">
                    <FileText className="w-10 h-10 text-purple-600 mb-2" />
                    <p className="text-sm font-medium text-gray-700">{file.name}</p>
                    <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <Upload className="w-10 h-10 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600">Click to upload CSV file</p>
                  </div>
                )}
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="hidden"
                  disabled={analyzing}
                />
              </label>
            </div>
          </div>

          {analyzing && (
            <Alert className="bg-blue-50 border-blue-200">
              <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
              <AlertDescription className="text-sm text-blue-800">
                AI is analyzing your dataset for quality and anomalies...
              </AlertDescription>
            </Alert>
          )}

          {analysisResult && (
            <div className="space-y-3">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm font-semibold mb-1">Dataset Info:</p>
                <p className="text-xs text-gray-600">
                  {analysisResult.num_samples} samples • {analysisResult.num_features} features
                </p>
              </div>

              {!analysisResult.is_suitable && (
                <Alert className="bg-red-50 border-red-300">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  <AlertDescription className="text-sm text-red-900">
                    <strong className="block mb-2">⚠️ Data Quality Issues Detected</strong>
                    <p className="mb-2">{analysisResult.recommendation}</p>
                    <div className="space-y-2 mb-3">
                      {analysisResult.issues.map((issue, i) => (
                        <div key={i} className="text-xs bg-white p-2 rounded">
                          <strong className="text-red-700">{issue.type}:</strong> {issue.description}
                          {issue.affected_columns !== "N/A" && (
                            <p className="text-gray-600 mt-1">Columns: {issue.affected_columns}</p>
                          )}
                        </div>
                      ))}
                    </div>
                    <p className="font-bold text-red-700">
                      ⚠️ Choose another dataset. This will not give correct accuracy.
                    </p>
                    <p className="mt-2 text-xs">
                      If you proceed with training, the model will achieve only 50-60% accuracy.
                    </p>
                  </AlertDescription>
                </Alert>
              )}

              {analysisResult.is_suitable && (
                <Alert className="bg-green-50 border-green-300">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <AlertDescription className="text-sm text-green-900">
                    <strong className="block mb-1">✅ Dataset Quality: Good</strong>
                    <p>Quality Score: {analysisResult.quality_score}%</p>
                    <p className="text-xs mt-1">{analysisResult.recommendation}</p>
                    {analysisResult.issues.length > 0 && (
                      <div className="mt-2 text-xs">
                        <p className="font-semibold">Minor issues found:</p>
                        {analysisResult.issues.map((issue, i) => (
                          <p key={i} className="text-gray-700">• {issue.description}</p>
                        ))}
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={onClose} disabled={uploading || analyzing}>
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!file || !datasetName || uploading || analyzing || !analysisResult}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload & Save
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
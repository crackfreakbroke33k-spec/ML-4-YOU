import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Database, Upload, Grid, List, Eye } from "lucide-react";
import { motion } from "framer-motion";
import AuthGuard from "../components/auth/AuthGuard";
import DatasetCard from "../components/datasets/DatasetCard";
import DatasetUploadModal from "../components/datasets/DatasetUploadModal";
import DatasetListView from "../components/datasets/DatasetListView";
import DatasetViewer from "../components/datasets/DatasetViewer";
import { useRealtimeSync } from "../components/hooks/useRealtimeSync";

export default function DatasetLibrary() {
  const { isElevated } = useRealtimeSync();
  const [searchQuery, setSearchQuery] = useState("");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [viewMode, setViewMode] = useState("grid");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedDataset, setSelectedDataset] = useState(null);

  const { data: datasets, isLoading, refetch } = useQuery({
    queryKey: ['datasets'],
    queryFn: () => base44.entities.Dataset.list('-created_date', 1000),
    initialData: [],
    refetchInterval: isElevated ? 1000 : 5000, // Real-time for admins
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  const filteredDatasets = datasets.filter(dataset => {
    const matchesSearch = dataset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         dataset.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || dataset.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = ["all", "Healthcare", "Finance", "Retail", "Gaming", "Education", "Research", "Other"];

  return (
    <AuthGuard>
      <div className="min-h-screen p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8"
          >
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent mb-2">
                My Datasets
              </h1>
              <p className="text-gray-600">Manage and view your uploaded datasets</p>
            </div>
            <Button
              onClick={() => setShowUploadModal(true)}
              className="bg-gradient-to-r from-purple-600 to-pink-600"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Dataset
            </Button>
          </motion.div>

          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <Input
              placeholder="Search datasets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-white"
            />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 rounded-lg border border-gray-300 bg-white"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat === "all" ? "All Categories" : cat}
                </option>
              ))}
            </select>
            <div className="flex gap-2">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="icon"
                onClick={() => setViewMode("grid")}
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="icon"
                onClick={() => setViewMode("list")}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {selectedDataset && (
            <div className="mb-6">
              <DatasetViewer 
                dataset={selectedDataset} 
                onClose={() => setSelectedDataset(null)} 
              />
            </div>
          )}

          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDatasets.map((dataset, index) => (
                <div key={dataset.id}>
                  <DatasetCard dataset={dataset} index={index} />
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-2"
                    onClick={() => setSelectedDataset(dataset)}
                  >
                    <Eye className="w-3 h-3 mr-2" />
                    View Data
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <DatasetListView datasets={filteredDatasets} />
          )}

          {filteredDatasets.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <Database className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p>No datasets found</p>
            </div>
          )}

          <DatasetUploadModal
            isOpen={showUploadModal}
            onClose={() => {
              setShowUploadModal(false);
              refetch();
            }}
          />
        </div>
      </div>
    </AuthGuard>
  );
}
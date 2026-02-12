import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Rocket, Package, Plus, Clock } from "lucide-react";
import { motion } from "framer-motion";
import AuthGuard from "../components/auth/AuthGuard";
import DisclaimerBanner from "../components/common/DisclaimerBanner";
import ModelCard from "../components/models/ModelCard";
import DeployedModels from "../components/models/DeployedModels";
import SaveModelModal from "../components/models/SaveModelModal";
import AutomationScheduler from "../components/training/AutomationScheduler";

export default function ModelDeployment() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [showSaveModal, setShowSaveModal] = useState(false);

  const { data: savedModels, isLoading } = useQuery({
    queryKey: ['saved-models'],
    queryFn: () => base44.entities.SavedModel.list('-created_date', 1000),
    initialData: [],
  });

  const { data: deployedModels } = useQuery({
    queryKey: ['deployed-models'],
    queryFn: async () => {
      const models = await base44.entities.SavedModel.list('-created_date', 1000);
      return models.filter(m => m.is_deployed);
    },
    initialData: [],
  });

  const filteredModels = savedModels.filter(model =>
    model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    model.model_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AuthGuard>
      <div className="min-h-screen p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <DisclaimerBanner />
          
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8"
          >
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent mb-2">
                Model Deployment
              </h1>
              <p className="text-gray-600">Save, deploy, and manage your ML models</p>
            </div>
            <Button
              onClick={() => setShowSaveModal(true)}
              className="bg-gradient-to-r from-purple-600 to-pink-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              Save New Model
            </Button>
          </motion.div>

          <Tabs defaultValue="all" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 bg-white/70 backdrop-blur-sm">
              <TabsTrigger value="all" className="gap-2">
                <Package className="w-4 h-4" />
                All Models ({savedModels.length})
              </TabsTrigger>
              <TabsTrigger value="deployed" className="gap-2">
                <Rocket className="w-4 h-4" />
                Deployed ({deployedModels.length})
              </TabsTrigger>
              <TabsTrigger value="automation" className="gap-2">
                <Clock className="w-4 h-4" />
                Automation
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              <Input
                placeholder="Search models..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-md bg-white"
              />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredModels.map((model, index) => (
                  <ModelCard key={model.id} model={model} index={index} />
                ))}
              </div>
              {filteredModels.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p>No models found</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="deployed">
              <DeployedModels models={deployedModels} />
            </TabsContent>

            <TabsContent value="automation">
              <AutomationScheduler />
            </TabsContent>
          </Tabs>

          <SaveModelModal
            isOpen={showSaveModal}
            onClose={() => setShowSaveModal(false)}
          />
        </div>
      </div>
    </AuthGuard>
  );
}
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy, ExternalLink, Code } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function DeployedModels({ models }) {
  const [copiedId, setCopiedId] = useState(null);

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const generateCurlExample = (endpoint) => {
    return `curl -X POST ${endpoint} \\
  -H "Content-Type: application/json" \\
  -d '{"data": [1, 2, 3, 4, 5]}'`;
  };

  return (
    <div className="space-y-4">
      {models.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Code className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p>No deployed models</p>
          <p className="text-sm mt-2">Deploy a model to get an API endpoint</p>
        </div>
      ) : (
        models.map((model, index) => (
          <motion.div
            key={model.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="bg-white">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{model.name}</CardTitle>
                    <p className="text-sm text-gray-500 mt-1">{model.model_name}</p>
                  </div>
                  <Badge className="bg-green-600">Live</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-700">API Endpoint</label>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(model.api_endpoint, `endpoint-${model.id}`)}
                    >
                      <Copy className="w-3 h-3 mr-1" />
                      {copiedId === `endpoint-${model.id}` ? "Copied!" : "Copy"}
                    </Button>
                  </div>
                  <code className="block p-3 bg-gray-50 rounded-lg text-sm break-all">
                    {model.api_endpoint}
                  </code>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-700">Example cURL Request</label>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(generateCurlExample(model.api_endpoint), `curl-${model.id}`)}
                    >
                      <Copy className="w-3 h-3 mr-1" />
                      {copiedId === `curl-${model.id}` ? "Copied!" : "Copy"}
                    </Button>
                  </div>
                  <pre className="p-3 bg-gray-900 text-gray-100 rounded-lg text-xs overflow-x-auto">
                    {generateCurlExample(model.api_endpoint)}
                  </pre>
                </div>

                {model.metrics && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {Object.entries(model.metrics).slice(0, 4).map(([key, value]) => (
                      <div key={key} className="p-2 bg-gray-50 rounded text-center">
                        <p className="text-xs text-gray-500 capitalize">{key}</p>
                        <p className="font-semibold text-sm">
                          {typeof value === 'number' ? value.toFixed(4) : value}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))
      )}
    </div>
  );
}
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { History, Download, Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

export default function VersionHistory({ datasetName }) {
  const { data: versions } = useQuery({
    queryKey: ['dataset-versions', datasetName],
    queryFn: async () => {
      const datasets = await base44.entities.Dataset.list('-created_date', 100);
      return datasets.filter(d => d.name === datasetName);
    },
    initialData: [],
  });

  return (
    <Card className="bg-white/70 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <History className="w-4 h-4 text-purple-600" />
          Version History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {versions.length === 0 ? (
            <p className="text-center text-gray-500 py-4 text-sm">No versions found</p>
          ) : (
            versions.map((version) => (
              <div
                key={version.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">v{version.version}</Badge>
                    <span className="text-sm font-medium">{version.name}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(version.created_date).toLocaleString()}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => window.open(version.file_url, '_blank')}
                >
                  <Download className="w-3 h-3" />
                </Button>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
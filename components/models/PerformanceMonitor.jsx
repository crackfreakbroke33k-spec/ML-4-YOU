import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function PerformanceMonitor({ modelId }) {
  const { data: metrics } = useQuery({
    queryKey: ['model-metrics', modelId],
    queryFn: async () => {
      const allMetrics = await base44.entities.ModelMetrics.list('-created_date', 100);
      return allMetrics.filter(m => m.model_id === modelId);
    },
    initialData: [],
    refetchInterval: 5000,
  });

  const latestMetric = metrics[0];
  const avgAccuracy = metrics.length > 0 
    ? (metrics.reduce((sum, m) => sum + (m.accuracy || 0), 0) / metrics.length).toFixed(4)
    : 0;
  const avgLatency = metrics.length > 0
    ? (metrics.reduce((sum, m) => sum + (m.latency_ms || 0), 0) / metrics.length).toFixed(2)
    : 0;

  const chartData = metrics.slice(0, 20).reverse().map((m, i) => ({
    index: i,
    accuracy: m.accuracy ? (m.accuracy * 100).toFixed(2) : 0,
    latency: m.latency_ms || 0
  }));

  return (
    <Card className="bg-white/70 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-purple-600" />
          Performance Monitoring
          <Badge variant="outline" className="ml-auto">
            Live • {metrics.length} Data Points
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
            <p className="text-xs text-blue-600 mb-1">Avg Accuracy</p>
            <p className="text-xl font-bold text-blue-900">{avgAccuracy}%</p>
          </div>
          <div className="p-3 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
            <p className="text-xs text-green-600 mb-1">Avg Latency</p>
            <p className="text-xl font-bold text-green-900">{avgLatency}ms</p>
          </div>
          <div className="p-3 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
            <p className="text-xs text-purple-600 mb-1">Total Predictions</p>
            <p className="text-xl font-bold text-purple-900">
              {metrics.reduce((sum, m) => sum + (m.prediction_count || 0), 0)}
            </p>
          </div>
          <div className="p-3 bg-gradient-to-br from-red-50 to-red-100 rounded-lg">
            <p className="text-xs text-red-600 mb-1">Error Rate</p>
            <p className="text-xl font-bold text-red-900">
              {latestMetric?.error_rate?.toFixed(2) || 0}%
            </p>
          </div>
        </div>

        {chartData.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold mb-2">Accuracy Trend</h4>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="index" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="accuracy" stroke="#8b5cf6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {metrics.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Activity className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No performance data yet</p>
            <p className="text-sm mt-1">Metrics will appear once the model starts receiving predictions</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
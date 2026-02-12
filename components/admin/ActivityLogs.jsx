import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Activity, Clock, RefreshCw, Loader2, Wifi } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { toast } from "sonner";

const ACTION_COLORS = {
  login: "bg-green-100 text-green-800",
  logout: "bg-gray-100 text-gray-800",
  train_model: "bg-purple-100 text-purple-800",
  upload_dataset: "bg-blue-100 text-blue-800",
  profile_update: "bg-yellow-100 text-yellow-800",
  user_promotion: "bg-orange-100 text-orange-800",
  user_demotion: "bg-red-100 text-red-800",
  analysis_delete: "bg-pink-100 text-pink-800",
};

export default function ActivityLogs() {
  const { data: logs, refetch, isLoading } = useQuery({
    queryKey: ['all-activity-logs'],
    queryFn: async () => {
      try {
        const allLogs = await base44.entities.ActivityLog.list('-created_date', 500);
        console.log('Admin View - All Activity Logs:', allLogs.length);
        return allLogs || [];
      } catch (error) {
        console.error('Error fetching activity logs:', error);
        return [];
      }
    },
    initialData: [],
    refetchInterval: 1000, // Real-time every 1 second
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });

  return (
    <Card className="bg-white/70 backdrop-blur-sm border-white/50 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 flex-wrap">
          <Activity className="w-5 h-5 text-purple-600" />
          Activity Logs
          <Badge variant="outline" className="ml-auto flex items-center gap-1">
            <Wifi className="w-3 h-3 text-green-500 animate-pulse" />
            Live • {logs.length} Events
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
          {isLoading && logs.length === 0 ? (
            <div className="text-center py-8">
              <Loader2 className="w-12 h-12 mx-auto mb-3 text-purple-600 animate-spin" />
              <p className="text-gray-500">Loading activity logs...</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Activity className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p>No activity logs yet</p>
            </div>
          ) : (
            logs.map((log, index) => (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03 }}
                className="flex items-start gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:shadow-md transition-all duration-300"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <Badge className={ACTION_COLORS[log.action_type] || "bg-gray-100 text-gray-800"}>
                      {log.action_type.replace(/_/g, ' ').toUpperCase()}
                    </Badge>
                    <span className="text-sm font-medium text-gray-700 truncate">{log.user_email}</span>
                  </div>
                  <p className="text-sm text-gray-600">{log.details}</p>
                  {log.metadata && Object.keys(log.metadata).length > 0 && (
                    <div className="mt-2 text-xs text-gray-500 bg-gray-50 rounded p-2">
                      {Object.entries(log.metadata).map(([key, value]) => (
                        <div key={key}>
                          <span className="font-medium">{key}:</span> {String(value)}
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center gap-1 text-xs text-gray-400 mt-2">
                    <Clock className="w-3 h-3" />
                    {format(new Date(log.created_date), "MMM d, yyyy • HH:mm:ss")}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
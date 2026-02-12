import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, Clock, TrendingUp } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";

export default function HistorySidebar({ analyses, isLoading, selectedAnalysis, onSelectAnalysis, onClose }) {
  return (
    <div className="w-full lg:w-80 h-full bg-white/70 backdrop-blur-md border-r border-white/50 shadow-xl">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">My Training History</h2>
        <Button variant="ghost" size="icon" onClick={onClose} className="lg:hidden">
          <X className="w-5 h-5" />
        </Button>
      </div>

      <ScrollArea className="h-[calc(100vh-5rem)]">
        <div className="p-4 space-y-3">
          {isLoading ? (
            <div className="text-center text-gray-500 py-8">Loading...</div>
          ) : analyses.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <Clock className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p>No training history yet</p>
              <p className="text-sm mt-1">Start training your first model!</p>
            </div>
          ) : (
            analyses.map((analysis, index) => (
              <motion.div
                key={analysis.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card
                  onClick={() => onSelectAnalysis(analysis)}
                  className={`cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 ${
                    selectedAnalysis?.id === analysis.id
                      ? "ring-2 ring-purple-500 bg-gradient-to-br from-purple-50 to-pink-50"
                      : "bg-white hover:bg-gray-50"
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="text-3xl">{analysis.dataset_icon}</div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm text-gray-800 truncate">
                          {analysis.dataset_name}
                        </h3>
                        <p className="text-xs text-gray-600 truncate">{analysis.model_name}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            {analysis.learning_type}
                          </Badge>
                          <div className="flex items-center gap-1 text-xs text-green-600">
                            <TrendingUp className="w-3 h-3" />
                            {(analysis.accuracy * 100).toFixed(1)}%
                          </div>
                        </div>
                        <p className="text-xs text-gray-400 mt-2">
                          {format(new Date(analysis.created_date), "MMM d, yyyy • HH:mm")}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
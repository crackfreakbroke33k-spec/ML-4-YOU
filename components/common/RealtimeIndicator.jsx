import React from "react";
import { Badge } from "@/components/ui/badge";
import { Wifi, WifiOff } from "lucide-react";
import { useRealtimeSync } from "../hooks/useRealtimeSync";

export default function RealtimeIndicator() {
  const { isElevated } = useRealtimeSync();

  if (!isElevated) return null;

  return (
    <Badge 
      variant="outline" 
      className="flex items-center gap-1 bg-green-50 border-green-300 text-green-700"
    >
      <Wifi className="w-3 h-3 animate-pulse" />
      Real-Time Sync Active
    </Badge>
  );
}
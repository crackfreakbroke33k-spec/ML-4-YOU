import React from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

export default function DisclaimerBanner() {
  return (
    <Alert className="bg-amber-50 border-amber-300 mb-4">
      <AlertTriangle className="h-5 w-5 text-amber-600" />
      <AlertDescription className="flex items-center gap-4">
        <span className="text-sm text-amber-900 font-medium">
          <strong>⚠️ Important Disclaimer:</strong> This ML platform is currently under training and experimentation. 
          AI models can make mistakes and predictions may not be accurate. Please exercise caution and verify 
          all results before using them for critical decisions or production systems.
        </span>
      </AlertDescription>
    </Alert>
  );
}
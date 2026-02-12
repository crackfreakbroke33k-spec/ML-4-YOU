import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Server, CheckCircle2, AlertCircle, Settings } from "lucide-react";
import { toast } from "sonner";

export default function BackendConfig() {
  const [backendUrl, setBackendUrl] = useState(
    localStorage.getItem('BACKEND_URL') || 'http://localhost:8000'
  );
  const [testing, setTesting] = useState(false);
  const [status, setStatus] = useState(null);

  const testConnection = async () => {
    setTesting(true);
    try {
      const response = await fetch(`${backendUrl}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000)
      });

      if (response.ok) {
        const data = await response.json();
        setStatus({ connected: true, version: data.version });
        toast.success("Backend connected successfully!");
      } else {
        setStatus({ connected: false });
        toast.error("Backend returned error");
      }
    } catch (error) {
      setStatus({ connected: false });
      toast.error("Cannot connect to backend - using simulation mode");
    }
    setTesting(false);
  };

  const saveConfig = () => {
    localStorage.setItem('BACKEND_URL', backendUrl);
    process.env.REACT_APP_BACKEND_URL = backendUrl;
    toast.success("Backend URL saved");
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Settings className="w-5 h-5" />
          Backend Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Backend API URL</label>
          <div className="flex gap-2">
            <Input
              value={backendUrl}
              onChange={(e) => setBackendUrl(e.target.value)}
              placeholder="http://localhost:8000"
              className="flex-1"
            />
            <Button onClick={testConnection} disabled={testing} variant="outline">
              {testing ? "Testing..." : "Test"}
            </Button>
            <Button onClick={saveConfig}>Save</Button>
          </div>
        </div>

        {status && (
          <Alert className={status.connected ? "bg-green-50 border-green-200" : "bg-amber-50 border-amber-200"}>
            {status.connected ? (
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            ) : (
              <AlertCircle className="h-4 w-4 text-amber-600" />
            )}
            <AlertDescription className="text-sm">
              {status.connected ? (
                <div className="flex items-center gap-2">
                  <span className="text-green-800">Backend is online</span>
                  {status.version && (
                    <Badge variant="outline" className="text-xs">v{status.version}</Badge>
                  )}
                </div>
              ) : (
                <span className="text-amber-800">Backend offline - using simulation mode</span>
              )}
            </AlertDescription>
          </Alert>
        )}

        <div className="text-xs text-gray-600 space-y-1">
          <p>• Leave empty to use simulation mode</p>
          <p>• For local backend: http://localhost:8000</p>
          <p>• Run backend with: <code className="bg-gray-100 px-1 py-0.5 rounded">python main.py</code></p>
        </div>
      </CardContent>
    </Card>
  );
}
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Trash2, ArrowLeft, Crown, User as UserIcon, Loader2, Activity, BarChart3, Users, Wifi } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import { toast } from "sonner";
import AuthGuard from "../components/auth/AuthGuard";
import UserManagement from "../components/admin/UserManagement";
import UserAnalytics from "../components/admin/UserAnalytics";
import ActivityLogs from "../components/admin/ActivityLogs";
import TrainingLogs from "../components/admin/TrainingLogs";

export default function AdminPanel() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [currentUser, setCurrentUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  useEffect(() => {
    const checkAdminAccess = async () => {
      const isAdminLoggedIn = sessionStorage.getItem("ml4you_admin") === "true";
      
      if (!isAdminLoggedIn) {
        navigate(createPageUrl("AdminLogin"));
        return;
      }
      
      try {
        const user = await base44.auth.me();
        setCurrentUser(user);
      } catch (error) {
        console.log("No user logged in, but admin access granted");
      }
      
      setIsAdmin(true);
      setIsSuperAdmin(true);
    };
    checkAdminAccess();
  }, [navigate]);

  if (!currentUser || !isAdmin) return null;

  return (
    <AuthGuard>
      <div className="min-h-screen p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4 mb-8"
          >
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate(createPageUrl("Dashboard"))}
              className="rounded-full"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
                Admin Panel
              </h1>
              <p className="text-gray-600">
                Full access to all data and system activity
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white">
                <Crown className="w-3 h-3 mr-1" />
                Admin Access
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1 bg-green-50 border-green-300 text-green-700">
                <Wifi className="w-3 h-3 animate-pulse" />
                Real-Time
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  sessionStorage.removeItem("ml4you_admin");
                  navigate(createPageUrl("Landing"));
                }}
              >
                Logout
              </Button>
            </div>
          </motion.div>

          {/* Tabs */}
          <Tabs defaultValue="users" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 bg-white/70 backdrop-blur-sm">
              <TabsTrigger value="users" className="gap-2">
                <Users className="w-4 h-4" />
                Users
              </TabsTrigger>
              <TabsTrigger value="analytics" className="gap-2">
                <BarChart3 className="w-4 h-4" />
                Analytics
              </TabsTrigger>
              <TabsTrigger value="activity" className="gap-2">
                <Activity className="w-4 h-4" />
                Activity Logs
              </TabsTrigger>
              <TabsTrigger value="training" className="gap-2">
                <Shield className="w-4 h-4" />
                Training Logs
              </TabsTrigger>
            </TabsList>

            <TabsContent value="users">
              <UserManagement isSuperAdmin={isSuperAdmin} />
            </TabsContent>

            <TabsContent value="analytics">
              <UserAnalytics />
            </TabsContent>

            <TabsContent value="activity">
              <ActivityLogs />
            </TabsContent>

            <TabsContent value="training">
              <TrainingLogs isSuperAdmin={isSuperAdmin} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AuthGuard>
  );
}
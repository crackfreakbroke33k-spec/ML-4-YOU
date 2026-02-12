import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Crown, User as UserIcon, Shield, Loader2, RefreshCw, Eye, Database, Activity, Wifi } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { broadcastChange } from "../hooks/useRealtimeSync";

export default function UserManagement({ isSuperAdmin }) {
  const queryClient = useQueryClient();
  const [currentUser, setCurrentUser] = useState(null);
  const [expandedUsers, setExpandedUsers] = useState({});

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const user = await base44.auth.me();
        setCurrentUser(user);
        console.log('Current user:', user);
      } catch (error) {
        console.error('Error fetching current user:', error);
      }
    };
    fetchCurrentUser();
  }, []);

  const { data: users, refetch, isLoading, error } = useQuery({
    queryKey: ['all-users-admin'],
    queryFn: async () => {
      try {
        const allUsers = await base44.entities.User.list('-created_date', 1000);
        console.log('Admin View - All Users:', allUsers.length);
        return allUsers || [];
      } catch (error) {
        console.error('Error fetching users:', error);
        return [];
      }
    },
    initialData: [],
    refetchInterval: 1000, // Real-time every 1 second
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });

  const updateUserMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.User.update(id, data),
    onSuccess: async () => {
      await broadcastChange(queryClient, ['all-users-admin', 'activitylogs']);
      refetch();
      toast.success("User updated - broadcasted to all admins!");
    },
    onError: (error) => {
      console.error('Update error:', error);
      toast.error("Failed to update user: " + error.message);
    },
  });

  const createActivityLogMutation = useMutation({
    mutationFn: (logData) => base44.entities.ActivityLog.create(logData),
    onSuccess: async () => {
      await broadcastChange(queryClient, 'activitylogs');
    },
  });

  const togglePermission = async (user, field, value, logMessage) => {
    await updateUserMutation.mutateAsync({
      id: user.id,
      data: { [field]: value }
    });
    await createActivityLogMutation.mutateAsync({
      user_email: user.email,
      action_type: value ? 'user_promotion' : 'user_demotion',
      details: logMessage,
    });
  };

  const toggleExpanded = (userId) => {
    setExpandedUsers(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };

  useEffect(() => {
    const autoPromote = async () => {
      if (!currentUser || users.length === 0) return;
      
      const hardcodedAdmins = ['durjoychatterjee59@gmail.com', 'dasriyanka858@gmail.com'];
      for (const user of users) {
        if (hardcodedAdmins.includes(user.email) && !user.is_super_admin) {
          try {
            await base44.entities.User.update(user.id, { is_super_admin: true });
            console.log(`Auto-promoted ${user.email} to Super Admin`);
            refetch();
          } catch (error) {
            console.error(`Failed to auto-promote ${user.email}:`, error);
          }
        }
      }
    };
    
    autoPromote();
  }, [users.length, currentUser]);

  if (error) {
    return (
      <Card className="bg-white/70 backdrop-blur-sm border-white/50 shadow-xl">
        <CardContent className="p-12 text-center">
          <Shield className="w-16 h-16 mx-auto mb-4 text-red-400" />
          <p className="text-red-600 font-semibold mb-2">Error Loading Users</p>
          <p className="text-sm text-gray-600 mb-4">{error.message}</p>
          <Button onClick={() => refetch()} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/70 backdrop-blur-sm border-white/50 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 flex-wrap">
          <Shield className="w-5 h-5 text-purple-600" />
          User Management & Permissions
          <Badge variant="outline" className="ml-auto flex items-center gap-1">
            <Wifi className="w-3 h-3 text-green-500 animate-pulse" />
            Live • {users.length} Users
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
        {isLoading && users.length === 0 ? (
          <div className="text-center py-12">
            <Loader2 className="w-12 h-12 mx-auto mb-4 text-purple-600 animate-spin" />
            <p className="text-gray-600">Loading users...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-12">
            <UserIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-600 mb-2">No users found</p>
            <p className="text-sm text-gray-500 mb-4">Users need to be invited to access the platform</p>
            <Button onClick={() => refetch()} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        ) : (
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {users.map((user, index) => {
              const isNaturalSuperAdmin = 
                user.email === 'durjoychatterjee59@gmail.com' || 
                user.email === 'dasriyanka858@gmail.com';
              
              return (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Collapsible
                    open={expandedUsers[user.id]}
                    onOpenChange={() => toggleExpanded(user.id)}
                  >
                    <Card className="bg-white border border-gray-200 hover:shadow-md transition-all duration-300">
                      <CollapsibleTrigger className="w-full">
                        <div className="flex items-center justify-between p-4">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-semibold flex-shrink-0">
                              {user.full_name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                            </div>
                            <div className="min-w-0 flex-1 text-left">
                              <p className="font-medium text-gray-900 truncate">{user.full_name || user.email}</p>
                              <p className="text-sm text-gray-500 truncate">{user.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {(user.is_super_admin || isNaturalSuperAdmin) ? (
                              <Badge className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white border-0">
                                <Crown className="w-3 h-3 mr-1" />
                                Super Admin
                              </Badge>
                            ) : user.is_admin ? (
                              <Badge className="bg-blue-500 text-white">
                                <Shield className="w-3 h-3 mr-1" />
                                Admin
                              </Badge>
                            ) : (
                              <Badge variant="outline">
                                <UserIcon className="w-3 h-3 mr-1" />
                                User
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CollapsibleTrigger>
                      
                      <CollapsibleContent>
                        <div className="px-4 pb-4 pt-2 border-t border-gray-100">
                          <p className="text-xs text-gray-500 mb-3">
                            Joined: {new Date(user.created_date).toLocaleDateString()}
                          </p>
                          
                          {isSuperAdmin && !isNaturalSuperAdmin && (
                            <div className="space-y-4">
                              {/* Role Management */}
                              <div className="space-y-2">
                                <Label className="text-sm font-semibold text-gray-700">Role Management</Label>
                                <div className="flex gap-2">
                                  {!user.is_super_admin && (
                                    <Button
                                      size="sm"
                                      variant={user.is_admin ? "destructive" : "default"}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        togglePermission(user, 'is_admin', !user.is_admin, 
                                          `${!user.is_admin ? 'Promoted to' : 'Demoted from'} Admin`);
                                      }}
                                      disabled={updateUserMutation.isPending}
                                    >
                                      {user.is_admin ? "Remove Admin" : "Make Admin"}
                                    </Button>
                                  )}
                                  <Button
                                    size="sm"
                                    variant={user.is_super_admin ? "destructive" : "secondary"}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      togglePermission(user, 'is_super_admin', !user.is_super_admin,
                                        `${!user.is_super_admin ? 'Promoted to' : 'Demoted from'} Super Admin`);
                                    }}
                                    disabled={updateUserMutation.isPending}
                                  >
                                    {user.is_super_admin ? "Remove Super Admin" : "Make Super Admin"}
                                  </Button>
                                </div>
                              </div>

                              {/* Granular Permissions */}
                              <div className="space-y-3">
                                <Label className="text-sm font-semibold text-gray-700">Data Access Permissions</Label>
                                
                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                  <div className="flex items-center gap-2">
                                    <Eye className="w-4 h-4 text-purple-600" />
                                    <div>
                                      <Label htmlFor={`view-users-${user.id}`} className="text-sm font-medium cursor-pointer">
                                        View All Users
                                      </Label>
                                      <p className="text-xs text-gray-500">Real-time access to all user data</p>
                                    </div>
                                  </div>
                                  <Switch
                                    id={`view-users-${user.id}`}
                                    checked={user.can_view_all_users || false}
                                    onCheckedChange={(checked) => {
                                      togglePermission(user, 'can_view_all_users', checked,
                                        `${checked ? 'Granted' : 'Revoked'} permission to view all users`);
                                    }}
                                    disabled={updateUserMutation.isPending}
                                  />
                                </div>

                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                  <div className="flex items-center gap-2">
                                    <Database className="w-4 h-4 text-blue-600" />
                                    <div>
                                      <Label htmlFor={`view-training-${user.id}`} className="text-sm font-medium cursor-pointer">
                                        View All Training Logs
                                      </Label>
                                      <p className="text-xs text-gray-500">Real-time access to all ML training data</p>
                                    </div>
                                  </div>
                                  <Switch
                                    id={`view-training-${user.id}`}
                                    checked={user.can_view_all_training || false}
                                    onCheckedChange={(checked) => {
                                      togglePermission(user, 'can_view_all_training', checked,
                                        `${checked ? 'Granted' : 'Revoked'} permission to view all training logs`);
                                    }}
                                    disabled={updateUserMutation.isPending}
                                  />
                                </div>

                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                  <div className="flex items-center gap-2">
                                    <Activity className="w-4 h-4 text-green-600" />
                                    <div>
                                      <Label htmlFor={`view-activity-${user.id}`} className="text-sm font-medium cursor-pointer">
                                        View All Activity Logs
                                      </Label>
                                      <p className="text-xs text-gray-500">Real-time access to all system activity</p>
                                    </div>
                                  </div>
                                  <Switch
                                    id={`view-activity-${user.id}`}
                                    checked={user.can_view_all_activity || false}
                                    onCheckedChange={(checked) => {
                                      togglePermission(user, 'can_view_all_activity', checked,
                                        `${checked ? 'Granted' : 'Revoked'} permission to view all activity logs`);
                                    }}
                                    disabled={updateUserMutation.isPending}
                                  />
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </CollapsibleContent>
                    </Card>
                  </Collapsible>
                </motion.div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Users, TrendingUp, Activity, Award, RefreshCw, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

const COLORS = ['#8b5cf6', '#ec4899', '#3b82f6', '#10b981', '#f59e0b'];

export default function UserAnalytics() {
  const { data: users, refetch: refetchUsers, isLoading: loadingUsers } = useQuery({
    queryKey: ['all-users-analytics'],
    queryFn: async () => {
      try {
        const allUsers = await base44.entities.User.list('-created_date', 1000);
        console.log('Analytics - Fetched users:', allUsers.length);
        return allUsers || [];
      } catch (error) {
        console.error('Error fetching users:', error);
        toast.error('Failed to load users');
        return [];
      }
    },
    initialData: [],
    refetchInterval: 3000, // Real-time updates every 3 seconds
    refetchOnWindowFocus: true,
  });

  const { data: analyses, refetch: refetchAnalyses, isLoading: loadingAnalyses } = useQuery({
    queryKey: ['all-analyses-analytics'],
    queryFn: async () => {
      try {
        const allAnalyses = await base44.entities.MLAnalysis.list('-created_date', 1000);
        console.log('Analytics - Fetched analyses:', allAnalyses.length);
        return allAnalyses || [];
      } catch (error) {
        console.error('Error fetching analyses:', error);
        toast.error('Failed to load training data');
        return [];
      }
    },
    initialData: [],
    refetchInterval: 3000, // Real-time updates every 3 seconds
    refetchOnWindowFocus: true,
  });

  const isLoading = loadingUsers || loadingAnalyses;

  // User role distribution
  const roleData = [
    { name: 'Super Admins', value: users.filter(u => u.is_super_admin || u.email === 'durjoychatterjee59@gmail.com' || u.email === 'dasriyanka858@gmail.com').length },
    { name: 'Admins', value: users.filter(u => u.is_admin && !u.is_super_admin).length },
    { name: 'Users', value: users.filter(u => !u.is_admin && !u.is_super_admin).length },
  ];

  // Training activity by user
  const userTrainingActivity = users.map(user => ({
    name: user.full_name || user.email.split('@')[0],
    email: user.email,
    trainings: analyses.filter(a => a.created_by === user.email).length,
  })).sort((a, b) => b.trainings - a.trainings).slice(0, 10);

  // Model usage distribution
  const modelUsage = {};
  analyses.forEach(a => {
    modelUsage[a.model_name] = (modelUsage[a.model_name] || 0) + 1;
  });
  const modelData = Object.entries(modelUsage).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);

  // Training over time (last 7 days)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date.toISOString().split('T')[0];
  });
  
  const trainingTimeline = last7Days.map(date => ({
    date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    trainings: analyses.filter(a => a.created_date.split('T')[0] === date).length,
  }));

  const avgAccuracy = analyses.length > 0 
    ? (analyses.reduce((sum, a) => sum + (a.accuracy || 0), 0) / analyses.length * 100).toFixed(1)
    : '0.0';

  const activeToday = analyses.filter(a => 
    new Date(a.created_date).toDateString() === new Date().toDateString()
  ).length;

  const handleRefresh = () => {
    refetchUsers();
    refetchAnalyses();
    toast.success('Data refreshed!');
  };

  return (
    <div className="space-y-6">
      {/* Refresh Button */}
      <div className="flex justify-end">
        <Button onClick={handleRefresh} variant="outline" disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4 mr-2" />
          )}
          Refresh Data
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { icon: Users, label: "Total Users", value: users.length, color: "from-blue-500 to-cyan-500" },
          { icon: Activity, label: "Total Trainings", value: analyses.length, color: "from-purple-500 to-pink-500" },
          { icon: TrendingUp, label: "Avg Accuracy", value: `${avgAccuracy}%`, color: "from-green-500 to-emerald-500" },
          { icon: Award, label: "Active Today", value: activeToday, color: "from-orange-500 to-red-500" },
        ].map((stat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card className="bg-white/80 backdrop-blur-sm border-white/50 shadow-lg">
              <CardContent className="p-6">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* User Role Distribution */}
        <Card className="bg-white/80 backdrop-blur-sm border-white/50 shadow-lg">
          <CardHeader>
            <CardTitle>User Role Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {users.length === 0 ? (
              <div className="h-[300px] flex items-center justify-center text-gray-500">
                No user data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={roleData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {roleData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Training Activity Timeline */}
        <Card className="bg-white/80 backdrop-blur-sm border-white/50 shadow-lg">
          <CardHeader>
            <CardTitle>Training Activity (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            {analyses.length === 0 ? (
              <div className="h-[300px] flex items-center justify-center text-gray-500">
                No training data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trainingTimeline}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="trainings" stroke="#8b5cf6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Top Users by Training */}
        <Card className="bg-white/80 backdrop-blur-sm border-white/50 shadow-lg">
          <CardHeader>
            <CardTitle>Top Users by Training Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {userTrainingActivity.length === 0 || userTrainingActivity.every(u => u.trainings === 0) ? (
              <div className="h-[300px] flex items-center justify-center text-gray-500">
                No training activity yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={userTrainingActivity.filter(u => u.trainings > 0)} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={120} />
                  <Tooltip />
                  <Bar dataKey="trainings" fill="#ec4899" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Model Usage */}
        <Card className="bg-white/80 backdrop-blur-sm border-white/50 shadow-lg">
          <CardHeader>
            <CardTitle>Most Popular Models</CardTitle>
          </CardHeader>
          <CardContent>
            {modelData.length === 0 ? (
              <div className="h-[300px] flex items-center justify-center text-gray-500">
                No model data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={modelData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Brain, LayoutDashboard, Shield, User, LogOut, Menu, X, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };
    fetchUser();
  }, []);

  const isSuperAdmin = user?.is_super_admin || 
    user?.email === 'durjoychatterjee59@gmail.com' || 
    user?.email === 'dasriyanka858@gmail.com';
  
  const isAdmin = user?.is_admin || isSuperAdmin;

  const navItems = [
    { name: "Dashboard", path: createPageUrl("Dashboard"), icon: LayoutDashboard },
    { name: "My Datasets", path: createPageUrl("DatasetLibrary"), icon: Database },
    { name: "Backend Code", path: createPageUrl("BackendDocs"), icon: Brain },
    { name: "Profile", path: createPageUrl("Profile"), icon: User },
    ...(isAdmin ? [{ name: "Admin Panel", path: createPageUrl("AdminPanel"), icon: Shield }] : []),
  ];

  const handleLogout = () => {
    base44.auth.logout(window.location.origin + createPageUrl("Landing"));
  };

  if (currentPageName === "Landing") {
    return children;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
      {/* Desktop Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-white/50 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to={createPageUrl("Dashboard")} className="flex items-center gap-3 group">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
                className="w-10 h-10 bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500 rounded-lg flex items-center justify-center shadow-lg"
              >
                <Brain className="w-6 h-6 text-white" />
              </motion.div>
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
                ML4YOU
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link key={item.name} to={item.path}>
                    <Button
                      variant={isActive ? "default" : "ghost"}
                      className={`gap-2 transition-all duration-300 ${
                        isActive
                          ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md"
                          : "hover:bg-purple-50"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {item.name}
                    </Button>
                  </Link>
                );
              })}
            </div>

            {/* User Menu */}
            <div className="hidden md:flex items-center gap-4">
              <div className="flex items-center gap-3 px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full border border-white/50">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-semibold text-sm">
                  {user?.full_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "U"}
                </div>
                <span className="text-sm font-medium text-gray-700">{user?.full_name || user?.email}</span>
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={handleLogout}
                className="rounded-full hover:bg-red-50 hover:text-red-600 hover:border-red-300 transition-all duration-300"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden border-t border-gray-200 bg-white/95 backdrop-blur-md overflow-hidden"
            >
              <div className="px-4 py-4 space-y-2">
                {/* User Info */}
                <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl mb-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-semibold">
                    {user?.full_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "U"}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{user?.full_name || "User"}</p>
                    <p className="text-xs text-gray-600">{user?.email}</p>
                  </div>
                </div>

                {/* Navigation Links */}
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.name}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Button
                        variant={isActive ? "default" : "ghost"}
                        className={`w-full justify-start gap-3 ${
                          isActive
                            ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                            : ""
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {item.name}
                      </Button>
                    </Link>
                  );
                })}

                {/* Logout Button */}
                <Button
                  variant="outline"
                  onClick={handleLogout}
                  className="w-full justify-start gap-3 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Main Content */}
      <motion.main
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {children}
      </motion.main>
    </div>
  );
}
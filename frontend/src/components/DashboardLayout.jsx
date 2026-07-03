import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { 
  LayoutDashboard, Briefcase, FileText, Bot, 
  Terminal, User, Settings, LogOut, Menu, X, 
  Bell, Moon, Sun, Shield, Users, Activity 
} from 'lucide-react';
import axios from 'axios';

const DashboardLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const { darkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  // Fetch candidate/user notifications
  const fetchNotifications = async () => {
    try {
      const res = await axios.get('/api/candidate/notifications');
      if (res.data.success) {
        setNotifications(res.data.data);
      }
    } catch (err) {
      console.warn('Error loading notifications:', err.message);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      // Poll notifications every 30 seconds
      const timer = setInterval(fetchNotifications, 30000);
      return () => clearInterval(timer);
    }
  }, [user]);

  const markAsRead = async (id) => {
    try {
      const res = await axios.put(`/api/candidate/notifications/${id}`);
      if (res.data.success) {
        setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  // Configure navigation based on role
  const getNavLinks = () => {
    if (!user) return [];
    
    const baseClass = "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium";
    const activeClass = "bg-primary-600 text-white shadow-lg shadow-primary-600/20";
    const inactiveClass = "text-slate-400 hover:text-white hover:bg-slate-800/40";

    const makeLink = (to, label, icon) => {
      const isActive = location.pathname === to;
      return (
        <Link 
          key={to} 
          to={to} 
          onClick={() => setSidebarOpen(false)}
          className={`${baseClass} ${isActive ? activeClass : inactiveClass}`}
        >
          {icon}
          <span>{label}</span>
        </Link>
      );
    };

    if (user.role === 'admin') {
      return [
        makeLink('/admin', 'Admin Dashboard', <LayoutDashboard size={18} />),
        makeLink('/admin/users', 'Manage Users', <Users size={18} />),
        makeLink('/admin/logs', 'Audit Logs', <Activity size={18} />),
        makeLink('/jobs', 'All Jobs', <Briefcase size={18} />),
        makeLink('/profile', 'Edit Profile', <User size={18} />)
      ];
    } else if (user.role === 'recruiter') {
      return [
        makeLink('/recruiter', 'Recruiter Board', <LayoutDashboard size={18} />),
        makeLink('/jobs', 'Manage Jobs', <Briefcase size={18} />),
        makeLink('/profile', 'Company Profile', <User size={18} />)
      ];
    } else {
      // Candidate
      return [
        makeLink('/candidate', 'Candidate Home', <LayoutDashboard size={18} />),
        makeLink('/jobs', 'Search Jobs', <Briefcase size={18} />),
        makeLink('/candidate/interview', 'AI Mock Interview', <Bot size={18} />),
        makeLink('/candidate/coding', 'Coding Test', <Terminal size={18} />),
        makeLink('/profile', 'Resume & Profile', <FileText size={18} />)
      ];
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Sidebar background overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 border-r transition-transform duration-300 lg:translate-x-0 
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
        ${darkMode ? 'bg-slate-950/70 border-slate-900 glass' : 'bg-white border-slate-100'}`}
      >
        <div className="h-20 flex items-center justify-between px-6 border-b border-slate-900/50">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary-600 to-amber-600 flex items-center justify-center font-display font-bold text-white text-lg shadow-md shadow-primary-600/30">
              H
            </div>
            <span className="font-display font-bold text-xl bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              HireGen <span className="text-primary-500 font-medium">AI</span>
            </span>
          </Link>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 lg:hidden"
          >
            <X size={18} />
          </button>
        </div>

        {/* Sidebar Nav Links */}
        <nav className="p-4 flex flex-col gap-1 h-[calc(100vh-160px)] overflow-y-auto">
          {getNavLinks()}
        </nav>

        {/* User logout section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-900/50 bg-slate-950/40">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 text-sm font-medium"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main content viewport */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        {/* Top Navbar */}
        <header className={`h-20 flex items-center justify-between px-6 md:px-8 border-b sticky top-0 z-30 backdrop-blur-md 
          ${darkMode ? 'bg-slate-950/70 border-slate-900/60' : 'bg-white/80 border-slate-100'}`}
        >
          {/* Left menu toggle for mobile */}
          <button 
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-xl border border-slate-800 bg-slate-900/50 hover:bg-slate-800 text-slate-400 lg:hidden"
          >
            <Menu size={20} />
          </button>
          
          <div className="hidden sm:flex items-center gap-2 text-sm text-slate-400">
            <span>Welcome back,</span>
            <span className="font-semibold text-white">{user?.name}</span>
            <span className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider 
              ${user?.role === 'admin' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 
                user?.role === 'recruiter' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 
                'bg-primary-500/10 text-primary-400 border border-primary-500/20'}`}
            >
              {user?.role}
            </span>
          </div>

          {/* Right Header items */}
          <div className="flex items-center gap-4">
            {/* Theme Toggle */}
            <button 
              onClick={toggleTheme}
              className="p-2.5 rounded-xl border border-slate-800/80 bg-slate-900/40 text-slate-400 hover:text-white transition-all hover:bg-slate-900/80"
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Notification Bell */}
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2.5 rounded-xl border border-slate-800/80 bg-slate-900/40 text-slate-400 hover:text-white transition-all hover:bg-slate-900/80 relative"
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-primary-600 rounded-full text-[9px] font-bold text-white flex items-center justify-center animate-bounce">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {showNotifications && (
                <div className={`absolute right-0 mt-3 w-80 rounded-2xl border shadow-xl overflow-hidden z-50
                  ${darkMode ? 'bg-slate-950 border-slate-900' : 'bg-white border-slate-200'}`}
                >
                  <div className="p-4 border-b border-slate-900/50 flex justify-between items-center bg-slate-950/80">
                    <span className="font-semibold text-sm">Notifications</span>
                    <span className="text-[11px] text-primary-400 font-semibold">{unreadCount} Unread</span>
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-900/30">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-xs text-slate-500">
                        No notifications yet.
                      </div>
                    ) : (
                      notifications.map(n => (
                        <div 
                          key={n._id} 
                          onClick={() => markAsRead(n._id)}
                          className={`p-4 text-xs transition-colors cursor-pointer flex flex-col gap-1 
                            ${!n.read ? (darkMode ? 'bg-slate-900/40 hover:bg-slate-900/70' : 'bg-slate-50 hover:bg-slate-100') : 'hover:bg-slate-900/20'}`}
                        >
                          <div className="flex justify-between items-start gap-2">
                            <span className={`font-semibold ${!n.read ? 'text-white' : 'text-slate-400'}`}>{n.title}</span>
                            {!n.read && <span className="w-2 h-2 rounded-full bg-primary-500 shrink-0 mt-1" />}
                          </div>
                          <p className="text-slate-400 leading-relaxed">{n.message}</p>
                          <span className="text-[10px] text-slate-500 mt-1">
                            {new Date(n.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* View Layout Children */}
        <main className="flex-1 p-6 md:p-8 flex flex-col">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;

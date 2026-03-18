import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { LogOut, Menu, X, Home, Users, Building, Calendar, MessageSquare, ClipboardList, User, Building2 } from 'lucide-react';

const Layout = ({ children }) => {
  const { role, logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getNavItems = () => {
    switch(role) {
      case 'admin':
        return [
          { name: 'Dashboard', path: '/admin-dashboard', icon: Home },
          { name: 'Hostels', path: '/admin-dashboard/hostels', icon: Building },
          { name: 'Wardens', path: '/admin-dashboard/wardens', icon: Users },
          { name: 'Students', path: '/admin-dashboard/students', icon: Users },
          { name: 'Feedback', path: '/admin-dashboard/feedback', icon: MessageSquare },
          { name: 'Profile', path: '/admin-dashboard/profile', icon: User },
        ];
      case 'warden':
        return [
          { name: 'Dashboard', path: '/warden-dashboard', icon: Home },
          { name: 'Requests', path: '/warden-dashboard/requests', icon: ClipboardList },
          { name: 'Attendance', path: '/warden-dashboard/attendance', icon: Calendar },
          { name: 'Absentees', path: '/warden-dashboard/absentees', icon: Users },
          { name: 'Students', path: '/warden-dashboard/students', icon: Users },
          { name: 'Feedback', path: '/warden-dashboard/feedback', icon: MessageSquare },
          { name: 'Profile', path: '/warden-dashboard/profile', icon: User },
        ];
      case 'student':
        return [
          { name: 'Dashboard', path: '/student-dashboard', icon: Home },
          { name: 'Profile', path: '/student-dashboard/profile', icon: User },
          { name: 'Attendance', path: '/student-dashboard/attendance', icon: Calendar },
          { name: 'Feedback', path: '/student-dashboard/feedback', icon: MessageSquare },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div 
        className={`fixed inset-y-0 left-0 z-30 w-64 glass-sidebar text-white transform transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between h-20 px-6 bg-slate-950/50 border-b border-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <Building2 size={20} className="text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">Hostel<span className="text-indigo-400">Hub</span></span>
          </div>
          <button className="lg:hidden text-gray-300 hover:text-white" onClick={() => setSidebarOpen(false)}>
            <X size={24} />
          </button>
        </div>

        <div className="px-4 py-6">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-4 px-3 flex items-center gap-2">
            <div className="h-px bg-slate-800 flex-1"></div>
            {role} Panel
            <div className="h-px bg-slate-800 flex-1"></div>
          </div>
          <nav className="space-y-1.5">
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => {
                  navigate(item.path);
                  setSidebarOpen(false);
                }}
                className={`flex items-center w-full px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                  location.pathname === item.path || (location.pathname.startsWith(item.path) && item.path !== `/${role}-dashboard`)
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20 translate-x-1'
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                }`}
              >
                <item.icon className={`mr-3 h-5 w-5 flex-shrink-0 ${location.pathname === item.path ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'}`} />
                {item.name}
              </button>
            ))}
          </nav>
        </div>

        <div className="absolute bottom-0 w-full p-4 border-t border-slate-800/50 bg-slate-950/30 backdrop-blur-sm">
          <button 
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-3 text-sm font-semibold text-rose-400 rounded-xl hover:bg-rose-500/10 transition-all duration-200 group"
          >
            <LogOut className="mr-3 h-5 w-5 group-hover:scale-110 transition-transform" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 h-16 z-10 lg:hidden">
          <div className="flex items-center justify-between h-full px-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
            >
              <Menu size={24} />
            </button>
            <div className="flex items-center gap-2">
              <Building2 size={20} className="text-indigo-600" />
              <span className="text-lg font-bold text-slate-900">HostelHub</span>
            </div>
            <div className="w-10"></div> {/* Spacer for centering */}
          </div>
        </header>

        {/* Main Workspace */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;

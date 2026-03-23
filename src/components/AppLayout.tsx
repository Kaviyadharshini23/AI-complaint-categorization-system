import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { store } from '@/lib/store';
import { GraduationCap, FileText, MessageSquare, BarChart3, Bell, LogOut, Home, Users, Settings } from 'lucide-react';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const unread = user ? store.getUnreadCount(user.id) : 0;

  const handleLogout = () => { logout(); navigate('/'); };

  const isAdmin = user?.role === 'admin';
  const roleLabel = user?.role === 'faculty' ? 'Faculty' : user?.role === 'student' ? 'Student' : 'Admin';

  const links = isAdmin
    ? [
        { to: '/dashboard', icon: <Home className="w-5 h-5" />, label: 'Dashboard' },
        { to: '/complaints', icon: <FileText className="w-5 h-5" />, label: 'All Complaints' },
        { to: '/analytics', icon: <BarChart3 className="w-5 h-5" />, label: 'Analytics' },
        { to: '/notifications', icon: <Bell className="w-5 h-5" />, label: 'Notifications', badge: unread },
      ]
    : [
        { to: '/dashboard', icon: <Home className="w-5 h-5" />, label: 'Dashboard' },
        { to: '/submit', icon: <FileText className="w-5 h-5" />, label: 'Submit Complaint' },
        { to: '/chatbot', icon: <MessageSquare className="w-5 h-5" />, label: 'AI Chatbot' },
        { to: '/my-complaints', icon: <BarChart3 className="w-5 h-5" />, label: 'My Complaints' },
        { to: '/notifications', icon: <Bell className="w-5 h-5" />, label: 'Notifications', badge: unread },
      ];

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 flex flex-col" style={{ background: 'var(--gradient-sidebar)' }}>
        <div className="p-5 border-b" style={{ borderColor: 'hsl(var(--sidebar-border))' }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'hsl(var(--sidebar-primary))' }}>
              <GraduationCap className="w-5 h-5" style={{ color: 'hsl(var(--sidebar-primary-foreground))' }} />
            </div>
            <div>
              <h1 className="text-sm font-bold" style={{ color: 'hsl(var(--sidebar-foreground))' }}>AI Categorization</h1>
              <p className="text-xs" style={{ color: 'hsl(var(--sidebar-foreground) / 0.6)' }}>{roleLabel} Portal</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {links.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              {link.icon}
              <span className="flex-1">{link.label}</span>
              {link.badge ? (
                <span className="w-5 h-5 rounded-full text-xs flex items-center justify-center font-bold" style={{ background: 'hsl(var(--destructive))', color: 'hsl(var(--destructive-foreground))' }}>
                  {link.badge}
                </span>
              ) : null}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t" style={{ borderColor: 'hsl(var(--sidebar-border))' }}>
          <div className="px-3 py-2 mb-2">
            <p className="text-sm font-medium truncate" style={{ color: 'hsl(var(--sidebar-foreground))' }}>{user?.name}</p>
            <p className="text-xs truncate" style={{ color: 'hsl(var(--sidebar-foreground) / 0.6)' }}>{user?.email}</p>
          </div>
          <button onClick={handleLogout} className="sidebar-link w-full text-left">
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        <div className="p-6 lg:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}

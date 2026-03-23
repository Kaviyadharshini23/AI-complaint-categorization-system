import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { store } from '@/lib/store';
import { FileText, Clock, CheckCircle, AlertTriangle, TrendingUp, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function UserDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  if (!user) return null;
  const complaints = store.getUserComplaints(user.id);
  const pending = complaints.filter(c => c.status === 'pending').length;
  const inProgress = complaints.filter(c => c.status === 'in-progress').length;
  const resolved = complaints.filter(c => c.status === 'resolved').length;
  const recent = [...complaints].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);

  const stats = [
    { label: 'Total', value: complaints.length, icon: <FileText className="w-5 h-5" />, color: 'text-primary' },
    { label: 'Pending', value: pending, icon: <Clock className="w-5 h-5" />, color: 'text-accent' },
    { label: 'In Progress', value: inProgress, icon: <TrendingUp className="w-5 h-5" />, color: 'text-info' },
    { label: 'Resolved', value: resolved, icon: <CheckCircle className="w-5 h-5" />, color: 'text-success' },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Welcome, {user.name}</h1>
          <p className="text-muted-foreground">{user.role === 'faculty' ? 'Faculty' : 'Student'} • {user.department}</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => navigate('/submit')}><FileText className="w-4 h-4 mr-2" />New Complaint</Button>
          <Button variant="outline" onClick={() => navigate('/chatbot')}><MessageSquare className="w-4 h-4 mr-2" />AI Chatbot</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(s => (
          <div key={s.label} className="stat-card">
            <div className={`${s.color}`}>{s.icon}</div>
            <p className="text-2xl font-bold text-foreground">{s.value}</p>
            <p className="text-sm text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="card-elevated">
        <div className="p-5 border-b">
          <h2 className="font-semibold text-foreground">Recent Complaints</h2>
        </div>
        {recent.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <FileText className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>No complaints yet. Submit your first complaint!</p>
          </div>
        ) : (
          <div className="divide-y">
            {recent.map(c => (
              <div key={c.id} className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{c.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{c.category} • {new Date(c.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <span className={`badge-priority-${c.priority}`}>{c.priority}</span>
                  <span className={`badge-status-${c.status === 'in-progress' ? 'progress' : c.status}`}>
                    {c.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

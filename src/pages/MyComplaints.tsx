import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { store } from '@/lib/store';
import { FileText } from 'lucide-react';

export default function MyComplaints() {
  const { user } = useAuth();
  if (!user) return null;
  const complaints = [...store.getUserComplaints(user.id)].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-1">My Complaints</h1>
      <p className="text-muted-foreground mb-6">Track the status of all your submitted complaints</p>

      {complaints.length === 0 ? (
        <div className="card-elevated p-12 text-center">
          <FileText className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />
          <p className="text-muted-foreground">No complaints submitted yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {complaints.map(c => (
            <div key={c.id} className="card-elevated p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground">{c.title}</h3>
                  <p className="text-sm text-muted-foreground mt-0.5">{new Date(c.createdAt).toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <span className={`badge-priority-${c.priority}`}>{c.priority}</span>
                  <span className={`badge-status-${c.status === 'in-progress' ? 'progress' : c.status}`}>{c.status}</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-3">{c.description}</p>
              <div className="flex flex-wrap gap-4 text-xs">
                <span className="text-muted-foreground">📂 {c.category}</span>
                <span className="text-muted-foreground">🔑 {c.keywords.join(', ')}</span>
              </div>
              {c.suggestion && (
                <div className="mt-3 p-3 rounded-lg bg-primary/5 border border-primary/10">
                  <p className="text-xs text-muted-foreground"><span className="font-medium text-primary">💡 Suggestion:</span> {c.suggestion}</p>
                </div>
              )}
              {c.adminNotes && (
                <div className="mt-3 p-3 rounded-lg bg-success/5 border border-success/10">
                  <p className="text-xs text-muted-foreground"><span className="font-medium" style={{ color: 'hsl(152 60% 30%)' }}>📝 Admin Notes:</span> {c.adminNotes}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

import React, { useState } from 'react';
import { store } from '@/lib/store';
import { useAuth } from '@/hooks/useAuth';
import { Complaint, Status, Category, Priority } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FileText, Search, Eye, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminComplaints() {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState<string>('all');
  const [filterPri, setFilterPri] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selected, setSelected] = useState<Complaint | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [, setRefresh] = useState(0);

  const complaints = store.getComplaints();
  const filtered = complaints.filter(c => {
    if (filterCat !== 'all' && c.category !== filterCat) return false;
    if (filterPri !== 'all' && c.priority !== filterPri) return false;
    if (filterStatus !== 'all' && c.status !== filterStatus) return false;
    if (search && !c.title.toLowerCase().includes(search.toLowerCase()) && !c.userName.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const updateStatus = (id: string, status: Status) => {
    store.updateComplaint(id, { status, adminNotes: adminNotes || undefined });
    const complaint = complaints.find(c => c.id === id);
    if (complaint) {
      store.addNotification({
        id: crypto.randomUUID(), userId: complaint.userId,
        message: `Your complaint "${complaint.title}" status updated to ${status}`,
        read: false, complaintId: id, createdAt: new Date().toISOString(),
      });
    }
    toast.success(`Status updated to ${status}`);
    setSelected(null);
    setAdminNotes('');
    setRefresh(r => r + 1);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-1">AI Categorized Complaints</h1>
      <p className="text-muted-foreground mb-6">Manage AI-categorized complaints</p>

      {/* Filters */}
      <div className="card-elevated p-4 mb-6">
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search complaints..." className="pl-9" />
            </div>
          </div>
          <Select value={filterCat} onValueChange={setFilterCat}>
            <SelectTrigger className="w-[160px]"><SelectValue placeholder="Category" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {['Infrastructure','Academic','IT','Administrative','Hostel','Library','Laboratory','Other'].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filterPri} onValueChange={setFilterPri}>
            <SelectTrigger className="w-[140px]"><SelectValue placeholder="Priority" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[140px]"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="card-elevated overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left p-3 font-medium text-muted-foreground">Complaint</th>
                <th className="text-left p-3 font-medium text-muted-foreground">User</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Category</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Priority</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Status</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Date</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">No complaints found</td></tr>
              ) : filtered.map(c => (
                <tr key={c.id} className="border-b hover:bg-muted/30 transition-colors">
                  <td className="p-3 max-w-[200px]">
                    <p className="font-medium text-foreground truncate">{c.title}</p>
                  </td>
                  <td className="p-3">
                    <p className="text-foreground">{c.userName}</p>
                    <p className="text-xs text-muted-foreground">{c.userRole} • {c.department}</p>
                  </td>
                  <td className="p-3"><span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{c.category}</span></td>
                  <td className="p-3"><span className={`badge-priority-${c.priority}`}>{c.priority}</span></td>
                  <td className="p-3"><span className={`badge-status-${c.status === 'in-progress' ? 'progress' : c.status}`}>{c.status}</span></td>
                  <td className="p-3 text-muted-foreground">{new Date(c.createdAt).toLocaleDateString()}</td>
                  <td className="p-3">
                    <Button size="sm" variant="outline" onClick={() => { setSelected(c); setAdminNotes(c.adminNotes || ''); }}>
                      <Eye className="w-3 h-3 mr-1" /> View
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Dialog */}
      <Dialog open={!!selected} onOpenChange={open => { if (!open) setSelected(null); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Complaint Details</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-foreground">{selected.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{selected.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-muted-foreground">User:</span> <span className="font-medium text-foreground">{selected.userName}</span></div>
                <div><span className="text-muted-foreground">Role:</span> <span className="font-medium text-foreground capitalize">{selected.userRole}</span></div>
                <div><span className="text-muted-foreground">Category:</span> <span className="font-medium text-foreground">{selected.category}</span></div>
                <div><span className="text-muted-foreground">Priority:</span> <span className={`badge-priority-${selected.priority}`}>{selected.priority}</span></div>
                <div><span className="text-muted-foreground">Department:</span> <span className="font-medium text-foreground">{selected.department}</span></div>
                <div><span className="text-muted-foreground">Date:</span> <span className="font-medium text-foreground">{new Date(selected.createdAt).toLocaleString()}</span></div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Keywords: {selected.keywords.join(', ')}</p>
                <p className="text-sm text-muted-foreground">Suggestion: {selected.suggestion}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Admin Notes</label>
                <Textarea value={adminNotes} onChange={e => setAdminNotes(e.target.value)} placeholder="Add notes..." rows={3} className="mt-1" />
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => updateStatus(selected.id, 'pending')} className="flex-1">
                  <Clock className="w-3 h-3 mr-1" /> Pending
                </Button>
                <Button size="sm" variant="outline" onClick={() => updateStatus(selected.id, 'in-progress')} className="flex-1" style={{ borderColor: 'hsl(200 80% 50%)', color: 'hsl(200 80% 35%)' }}>
                  <AlertTriangle className="w-3 h-3 mr-1" /> In Progress
                </Button>
                <Button size="sm" onClick={() => updateStatus(selected.id, 'resolved')} className="flex-1" style={{ background: 'hsl(152 60% 40%)' }}>
                  <CheckCircle className="w-3 h-3 mr-1" /> Resolve
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { store } from '@/lib/store';
import { classifyComplaint } from '@/lib/ai-classifier';
import { Complaint, Category } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Send, Sparkles, Tag, AlertTriangle, Lightbulb } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const categories: Category[] = ['Infrastructure', 'Academic', 'IT', 'Administrative', 'Hostel', 'Library', 'Laboratory', 'Other'];

export default function SubmitComplaint() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [manualCategory, setManualCategory] = useState<Category | ''>('');
  const [analysis, setAnalysis] = useState<ReturnType<typeof classifyComplaint> | null>(null);

  const handleAnalyze = () => {
    if (!description.trim()) return;
    const result = classifyComplaint(`${title} ${description}`);
    setAnalysis(result);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !title || !description) return;
    const ai = analysis || classifyComplaint(`${title} ${description}`);
    const complaint: Complaint = {
      id: crypto.randomUUID(),
      userId: user.id,
      userName: user.name,
      userRole: user.role as 'faculty' | 'student',
      department: user.department || '',
      title,
      description,
      category: (manualCategory || ai.category) as Category,
      priority: ai.priority,
      status: 'pending',
      keywords: ai.keywords,
      suggestion: ai.suggestion,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    store.addComplaint(complaint);
    // Notify admins from the same department
    const admins = store.getUsers().filter(u => u.role === 'admin' && u.department === user.department);
    admins.forEach(a => {
      store.addNotification({ id: crypto.randomUUID(), userId: a.id, message: `New ${ai.priority} priority complaint: "${title}" from ${user.name}`, read: false, complaintId: complaint.id, createdAt: new Date().toISOString() });
    });
    toast.success('Complaint submitted successfully!');
    navigate('/my-complaints');
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-1">Submit Complaint</h1>
      <p className="text-muted-foreground mb-6">Describe your issue and our AI will classify it automatically</p>

      <div className="grid lg:grid-cols-5 gap-6">
        <form onSubmit={handleSubmit} className="lg:col-span-3 card-elevated p-6 space-y-5">
          <div>
            <Label>Title</Label>
            <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Brief description of the issue" required />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Provide detailed information about your complaint..." rows={5} required />
          </div>
          <div>
            <Label>Category (optional override)</Label>
            <Select value={manualCategory} onValueChange={v => setManualCategory(v as Category)}>
              <SelectTrigger><SelectValue placeholder="Auto-detect by AI" /></SelectTrigger>
              <SelectContent>
                {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={handleAnalyze} disabled={!description}>
              <Sparkles className="w-4 h-4 mr-2" /> Analyze with AI
            </Button>
            <Button type="submit" disabled={!title || !description}>
              <Send className="w-4 h-4 mr-2" /> Submit
            </Button>
          </div>
        </form>

        {/* AI Analysis Panel */}
        <div className="lg:col-span-2 space-y-4">
          {analysis ? (
            <>
              <div className="card-elevated p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold text-foreground">AI Analysis</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Category</span>
                    <span className="text-sm font-medium bg-primary/10 text-primary px-2.5 py-0.5 rounded-full">{analysis.category}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Priority</span>
                    <span className={`badge-priority-${analysis.priority}`}>{analysis.priority.toUpperCase()}</span>
                  </div>
                </div>
              </div>
              <div className="card-elevated p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Tag className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold text-foreground">Keywords</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {analysis.keywords.map(k => (
                    <span key={k} className="text-xs bg-muted text-muted-foreground px-2.5 py-1 rounded-full">{k}</span>
                  ))}
                </div>
              </div>
              <div className="card-elevated p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb className="w-5 h-5 text-accent" />
                  <h3 className="font-semibold text-foreground">Suggestion</h3>
                </div>
                <p className="text-sm text-muted-foreground">{analysis.suggestion}</p>
              </div>
            </>
          ) : (
            <div className="card-elevated p-8 text-center">
              <Sparkles className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Enter your complaint details and click "Analyze with AI" to see classification results</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

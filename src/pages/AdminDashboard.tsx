import React from 'react';
import { store } from '@/lib/store';
import { FileText, Users, AlertTriangle, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['hsl(220,65%,42%)', 'hsl(38,92%,50%)', 'hsl(152,60%,40%)', 'hsl(200,80%,50%)', 'hsl(0,72%,51%)', 'hsl(270,60%,50%)', 'hsl(160,60%,45%)', 'hsl(30,80%,50%)'];

export default function AdminDashboard() {
  const complaints = store.getComplaints();
  const users = store.getUsers();
  const pending = complaints.filter(c => c.status === 'pending').length;
  const inProgress = complaints.filter(c => c.status === 'in-progress').length;
  const resolved = complaints.filter(c => c.status === 'resolved').length;
  const highPriority = complaints.filter(c => c.priority === 'high').length;

  const stats = [
    { label: 'Total Complaints', value: complaints.length, icon: <FileText className="w-5 h-5" />, color: 'text-primary' },
    { label: 'Pending', value: pending, icon: <Clock className="w-5 h-5" />, color: 'text-accent' },
    { label: 'In Progress', value: inProgress, icon: <TrendingUp className="w-5 h-5" />, color: 'text-info' },
    { label: 'Resolved', value: resolved, icon: <CheckCircle className="w-5 h-5" />, color: 'text-success' },
    { label: 'High Priority', value: highPriority, icon: <AlertTriangle className="w-5 h-5" />, color: 'text-destructive' },
    { label: 'Total Users', value: users.length, icon: <Users className="w-5 h-5" />, color: 'text-primary' },
  ];

  // Category data
  const catMap: Record<string, number> = {};
  complaints.forEach(c => { catMap[c.category] = (catMap[c.category] || 0) + 1; });
  const catData = Object.entries(catMap).map(([name, value]) => ({ name, value }));

  // Priority data
  const priData = [
    { name: 'High', value: complaints.filter(c => c.priority === 'high').length },
    { name: 'Medium', value: complaints.filter(c => c.priority === 'medium').length },
    { name: 'Low', value: complaints.filter(c => c.priority === 'low').length },
  ];

  // Keywords
  const kwMap: Record<string, number> = {};
  complaints.forEach(c => c.keywords.forEach(k => { kwMap[k] = (kwMap[k] || 0) + 1; }));
  const topKeywords = Object.entries(kwMap).sort((a, b) => b[1] - a[1]).slice(0, 10);

  return (
    <div>
<h1 className="text-2xl font-bold text-foreground mb-1">AI Complaint Categorization System</h1>
      <p className="text-muted-foreground mb-6">AI-powered overview and categorization of complaints</p>

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        {stats.map(s => (
          <div key={s.label} className="stat-card">
            <div className={s.color}>{s.icon}</div>
            <p className="text-2xl font-bold text-foreground">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Category Chart */}
        <div className="card-elevated p-5">
          <h3 className="font-semibold text-foreground mb-4">Complaints by Category</h3>
          {catData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={catData}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" fill="hsl(220,65%,42%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-muted-foreground text-center py-12">No data yet</p>}
        </div>

        {/* Priority Pie */}
        <div className="card-elevated p-5">
          <h3 className="font-semibold text-foreground mb-4">Priority Distribution</h3>
          {priData.some(d => d.value > 0) ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={priData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                  {priData.map((_, i) => <Cell key={i} fill={['hsl(0,72%,51%)', 'hsl(38,92%,50%)', 'hsl(152,60%,40%)'][i]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : <p className="text-muted-foreground text-center py-12">No data yet</p>}
        </div>
      </div>

      {/* Top Keywords */}
      <div className="card-elevated p-5">
        <h3 className="font-semibold text-foreground mb-4">Top Keywords</h3>
        {topKeywords.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {topKeywords.map(([kw, count]) => (
              <span key={kw} className="text-sm bg-primary/10 text-primary px-3 py-1.5 rounded-full font-medium">
                {kw} <span className="text-primary/60">({count})</span>
              </span>
            ))}
          </div>
        ) : <p className="text-muted-foreground">No keywords yet</p>}
      </div>
    </div>
  );
}

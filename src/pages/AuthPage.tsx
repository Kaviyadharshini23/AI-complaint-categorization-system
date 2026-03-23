import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Role } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { GraduationCap, Users, Shield, LogIn, UserPlus } from 'lucide-react';

export default function AuthPage() {
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'faculty' as Role, department: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (isLogin) {
      const err = login(form.email, form.password);
      if (err) setError(err);
    } else {
      if (!form.name || !form.email || !form.password) { setError('All fields are required'); return; }
      const err = register({ name: form.name, email: form.email, password: form.password, role: form.role, department: form.department });
      if (err) setError(err);
    }
  };

  const roles: { value: Role; label: string; icon: React.ReactNode; desc: string }[] = [
    { value: 'faculty', label: 'Faculty', icon: <GraduationCap className="w-5 h-5" />, desc: 'Submit & track complaints' },
    { value: 'student', label: 'Student', icon: <Users className="w-5 h-5" />, desc: 'Submit & track complaints' },
    { value: 'admin', label: 'Admin', icon: <Shield className="w-5 h-5" />, desc: 'Manage & resolve' },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-12" style={{ background: 'var(--gradient-primary)' }}>
        <div className="max-w-md text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary-foreground/20 flex items-center justify-center mx-auto mb-6">
            <GraduationCap className="w-8 h-8" style={{ color: 'hsl(0 0% 100%)' }} />
          </div>
          <h1 className="text-4xl font-bold mb-4" style={{ color: 'hsl(0 0% 100%)' }}>AI Complaint Categorization System</h1>
          <p className="text-lg opacity-90" style={{ color: 'hsl(0 0% 100% / 0.85)' }}>
            Intelligent complaint management for educational institutions
          </p>
          <div className="mt-8 grid grid-cols-2 gap-4 text-left">
            {['AI Classification', 'Voice Input', 'Real-time Tracking', 'Smart Suggestions'].map(f => (
              <div key={f} className="flex items-center gap-2 rounded-lg px-3 py-2" style={{ background: 'hsl(0 0% 100% / 0.12)' }}>
                <div className="w-2 h-2 rounded-full" style={{ background: 'hsl(38 92% 50%)' }} />
                <span className="text-sm font-medium" style={{ color: 'hsl(0 0% 100%)' }}>{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8 text-center">
            <h1 className="text-2xl font-bold text-foreground">AI Complaint Categorization System</h1>
          </div>

          <h2 className="text-2xl font-bold text-foreground mb-1">{isLogin ? 'Welcome back' : 'Create account'}</h2>
          <p className="text-muted-foreground mb-6">{isLogin ? 'Sign in to your account' : 'Register to get started'}</p>

          {error && <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <div>
                  <Label>Full Name</Label>
                  <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="John Doe" />
                </div>
                <div>
                  <Label>Role</Label>
                  <div className="grid grid-cols-3 gap-2 mt-1.5">
                    {roles.map(r => (
                      <button
                        key={r.value}
                        type="button"
                        onClick={() => setForm({ ...form, role: r.value })}
                        className={`flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-all text-sm ${form.role === r.value ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'}`}
                      >
                        {r.icon}
                        <span className="font-medium">{r.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <Label>Department</Label>
                  <Input value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} placeholder="Computer Science" />
                </div>
              </>
            )}
            <div>
              <Label>Email</Label>
              <Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="you@institution.edu" />
            </div>
            <div>
              <Label>Password</Label>
              <Input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="••••••••" />
            </div>
            <Button type="submit" className="w-full" size="lg">
              {isLogin ? <><LogIn className="w-4 h-4 mr-2" /> Sign In</> : <><UserPlus className="w-4 h-4 mr-2" /> Create Account</>}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <button onClick={() => { setIsLogin(!isLogin); setError(''); }} className="text-primary font-medium hover:underline">
              {isLogin ? 'Register' : 'Sign in'}
            </button>
          </p>

          {isLogin && (
            <div className="mt-6 p-4 rounded-lg bg-muted">
              <p className="text-xs text-muted-foreground font-medium mb-2">Demo Credentials:</p>
              <p className="text-xs text-muted-foreground">Admin: admin@facultyflow.com / admin123</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

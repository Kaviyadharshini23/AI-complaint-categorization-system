import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { store } from '@/lib/store';
import { classifyComplaint } from '@/lib/ai-classifier';
import { Complaint } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Mic, MicOff, Bot, User, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface Message {
  role: 'bot' | 'user';
  text: string;
}

type Stage = 'greeting' | 'collecting' | 'confirm' | 'done';

export default function AIChatbot() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    { role: 'bot', text: `Hello ${user?.name}! 👋 I'm your AI assistant. Tell me about your complaint and I'll classify it automatically.\n\nYou can type or use the 🎙️ microphone button to speak.` },
  ]);
  const [input, setInput] = useState('');
  const [stage, setStage] = useState<Stage>('greeting');
  const [collectedText, setCollectedText] = useState<string[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [analysis, setAnalysis] = useState<ReturnType<typeof classifyComplaint> | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const addMsg = (role: 'bot' | 'user', text: string) => setMessages(prev => [...prev, { role, text }]);

  const handleSend = () => {
    if (!input.trim()) return;
    const text = input.trim();
    setInput('');
    addMsg('user', text);

    if (stage === 'greeting' || stage === 'collecting') {
      const newCollected = [...collectedText, text];
      setCollectedText(newCollected);
      const combined = newCollected.join('. ');
      const result = classifyComplaint(combined);
      setAnalysis(result);
      setStage('confirm');

      setTimeout(() => {
        addMsg('bot', `Here's my analysis:\n\n📂 **Category:** ${result.category}\n⚡ **Priority:** ${result.priority.toUpperCase()}\n🔑 **Keywords:** ${result.keywords.join(', ')}\n💡 **Suggestion:** ${result.suggestion}\n\nWould you like me to submit this complaint? (yes/no)\nOr add more details.`);
      }, 300);
    } else if (stage === 'confirm') {
      const lower = text.toLowerCase();
      if (lower.includes('yes') || lower.includes('submit')) {
        submitComplaint();
      } else if (lower.includes('no') || lower.includes('cancel')) {
        setStage('greeting');
        setCollectedText([]);
        setAnalysis(null);
        setTimeout(() => addMsg('bot', 'No problem! Feel free to describe a new complaint.'), 300);
      } else {
        const newCollected = [...collectedText, text];
        setCollectedText(newCollected);
        const combined = newCollected.join('. ');
        const result = classifyComplaint(combined);
        setAnalysis(result);
        setTimeout(() => {
          addMsg('bot', `Updated analysis:\n\n📂 **Category:** ${result.category}\n⚡ **Priority:** ${result.priority.toUpperCase()}\n🔑 **Keywords:** ${result.keywords.join(', ')}\n💡 **Suggestion:** ${result.suggestion}\n\nSubmit? (yes/no)`);
        }, 300);
      }
    } else if (stage === 'done') {
      setStage('greeting');
      setCollectedText([]);
      setAnalysis(null);
      const newCollected = [text];
      setCollectedText(newCollected);
      const result = classifyComplaint(text);
      setAnalysis(result);
      setStage('confirm');
      setTimeout(() => {
        addMsg('bot', `New analysis:\n\n📂 **Category:** ${result.category}\n⚡ **Priority:** ${result.priority.toUpperCase()}\n🔑 **Keywords:** ${result.keywords.join(', ')}\n💡 **Suggestion:** ${result.suggestion}\n\nSubmit? (yes/no)`);
      }, 300);
    }
  };

  const submitComplaint = () => {
    if (!user || !analysis) return;
    const combined = collectedText.join('. ');
    const complaint: Complaint = {
      id: crypto.randomUUID(),
      userId: user.id,
      userName: user.name,
      userRole: user.role as 'faculty' | 'student',
      department: user.department || '',
      title: combined.slice(0, 80),
      description: combined,
      category: analysis.category,
      priority: analysis.priority,
      status: 'pending',
      keywords: analysis.keywords,
      suggestion: analysis.suggestion,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    store.addComplaint(complaint);
    const admins = store.getUsers().filter(u => u.role === 'admin');
    admins.forEach(a => {
      store.addNotification({ id: crypto.randomUUID(), userId: a.id, message: `New complaint: "${complaint.title}" from ${user.name}`, read: false, complaintId: complaint.id, createdAt: new Date().toISOString() });
    });
    setStage('done');
    toast.success('Complaint submitted!');
    setTimeout(() => addMsg('bot', '✅ Complaint submitted successfully! You can track it in "My Complaints". Tell me if you have another issue.'), 300);
  };

  // Voice
  const toggleVoice = () => {
    if (isListening) { recognitionRef.current?.stop(); setIsListening(false); return; }
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) { toast.error('Speech recognition not supported. Use Chrome.'); return; }
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.onresult = (e: any) => {
      const transcript = Array.from(e.results).map((r: any) => r[0].transcript).join('');
      setInput(transcript);
    };
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-1">AI Chatbot</h1>
      <p className="text-muted-foreground mb-6">Register complaints through conversation with voice support</p>

      <div className="card-elevated flex flex-col" style={{ height: 'calc(100vh - 220px)' }}>
        {/* Messages */}
        <div className="flex-1 overflow-auto p-4 space-y-4">
          {messages.map((m, i) => (
            <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : ''}`}>
              {m.role === 'bot' && (
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-primary/10">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
              )}
              <div className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap ${m.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'}`}>
                {m.text}
              </div>
              {m.role === 'user' && (
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-primary">
                  <User className="w-4 h-4 text-primary-foreground" />
                </div>
              )}
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="border-t p-4">
          <div className="flex gap-2">
            <Button type="button" variant="outline" size="icon" onClick={toggleVoice} className={isListening ? 'ring-2 ring-destructive animate-pulse' : ''}>
              {isListening ? <MicOff className="w-4 h-4 text-destructive" /> : <Mic className="w-4 h-4" />}
            </Button>
            <Input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder={isListening ? 'Listening...' : 'Type your complaint...'}
            />
            <Button onClick={handleSend} disabled={!input.trim()}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
          {isListening && <p className="text-xs text-destructive mt-2 animate-pulse">🎙️ Recording... speak your complaint</p>}
        </div>
      </div>
    </div>
  );
}

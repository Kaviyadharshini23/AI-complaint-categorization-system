import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { store } from '@/lib/store';
import { Bell, CheckCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotificationsPage() {
  const { user } = useAuth();
  const [, setRefresh] = React.useState(0);
  if (!user) return null;

  const notifications = [...store.getNotifications(user.id)].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = () => { store.markAllRead(user.id); setRefresh(r => r + 1); };
  const markRead = (id: string) => { store.markRead(id); setRefresh(r => r + 1); };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
          <p className="text-muted-foreground">{unreadCount} unread</p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" onClick={markAllRead}><CheckCheck className="w-4 h-4 mr-2" />Mark all read</Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="card-elevated p-12 text-center">
          <Bell className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />
          <p className="text-muted-foreground">No notifications yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map(n => (
            <div
              key={n.id}
              onClick={() => markRead(n.id)}
              className={`card-elevated p-4 cursor-pointer transition-colors ${!n.read ? 'border-l-4 border-l-primary bg-primary/[0.02]' : 'opacity-70'}`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className={`text-sm ${!n.read ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>{n.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                </div>
                {!n.read && <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

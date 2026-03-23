import { User, Complaint, Notification } from './types';

const USERS_KEY = 'ff_users';
const COMPLAINTS_KEY = 'ff_complaints';
const NOTIFICATIONS_KEY = 'ff_notifications';
const CURRENT_USER_KEY = 'ff_current_user';

function get<T>(key: string, fallback: T): T {
  try {
    const d = localStorage.getItem(key);
    return d ? JSON.parse(d) : fallback;
  } catch { return fallback; }
}
function set(key: string, val: unknown) {
  localStorage.setItem(key, JSON.stringify(val));
}

// Seed default admin
function seedDefaults() {
  const users = get<User[]>(USERS_KEY, []);
  if (!users.find(u => u.email === 'admin@facultyflow.com')) {
    users.push({ id: 'admin-1', name: 'Admin', email: 'admin@facultyflow.com', role: 'admin', password: 'admin123', department: 'Administration' });
    set(USERS_KEY, users);
  }
}
seedDefaults();

export const store = {
  // Auth
  getUsers: () => get<User[]>(USERS_KEY, []),
  addUser: (u: User) => { const users = get<User[]>(USERS_KEY, []); users.push(u); set(USERS_KEY, users); },
  findUser: (email: string, password: string) => get<User[]>(USERS_KEY, []).find(u => u.email === email && u.password === password),
  emailExists: (email: string) => get<User[]>(USERS_KEY, []).some(u => u.email === email),
  getCurrentUser: () => get<User | null>(CURRENT_USER_KEY, null),
  setCurrentUser: (u: User | null) => set(CURRENT_USER_KEY, u),

  // Complaints
  getComplaints: () => get<Complaint[]>(COMPLAINTS_KEY, []),
  addComplaint: (c: Complaint) => { const cs = get<Complaint[]>(COMPLAINTS_KEY, []); cs.push(c); set(COMPLAINTS_KEY, cs); },
  updateComplaint: (id: string, updates: Partial<Complaint>) => {
    const cs = get<Complaint[]>(COMPLAINTS_KEY, []);
    const idx = cs.findIndex(c => c.id === id);
    if (idx >= 0) { cs[idx] = { ...cs[idx], ...updates, updatedAt: new Date().toISOString() }; set(COMPLAINTS_KEY, cs); }
  },
  getUserComplaints: (userId: string) => get<Complaint[]>(COMPLAINTS_KEY, []).filter(c => c.userId === userId),

  // Notifications
  getNotifications: (userId: string) => get<Notification[]>(NOTIFICATIONS_KEY, []).filter(n => n.userId === userId),
  addNotification: (n: Notification) => { const ns = get<Notification[]>(NOTIFICATIONS_KEY, []); ns.push(n); set(NOTIFICATIONS_KEY, ns); },
  markRead: (id: string) => {
    const ns = get<Notification[]>(NOTIFICATIONS_KEY, []);
    const idx = ns.findIndex(n => n.id === id);
    if (idx >= 0) { ns[idx].read = true; set(NOTIFICATIONS_KEY, ns); }
  },
  markAllRead: (userId: string) => {
    const ns = get<Notification[]>(NOTIFICATIONS_KEY, []);
    ns.forEach(n => { if (n.userId === userId) n.read = true; });
    set(NOTIFICATIONS_KEY, ns);
  },
  getUnreadCount: (userId: string) => get<Notification[]>(NOTIFICATIONS_KEY, []).filter(n => n.userId === userId && !n.read).length,
};

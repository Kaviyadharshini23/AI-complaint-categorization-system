import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/lib/types';
import { store } from '@/lib/store';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => string | null;
  register: (user: Omit<User, 'id'>) => string | null;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(store.getCurrentUser());

  const login = (email: string, password: string): string | null => {
    const found = store.findUser(email, password);
    if (!found) return 'Invalid email or password';
    setUser(found);
    store.setCurrentUser(found);
    return null;
  };

  const register = (userData: Omit<User, 'id'>): string | null => {
    if (store.emailExists(userData.email)) return 'Email already exists';
    const newUser: User = { ...userData, id: crypto.randomUUID() };
    store.addUser(newUser);
    setUser(newUser);
    store.setCurrentUser(newUser);
    return null;
  };

  const logout = () => { setUser(null); store.setCurrentUser(null); };

  return <AuthContext.Provider value={{ user, login, register, logout }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, NotificationItem } from '../types';
import { api } from '../services/api';
import { sound } from '../utils/audio';

export interface ToastItem {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'jackpot';
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAdmin: boolean;
  soundEnabled: boolean;
  toggleSound: () => void;
  login: (username: string, password: string) => Promise<void>;
  register: (data: { username: string; fullName: string; dni: string; email?: string; phone?: string }) => Promise<void>;
  logout: () => void;
  refreshBalance: () => Promise<number | undefined>;
  updateUserBalanceDirect: (newBalance: number) => void;
  quickSwitchUser: (username: 'demo-player' | 'jugador1' | 'admin') => Promise<void>;
  notifications: NotificationItem[];
  unreadNotifsCount: number;
  markNotificationsAsRead: () => void;
  addToast: (title: string, message: string, type?: 'success' | 'error' | 'info' | 'jackpot') => void;
  activeToast: { title: string; message: string; type: string } | null;
  clearToast: () => void;
  toasts: ToastItem[];
  removeToast: (id: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(api.getToken());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadNotifsCount, setUnreadNotifsCount] = useState<number>(0);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [activeToast, setActiveToast] = useState<{ title: string; message: string; type: string } | null>(null);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((title: string, message: string, type: 'success' | 'error' | 'info' | 'jackpot' = 'info') => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 6);
    const newToast: ToastItem = { id, title, message, type };
    
    setToasts((prev) => [...prev.slice(-4), newToast]);
    setActiveToast({ title, message, type });

    if (type === 'jackpot') {
      sound.playJackpot();
    } else if (type === 'success') {
      sound.playWin();
    }

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
      setActiveToast((prev) => (prev?.title === title ? null : prev));
    }, 5500);
  }, []);

  const clearToast = useCallback(() => {
    setActiveToast(null);
    setToasts([]);
  }, []);

  const toggleSound = useCallback(() => {
    const updated = sound.toggleSound();
    setSoundEnabled(updated);
  }, []);

  // Fetch current user if token exists, or auto-login with default player
  useEffect(() => {
    const initAuth = async () => {
      try {
        setIsLoading(true);
        if (token) {
          const res = await api.getMe();
          setUser(res.user);
        } else {
          // Default start logged in as VIP Argentine player "demo-player" for seamless instant exploration
          const res = await api.login('demo-player', 'demo-player-password-change-me');
          api.setToken(res.token);
          setToken(res.token);
          setUser(res.user);
        }
      } catch {
        // fallback to guest or fresh login
        api.removeToken();
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  // Polling notifications periodically
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await api.getNotifications();
        setNotifications(res.notifications);
        const unread = res.notifications.filter((n) => !n.read).length;
        setUnreadNotifsCount(unread);
      } catch {
        // silent
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 12000);
    return () => clearInterval(interval);
  }, []);

  const login = async (username: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await api.login(username, password);
      api.setToken(res.token);
      setToken(res.token);
      setUser(res.user);
      addToast('Bienvenido a La Clave', `Sesión iniciada con éxito como ${res.user.fullName || res.user.username}.`, 'success');
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: { username: string; fullName: string; dni: string; email?: string; phone?: string }) => {
    setIsLoading(true);
    try {
      const res = await api.register(data);
      api.setToken(res.token);
      setToken(res.token);
      setUser(res.user);
      addToast('¡Registro Exitoso!', res.message, 'success');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    api.removeToken();
    setToken(null);
    setUser(null);
    addToast('Sesión Cerrada', 'Has cerrado sesión correctamente.', 'info');
  };

  const refreshBalance = async () => {
    if (!token) return;
    try {
      const res = await api.getBalance();
      setUser((prev) => (prev ? { ...prev, chipBalance: res.chipBalance } : null));
      return res.chipBalance;
    } catch {
      // silent
    }
  };

  const updateUserBalanceDirect = (newBalance: number) => {
    setUser((prev) => (prev ? { ...prev, chipBalance: newBalance } : null));
  };

  const quickSwitchUser = async (username: 'demo-player' | 'jugador1' | 'admin') => {
    const passwords: Record<string, string> = {
      demo-player: 'demo-player-password-change-me',
      jugador1: 'demo-player-password-change-me',
      admin: 'demo-admin-password-change-me',
    };
    await login(username, passwords[username]);
  };

  const markNotificationsAsRead = () => {
    setUnreadNotifsCount(0);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAdmin: user?.role === 'admin',
    soundEnabled,
    toggleSound,
    login,
    register,
    logout,
    refreshBalance,
    updateUserBalanceDirect,
    quickSwitchUser,
    notifications,
    unreadNotifsCount,
    markNotificationsAsRead,
    addToast,
    activeToast,
    clearToast,
    toasts,
    removeToast,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

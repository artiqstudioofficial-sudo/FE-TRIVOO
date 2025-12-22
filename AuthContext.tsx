// src/AuthContext.tsx
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { authService } from './services/authService';
import { AgentSpecialization, AuthUser, UserRole } from './types';

type LoginResult = {
  success: boolean;
  user?: AuthUser;
  message?: string;
};

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<LoginResult>;
  logout: () => Promise<void>;
  refreshMe: () => Promise<void>;
  updateUser: (partial: Partial<AuthUser>) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function normalize_user(api_user: any): AuthUser {
  const verification_status = api_user?.verification_status;

  return {
    id: api_user.id,
    name: api_user.name,
    avatar: api_user.avatar ?? null,
    email: api_user.email,
    role: api_user.role as UserRole,
    specialization: (api_user.specialization ?? null) as AgentSpecialization | null,
    verification_status,
  };
}

const CACHE_KEY = 'trivgoo_user_cache';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, set_user] = useState<AuthUser | null>(null);
  const [is_loading, set_is_loading] = useState(true);

  const persist_user = (u: AuthUser | null) => {
    set_user(u);
    if (u) localStorage.setItem(CACHE_KEY, JSON.stringify(u));
    else localStorage.removeItem(CACHE_KEY);
  };

  const refresh_me = async () => {
    try {
      const api_user = await authService.me(); // <- satu pintu
      persist_user(normalize_user(api_user));
    } catch (e) {
      // 401 / session expired -> logout local
      persist_user(null);
    }
  };

  useEffect(() => {
    // optional: hydrate dari cache biar UI gak kosong
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) set_user(JSON.parse(cached));
    } catch {
      localStorage.removeItem(CACHE_KEY);
    }

    (async () => {
      await refresh_me();
      set_is_loading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const update_user = (partial: Partial<AuthUser>) => {
    set_user((prev) => {
      if (!prev) return prev;
      const merged = { ...prev, ...partial };
      localStorage.setItem(CACHE_KEY, JSON.stringify(merged));
      return merged;
    });
  };

  const login = async (email: string, password: string): Promise<LoginResult> => {
    try {
      const api_user = await authService.login({ email, password }); // <- satu pintu
      const u = normalize_user(api_user);
      persist_user(u);
      return { success: true, user: u };
    } catch (e: any) {
      return { success: false, message: e?.message || 'Login failed' };
    }
  };

  const logout = async () => {
    try {
      await authService.logout(); // <- satu pintu
    } catch (e) {
      // ignore network error, tetap clear local
      console.error('[AUTH] logout error:', e);
    } finally {
      persist_user(null);
    }
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: !!user,
      isLoading: is_loading,
      login,
      logout,
      refreshMe: refresh_me,
      updateUser: update_user,
    }),
    [user, is_loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

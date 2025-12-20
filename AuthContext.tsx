import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { AgentSpecialization, UserRole, VerificationStatus } from './types';

const API_BASE_URL = 'http://localhost:4000';
const AUTH_BASE_URL = `${API_BASE_URL}/api/v1/auth`;

export type AuthUser = {
  id: number;
  name: string;
  avatar: string;
  email: string;
  role: UserRole;
  specialization?: AgentSpecialization | null;
  verificationStatus?: VerificationStatus;
};

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

// helper: normalisasi response user dari API
function normalizeUserFromApi(apiUser: any): AuthUser {
  const verificationStatus = (apiUser.verificationStatus ||
    apiUser.verification_status ||
    VerificationStatus.UNVERIFIED) as VerificationStatus;

  return {
    id: apiUser.id,
    name: apiUser.name,
    avatar: apiUser.avatar,
    email: apiUser.email,
    role: apiUser.role as UserRole,
    specialization: (apiUser.specialization ?? null) as AgentSpecialization | null,
    verificationStatus,
  };
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // optional: kalau mau “cache” UI (bukan auth), boleh simpan user.
  // tapi sumber kebenaran tetap /me
  const persistUser = (u: AuthUser | null) => {
    setUser(u);
    if (u) localStorage.setItem('trivgoo_user_cache', JSON.stringify(u));
    else localStorage.removeItem('trivgoo_user_cache');
  };

  const refreshMe = async () => {
    try {
      const res = await fetch(`${AUTH_BASE_URL}/me`, {
        method: 'GET',
        credentials: 'include', // ✅ WAJIB untuk session cookie
      });

      const json = await res.json().catch(() => null);

      // kalau 401, berarti belum login / session expired
      if (!res.ok || json?.error) {
        persistUser(null);
        return;
      }

      const apiUser = json?.data?.user ?? json?.data; // jaga-jaga format beda
      if (!apiUser) {
        persistUser(null);
        return;
      }

      persistUser(normalizeUserFromApi(apiUser));
    } catch (e) {
      // kalau network error, jangan paksa logout (biar UX enak)
      console.error('[AUTH] refreshMe error:', e);
    }
  };

  useEffect(() => {
    // optional: tampilkan cache dulu biar UI gak kosong
    try {
      const cached = localStorage.getItem('trivgoo_user_cache');
      if (cached) setUser(JSON.parse(cached));
    } catch {
      localStorage.removeItem('trivgoo_user_cache');
    }

    // sumber kebenaran: session di server
    (async () => {
      await refreshMe();
      setIsLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateUser = (partial: Partial<AuthUser>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const merged = { ...prev, ...partial };
      localStorage.setItem('trivgoo_user_cache', JSON.stringify(merged));
      return merged;
    });
  };

  const login = async (email: string, password: string): Promise<LoginResult> => {
    try {
      const res = await fetch(`${AUTH_BASE_URL}/login`, {
        method: 'POST',
        credentials: 'include', // ✅ biar Set-Cookie sid disimpan browser
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const json = await res.json();

      if (!res.ok || json.error) {
        return { success: false, message: json.message || 'Login failed' };
      }

      // backend kamu ngembaliin user di json.data.user (tanpa token)
      const apiUser = json?.data?.user ?? json?.data;
      const u = normalizeUserFromApi(apiUser);

      persistUser(u);

      return { success: true, user: u };
    } catch (e: any) {
      console.error(e);
      return { success: false, message: e?.message || 'Network error' };
    }
  };

  const logout = async () => {
    try {
      // hit server buat destroy session (Redis)
      await fetch(`${AUTH_BASE_URL}/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (e) {
      console.error('[AUTH] logout error:', e);
    } finally {
      persistUser(null);
    }
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      logout,
      refreshMe,
      updateUser,
    }),
    [user, isLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

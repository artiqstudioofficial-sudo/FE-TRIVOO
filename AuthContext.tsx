import React, { createContext, useContext, useEffect, useState } from 'react';
import { AgentSpecialization, UserRole, VerificationStatus } from './types';

const API_BASE_URL = 'http://localhost:4000';
const AUTH_BASE_URL = `${API_BASE_URL}/api/v1/auth`;

export type AuthUser = {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  specialization?: AgentSpecialization | null;
  verificationStatus?: VerificationStatus; // <-- tambahin ini
  token: string;
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
  logout: () => void;
  setUserFromApi: (payload: { token: string; user: any }) => void;
  updateUser: (partial: Partial<AuthUser>) => void; // <-- tambahin ini
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('trivgoo_auth');
      if (raw) {
        const parsed = JSON.parse(raw) as AuthUser;
        setUser(parsed);
      }
    } catch (e) {
      console.error('Failed to parse trivgoo_auth', e);
      localStorage.removeItem('trivgoo_auth');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const persistUser = (u: AuthUser | null) => {
    setUser(u);
    if (u) {
      localStorage.setItem('trivgoo_auth', JSON.stringify(u));
      // optional: kalau kamu pakai axios interceptor baca dari "token"
      localStorage.setItem('token', u.token);
    } else {
      localStorage.removeItem('trivgoo_auth');
      localStorage.removeItem('token');
    }
  };

  const setUserFromApi = (payload: { token: string; user: any }) => {
    const verificationStatus = (payload.user.verificationStatus ||
      payload.user.verification_status ||
      VerificationStatus.UNVERIFIED) as VerificationStatus;

    const u: AuthUser = {
      id: payload.user.id,
      name: payload.user.name,
      email: payload.user.email,
      role: payload.user.role as UserRole,
      specialization: payload.user.specialization as AgentSpecialization | null,
      verificationStatus,
      token: payload.token,
    };

    persistUser(u);
  };

  const updateUser = (partial: Partial<AuthUser>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const merged: AuthUser = { ...prev, ...partial };
      // sync ke localStorage juga
      localStorage.setItem('trivgoo_auth', JSON.stringify(merged));
      localStorage.setItem('token', merged.token);
      return merged;
    });
  };

  const login = async (email: string, password: string): Promise<LoginResult> => {
    try {
      const res = await fetch(`${AUTH_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const json = await res.json();

      if (!res.ok || json.error) {
        return {
          success: false,
          message: json.message || 'Login failed',
        };
      }

      setUserFromApi(json.data);

      const verificationStatus = json.data.user.verification_status;

      console.log(verificationStatus);

      const u: AuthUser = {
        id: json.data.user.id,
        name: json.data.user.name,
        email: json.data.user.email,
        role: json.data.user.role as UserRole,
        specialization: json.data.user.specialization as AgentSpecialization | null,
        verificationStatus,
        token: json.data.token,
      };

      return { success: true, user: u };
    } catch (e: any) {
      console.error(e);
      return {
        success: false,
        message: e?.message || 'Network error',
      };
    }
  };

  const logout = () => {
    persistUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        setUserFromApi,
        updateUser, // <-- jangan lupa expose di sini
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
};

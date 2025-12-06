import React, { createContext, useContext, useEffect, useState } from 'react';
import { AgentSpecialization, UserRole } from './types';

const API_BASE_URL = 'http://localhost:4000';

type AuthUser = {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  specialization?: AgentSpecialization | null;
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
  login: (email: string, password: string) => Promise<LoginResult>;
  logout: () => void;
  setUserFromApi: (payload: { token: string; user: any }) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);

  // restore dari localStorage
  useEffect(() => {
    const raw = localStorage.getItem('trivgoo_auth');
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as AuthUser;
      setUser(parsed);
    } catch {
      localStorage.removeItem('trivgoo_auth');
    }
  }, []);

  const setUserFromApi = (payload: { token: string; user: any }) => {
    const u: AuthUser = {
      id: payload.user.id,
      name: payload.user.name,
      email: payload.user.email,
      role: payload.user.role as UserRole,
      specialization: payload.user.specialization as AgentSpecialization | null,
      token: payload.token,
    };
    setUser(u);
    localStorage.setItem('trivgoo_auth', JSON.stringify(u));
  };

  const login = async (email: string, password: string): Promise<LoginResult> => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
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

      const u: AuthUser = {
        id: json.data.user.id,
        name: json.data.user.name,
        email: json.data.user.email,
        role: json.data.user.role as UserRole,
        specialization: json.data.user.specialization as AgentSpecialization | null,
        token: json.data.token,
      };

      return { success: true, user: u };
    } catch (e: any) {
      return {
        success: false,
        message: e?.message || 'Network error',
      };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('trivgoo_auth');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        setUserFromApi,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

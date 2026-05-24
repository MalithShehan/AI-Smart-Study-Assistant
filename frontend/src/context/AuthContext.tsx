import React, { createContext, useContext, useState, useCallback } from 'react';
import { apiPost, setAuthToken } from '../api/client';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  isEmailVerified: boolean;
  profileImage: { url: string | null; publicId: string | null } | null;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>(null!);

export const useAuth = (): AuthContextType => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const _applyAuth = (data: { accessToken: string; user: AuthUser }) => {
    setToken(data.accessToken);
    setAuthToken(data.accessToken);
    setUser(data.user);
  };

  const login = useCallback(async (email: string, password: string) => {
    const data = await apiPost('/auth/login', { email, password });
    _applyAuth(data);
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const data = await apiPost('/auth/register', { name, email, password });
    _applyAuth(data);
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setAuthToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, token, isAuthenticated: !!token, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

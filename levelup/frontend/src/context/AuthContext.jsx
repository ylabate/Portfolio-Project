import { createContext, useContext, useState } from 'react';
import api from '../api';

const AuthContext = createContext(null);

function decodeJwt(token) {
  try {
    const payload = token?.split('.')?.[1];
    if (!payload) return null;

    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(normalized.length + (4 - (normalized.length % 4)) % 4, '=');
    return JSON.parse(atob(padded));
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const u = localStorage.getItem('user');
    if (!u) return null;

    const parsedUser = JSON.parse(u);
    const token = localStorage.getItem('token') || localStorage.getItem('access_token');
    const tokenClaims = token ? decodeJwt(token) : null;

    return {
      ...parsedUser,
      is_admin: parsedUser.is_admin ?? tokenClaims?.is_admin ?? false,
    };
  });

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password }, { _skipToast: true });
    const tokenClaims = decodeJwt(data.access_token);
    const isAdmin = data.user.is_admin ?? tokenClaims?.is_admin ?? false;
    localStorage.setItem('token', data.access_token);
    localStorage.setItem('access_token', data.access_token);
    localStorage.setItem('refresh_token', data.refresh_token);
    localStorage.setItem('user', JSON.stringify({
      id: data.user.id,
      username: data.user.username,
      is_admin: isAdmin
    }));
    setUser({ id: data.user.id, username: data.user.username, is_admin: isAdmin });
    return data;
  };

  const register = async (username, email, password) => {
    const { data } = await api.post('/auth/register', { username, email, password }, { _skipToast: true });
    const tokenClaims = decodeJwt(data.access_token);
    const isAdmin = data.user.is_admin ?? tokenClaims?.is_admin ?? false;
    localStorage.setItem('token', data.access_token);
    localStorage.setItem('access_token', data.access_token);
    localStorage.setItem('refresh_token', data.refresh_token);
    localStorage.setItem('user', JSON.stringify({
      id: data.user.id,
      username: data.user.username,
      is_admin: isAdmin
    }));
    setUser({ id: data.user.id, username: data.user.username, is_admin: isAdmin });
    return data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
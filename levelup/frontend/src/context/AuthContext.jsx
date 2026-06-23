import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const u = localStorage.getItem('user');
    return u ? JSON.parse(u) : null;
  });

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password }, { _skipToast: true });
    localStorage.setItem('token', data.access_token);
    localStorage.setItem('user', JSON.stringify({ id: data.user.id, username: data.user.username }));
    setUser({ id: data.user.id, username: data.user.username });
    return data;
  };

  const register = async (username, email, password) => {
    const { data } = await api.post('/auth/register', { username, email, password }, { _skipToast: true });
    localStorage.setItem('token', data.access_token);
    localStorage.setItem('user', JSON.stringify({ id: data.user.id, username: data.user.username }));
    setUser({ id: data.user.id, username: data.user.username });
    return data;
  };

  const logout = () => {
    localStorage.removeItem('token');
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

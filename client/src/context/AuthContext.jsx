import { createContext, useContext, useEffect, useState } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On page load, ask the backend who the saved token belongs to.
  useEffect(() => {
    if (!localStorage.getItem('token')) { setLoading(false); return; }
    api.get('/auth/me')
      .then((res) => setUser(res.data.user))
      .catch(() => localStorage.removeItem('token'))
      .finally(() => setLoading(false));
  }, []);

  const saveSession = (data) => {
    localStorage.setItem('token', data.token);
    setUser(data.user);
    return data.user;
  };

  const login = async (schoolId, password) => saveSession((await api.post('/auth/login', { schoolId, password })).data);
  const register = async (form) => saveSession((await api.post('/auth/register', form)).data);
  const logout = () => { localStorage.removeItem('token'); setUser(null); };

  return <AuthContext.Provider value={{ user, loading, login, register, logout }}>{children}</AuthContext.Provider>;
}

import { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token) {
      setCarregando(false);
      return;
    }
    auth.me()
      .then(setUsuario)
      .catch(() => {
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
      })
      .finally(() => setCarregando(false));
  }, []);

  const login = async (email, senha, manterLogado) => {
    const data = await auth.login(email, senha);
    if (manterLogado) {
      localStorage.setItem('token', data.token);
    } else {
      sessionStorage.setItem('token', data.token);
    }
    setUsuario(data.usuario);
  };

  const logout = () => {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    setUsuario(null);
  };

  return (
    <AuthContext.Provider value={{ usuario, carregando, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi } from '../lib/api';
import type { User, AuthContextType } from '../lib/types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [password, setPassword] = useState<string | null>(null);

  useEffect(() => {
    const storedUser = sessionStorage.getItem('cryptora_user');
    const storedPassword = sessionStorage.getItem('cryptora_password');
    if (storedUser && storedPassword) {
      setUser(JSON.parse(storedUser));
      setPassword(storedPassword);
    }
  }, []);

  const login = async (alias: string, pwd: string) => {
    const response = await authApi.login({ alias, password: pwd });
    if (response.success && response.user) {
      setUser(response.user);
      setPassword(pwd);
      sessionStorage.setItem('cryptora_user', JSON.stringify(response.user));
      sessionStorage.setItem('cryptora_password', pwd);
    } else {
      throw new Error(response.message);
    }
  };

  const register = async (alias: string, pwd: string) => {
    const user = await authApi.register({ alias, password: pwd });
    setUser(user);
    setPassword(pwd);
    sessionStorage.setItem('cryptora_user', JSON.stringify(user));
    sessionStorage.setItem('cryptora_password', pwd);
  };

  const logout = () => {
    setUser(null);
    setPassword(null);
    sessionStorage.removeItem('cryptora_user');
    sessionStorage.removeItem('cryptora_password');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        password,
        login,
        register,
        logout,
        isAuthenticated: !!user && !!password,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

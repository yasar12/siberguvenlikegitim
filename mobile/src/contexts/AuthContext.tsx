import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { login, getDashboardData } from '../services/api';
import { router } from 'expo-router';

interface User {
  id: number;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  const handleLogout = async () => {
    try {
      setUser(null);
      await AsyncStorage.clear();
      router.navigate('/login');
    } catch (error) {
      console.error('Çıkış hatası:', error);
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('user');
        const storedToken = await AsyncStorage.getItem('token');

        if (storedUser && storedToken) {
          setUser(JSON.parse(storedUser));
          try {
            const dashboardData = await getDashboardData();
            console.log('Dashboard verisi başarıyla alındı');
          } catch (error: any) {
            if (error.message === 'UNAUTHORIZED' || error.message === 'Oturum bulunamadı') {
              console.log('Token geçersiz veya oturum süresi doldu');
              await handleLogout();
            }
          }
        } else {
          router.navigate('/login');
        }
      } catch (error) {
        console.error('Başlatma hatası:', error);
        await handleLogout();
      } finally {
        setLoading(false);
        setIsInitialized(true);
      }
    };

    initializeAuth();
  }, []);

  const handleLogin = async (email: string, password: string) => {
    try {
      const response = await login(email, password);
      const { user, token } = response;

      await AsyncStorage.setItem('user', JSON.stringify(user));
      await AsyncStorage.setItem('token', token);

      setUser(user);
      router.navigate('/');
    } catch (error) {
      console.error('Giriş hatası:', error);
      throw error;
    }
  };

  if (!isInitialized) {
    return null;
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login: handleLogin,
        logout: handleLogout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 
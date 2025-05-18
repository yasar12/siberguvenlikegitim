import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { login, register, getDashboardData, User, verifyEmail } from '../services/api';
import { router } from 'expo-router';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  verifyEmail: (code: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Kullanıcı durumunda değişiklik olduğunda yönlendirme yap
  useEffect(() => {
    if (!loading) {
      // Eğer kullanıcı null ise ve yükleme tamamlandıysa, ana sayfaya yönlendir
      if (!user) {
        // Eğer zaten auth sayfalarında değilsek, ana sayfaya yönlendir
        const pathname = window.location?.pathname || '';
        if (!pathname.includes('/(auth)') && !pathname.includes('/login') && !pathname.includes('/register')) {
          // Rota root ise bir şey yapma (zaten app/index.tsx yönlendirecek)
          if (pathname !== '/' && pathname !== '') {
            router.replace('/');
          }
        }
      }
    }
  }, [user, loading]);

  const handleLogout = async () => {
    try {
      setLoading(true);
      
      // 1. Önce state'i temizle - Bu UI'ın hemen güncellemesini sağlar
      setUser(null);
      
      // 2. Local storage'ı temizle
      await AsyncStorage.multiRemove(['user', 'token']);
      
      // 3. Sonra API'ye logout isteği gönder
      try {
        await fetch('http://localhost:3000/api/auth/logout', {
          method: 'POST',
          credentials: 'include'
        });
      } catch (apiError) {
        // API hatası olsa bile devam et
        console.error('API logout hatası (devam ediliyor):', apiError);
      }

      // 4. Navigation stack'i tamamen temizle ve en başa dön
      // Bu, tüm ekran geçmişini temizler ve sadece login ekranını gösterir
      router.replace('/');
    } catch (error) {
      console.error('Çıkış hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const [storedUser, storedToken] = await Promise.all([
          AsyncStorage.getItem('user'),
          AsyncStorage.getItem('token')
        ]);

        if (!storedUser || !storedToken) {
          setLoading(false);
          return;
        }

        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
        } catch (error: any) {
          if (error.response?.status === 401 || error.message === 'UNAUTHORIZED') {
            await handleLogout();
          }
        }
      } catch (error) {
        console.error('Başlatma hatası:', error);
        await handleLogout();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const handleLogin = async (email: string, password: string) => {
    try {
      setLoading(true);
      const response = await login(email, password);
      const { user, token } = response;

      await AsyncStorage.multiSet([
        ['user', JSON.stringify(user)],
        ['token', token]
      ]);

      setUser(user);
      
      // Login sonrası navigation stack'i temizleyerek ana sayfaya git
      router.replace('/(app)');
    } catch (error) {
      console.error('Giriş hatası:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (email: string, password: string, name: string) => {
    try {
      setLoading(true);
      console.log('Kayıt isteği gönderiliyor:', { email, name });
      const response = await register(email, password, name);
      console.log('Kayıt yanıtı:', response);
      
      if (!response.success) {
        throw new Error(response.message || 'Kayıt işlemi başarısız oldu');
      }

      await AsyncStorage.setItem('pendingEmail', email);
      router.replace('/(auth)/verify-email');
    } catch (error: any) {
      console.error('Kayıt hatası:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEmail = async (code: string) => {
    try {
      setLoading(true);
      
      const pendingEmail = await AsyncStorage.getItem('pendingEmail');
      if (!pendingEmail) {
        throw new Error('E-posta adresi bulunamadı. Lütfen tekrar kayıt olun.');
      }
      
      console.log('Doğrulama isteği gönderiliyor:', { email: pendingEmail, code });
      
      const response = await verifyEmail(code);
      console.log('Doğrulama yanıtı:', response);
      
      if (!response.success) {
        throw new Error(response.message || 'Doğrulama işlemi başarısız oldu');
      }

      if (response.token && response.user) {
        await AsyncStorage.setItem('token', response.token);
        await AsyncStorage.setItem('user', JSON.stringify(response.user));
        setUser(response.user);
        
        await AsyncStorage.removeItem('pendingEmail');
        
        // Doğrulama sonrası navigation stack'i temizleyerek ana sayfaya git
        router.replace('/(app)');
      } else {
        throw new Error('Geçersiz sunucu yanıtı: Token veya kullanıcı bilgisi eksik');
      }
    } catch (error: any) {
      console.error('Doğrulama hatası:', error);
      throw new Error(error.response?.data?.message || error.message || 'Doğrulama işlemi başarısız oldu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login: handleLogin,
        register: handleRegister,
        logout: handleLogout,
        verifyEmail: handleVerifyEmail
      }}
    >
      {children}
    </AuthContext.Provider>
  );
} 
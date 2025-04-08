import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { useAuth } from '../src/contexts/AuthContext';
import { colors } from '../src/constants/colors';

export default function Index() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    console.log('Index sayfası render edildi');
    console.log('Loading durumu:', loading);
    console.log('Kullanıcı durumu:', user ? 'Giriş yapılmış' : 'Giriş yapılmamış');

    if (!loading) {
      if (user) {
        console.log('Kullanıcı oturumu açık, dashboard\'a yönlendiriliyorum...');
        router.replace('/dashboard');
      } else {
        console.log('Kullanıcı oturumu kapalı, login sayfasına yönlendiriliyorum...');
        router.replace('/login');
      }
    }
  }, [loading, user]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
} 
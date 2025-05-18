import { Stack } from 'expo-router';
import { colors } from '../../src/constants/colors';
import { useEffect } from 'react';
import { BackHandler } from 'react-native';

export default function AuthLayout() {
  // Android'de geri tuşunu özelleştir
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      // Sadece belirli yerlerde engelleyebiliriz
      return false; // Varsayılan davranışa izin ver
    });

    return () => backHandler.remove();
  }, []);
  
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        // Animasyonu kapat - sayfalar arası geçişte animasyon yaratabilir
        animation: 'none',
        // Herhangi bir gesture'ı devre dışı bırak
        gestureEnabled: false,
        // Auth sayfalarında geri gitmeyi engelle
        headerBackVisible: false,
        headerLeft: () => null,
      }}
    >
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="verify-email" />
      <Stack.Screen name="index" />
    </Stack>
  );
} 
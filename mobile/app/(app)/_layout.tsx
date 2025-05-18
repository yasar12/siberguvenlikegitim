import React from 'react';
import { Tabs } from 'expo-router';
import { colors } from '../../src/constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { BackHandler } from 'react-native';
import { useEffect } from 'react';

export default function AppLayout() {
  // Android'de geri tuşunu devre dışı bırak (kullanıcının geri gitmesini engellemek için)
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      // Geri tuşuna basıldığında true döndürüyoruz ki varsayılan davranışı engellemiş olalım
      return true;
    });

    return () => backHandler.remove();
  }, []);
  
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: colors.border,
        },
        headerShown: true,
        headerStyle: {
          backgroundColor: colors.card,
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        // Geri butonunu kaldır - tüm tab sayfalarda
        headerBackVisible: false,
        headerLeft: () => null,
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Ana Sayfa',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="pathways"
        options={{
          title: 'Yollar',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="map-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
      {/* index sayfasını görünmez yap */}
      <Tabs.Screen
        name="index"
        options={{
          href: null, // Bu sayfa linki devre dışı bırakır
          tabBarItemStyle: { display: 'none' }, // Tab bar'da görünmez
        }}
      />
    </Tabs>
  );
} 
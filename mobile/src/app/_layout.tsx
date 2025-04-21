import React, { useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { Stack, useRouter, useSegments, Slot } from 'expo-router';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import BottomTabBar from '../components/BottomTabBar';

function RootLayoutNav() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const currentPath = segments[0];
    const protectedRoutes = ['profile', 'dashboard', 'pathways', 'career'];
    const isProtectedRoute = protectedRoutes.includes(currentPath);
    const isLoginPage = currentPath === 'login';

    if (!user) {
      if (isProtectedRoute || currentPath === undefined) {
        router.replace('/login');
      }
    } else {
      if (isLoginPage) {
        router.replace('/');
      }
    }
  }, [user, loading, segments]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.container}>
        <Slot />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Slot />
      <BottomTabBar />
    </View>
  );
}

export default function Layout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
}); 
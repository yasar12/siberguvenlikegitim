import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function BottomTabBar() {
  const router = useRouter();
  const pathname = usePathname();

  const tabs = [
    {
      name: 'dashboard',
      label: 'Ana Sayfa',
      icon: 'home',
      path: '/dashboard'
    },
    {
      name: 'pathways',
      label: 'Yollar',
      icon: 'map',
      path: '/pathways'
    },
    {
      name: 'profile',
      label: 'Profil',
      icon: 'person',
      path: '/profile'
    }
  ];

  return (
    <View style={styles.container}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.name}
          style={styles.tab}
          onPress={() => router.push(tab.path)}
        >
          <Ionicons
            name={pathname === tab.path ? tab.icon as any : `${tab.icon}-outline` as any}
            size={24}
            color={pathname === tab.path ? '#4CAF50' : '#666'}
          />
          <Text style={[
            styles.label,
            pathname === tab.path && styles.activeLabel
          ]}>
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingBottom: 20,
    paddingTop: 10,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  activeLabel: {
    color: '#4CAF50',
  },
}); 
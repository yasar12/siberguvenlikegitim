import React from 'react';
import { Stack } from 'expo-router';
import VerifyEmailScreen from '../../screens/VerifyEmailScreen';

export default function VerifyEmail() {
  return (
    <>
      <Stack.Screen 
        options={{ 
          headerShown: false,
          gestureEnabled: false,
          animation: 'none',
          presentation: 'modal'
        }} 
      />
      <VerifyEmailScreen />
    </>
  );
} 
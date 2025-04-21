import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import LoadingSpinner from '../components/LoadingSpinner';
import { authService } from '../services/api';

const Logo = () => (
  <Svg width="120" height="120" viewBox="0 0 120 120">
    <Circle cx="60" cy="60" r="50" fill="#2E7D32" />
    <Path d="M60 30 L90 90 L30 90 Z" fill="white" />
    <Circle cx="60" cy="60" r="15" fill="#2E7D32" />
  </Svg>
);

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Hata', 'Lütfen e-posta ve şifrenizi giriniz.');
      return;
    }

    try {
      setLoading(true);
      const response = await authService.login(email, password);
      console.log('Login successful:', response);
      // TODO: Token'ı kaydet ve ana sayfaya yönlendir
    } catch (error: any) {
      Alert.alert('Hata', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = () => {
    // Kayıt sayfasına yönlendirme
    console.log('Navigate to register');
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.logoContainer}>
        <Logo />
        <Text style={styles.title}>Siber Güvenlik Eğitim Platformu</Text>
      </View>

      <View style={styles.formContainer}>
        <CustomInput
          placeholder="E-posta"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        
        <CustomInput
          placeholder="Şifre"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <CustomButton
          title="Giriş Yap"
          onPress={handleLogin}
        />

        <CustomButton
          title="Hesap Oluştur"
          type="secondary"
          onPress={handleRegister}
        />
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginTop: 20,
  },
  formContainer: {
    paddingHorizontal: 20,
  },
});

export default LoginScreen; 
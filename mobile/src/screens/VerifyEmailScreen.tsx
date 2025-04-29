import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, SafeAreaView } from 'react-native';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../contexts/AuthContext';
import { router } from 'expo-router';

const VerifyEmailScreen = () => {
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const { verifyEmail } = useAuth();

  const handleVerify = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      Alert.alert('Hata', 'Lütfen 6 haneli doğrulama kodunu giriniz.');
      return;
    }

    try {
      setLoading(true);
      console.log('Doğrulama başlatılıyor...');
      await verifyEmail(verificationCode);
      console.log('Doğrulama başarılı');
      Alert.alert('Başarılı', 'E-posta adresiniz başarıyla doğrulandı.', [
        {
          text: 'Tamam',
          onPress: () => router.replace('/(app)')
        }
      ]);
    } catch (error: any) {
      console.error('Doğrulama hatası:', error);
      Alert.alert('Hata', error.message || 'Doğrulama işlemi başarısız oldu. Lütfen tekrar deneyin.');
      setVerificationCode('');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingSpinner />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.formContainer}>
        <Text style={styles.title}>E-posta Doğrulama</Text>
        <Text style={styles.subtitle}>
          E-posta adresinize gönderilen 6 haneli doğrulama kodunu giriniz.
        </Text>
        
        <CustomInput
          placeholder="Doğrulama Kodu"
          value={verificationCode}
          onChangeText={setVerificationCode}
          keyboardType="number-pad"
          maxLength={6}
          autoFocus={true}
        />

        <CustomButton
          title="Doğrula"
          onPress={handleVerify}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  formContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
});

export default VerifyEmailScreen; 
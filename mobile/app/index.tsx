import { Redirect } from 'expo-router';
import { useAuth } from '../src/contexts/AuthContext';

export default function Index() {
  const { user } = useAuth();
  
  // Kullanıcı giriş yapmışsa app klasörüne, yapmamışsa auth klasörüne yönlendir
  return user ? <Redirect href="/(app)" /> : <Redirect href="/(auth)" />;
} 
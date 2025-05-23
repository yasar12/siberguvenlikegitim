import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { dashboardService } from '../src/services/api';
import { DashboardData } from '../src/services/api';
import { useAuth } from '../src/contexts/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../src/components/Card';
import { colors } from '../src/constants/colors';
import { useRouter } from 'expo-router';

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  const loadDashboardData = async () => {
    try {
      console.log('Dashboard verisi yükleniyor...');
      setLoading(true);
      const response = await dashboardService.getDashboardData();
      console.log('Dashboard yanıtı alındı:', {
        user: response.user,
        stats: response.stats,
        pathwaysCount: response.enrolledPathways?.length
      });
      setData(response);
    } catch (error: any) {
      console.error('Dashboard verisi alınamadı:', error);
      console.error('Hata detayları:', {
        message: error.message,
        code: error.code,
        response: error.response?.data,
        status: error.response?.status
      });
      
      if (error.response?.status === 401) {
        console.log('401 hatası: Oturum süresi dolmuş');
        router.replace('/login');
      } else {
        Alert.alert('Hata', 'Dashboard verisi alınamadı. Lütfen tekrar deneyin.');
      }
    } finally {
      console.log('Dashboard verisi yükleme tamamlandı');
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    console.log('Yenileme başlatıldı');
    setRefreshing(true);
    await loadDashboardData();
    console.log('Yenileme tamamlandı');
  };

  useEffect(() => {
    console.log('Dashboard useEffect çalıştı');
    console.log('Mevcut kullanıcı:', user);
    
    if (!user) {
      console.log('Kullanıcı bulunamadı, Login ekranına yönlendiriliyorum...');
      router.replace('/login');
      return;
    }
    
    loadDashboardData();
  }, [user]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!data) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Veriler yüklenemedi</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
          />
        }
      >
        <View style={styles.header}>
          <Text style={styles.title}>Hoş Geldiniz, {data.user.full_name}</Text>
        </View>

        <Card style={styles.statsCard}>
          <Text style={styles.statsTitle}>İstatistikler</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{data.stats.registeredPathways}</Text>
              <Text style={styles.statLabel}>Kayıtlı Yol</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{data.stats.completedLessons}</Text>
              <Text style={styles.statLabel}>Tamamlanan Ders</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{data.stats.totalLessons}</Text>
              <Text style={styles.statLabel}>Toplam Ders</Text>
            </View>
          </View>
        </Card>

        <View style={styles.pathwaysSection}>
          <Text style={styles.sectionTitle}>Kariyer Yollarım</Text>
          {data.enrolledPathways.map((pathway) => (
            <Card key={pathway.id} style={styles.pathwayCard}>
              <Text style={styles.pathwayTitle}>{pathway.pathway.title}</Text>
              <Text style={styles.pathwayDescription}>{pathway.pathway.description}</Text>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { width: `${pathway.progress_percentage}%` }
                  ]} 
                />
              </View>
              <Text style={styles.progressText}>
                İlerleme: {pathway.progress_percentage}%
              </Text>
            </Card>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  errorText: {
    color: colors.error,
    fontSize: 16,
  },
  header: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  statsCard: {
    margin: 20,
    padding: 20,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 15,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
  },
  statLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 5,
  },
  pathwaysSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 15,
  },
  pathwayCard: {
    marginBottom: 15,
    padding: 15,
  },
  pathwayTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 5,
  },
  pathwayDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 10,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    marginVertical: 10,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'right',
  },
}); 
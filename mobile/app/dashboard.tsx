import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { dashboardService } from '../src/services/api';
import { DashboardData, UserPathway } from '../src/services/api';
import { useAuth } from '../src/contexts/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../src/components/Card';
import { colors } from '../src/constants/colors';
import { useRouter } from 'expo-router';

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user, signOut } = useAuth();
  const router = useRouter();

  console.log('Dashboard ekranı render edildi');
  console.log('Mevcut durum:', {
    loading,
    refreshing,
    user,
    hasData: !!data,
    pathwaysCount: data?.enrolledPathways?.length
  });

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
        console.log('401 hatası: Oturum süresi dolmuş, çıkış yapılıyor');
        await handleLogout();
      } else {
        Alert.alert('Hata', 'Dashboard verisi alınamadı. Lütfen tekrar deneyin.');
      }
    } finally {
      console.log('Dashboard verisi yükleme tamamlandı, loading:', loading);
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    console.log('Yenileme başlatıldı');
    setRefreshing(true);
    await loadDashboardData();
    console.log('Yenileme tamamlandı');
    setRefreshing(false);
  };

  const handleLogout = async () => {
    try {
      console.log('Çıkış yapılıyor...');
      await signOut();
      console.log('Login ekranına yönlendiriliyorum...');
      router.replace('/login');
    } catch (error) {
      console.error('Çıkış hatası:', error);
    }
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
    console.log('Loading durumunda render');
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  console.log('Dashboard render ediliyor');
  console.log('Data durumu:', {
    hasData: !!data,
    stats: data?.stats,
    pathwaysCount: data?.enrolledPathways?.length
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.statsContainer}>
          <Card style={styles.statCard}>
            <Text style={styles.statTitle}>Kayıtlı Kariyer Yolları</Text>
            <Text style={styles.statValue}>{data?.stats.registeredPathways || 0}</Text>
          </Card>

          <Card style={styles.statCard}>
            <Text style={styles.statTitle}>Tamamlanan Dersler</Text>
            <Text style={styles.statValue}>{data?.stats.completedLessons || 0}</Text>
          </Card>

          <Card style={styles.statCard}>
            <Text style={styles.statTitle}>Toplam Ders</Text>
            <Text style={styles.statValue}>{data?.stats.totalLessons || 0}</Text>
          </Card>
        </View>

        <View style={styles.pathwaysSection}>
          <Text style={styles.sectionTitle}>Kariyer Yollarım</Text>
          {data?.enrolledPathways && data.enrolledPathways.length > 0 ? (
            data.enrolledPathways.map((pathway: UserPathway) => {
              console.log('Pathway render ediliyor:', {
                id: pathway.id,
                title: pathway.pathway.title,
                progress: pathway.progress_percentage
              });
              return (
                <Card key={pathway.id} style={styles.pathwayCard}>
                  <View style={styles.pathwayHeader}>
                    <Text style={styles.pathwayTitle}>{pathway.pathway.title}</Text>
                  </View>

                  <Text style={styles.pathwayDescription} numberOfLines={2}>
                    {pathway.pathway.description}
                  </Text>

                  <View style={styles.progressSection}>
                    <View style={styles.progressHeader}>
                      <Text style={styles.progressText}>İlerleme</Text>
                      <Text style={styles.progressPercentage}>
                        %{pathway.progress_percentage}
                      </Text>
                    </View>
                    <View style={styles.progressBar}>
                      <View
                        style={[
                          styles.progressFill,
                          { width: `${pathway.progress_percentage}%` },
                        ]}
                      />
                    </View>
                  </View>

                  <View style={styles.pathwayFooter}>
                    <Text style={styles.lessonCount}>
                      {pathway.status === 'completed' ? 'Tamamlandı' :
                       pathway.status === 'in_progress' ? 'Devam Ediyor' :
                       pathway.status === 'not_started' ? 'Başlanmadı' : 'Bırakıldı'}
                    </Text>
                  </View>
                </Card>
              );
            })
          ) : (
            <Card style={styles.emptyCard}>
              <Text style={styles.emptyText}>
                Henüz bir kariyer yoluna kayıt olmadınız.
              </Text>
            </Card>
          )}
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
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: 16,
  },
  statCard: {
    width: '30%',
    alignItems: 'center',
  },
  statTitle: {
    color: colors.textSecondary,
    fontSize: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  statValue: {
    color: colors.text,
    fontSize: 24,
    fontWeight: 'bold',
  },
  pathwaysSection: {
    padding: 16,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  pathwayCard: {
    marginBottom: 16,
  },
  pathwayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  pathwayTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: 'bold',
  },
  pathwayDescription: {
    color: colors.textSecondary,
    fontSize: 14,
    marginBottom: 16,
  },
  progressSection: {
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  progressPercentage: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: 'bold',
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  pathwayFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lessonCount: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  emptyCard: {
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 16,
    textAlign: 'center',
  },
}); 
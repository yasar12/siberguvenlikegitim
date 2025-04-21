import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { dashboardService } from '../services/api';
import { Card } from '../components/Card';
import { colors } from '../constants/colors';

interface Pathway {
  id: number;
  title: string;
  description: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  duration_weeks: number;
  image_url: string | null;
  is_active: boolean;
}

interface UserPathway {
  id: number;
  start_date: string;
  completion_date: string | null;
  progress_percentage: number;
  status: 'not_started' | 'in_progress' | 'completed' | 'dropped';
  pathway: Pathway;
}

interface DashboardData {
  user: {
    id: number;
    full_name: string;
    email: string;
    profile_image: string | null;
    bio: string | null;
    role: string | null;
  };
  stats: {
    registeredPathways: number;
    completedLessons: number;
    totalLessons: number;
  };
  enrolledPathways: UserPathway[];
}

export default function Dashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setError(null);
      const response = await dashboardService.getDashboardData();
      console.log('Dashboard verisi:', response);
      setData(response);
    } catch (err) {
      console.error('Dashboard verisi yüklenirken hata:', err);
      setError('Veriler yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.welcomeText}>
          Hoş geldin, {data?.user.full_name || user?.full_name || 'Kullanıcı'}
        </Text>
      </View>

      <View style={styles.statsContainer}>
        <Card style={styles.statsCard}>
          <Text style={styles.statsTitle}>İstatistikler</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{data?.stats.registeredPathways || 0}</Text>
              <Text style={styles.statLabel}>Kayıtlı Yol</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{data?.stats.completedLessons || 0}</Text>
              <Text style={styles.statLabel}>Tamamlanan Ders</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{data?.stats.totalLessons || 0}</Text>
              <Text style={styles.statLabel}>Toplam Ders</Text>
            </View>
          </View>
        </Card>
      </View>

      <View style={styles.pathwaysContainer}>
        <Text style={styles.sectionTitle}>Kariyer Yollarım</Text>
        {data?.enrolledPathways.map((pathway) => {
          console.log('Yol render ediliyor:', {
            id: pathway.id,
            title: pathway.pathway.title,
            progress: pathway.progress_percentage
          });
          return (
            <Card key={pathway.id} style={styles.pathwayCard}>
              <Text style={styles.pathwayTitle}>{pathway.pathway.title}</Text>
              <Text style={styles.pathwayDescription}>{pathway.pathway.description}</Text>
              <View style={styles.pathwayInfo}>
                <Text style={styles.pathwayLevel}>
                  Seviye: {pathway.pathway.level === 'beginner' ? 'Başlangıç' : 
                           pathway.pathway.level === 'intermediate' ? 'Orta' : 'İleri'}
                </Text>
                <Text style={styles.pathwayDuration}>
                  Süre: {pathway.pathway.duration_weeks} hafta
                </Text>
              </View>
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { width: `${pathway.progress_percentage}%` }
                    ]} 
                  />
                </View>
                <Text style={styles.progressText}>
                  {Math.round(pathway.progress_percentage)}% tamamlandı
                </Text>
              </View>
              <Text style={styles.pathwayStatus}>
                Durum: {pathway.status === 'not_started' ? 'Başlanmadı' :
                        pathway.status === 'in_progress' ? 'Devam Ediyor' :
                        pathway.status === 'completed' ? 'Tamamlandı' : 'Bırakıldı'}
              </Text>
            </Card>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: colors.error,
    fontSize: 16,
    textAlign: 'center',
  },
  header: {
    padding: 20,
    backgroundColor: colors.primary,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  statsContainer: {
    padding: 20,
  },
  statsCard: {
    padding: 15,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: colors.text,
  },
  statsRow: {
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
  pathwaysContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: colors.text,
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
  pathwayInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  pathwayLevel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  pathwayDuration: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  progressContainer: {
    marginBottom: 10,
  },
  progressBar: {
    height: 10,
    backgroundColor: colors.background,
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  progressText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 5,
    textAlign: 'right',
  },
  pathwayStatus: {
    fontSize: 14,
    color: colors.textSecondary,
  },
}); 
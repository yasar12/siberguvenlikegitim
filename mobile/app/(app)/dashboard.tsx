import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { dashboardService } from '../../src/services/api';
import { useAuth } from '../../src/contexts/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../../src/components/Card';
import { colors } from '../../src/constants/colors';

// DashboardData tipi tanımla
interface DashboardData {
  user: {
    id: number;
    full_name: string;
    email: string;
  };
  stats: {
    registeredPathways: number;
    completedLessons: number;
    totalLessons: number;
  };
  enrolledPathways: Array<{
    id: number;
    pathway: {
      id: number;
      title: string;
      description: string;
    };
    progress_percentage: number;
  }>;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const response = await dashboardService.getDashboardData();
      setData(response);
    } catch (error: any) {
      console.error('Dashboard verisi alınamadı:', error);
      Alert.alert('Hata', 'Dashboard verisi alınamadı. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  if (loading && !refreshing) {
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
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeText}>Hoş Geldiniz, {data.user.full_name}</Text>
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
  welcomeSection: {
    padding: 20,
  },
  welcomeText: {
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
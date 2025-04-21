import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { dashboardService } from '../services/api';
import { DashboardData } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Card } from '../components/Card';
import { colors } from '../constants/colors';

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

      <Text style={styles.sectionTitle}>Kariyer Yollarım</Text>
      {data?.enrolledPathways.map((pathway) => (
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
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    marginTop: 20,
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
    padding: 16,
  },
  errorText: {
    color: colors.error,
    textAlign: 'center',
  },
  statsContainer: {
    padding: 16,
  },
  statsCard: {
    padding: 16,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
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
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  pathwayCard: {
    margin: 8,
    marginHorizontal: 16,
    padding: 16,
  },
  pathwayTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  pathwayDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  pathwayInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
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
    marginBottom: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  progressText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  pathwayStatus: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
}); 
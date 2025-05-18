import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../src/constants/colors';
import { Card } from '../src/components/Card';
import { Ionicons } from '@expo/vector-icons';
import { dashboardService, Pathway } from '../src/services/api';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

// Icon eşleştirme fonksiyonu - kariyer yollarına uygun ikon atar
const getPathwayIcon = (title: string): IconName => {
  const titleLower = title.toLowerCase();
  
  if (titleLower.includes('hack') || titleLower.includes('etik')) {
    return 'shield-checkmark-outline';
  } else if (titleLower.includes('ağ') || titleLower.includes('network')) {
    return 'globe-outline';
  } else if (titleLower.includes('yazılım') || titleLower.includes('kod')) {
    return 'code-slash-outline';
  } else if (titleLower.includes('veri') || titleLower.includes('data')) {
    return 'analytics-outline';
  } else if (titleLower.includes('siber')) {
    return 'lock-closed-outline';
  }
  
  return 'school-outline'; // Varsayılan ikon
};

export default function PathwaysScreen() {
  const [pathways, setPathways] = useState<Pathway[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPathways = async () => {
      try {
        setLoading(true);
        const data = await dashboardService.getEnrolledPathways();
        setPathways(data);
        setError(null);
      } catch (err: any) {
        console.error('Kariyer yolları yüklenirken hata:', err);
        setError(err.message || 'Kariyer yolları yüklenemedi');
      } finally {
        setLoading(false);
      }
    };

    fetchPathways();
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Kariyer yolları yükleniyor...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.error} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>Kariyer Yolları</Text>
        </View>

        {pathways.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="school-outline" size={48} color={colors.textSecondary} />
            <Text style={styles.emptyText}>Henüz kariyer yolu bulunamadı</Text>
          </View>
        ) : (
          pathways.map(pathway => (
            <Card key={pathway.id} style={styles.pathwayCard}>
              <View style={styles.pathwayHeader}>
                <Ionicons name={getPathwayIcon(pathway.title)} size={32} color={colors.primary} />
                <Text style={styles.pathwayTitle}>{pathway.title}</Text>
              </View>
              <Text style={styles.pathwayDescription}>{pathway.description}</Text>
              
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View 
                    style={[styles.progressFill, { width: `${pathway.is_enrolled ? (pathway.enrollment_status === 'completed' ? 100 : 0) : 0}%` }]} 
                  />
                </View>
                <Text style={styles.progressText}>
                  {pathway.is_enrolled ? 
                    (pathway.enrollment_status === 'completed' ? '100% Tamamlandı' : 
                     pathway.enrollment_status === 'in_progress' ? 'Devam Ediyor' : 
                     'Başlanmadı') : 
                    'Kayıt olmadınız'}
                </Text>
              </View>
              
              <View style={styles.lessonInfo}>
                <Ionicons name="book-outline" size={16} color={colors.textSecondary} />
                <Text style={styles.lessonText}>{pathway.duration_weeks} Hafta</Text>
                <View style={styles.levelContainer}>
                  <Text style={styles.levelText}>
                    {pathway.level === 'beginner' ? 'Başlangıç' : 
                     pathway.level === 'intermediate' ? 'Orta Seviye' : 'İleri Seviye'}
                  </Text>
                </View>
              </View>
            </Card>
          ))
        )}
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
  header: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  pathwayCard: {
    marginHorizontal: 20,
    marginBottom: 15,
    padding: 15,
  },
  pathwayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  pathwayTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginLeft: 10,
  },
  pathwayDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 15,
  },
  progressContainer: {
    marginVertical: 10,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    marginBottom: 5,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'right',
  },
  lessonInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  lessonText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 5,
    marginRight: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: colors.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginTop: 10,
    color: colors.error,
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    marginTop: 10,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  levelContainer: {
    marginLeft: 'auto',
  },
  levelText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '500',
  },
}); 
import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { dashboardService } from '../services/api';
import { useRouter } from 'expo-router';

interface Pathway {
  id: number;
  title: string;
  description: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  duration_weeks: number;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  is_enrolled: boolean;
  enrollment_status?: 'not_started' | 'in_progress' | 'completed' | 'dropped';
}

export default function Pathways() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pathways, setPathways] = useState<Pathway[]>([]);

  useEffect(() => {
    loadPathways();
  }, []);

  const loadPathways = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Pathways yükleniyor...');
      const data = await dashboardService.getEnrolledPathways();
      console.log('Pathways yanıtı:', data);
      setPathways(data);
    } catch (err) {
      console.error('Pathways yükleme hatası:', err);
      setError('Yollar yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const getLevelText = (level: string) => {
    switch (level) {
      case 'beginner':
        return 'Başlangıç';
      case 'intermediate':
        return 'Orta';
      case 'advanced':
        return 'İleri';
      default:
        return level;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'not_started':
        return 'Başlanmadı';
      case 'in_progress':
        return 'Devam Ediyor';
      case 'completed':
        return 'Tamamlandı';
      case 'dropped':
        return 'Bırakıldı';
      default:
        return status;
    }
  };

  const handleEnroll = async (pathwayId: number) => {
    try {
      // TODO: Kayıt olma işlemi eklenecek
      console.log('Kayıt olunuyor:', pathwayId);
    } catch (err) {
      console.error('Kayıt olma hatası:', err);
    }
  };

  const handlePathwayPress = (pathwayId: number) => {
    router.push(`/pathway/${pathwayId}`);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
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
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Kariyer Yolları</Text>
      </View>

      <View style={styles.content}>
        {pathways.length === 0 ? (
          <Text style={styles.emptyText}>Henüz kariyer yolu bulunmuyor.</Text>
        ) : (
          pathways.map((pathway) => (
            <TouchableOpacity
              key={pathway.id}
              style={styles.pathwayCard}
              onPress={() => handlePathwayPress(pathway.id)}
            >
              <View style={styles.pathwayInfo}>
                <Text style={styles.pathwayTitle}>{pathway.title}</Text>
                <Text style={styles.pathwayDescription}>{pathway.description}</Text>
                <View style={styles.pathwayMeta}>
                  <Text style={styles.pathwayLevel}>
                    {getLevelText(pathway.level)}
                  </Text>
                  <Text style={styles.pathwayDuration}>{pathway.duration_weeks} Hafta</Text>
                </View>
                {pathway.is_enrolled ? (
                  <View style={styles.enrolledContainer}>
                    <Text style={[
                      styles.enrolledText,
                      { color: pathway.enrollment_status === 'completed' ? '#4CAF50' : 
                              pathway.enrollment_status === 'in_progress' ? '#2196F3' :
                              pathway.enrollment_status === 'dropped' ? '#F44336' : '#666' }
                    ]}>
                      {pathway.enrollment_status ? getStatusText(pathway.enrollment_status) : 'Kayıtlı'}
                    </Text>
                  </View>
                ) : (
                  <TouchableOpacity 
                    style={styles.enrollButton}
                    onPress={(e) => {
                      e.stopPropagation();
                      handleEnroll(pathway.id);
                    }}
                  >
                    <Text style={styles.enrollButtonText}>Kayıt Ol</Text>
                  </TouchableOpacity>
                )}
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    marginTop: 20,
  },
  header: {
    padding: 20,
    paddingTop: 40,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  content: {
    padding: 20,
    paddingTop: 30,
  },
  pathwayCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 20,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  pathwayInfo: {
    padding: 15,
  },
  pathwayTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  pathwayDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  pathwayMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  pathwayLevel: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500',
  },
  pathwayDuration: {
    fontSize: 14,
    color: '#666',
  },
  enrollButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  enrollButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  enrolledContainer: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
    backgroundColor: '#f5f5f5',
  },
  enrolledText: {
    fontSize: 16,
    fontWeight: '500',
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
    color: '#F44336',
    fontSize: 16,
    textAlign: 'center',
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 20,
  },
}); 
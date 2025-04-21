import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, TouchableOpacity, Image, SafeAreaView } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { dashboardService } from '../../services/api';
import { Ionicons } from '@expo/vector-icons';

export default function ModuleDetail() {
  const { id } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [module, setModule] = useState<any>(null);
  const [lessons, setLessons] = useState<any[]>([]);
  const [noLessons, setNoLessons] = useState(false);

  useEffect(() => {
    loadModuleDetails();
  }, [id]);

  const loadModuleDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      setNoLessons(false);
      
      if (!id) {
        setError('Modül ID bulunamadı');
        return;
      }

      const moduleId = Number(id);
      if (isNaN(moduleId)) {
        setError('Geçersiz modül ID');
        return;
      }
      
      const data = await dashboardService.getModuleLessons(moduleId);
      
      if (!data) {
        setError('Modül bulunamadı');
        return;
      }
      
      setModule(data);
      
      if (!data.lessons || data.lessons.length === 0) {
        setNoLessons(true);
        return;
      }
      
      setLessons(data.lessons);
    } catch (err: any) {
      console.error('Modül detayları yüklenirken hata:', err);
      if (err.response?.status === 404) {
        setError('Modül bulunamadı');
      } else {
        setError(err.message || 'Modül detayları yüklenirken bir hata oluştu');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLessonPress = (lessonId: number) => {
    router.push(`/lesson/${lessonId}`);
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
        <Ionicons name="alert-circle" size={48} color="#F44336" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={loadModuleDetails}
        >
          <Text style={styles.retryButtonText}>Tekrar Dene</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (noLessons) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.moduleTitle}>{module?.title || 'Modül'}</Text>
        </View>

        <View style={styles.noLessonsContainer}>
          <Ionicons name="book-outline" size={64} color="#666" />
          <Text style={styles.noLessonsTitle}>Henüz Ders Yok</Text>
          <Text style={styles.noLessonsText}>
            Bu modüle ait dersler henüz yüklenmedi. Lütfen daha sonra tekrar kontrol edin.
          </Text>
          <TouchableOpacity 
            style={styles.backToModulesButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backToModulesText}>Modüllere Dön</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.moduleTitle}>{module?.title}</Text>
        </View>

        <View style={styles.content}>
          <Text style={styles.description}>{module?.description}</Text>
          
          <View style={styles.lessonsContainer}>
            {lessons.map((lesson) => (
              <TouchableOpacity
                key={lesson.id}
                style={[
                  styles.lessonCard,
                  lesson.status === 'completed' && styles.completedLessonCard
                ]}
                onPress={() => handleLessonPress(lesson.id)}
              >
                <View style={styles.lessonHeader}>
                  <Text style={styles.lessonTitle}>{lesson.title}</Text>
                  {lesson.status === 'completed' && (
                    <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                  )}
                </View>
                <Text style={styles.lessonDescription}>{lesson.description}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  moduleTitle: {
    fontSize: 16,
    color: '#666',
    flex: 1,
  },
  content: {
    padding: 16,
  },
  description: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
    lineHeight: 24,
  },
  lessonsContainer: {
    gap: 16,
  },
  lessonCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  completedLessonCard: {
    backgroundColor: '#E8F5E9',
  },
  lessonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  lessonTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  lessonDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  errorText: {
    color: '#F44336',
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 16,
  },
  retryButton: {
    backgroundColor: '#2196F3',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  noLessonsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#f5f5f5',
  },
  noLessonsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  noLessonsText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  backToModulesButton: {
    backgroundColor: '#2196F3',
    padding: 16,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backToModulesText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 
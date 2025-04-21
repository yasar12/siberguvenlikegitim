import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, TouchableOpacity, Image, SafeAreaView } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { dashboardService } from '../../services/api';
import { Ionicons } from '@expo/vector-icons';

export default function LessonDetail() {
  const { id } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lesson, setLesson] = useState<any>(null);
  const [moduleLessons, setModuleLessons] = useState<any[]>([]);
  const [currentLessonIndex, setCurrentLessonIndex] = useState<number>(-1);
  const [noLessons, setNoLessons] = useState(false);

  useEffect(() => {
    loadLessonDetails();
  }, [id]);

  const loadLessonDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      setNoLessons(false);
      
      const data = await dashboardService.getLessonDetails(Number(id));
      setLesson(data);
      
      // Modüldeki tüm dersleri al
      const moduleData = await dashboardService.getModuleLessons(data.module_id);
      
      if (!moduleData.lessons || moduleData.lessons.length === 0) {
        setNoLessons(true);
        return;
      }
      
      setModuleLessons(moduleData.lessons);
      
      // Mevcut dersin indeksini bul
      const index = moduleData.lessons.findIndex((l: any) => l.id === Number(id));
      setCurrentLessonIndex(index);
    } catch (err: any) {
      console.error('Ders detayları yüklenirken hata:', err);
      setError(err.message || 'Ders detayları yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteLesson = async () => {
    try {
      await dashboardService.completeLesson(Number(id));
      // Ders tamamlandıktan sonra modül sayfasına geri dön
      router.back();
    } catch (err: any) {
      console.error('Ders tamamlanırken hata:', err);
      setError(err.message || 'Ders tamamlanırken bir hata oluştu');
    }
  };

  const navigateToLesson = (lessonId: number) => {
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
          onPress={loadLessonDetails}
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
          <Text style={styles.moduleTitle}>{lesson?.module_title}</Text>
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
          <Text style={styles.moduleTitle}>{lesson?.module_title}</Text>
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>{lesson?.title}</Text>
          
          <View style={styles.contentCard}>
            <Text style={styles.contentText}>{lesson?.content}</Text>
          </View>

          {lesson?.status !== 'completed' && (
            <TouchableOpacity 
              style={styles.completeButton}
              onPress={handleCompleteLesson}
            >
              <Ionicons name="checkmark-circle" size={24} color="#fff" />
              <Text style={styles.completeButtonText}>Dersi Tamamla</Text>
            </TouchableOpacity>
          )}

          {lesson?.status === 'completed' && (
            <View style={styles.completedBadge}>
              <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
              <Text style={styles.completedText}>Ders Tamamlandı</Text>
            </View>
          )}

          <View style={styles.navigationButtons}>
            {currentLessonIndex > 0 && (
              <TouchableOpacity 
                style={[styles.navButton, styles.prevButton]}
                onPress={() => navigateToLesson(moduleLessons[currentLessonIndex - 1].id)}
              >
                <Ionicons name="arrow-back" size={20} color="#fff" />
                <Text style={styles.navButtonText}>Önceki Ders</Text>
              </TouchableOpacity>
            )}

            {currentLessonIndex < moduleLessons.length - 1 && (
              <TouchableOpacity 
                style={[styles.navButton, styles.nextButton]}
                onPress={() => navigateToLesson(moduleLessons[currentLessonIndex + 1].id)}
              >
                <Text style={styles.navButtonText}>Sonraki Ders</Text>
                <Ionicons name="arrow-forward" size={20} color="#fff" />
              </TouchableOpacity>
            )}
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  contentCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  contentText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  completeButton: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  completeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  completedBadge: {
    backgroundColor: '#E8F5E9',
    padding: 16,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  completedText: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
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
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    gap: 12,
  },
  navButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  prevButton: {
    backgroundColor: '#2196F3',
  },
  nextButton: {
    backgroundColor: '#4CAF50',
  },
  navButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginHorizontal: 8,
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
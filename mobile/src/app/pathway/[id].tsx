import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { dashboardService, Module } from '../../services/api';

export default function PathwayDetails() {
  const { id } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modules, setModules] = useState<Module[]>([]);

  useEffect(() => {
    loadPathwayDetails();
  }, [id]);

  const loadPathwayDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await dashboardService.getPathwayDetails(Number(id));
      setModules(data.modules);
    } catch (err: any) {
      console.error('Detaylar yüklenirken hata:', err);
      setError(err.message || 'Detaylar yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const getLessonStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return '#4CAF50';
      case 'in_progress':
        return '#2196F3';
      default:
        return '#666';
    }
  };

  const handleModulePress = (module: Module) => {
    // Modüldeki derslerin durumlarını kontrol et
    const completedLessons = module.lessons.filter(lesson => lesson.status === 'completed');
    const inProgressLessons = module.lessons.filter(lesson => lesson.status === 'in_progress');
    
    let targetLessonId: number;

    if (completedLessons.length === 0 && inProgressLessons.length === 0) {
      // Hiç ders başlanmamışsa ilk dersi aç
      targetLessonId = module.lessons[0].id;
    } else if (completedLessons.length === module.lessons.length) {
      // Tüm dersler tamamlanmışsa son dersi aç
      targetLessonId = module.lessons[module.lessons.length - 1].id;
    } else {
      // Devam eden veya tamamlanmış dersler varsa, son tamamlanan dersten sonraki dersi aç
      const lastCompletedIndex = module.lessons.findIndex(lesson => lesson.status === 'completed');
      targetLessonId = module.lessons[lastCompletedIndex + 1].id;
    }

    // Ders detay sayfasına yönlendir
    router.push(`/lesson/${targetLessonId}`);
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
      <View style={styles.content}>
        {modules.map((module, index) => (
          <TouchableOpacity 
            key={module.id} 
            style={styles.moduleCard}
            onPress={() => handleModulePress(module)}
          >
            <View style={styles.moduleHeader}>
              <Text style={styles.moduleTitle}>
                Modül {index + 1}: {module.title}
              </Text>
              <Text style={styles.moduleDescription}>{module.description}</Text>
            </View>
            
            <View style={styles.lessonsList}>
              {module.lessons.map((lesson, lessonIndex) => (
                <View key={lesson.id} style={styles.lessonItem}>
                  <View style={styles.lessonHeader}>
                    <Text style={styles.lessonTitle}>
                      {lessonIndex + 1}. {lesson.title}
                    </Text>
                    <Text style={[
                      styles.lessonStatus,
                      { color: getLessonStatusColor(lesson.status) }
                    ]}>
                      {lesson.status === 'completed' ? 'Tamamlandı' :
                       lesson.status === 'in_progress' ? 'Devam Ediyor' :
                       'Başlanmadı'}
                    </Text>
                  </View>
                  <Text style={styles.lessonContent}>{lesson.content}</Text>
                </View>
              ))}
            </View>
          </TouchableOpacity>
        ))}
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
  content: {
    padding: 16,
  },
  moduleCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  moduleHeader: {
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  moduleTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  moduleDescription: {
    fontSize: 14,
    color: '#666',
  },
  lessonsList: {
    padding: 16,
  },
  lessonItem: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  lessonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  lessonTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    flex: 1,
  },
  lessonStatus: {
    fontSize: 14,
    fontWeight: '500',
  },
  lessonContent: {
    fontSize: 14,
    color: '#666',
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
}); 
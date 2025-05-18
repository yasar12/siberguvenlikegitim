import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../src/constants/colors';
import { Card } from '../../src/components/Card';
import { Ionicons } from '@expo/vector-icons';
import { dashboardService, ModuleLessons, Lesson } from '../../src/services/api';
import { Stack, useLocalSearchParams, router } from 'expo-router';

export default function ModuleDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const moduleId = parseInt(id);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [moduleData, setModuleData] = useState<ModuleLessons | null>(null);

  useEffect(() => {
    const fetchModuleLessons = async () => {
      try {
        setLoading(true);
        console.log(`Modül detayları yükleniyor (ID: ${moduleId})...`);
        const data = await dashboardService.getModuleLessons(moduleId);
        setModuleData(data);
        setError(null);
      } catch (err: any) {
        console.error('Modül dersleri yüklenirken hata:', err);
        setError(err.message || 'Modül dersleri yüklenemedi');
      } finally {
        setLoading(false);
      }
    };

    if (moduleId) {
      fetchModuleLessons();
    } else {
      setError('Geçersiz modül ID');
      setLoading(false);
    }
  }, [moduleId]);

  const handleLessonPress = (lessonId: number) => {
    console.log('Ders seçildi:', lessonId);
    router.push(`/lesson/${lessonId}`);
  };

  const handleBackPress = () => {
    router.back();
  };

  const getLessonStatusIcon = (status: string): { name: string; color: string } => {
    switch (status) {
      case 'completed':
        return { name: 'checkmark-circle', color: colors.success };
      case 'in_progress':
        return { name: 'time', color: colors.warning };
      default:
        return { name: 'radio-button-off', color: colors.textSecondary };
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ title: 'Modül Detayı' }} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Modül dersleri yükleniyor...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !moduleData) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ title: 'Modül Detayı' }} />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.error} />
          <Text style={styles.errorText}>{error || 'Modül bilgileri yüklenemedi'}</Text>
          <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
            <Text style={styles.backButtonText}>Geri Dön</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ title: moduleData.title || 'Modül Detayı' }} />
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButtonContainer} onPress={handleBackPress}>
            <Ionicons name="arrow-back" size={24} color={colors.primary} />
            <Text style={styles.backText}>Modüllere Dön</Text>
          </TouchableOpacity>
          <Text style={styles.title}>{moduleData.title}</Text>
          <Text style={styles.description}>{moduleData.description}</Text>
        </View>

        <View style={styles.lessonsSection}>
          <Text style={styles.sectionTitle}>Dersler</Text>
          
          {!moduleData.lessons || moduleData.lessons.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="document-text-outline" size={48} color={colors.textSecondary} />
              <Text style={styles.emptyText}>Bu modülde henüz ders bulunmuyor</Text>
            </View>
          ) : (
            moduleData.lessons.map((lesson, index) => {
              const statusIcon = getLessonStatusIcon(lesson.status);
              
              return (
                <TouchableOpacity 
                  key={lesson.id} 
                  onPress={() => handleLessonPress(lesson.id)}
                  activeOpacity={0.7}
                >
                  <Card style={styles.lessonCard}>
                    <View style={styles.lessonHeader}>
                      <View style={styles.lessonNumberContainer}>
                        <Text style={styles.lessonNumber}>{index + 1}</Text>
                      </View>
                      <Text style={styles.lessonTitle}>{lesson.title}</Text>
                      <Ionicons 
                        name={statusIcon.name as any} 
                        size={24} 
                        color={statusIcon.color} 
                        style={styles.statusIcon}
                      />
                    </View>
                    
                    <View style={styles.lessonStatus}>
                      <Text style={[styles.statusText, { color: statusIcon.color }]}>
                        {lesson.status === 'completed' ? 'Tamamlandı' : 
                        lesson.status === 'in_progress' ? 'Devam Ediyor' :
                        'Başlanmadı'}
                      </Text>
                    </View>
                  </Card>
                </TouchableOpacity>
              );
            })
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
  header: {
    padding: 20,
  },
  backButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  backText: {
    color: colors.primary,
    marginLeft: 8,
    fontSize: 14,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  lessonsSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 15,
  },
  lessonCard: {
    marginBottom: 15,
    padding: 15,
  },
  lessonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  lessonNumberContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  lessonNumber: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  lessonTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    flex: 1,
  },
  statusIcon: {
    marginLeft: 10,
  },
  lessonStatus: {
    alignItems: 'flex-end',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
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
    marginBottom: 20,
    color: colors.error,
    textAlign: 'center',
  },
  emptyContainer: {
    padding: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 10,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  backButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: colors.primary,
    borderRadius: 5,
  },
  backButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
}); 
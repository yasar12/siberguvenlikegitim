import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../src/constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { dashboardService, LessonDetails } from '../../src/services/api';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import TextSelection from '../../src/components/TextSelection';
import AIChat from '../../src/components/AIChat';

export default function LessonDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const lessonId = parseInt(id);
  
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lessonData, setLessonData] = useState<LessonDetails | null>(null);
  
  // AI Chat durumu
  const [isChatVisible, setIsChatVisible] = useState(false);
  const [selectedText, setSelectedText] = useState('');

  useEffect(() => {
    const fetchLessonDetails = async () => {
      try {
        setLoading(true);
        console.log(`Ders detayları yükleniyor (ID: ${lessonId})...`);
        const data = await dashboardService.getLessonDetails(lessonId);
        setLessonData(data);
        setError(null);
      } catch (err: any) {
        console.error('Ders detayları yüklenirken hata:', err);
        setError(err.message || 'Ders detayları yüklenemedi');
      } finally {
        setLoading(false);
      }
    };

    if (lessonId) {
      fetchLessonDetails();
    } else {
      setError('Geçersiz ders ID');
      setLoading(false);
    }
  }, [lessonId]);

  const handleBackPress = () => {
    router.back();
  };

  const handleCompleteLesson = async () => {
    if (!lessonData || completing) return;
    
    try {
      setCompleting(true);
      await dashboardService.completeLesson(lessonId);
      
      // Dersi tamamlandı olarak güncelle
      setLessonData({
        ...lessonData,
        status: 'completed'
      });
      
      console.log('Ders başarıyla tamamlandı');
    } catch (err: any) {
      console.error('Ders tamamlanırken hata:', err);
      alert('Ders tamamlanamadı. Lütfen tekrar deneyin.');
    } finally {
      setCompleting(false);
    }
  };
  
  // AI'a soru sorma işlevi
  const handleAskAI = (text: string) => {
    setSelectedText(text);
    setIsChatVisible(true);
  };
  
  // AI Chat'i kapatma
  const handleCloseChat = () => {
    setIsChatVisible(false);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ title: 'Ders Detayı' }} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Ders detayları yükleniyor...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !lessonData) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ title: 'Ders Detayı' }} />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.error} />
          <Text style={styles.errorText}>{error || 'Ders bilgileri yüklenemedi'}</Text>
          <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
            <Text style={styles.backButtonText}>Geri Dön</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ title: lessonData.title || 'Ders Detayı' }} />
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButtonContainer} onPress={handleBackPress}>
            <Ionicons name="arrow-back" size={24} color={colors.primary} />
            <Text style={styles.backText}>Modüle Dön</Text>
          </TouchableOpacity>
          <Text style={styles.title}>{lessonData.title}</Text>
          
          <View style={styles.statusContainer}>
            <Ionicons 
              name={lessonData.status === 'completed' ? 'checkmark-circle' : 
                   lessonData.status === 'in_progress' ? 'time' : 'radio-button-off'} 
              size={18} 
              color={lessonData.status === 'completed' ? colors.success : 
                    lessonData.status === 'in_progress' ? colors.warning : colors.textSecondary} 
            />
            <Text style={[styles.statusText, { 
              color: lessonData.status === 'completed' ? colors.success : 
                    lessonData.status === 'in_progress' ? colors.warning : colors.textSecondary
            }]}>
              {lessonData.status === 'completed' ? 'Tamamlandı' : 
               lessonData.status === 'in_progress' ? 'Devam Ediyor' : 'Başlanmadı'}
            </Text>
          </View>
        </View>

        <View style={styles.contentSection}>
          <TextSelection onAskAI={handleAskAI}>
            <Text style={styles.content}>{lessonData.content}</Text>
          </TextSelection>
        </View>
        
        {lessonData.status !== 'completed' && (
          <View style={styles.actionSection}>
            <TouchableOpacity 
              style={styles.completeButton} 
              onPress={handleCompleteLesson}
              disabled={completing}
            >
              {completing ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text style={styles.completeButtonText}>Dersi Tamamla</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
      
      {/* AI Chat Modal */}
      <AIChat 
        isVisible={isChatVisible}
        onClose={handleCloseChat}
        initialMessage={selectedText}
      />
      
      {/* Yardım butonu */}
      <TouchableOpacity 
        style={styles.helpButton}
        onPress={() => handleAskAI("Bu ders hakkında bana yardımcı olabilir misin?")}
      >
        <Ionicons name="help-circle" size={30} color="white" />
      </TouchableOpacity>
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
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  statusText: {
    fontSize: 14,
    marginLeft: 5,
    fontWeight: '500',
  },
  contentSection: {
    padding: 20,
    paddingTop: 0,
  },
  content: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
  },
  actionSection: {
    padding: 20,
    alignItems: 'center',
  },
  completeButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    width: '80%',
    alignItems: 'center',
  },
  completeButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
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
  helpButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
}); 
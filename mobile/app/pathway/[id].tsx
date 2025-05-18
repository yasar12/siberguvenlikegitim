import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../src/constants/colors';
import { Card } from '../../src/components/Card';
import { Ionicons } from '@expo/vector-icons';
import { dashboardService, Module } from '../../src/services/api';
import { Stack, useLocalSearchParams, router } from 'expo-router';

export default function PathwayDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const pathwayId = parseInt(id);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [pathwayTitle, setPathwayTitle] = useState<string>('Kariyer Yolu Detayı');

  useEffect(() => {
    const fetchPathwayDetails = async () => {
      try {
        setLoading(true);
        console.log(`Kariyer yolu detayları yükleniyor (ID: ${pathwayId})...`);
        const data = await dashboardService.getPathwayDetails(pathwayId);
        setModules(data.modules || []);
        
        // Pathway title'ı da alabilmek için ek olarak yolları çekelim
        try {
          const pathways = await dashboardService.getEnrolledPathways();
          const currentPathway = pathways.find(p => p.id === pathwayId);
          if (currentPathway) {
            setPathwayTitle(currentPathway.title);
          }
        } catch (titleErr) {
          console.error('Pathway başlığı alınamadı:', titleErr);
        }
        
        setError(null);
      } catch (err: any) {
        console.error('Kariyer yolu detayları yüklenirken hata:', err);
        setError(err.message || 'Kariyer yolu detayları yüklenemedi');
      } finally {
        setLoading(false);
      }
    };

    if (pathwayId) {
      fetchPathwayDetails();
    } else {
      setError('Geçersiz kariyer yolu ID');
      setLoading(false);
    }
  }, [pathwayId]);

  const handleModulePress = (moduleId: number) => {
    console.log('Modül seçildi:', moduleId);
    router.push(`/module/${moduleId}`);
  };

  const handleBackPress = () => {
    router.back();
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ title: 'Kariyer Yolu' }} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Kariyer yolu detayları yükleniyor...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ title: 'Kariyer Yolu' }} />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.error} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
            <Text style={styles.backButtonText}>Geri Dön</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ title: pathwayTitle }} />
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButtonContainer} onPress={handleBackPress}>
            <Ionicons name="arrow-back" size={24} color={colors.primary} />
            <Text style={styles.backText}>Kariyer Yollarına Dön</Text>
          </TouchableOpacity>
          <Text style={styles.title}>{pathwayTitle}</Text>
        </View>

        <View style={styles.modulesSection}>
          <Text style={styles.sectionTitle}>Modüller</Text>
          
          {modules.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="book-outline" size={48} color={colors.textSecondary} />
              <Text style={styles.emptyText}>Bu kariyer yolunda henüz modül bulunmuyor</Text>
            </View>
          ) : (
            modules.map((module, index) => (
              <TouchableOpacity 
                key={module.id} 
                onPress={() => handleModulePress(module.id)}
                activeOpacity={0.7}
              >
                <Card style={styles.moduleCard}>
                  <View style={styles.moduleHeader}>
                    <View style={styles.moduleNumberContainer}>
                      <Text style={styles.moduleNumber}>{index + 1}</Text>
                    </View>
                    <Text style={styles.moduleTitle}>{module.title}</Text>
                  </View>
                  <Text style={styles.moduleDescription}>{module.description}</Text>
                  
                  <View style={styles.lessonsInfo}>
                    <Ionicons name="document-text-outline" size={16} color={colors.textSecondary} />
                    <Text style={styles.lessonsText}>
                      {module.lessons?.length || 0} Ders
                    </Text>
                  </View>
                </Card>
              </TouchableOpacity>
            ))
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
  },
  modulesSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 15,
  },
  moduleCard: {
    marginBottom: 15,
    padding: 15,
  },
  moduleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  moduleNumberContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  moduleNumber: {
    color: 'white',
    fontWeight: 'bold',
  },
  moduleTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    flex: 1,
  },
  moduleDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 15,
  },
  lessonsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lessonsText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 5,
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
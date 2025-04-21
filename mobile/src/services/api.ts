import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

// Bilgisayarınızın IP adresi
const API_URL = 'http://172.20.10.3:3000/api';

console.log('API_URL:', API_URL);

let authToken: string | null = null;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 || error.message === 'Oturum bulunamadı') {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      // Yönlendirme işlemini AuthContext üzerinden yapacağız
      return Promise.reject(new Error('UNAUTHORIZED'));
    }
    return Promise.reject(error);
  }
);

export interface LoginResponse {
  token: string;
  user: User;
}

export interface User {
  id: number;
  full_name: string;
  email: string;
  profile_image: string | null;
  bio: string | null;
  role: 'user' | 'instructor' | 'admin';
}

export interface Pathway {
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

export interface UserPathway {
  id: number;
  start_date: string;
  completion_date: string | null;
  progress_percentage: number;
  status: 'not_started' | 'in_progress' | 'completed' | 'dropped';
  pathway: Pathway;
}

export interface DashboardData {
  user: User;
  stats: {
    registeredPathways: number;
    completedLessons: number;
    totalLessons: number;
  };
  enrolledPathways: UserPathway[];
}

export interface LoginError {
  message: string;
}

export interface Module {
  id: number;
  title: string;
  description: string;
  lessons: Lesson[];
}

export interface Lesson {
  id: number;
  title: string;
  content: string;
  status: 'not_started' | 'in_progress' | 'completed';
}

export interface PathwayDetails {
  modules: Module[];
}

export interface LessonDetails {
  id: number;
  title: string;
  content: string;
  status: 'not_started' | 'in_progress' | 'completed';
  module_id: number;
}

export interface ModuleLessons {
  id: number;
  title: string;
  description: string;
  lessons: Lesson[];
}

export const login = async (email: string, password: string) => {
  const response = await api.post('/auth/login', { email, password });
  return response.data;
};

export const getDashboardData = async () => {
  const response = await api.get('/dashboard');
  return response.data;
};

export const getModuleLessons = async (moduleId: number) => {
  const response = await api.get(`/modules/${moduleId}/lessons`);
  return response.data;
};

export const getLessonDetails = async (lessonId: number) => {
  const response = await api.get(`/lessons/${lessonId}`);
  return response.data;
};

export const completeLesson = async (lessonId: number) => {
  const response = await api.post(`/lessons/${lessonId}/complete`);
  return response.data;
};

export const authService = {
  async login(email: string, password: string) {
    try {
      console.log('Login isteği gönderiliyor:', { email, password });
      const response = await api.post('/auth/login', { 
        email, 
        password
      });
      console.log('Login yanıtı:', response.data);
      
      if (response.data.token) {
        await AsyncStorage.setItem('token', response.data.token);
        await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      return response.data;
    } catch (error: any) {
      console.error('Login hatası:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Giriş yapılamadı. Lütfen bilgilerinizi kontrol edin.');
    }
  },

  async logout() {
    try {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
    } catch (error) {
      console.error('Logout hatası:', error);
      throw error;
    }
  },

  async getStoredData() {
    try {
      const [token, userStr] = await Promise.all([
        AsyncStorage.getItem('token'),
        AsyncStorage.getItem('user')
      ]);

      const user = userStr ? JSON.parse(userStr) : null;
      
      console.log('Kayıtlı veriler:', { hasToken: !!token, storedUser: user });
      
      return { token, user };
    } catch (error) {
      console.error('Veri okuma hatası:', error);
      return { token: null, user: null };
    }
  }
};

export const dashboardService = {
  getDashboardData: async (): Promise<DashboardData> => {
    try {
      console.log('Dashboard verisi isteniyor...');
      const response = await api.get<DashboardData>('/dashboard');
      console.log('Dashboard verisi alındı:', response.data);
      return response.data;
    } catch (error) {
      console.error('Dashboard verisi alınırken hata:', error);
      throw error;
    }
  },
  getEnrolledPathways: async (): Promise<Pathway[]> => {
    try {
      console.log('Kariyer yolları isteniyor...');
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error('Oturum bulunamadı');
      }
      const response = await api.get<Pathway[]>('/pathways');
      console.log('Kariyer yolları alındı:', response.data);
      if (!Array.isArray(response.data)) {
        throw new Error('Geçersiz yanıt formatı');
      }
      return response.data;
    } catch (error) {
      console.error('Kariyer yolları alınırken hata:', error);
      throw error;
    }
  },
  getPathwayDetails: async (pathwayId: number): Promise<PathwayDetails> => {
    try {
      console.log('Kariyer yolu detayları isteniyor...', pathwayId);
      const response = await api.get<PathwayDetails>(`/pathways/${pathwayId}/details`);
      console.log('Kariyer yolu detayları alındı:', response.data);
      return response.data;
    } catch (error) {
      console.error('Kariyer yolu detayları alınırken hata:', error);
      throw error;
    }
  },
  getLessonDetails: async (lessonId: number): Promise<LessonDetails> => {
    try {
      console.log('Ders detayları isteniyor...');
      const response = await api.get<LessonDetails>(`/lessons/${lessonId}`);
      console.log('Ders detayları alındı:', response.data);
      return response.data;
    } catch (error) {
      console.error('Ders detayları alınırken hata:', error);
      throw error;
    }
  },
  completeLesson: async (lessonId: number): Promise<void> => {
    try {
      console.log('Ders tamamlanıyor...');
      await api.post(`/lessons/${lessonId}/complete`);
      console.log('Ders başarıyla tamamlandı');
    } catch (error) {
      console.error('Ders tamamlanırken hata:', error);
      throw error;
    }
  },
  getModuleLessons: async (moduleId: number): Promise<ModuleLessons> => {
    try {
      console.log('Modül dersleri isteniyor...');
      const response = await api.get<ModuleLessons>(`/modules/${moduleId}/lessons`);
      console.log('Modül dersleri alındı:', response.data);
      return response.data;
    } catch (error) {
      console.error('Modül dersleri alınırken hata:', error);
      throw error;
    }
  },
  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
  },
};

export const userService = {
  async getProfile() {
    try {
      console.log('Profil bilgileri isteniyor...');
      const response = await api.get('/user/profile');
      console.log('Profil bilgileri alındı:', response.data);
      return response.data;
    } catch (error) {
      console.error('Profil bilgileri alınamadı:', error);
      throw error;
    }
  }
};

export default api; 
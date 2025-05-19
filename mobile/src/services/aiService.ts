import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Gemini API için anahtar
const API_KEY = 'AIzaSyCdk_-u4nUhpJ6cP84xG0NvmFARmZ2FcKY'; 
const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

// Farklı model yapılandırmaları
const API_ENDPOINTS = {
  // Google AI API Endpoints - En yeni v1 API
  googleAIv1: {
    url: 'https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent',
    model: 'gemini-pro'
  },
  // Alternatif API versiyonu ve endpoint
  googleAIPreview: {
    url: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent',
    model: 'gemini-1.5-pro'
  },
  // PaLM 2 API endpoint
  palm2: {
    url: 'https://generativelanguage.googleapis.com/v1beta/models/text-bison-001:generateText',
    model: 'text-bison-001'
  }
};

// Arayüz tanımlamaları
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface ChatSession {
  id: string;
  messages: ChatMessage[];
  title: string;
  createdAt: number;
}

// Her kullanıcı sorusundan önce yapay zekaya verilen talimat
const AI_INSTRUCTION = 
  "Sen bir siber güvenlik eğitim platformunun yapay zeka asistanısın. " +
  "Yalnızca siber güvenlik, programlama, bilgisayar ağları, bilişim sistemleri ve bilgi teknolojileri ile ilgili konularda yardımcı olabilirsin. " +
  "Eğer kullanıcının sorusu bu konular dışındaysa, nazikçe yanıt vermeyi reddet ve yalnızca siber güvenlik eğitimi " +
  "ile ilgili konularda yardımcı olabileceğini belirt. Şimdi kullanıcının sorusuna cevap ver: ";

// API servisini uygulaması
export const aiService = {
  async generateResponse(message: string, history: ChatMessage[] = []): Promise<string> {
    try {
      console.log('AI yanıtı isteniyor...');
      
      // Gemini API için formatlanmış mesaj geçmişi oluştur
      const formattedHistory = history.map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      }));
      
      // Mevcut mesajı AI talimatı ile birlikte ekle
      formattedHistory.push({
        role: 'user',
        parts: [{ text: AI_INSTRUCTION + message }]
      });
      
      const response = await axios.post(
        `${API_URL}?key=${API_KEY}`,
        {
          contents: formattedHistory,
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1000,
          },
          safetySettings: [
            {
              category: 'HARM_CATEGORY_HARASSMENT',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE'
            },
            {
              category: 'HARM_CATEGORY_HATE_SPEECH',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE'
            },
            {
              category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE'
            },
            {
              category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE'
            }
          ]
        }
      );
      
      const aiResponse = response.data.candidates[0].content.parts[0].text;
      console.log('AI yanıtı alındı');
      
      return aiResponse;
    } catch (error: any) {
      console.error('AI yanıtı alınırken hata:', error.response?.data || error.message);
      throw new Error('Yapay zeka yanıtı alınamadı. Lütfen daha sonra tekrar deneyin.');
    }
  }
};

// React Native için async depolama sistemi 
export const chatStorage = {
  // Tüm oturumları getir
  async getSessions(): Promise<ChatSession[]> {
    try {
      const sessionsJson = await AsyncStorage.getItem('chatSessions');
      return sessionsJson ? JSON.parse(sessionsJson) : [];
    } catch (error) {
      console.error('Oturumlar alınırken hata:', error);
      return [];
    }
  },
  
  // Oturumları kaydet
  async saveSessions(sessions: ChatSession[]): Promise<void> {
    try {
      await AsyncStorage.setItem('chatSessions', JSON.stringify(sessions));
    } catch (error) {
      console.error('Oturumlar kaydedilirken hata:', error);
    }
  },
  
  // Oturum getir
  async getSession(sessionId: string): Promise<ChatSession | null> {
    try {
      const sessionData = await AsyncStorage.getItem(`chat_session_${sessionId}`);
      return sessionData ? JSON.parse(sessionData) : null;
    } catch (error) {
      console.error('Oturum alınırken hata:', error);
      return null;
    }
  },
  
  // Yeni oturum oluştur
  async createSession(initialMessage: string): Promise<ChatSession> {
    const sessionId = Date.now().toString();
    const newSession: ChatSession = {
      id: sessionId,
      messages: [
        {
          id: Date.now().toString(),
          role: 'user',
          content: initialMessage,
          timestamp: Date.now()
        }
      ],
      title: initialMessage.slice(0, 30) + (initialMessage.length > 30 ? '...' : ''),
      createdAt: Date.now()
    };
    
    try {
      await AsyncStorage.setItem(`chat_session_${sessionId}`, JSON.stringify(newSession));
    } catch (error) {
      console.error('Oturum kaydedilirken hata:', error);
    }
    
    return newSession;
  },
  
  // Mesaj ekle
  async addMessage(session: ChatSession, role: 'user' | 'assistant', content: string): Promise<ChatSession> {
    const updatedSession = {
      ...session,
      messages: [
        ...session.messages,
        {
          id: Date.now().toString(),
          role,
          content,
          timestamp: Date.now()
        }
      ]
    };
    
    try {
      await AsyncStorage.setItem(`chat_session_${session.id}`, JSON.stringify(updatedSession));
    } catch (error) {
      console.error('Mesaj kaydedilirken hata:', error);
    }
    
    return updatedSession;
  },
  
  // Oturum sil
  async deleteSession(sessionId: string): Promise<void> {
    try {
      const sessions = await this.getSessions();
      const updatedSessions = sessions.filter(session => session.id !== sessionId);
      await this.saveSessions(updatedSessions);
    } catch (error) {
      console.error('Oturum silinirken hata:', error);
      throw error;
    }
  },
  
  // Tüm oturumları temizle
  async clearAllSessions(): Promise<void> {
    try {
      await AsyncStorage.removeItem('chatSessions');
    } catch (error) {
      console.error('Tüm oturumlar temizlenirken hata:', error);
      throw error;
    }
  }
};

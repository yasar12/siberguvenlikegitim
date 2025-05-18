import axios from 'axios';

// Gemini API için anahtar
const API_KEY = 'AIzaSyCdk_-u4nUhpJ6cP84xG0NvmFARmZ2FcKY'; 
const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

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

export const aiService = {
  async generateResponse(message: string, history: ChatMessage[] = []): Promise<string> {
    try {
      console.log('AI yanıtı isteniyor...');
      
      // Gemini API için formatlanmış mesaj geçmişi oluştur
      const formattedHistory = history.map(msg => ({
        role: msg.role,
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
  },
  
  // Mock AI yanıtı (test için)
  getMockResponse(message: string): Promise<string> {
    console.log('Mock AI yanıtı oluşturuluyor...');
    
    // AI talimatlarına uygun mock yanıtlar (gerçek AI ile değiştirilecek)
    return new Promise((resolve) => {
      setTimeout(() => {
        let response = '';
        const lowerMessage = message.toLowerCase();
        
        // Siber güvenlik dışı konu kontrolü (gerçek API'de bunu AI yapacak)
        if (lowerMessage.includes('hava durumu') || 
            lowerMessage.includes('film') || 
            lowerMessage.includes('yemek') || 
            lowerMessage.includes('spor')) {
          response = 'Üzgünüm, ben yalnızca siber güvenlik, programlama ve bilişim sistemleri konularında yardımcı olabilirim. Siber güvenlik eğitiminizle ilgili başka bir soru sormak ister misiniz?';
        } 
        else if (lowerMessage.includes('ne demek') || lowerMessage.includes('nedir')) {
          response = 'Bu terim, siber güvenlik alanında önemli bir kavramı ifade eder. Belirtilen kavram hakkında daha fazla bilgi için ders içeriğine göz atabilir veya daha spesifik bir soru sorabilirsiniz.';
        } else if (lowerMessage.includes('nasıl')) {
          response = 'Bu işlem genellikle şu adımları içerir: 1) Gerekli araçları hazırlama, 2) Güvenlik kontrollerini yapma, 3) Süreci adım adım takip etme. Daha detaylı bilgi için sorunu daha spesifik olarak iletebilirsin.';
        } else if (lowerMessage.includes('örnek')) {
          response = 'Örnek olarak, bir web uygulamasında SQL enjeksiyonu saldırısına karşı koruma için giriş doğrulama ve parametreli sorguların kullanılması verilebilir. Başka bir örnek vermemi ister misin?';
        } else {
          response = 'Sorduğun siber güvenlik konusu hakkında detaylı bilgi vermek için elimden geleni yapacağım. Bu alan derinlemesine anlaşılması gereken önemli bir konudur. Daha spesifik bir soru sormak istersen yardımcı olabilirim.';
        }
        
        resolve(response);
      }, 1500);
    });
  }
};

// Local storage üzerinden chat oturumlarını yönetmek için yardımcı fonksiyonlar
export const chatStorage = {
  // Yeni oturum oluştur
  createSession(initialMessage: string): ChatSession {
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
    
    return newSession;
  },
  
  // Mesaj ekle
  addMessage(session: ChatSession, role: 'user' | 'assistant', content: string): ChatSession {
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
    
    return updatedSession;
  }
}; 
const axios = require('axios');

// Gemini API için anahtar
const API_KEY = 'AIzaSyCdk_-u4nUhpJ6cP84xG0NvmFARmZ2FcKY';
const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

// Her kullanıcı sorusundan önce yapay zekaya verilen talimat
const AI_INSTRUCTION = 
  "Sen bir siber güvenlik eğitim platformunun yapay zeka asistanısın. " +
  "Yalnızca siber güvenlik, programlama, bilgisayar ağları, bilişim sistemleri ve bilgi teknolojileri ile ilgili konularda yardımcı olabilirsin. " +
  "Eğer kullanıcının sorusu bu konular dışındaysa, nazikçe yanıt vermeyi reddet ve yalnızca siber güvenlik eğitimi " +
  "ile ilgili konularda yardımcı olabileceğini belirt. Şimdi kullanıcının sorusuna cevap ver: ";

// API servisini uygulaması
const aiService = {
  async generateResponse(message, history = []) {
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
    } catch (error) {
      console.error('AI yanıtı alınırken hata:', error.response?.data || error.message);
      throw new Error('Yapay zeka yanıtı alınamadı. Lütfen daha sonra tekrar deneyin.');
    }
  }
};

module.exports = aiService; 
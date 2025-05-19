import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Keyboard
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';
import { aiService, ChatMessage, ChatSession, chatStorage } from '../services/aiService';

interface AIChatProps {
  isVisible: boolean;
  onClose: () => void;
  initialMessage?: string;
}

const AIChat: React.FC<AIChatProps> = ({ isVisible, onClose, initialMessage = '' }) => {
  const [session, setSession] = useState<ChatSession | null>(null);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  // Başlangıç mesajını işle ve yeni oturum oluştur
  useEffect(() => {
    if (isVisible && initialMessage && !session) {
      const initializeSession = async () => {
        const newSession = await chatStorage.createSession(initialMessage);
        setSession(newSession);
        handleInitialMessage(newSession);
      };
      initializeSession();
    } else if (!isVisible) {
      // Modal kapandığında state sıfırla
      setSession(null);
      setInputText('');
    }
  }, [isVisible, initialMessage]);

  // Başlangıç mesajı geldiğinde AI yanıtı al
  const handleInitialMessage = async (newSession: ChatSession) => {
    setIsLoading(true);
    try {
      const aiResponse = await aiService.generateResponse(initialMessage);
      
      const updatedSession = await chatStorage.addMessage(newSession, 'assistant', aiResponse);
      setSession(updatedSession);
    } catch (error) {
      console.error('AI yanıtı alınırken hata oluştu:', error);
      
      if (newSession) {
        const errorMessage = 'Üzgünüm, yanıt oluşturulurken bir hata meydana geldi. Lütfen tekrar deneyin.';
        const updatedSession = await chatStorage.addMessage(newSession, 'assistant', errorMessage);
        setSession(updatedSession);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Yeni mesaj gönderme
  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading || !session) return;
    
    // Kullanıcı mesajını ekle
    const userMessage = inputText.trim();
    setInputText('');
    Keyboard.dismiss();
    
    const sessionWithUserMessage = await chatStorage.addMessage(session, 'user', userMessage);
    setSession(sessionWithUserMessage);
    
    // Otomatik scroll
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
    
    // AI yanıtını al
    setIsLoading(true);
    try {
      const aiResponse = await aiService.generateResponse(
        userMessage, 
        sessionWithUserMessage.messages
      );
      
      const updatedSession = await chatStorage.addMessage(sessionWithUserMessage, 'assistant', aiResponse);
      setSession(updatedSession);
      
      // Otomatik scroll
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error('AI yanıtı alınırken hata oluştu:', error);
      
      const errorMessage = 'Üzgünüm, yanıt oluşturulurken bir hata meydana geldi. Lütfen tekrar deneyin.';
      const updatedSession = await chatStorage.addMessage(sessionWithUserMessage, 'assistant', errorMessage);
      setSession(updatedSession);
    } finally {
      setIsLoading(false);
    }
  };

  // Mesaj baloncuğu bileşeni
  const MessageBubble = ({ message }: { message: ChatMessage }) => {
    const isUser = message.role === 'user';
    
    return (
      <View style={[
        styles.messageBubble,
        isUser ? styles.userBubble : styles.aiBubble
      ]}>
        <Text style={[
          styles.messageText,
          isUser ? styles.userText : styles.aiText
        ]}>
          {message.content}
        </Text>
      </View>
    );
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.chatContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>AI Asistan</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          
          {/* Chat Messages */}
          <ScrollView 
            style={styles.messagesContainer}
            ref={scrollViewRef}
            contentContainerStyle={styles.messagesContent}
          >
            {session?.messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            
            {isLoading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={styles.loadingText}>Düşünüyor...</Text>
              </View>
            )}
          </ScrollView>
          
          {/* Input Area */}
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
          >
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={inputText}
                onChangeText={setInputText}
                placeholder="Bir soru sor..."
                placeholderTextColor={colors.textSecondary}
                multiline
                maxLength={500}
                onSubmitEditing={handleSendMessage}
                editable={!isLoading}
              />
              <TouchableOpacity 
                style={[
                  styles.sendButton,
                  (!inputText.trim() || isLoading) && styles.sendButtonDisabled
                ]}
                onPress={handleSendMessage}
                disabled={!inputText.trim() || isLoading}
              >
                <Ionicons 
                  name="send" 
                  size={20} 
                  color={!inputText.trim() || isLoading ? colors.textSecondary : colors.primary} 
                />
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  chatContainer: {
    backgroundColor: colors.background,
    height: '80%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  header: {
    backgroundColor: colors.card,
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  closeButton: {
    padding: 5,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 15,
    paddingBottom: 20,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 10,
  },
  userBubble: {
    backgroundColor: colors.primary,
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: colors.card,
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userText: {
    color: 'white',
  },
  aiText: {
    color: colors.text,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: colors.card,
    padding: 12,
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    marginBottom: 10,
  },
  loadingText: {
    color: colors.textSecondary,
    marginLeft: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.card,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    backgroundColor: colors.background,
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    opacity: 0.6,
  },
});

export default AIChat; 
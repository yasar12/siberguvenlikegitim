import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  NativeEventEmitter,
  NativeModules
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';

interface TextSelectionProps {
  children: React.ReactNode;
  onAskAI: (selectedText: string) => void;
}

/**
 * React Native'de şu an için doğrudan metin seçimi üzerinde UI manipülasyonu yapmak zor.
 * Bu nedenle bu bileşen bir şemsiye bileşen olarak çalışır ve içindeki text
 * seçildiğinde kullanıcı kendi seçim menüsünü görecektir. Biz sadece bir kapsamlı çözüm
 * için seçilen metni algılayıp "AI'a Sor" butonu göstereceğiz.
 */
const TextSelection: React.FC<TextSelectionProps> = ({ children, onAskAI }) => {
  const [isTextSelected, setIsTextSelected] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  
  // Klavye seçimini algılamak için isteğe bağlı listener
  // RN ile doğrudan seçilen metin alınamadığından bu bir simülasyondur
  // Native modül geliştirmeyle gerçek çözüm yapılabilir
  
  // Opsiyonel: Metin seçim simülasyonu için buton
  // Gerçek uygulamada kullanıcı metni kendisi seçecek
  const handleSimulateSelection = () => {
    setIsTextSelected(true);
    // Örnek seçilmiş metin - gerçek uygulamada bu değer platform API'larından alınmalı
    setSelectedText('Seçilen örnek metin parçası');
  };
  
  const handleAskAI = () => {
    if (selectedText) {
      onAskAI(selectedText);
      // Seçimi temizle
      setIsTextSelected(false);
      setSelectedText('');
    }
  };
  
  const handleCancelSelection = () => {
    setIsTextSelected(false);
    setSelectedText('');
  };
  
  return (
    <View style={styles.container}>
      {/* Çocuk bileşenler (örn. Text içeriği) */}
      <View style={styles.content}>
        {children}
      </View>
      
      {/* Seçim olduğunda gösterilen AI'a sor butonu */}
      {isTextSelected && (
        <View style={styles.selectionToolbar}>
          <TouchableOpacity 
            style={styles.askButton}
            onPress={handleAskAI}
          >
            <Ionicons name="chatbox-ellipses" size={20} color="white" />
            <Text style={styles.askButtonText}>AI'a Sor</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={handleCancelSelection}
          >
            <Ionicons name="close" size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      )}
      
      {/* DEV: Simülasyon butonu - gerçek uygulamada bu olmayacak */}
      {!isTextSelected && __DEV__ && (
        <TouchableOpacity 
          style={styles.simulateButton}
          onPress={handleSimulateSelection}
        >
          <Text style={styles.simulateButtonText}>Metin Seçimini Simüle Et</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  content: {
    width: '100%',
  },
  selectionToolbar: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 25,
    paddingVertical: 8,
    paddingHorizontal: 16,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  askButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  askButtonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  cancelButton: {
    padding: 8,
    marginLeft: 8,
  },
  simulateButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: colors.primary + '80', // Yarı saydam
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  simulateButtonText: {
    color: 'white',
    fontSize: 12,
  },
});

export default TextSelection; 
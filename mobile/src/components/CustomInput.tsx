import React from 'react';
import { View, TextInput, StyleSheet, TextInputProps } from 'react-native';

interface CustomInputProps extends TextInputProps {
  placeholder: string;
  secureTextEntry?: boolean;
}

const CustomInput: React.FC<CustomInputProps> = ({ 
  placeholder, 
  secureTextEntry = false,
  ...props 
}) => {
  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor="#666"
        secureTextEntry={secureTextEntry}
        {...props}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: 8,
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#ddd',
  },
});

export default CustomInput; 
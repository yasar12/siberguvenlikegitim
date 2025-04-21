import React from 'react';
import { TouchableOpacity, Text, StyleSheet, TouchableOpacityProps } from 'react-native';

interface CustomButtonProps extends TouchableOpacityProps {
  title: string;
  type?: 'primary' | 'secondary';
}

const CustomButton: React.FC<CustomButtonProps> = ({ 
  title, 
  type = 'primary',
  ...props 
}) => {
  return (
    <TouchableOpacity 
      style={[styles.button, type === 'secondary' && styles.secondaryButton]} 
      {...props}
    >
      <Text style={[styles.text, type === 'secondary' && styles.secondaryText]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#2E7D32',
    padding: 15,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    marginVertical: 8,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#2E7D32',
  },
  text: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryText: {
    color: '#2E7D32',
  },
});

export default CustomButton; 
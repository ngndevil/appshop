import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

export default function SimpleHeader({ title, onBack }) {
  // Get colors from theme context
  const { colors } = useTheme();
  
  // Create themed styles inside component
  const themedStyles = StyleSheet.create({
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 8,
      paddingVertical: 12,
      backgroundColor: colors.card,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    side: {
      width: 40,
      alignItems: 'center',
    },
    center: {
      flex: 1,
      alignItems: 'center',
    },
    title: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.text,
    },
  });
  
  return (
    <View style={themedStyles.header}>
      <TouchableOpacity onPress={onBack} style={themedStyles.side}>
        <Ionicons name="arrow-back" size={24} color={colors.primary} />
      </TouchableOpacity>

      <View style={themedStyles.center}>
        <Text style={themedStyles.title}>{title}</Text>
      </View>

      <View style={themedStyles.side} /> 
    </View>
  );
}

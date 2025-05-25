import { View, Text, Image, StyleSheet } from 'react-native';
import React from 'react';
import { TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';

export default function LandingScreen() {
  const navigation = useNavigation();
  const { colors } = useTheme();

  // Move styles inside component to use theme colors
  const themedStyles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      backgroundColor: colors.card,
      paddingVertical: 40,
      paddingHorizontal: 20,
    },
    imageContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginBottom: 30,
      flex: 1,
    },
    largeImage: {
      width: '40%',
      height: '100%', 
      borderRadius: 15,
      marginRight: 10,
    },
    rightImages: {
      justifyContent: 'space-between',
      alignItems: 'center',
      flex: 1,
    },
    smallImage: {
      width: '100%',
      height: '45%',
      borderRadius: 15,
      marginBottom: 10,
    },
    textContainer: {
      paddingHorizontal: 30,
      alignItems: 'center',
      marginBottom: 20,
    },
    title: {
      fontSize: 24,
      fontWeight: '600',
      textAlign: 'center',
      marginBottom: 10,
      color: colors.text,
    },
    highlight: {
      color: colors.primaryLight,
      fontWeight: 'bold',
    },
    description: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: 30,
    },
    button: {
      backgroundColor: colors.primary,
      paddingVertical: 14,
      paddingHorizontal: 60,
      borderRadius: 30,
      marginBottom: 20,
      alignItems: 'center',
    },
    buttonText: {
      color: colors.card,
      fontSize: 16,
    },
    signInText: {
      color: colors.text,
      fontSize: 14,
    },
    signInLink: {
      color: colors.primary,
      fontWeight: 'bold',
    },
  });

  return (
    <View style={themedStyles.container}>
      <View style={themedStyles.imageContainer}>
        <Image source={require('../assets/images/img1.jpg')} style={themedStyles.largeImage} />
        <View style={themedStyles.rightImages}>
          <Image source={require('../assets/images/img2.jpg')} style={themedStyles.smallImage} />
          <Image source={require('../assets/images/img3.jpg')} style={themedStyles.smallImage} />
        </View>
      </View>

      <View style={themedStyles.textContainer}>
        <Text style={themedStyles.title}>
          The <Text style={themedStyles.highlight}>Clothing Store</Text>{' '}
          That Makes You Look Your Best
        </Text>
        <Text style={themedStyles.description}>
          Keep it short and simple.
        </Text>
      </View>

      <TouchableOpacity 
        style={themedStyles.button} 
        onPress={() => navigation.navigate('LoginScreen')}
      >
        <Text style={themedStyles.buttonText}>Let's Get Started</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('LoginScreen')}>
        <Text style={themedStyles.signInText}>
          Already have an account? <Text style={themedStyles.signInLink}>Sign In</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
}

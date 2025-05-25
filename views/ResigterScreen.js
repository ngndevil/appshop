import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';
import { auth } from '../constants/firebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { Ionicons } from '@expo/vector-icons';
import Checkbox from 'expo-checkbox';
import { useTheme } from '../context/ThemeContext';

const RegisterScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [isChecked, setChecked] = useState(false); 
  
  const handleRegister = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!name) {
      Alert.alert('Error', 'Please enter your name.');
      return;
    }
    if (!email || !emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address.');
      return;
    }
    if (!password || password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters.');
      return;
    }
    if (!isChecked) {
      Alert.alert('Error', 'Please agree with Terms & Condition.');
      return;
    }

    console.log('Registering with:', { email, password });
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        Alert.alert('Registration Successful', `Welcome ${user.email}`);
        navigation.navigate('LoginScreen');
      })
      .catch((error) => {
        console.log('Register error:', error);
        let errorMessage = 'An error occurred. Please try again.';
        if (error.code === 'auth/email-already-in-use') {
          errorMessage = 'This email is already registered.';
        } else if (error.code === 'auth/invalid-email') {
          errorMessage = 'Invalid email format.';
        } else if (error.code === 'auth/weak-password') {
          errorMessage = 'Password must be at least 6 characters.';
        } else {
          errorMessage = error.message;
        }
        Alert.alert('Registration Failed', errorMessage);
      });
  };

  // Define styles inside component to use theme colors
  const themedStyles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      paddingHorizontal: 20,
      backgroundColor: colors.card,
    },
    logo: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.text,
      textAlign: 'center',
      marginBottom: 20,
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: colors.text,
      textAlign: 'center',
      marginBottom: 10,
    },
    subtitle: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: 30,
    },
    input: {
      height: 50,
      borderColor: colors.border,
      borderWidth: 1,
      borderRadius: 8,
      paddingHorizontal: 15,
      marginBottom: 15,
      fontSize: 16,
      color: colors.text,
    },
    passwordContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      borderColor: colors.border,
      borderWidth: 1,
      borderRadius: 8,
      marginBottom: 15,
    },
    inputPassword: {
      flex: 1,
      height: 50,
      paddingHorizontal: 15,
      fontSize: 16,
      color: colors.text,
    },
    eyeIcon: {
      padding: 10,
    },
    checkboxContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 20,
    },
    checkbox: {
      marginRight: 10,
    },
    checkboxText: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    termsLink: {
      color: colors.primary,
      textDecorationLine: 'underline',
    },
    signUpButton: {
      backgroundColor: colors.primary,
      paddingVertical: 15,
      borderRadius: 8,
      alignItems: 'center',
      marginBottom: 20,
    },
    signUpButtonText: {
      color: colors.card,
      fontSize: 16,
      fontWeight: 'bold',
    },
    orText: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: 20,
    },
    socialButtons: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginBottom: 20,
    },
    socialButton: {
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: colors.primaryLightest,
      justifyContent: 'center',
      alignItems: 'center',
      marginHorizontal: 10,
    },
    signInLink: {
      flexDirection: 'row',
      justifyContent: 'center',
    },
    signInText: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    signInLinkText: {
      fontSize: 14,
      color: colors.primary,
      fontWeight: 'bold',
    },
  });

  return (
    <View style={themedStyles.container}>
      {/* Logo */}
      <Text style={themedStyles.logo}>Insightlancer</Text>

      {/* Tiêu đề */}
      <Text style={themedStyles.title}>Create Account</Text>
      <Text style={themedStyles.subtitle}>Fill your information below or register with your social account</Text>

      {/* Trường Name */}
      <TextInput
        style={themedStyles.input}
        placeholder="Name"
        placeholderTextColor={colors.textLight}
        value={name}
        onChangeText={setName}
        autoCapitalize="words"
      />

      {/* Trường Email */}
      <TextInput
        style={themedStyles.input}
        placeholder="Email"
        placeholderTextColor={colors.textLight}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      {/* Trường Password */}
      <View style={themedStyles.passwordContainer}>
        <TextInput
          style={themedStyles.inputPassword}
          placeholder="Password"
          placeholderTextColor={colors.textLight}
          value={password}
          onChangeText={setPassword}
          secureTextEntry={secureTextEntry}
        />
        <TouchableOpacity
          onPress={() => setSecureTextEntry(!secureTextEntry)}
          style={themedStyles.eyeIcon}
        >
          <Ionicons
            name={secureTextEntry ? 'eye-off' : 'eye'}
            size={24}
            color={colors.textLight}
          />
        </TouchableOpacity>
      </View>

      {/* Checkbox Agree with Terms & Condition */}
      <View style={themedStyles.checkboxContainer}>
        <Checkbox
          value={isChecked}
          onValueChange={setChecked}
          color={isChecked ? colors.primary : undefined}
          style={themedStyles.checkbox}
        />
        <TouchableOpacity onPress={() => setChecked(!isChecked)}>
          <Text style={themedStyles.checkboxText}>Agree with <Text style={themedStyles.termsLink}>Terms & Condition</Text></Text>
        </TouchableOpacity>
      </View>

      {/* Nút Sign Up */}
      <TouchableOpacity style={themedStyles.signUpButton} onPress={handleRegister}>
        <Text style={themedStyles.signUpButtonText}>Sign Up</Text>
      </TouchableOpacity>

      {/* Đăng nhập bằng Apple/Google/Facebook */}
      <Text style={themedStyles.orText}>Or sign up with</Text>
      <View style={themedStyles.socialButtons}>
        <TouchableOpacity style={themedStyles.socialButton}>
          <Ionicons name="logo-apple" size={24} color={colors.text} />
        </TouchableOpacity>
        <TouchableOpacity style={themedStyles.socialButton}>
          <Ionicons name="logo-google" size={24} color={colors.text} />
        </TouchableOpacity>
        <TouchableOpacity style={themedStyles.socialButton}>
          <Ionicons name="logo-facebook" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Liên kết đến Sign In */}
      <View style={themedStyles.signInLink}>
        <Text style={themedStyles.signInText}>Already have an account? </Text>
        <TouchableOpacity onPress={() => navigation.navigate('LoginScreen')}>
          <Text style={themedStyles.signInLinkText}>Sign In</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default RegisterScreen;

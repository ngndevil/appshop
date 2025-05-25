import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';
import { auth } from '../constants/firebaseConfig';
import { signInWithEmailAndPassword, onAuthStateChanged, signInWithCredential, GoogleAuthProvider } from 'firebase/auth';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { useTheme } from '../context/ThemeContext';

WebBrowser.maybeCompleteAuthSession();

const LoginScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  
  // Configure Google Sign-In
  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: '276500725099-9tctqkju0rvqavtinjr7jial0bq47aeh.apps.googleusercontent.com',
    webClientId: '276500725099-cejrjvmogplpfjkdck194eh5rtprfjbp.apps.googleusercontent.com',
    expoClientId: '276500725099-cejrjvmogplpfjkdck194eh5rtprfjbp.apps.googleusercontent.com'
  });
  
  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      const credential = GoogleAuthProvider.credential(id_token);
      signInWithCredential(auth, credential)
        .then(userCredential => {
          const user = userCredential.user;
          Alert.alert('Login Successful', `Welcome ${user.email}`);
          navigation.replace('ProductListScreen');
        })
        .catch(error => {
          console.error('Google Sign-In error:', error);
          Alert.alert('Google Sign-In Failed', error.message);
        });
    }
  }, [response]);
  
  const handleLogin = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address.');
      return;
    }
    if (!password) {
      Alert.alert('Error', 'Please enter a password.');
      return;
    }
  
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        Alert.alert('Login Successful', `Welcome ${user.email}`);
        console.log('Navigating to ProductListScreen');
        navigation.replace('ProductListScreen');
      })
      .catch((error) => {
        console.log('Login error:', error);
        let errorMessage = 'An error occurred. Please try again.';
        if (error.code === 'auth/wrong-password') {
          errorMessage = 'Incorrect password. Please try again.';
        } else if (error.code === 'auth/user-not-found') {
          errorMessage = 'No account found with this email. Please check your email or sign up.';
        } else if (error.code === 'auth/too-many-requests') {
          errorMessage = 'Too many failed attempts. Please try again later.';
        } else if (error.code === 'auth/network-request-failed') {
          errorMessage = 'Network error. Please check your internet connection and try again.';
        } else {
          errorMessage = error.message;
        }
        Alert.alert('Login Failed', errorMessage);
      });
  };

  // Update the Google sign-in button press handler
  const handleGoogleSignIn = async () => {
    try {
      await promptAsync();
    } catch (error) {
      console.error('Google Sign-In Error:', error);
      Alert.alert('Error', 'Failed to initiate Google Sign-In');
    }
  };

  const themedStyles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 20,
      backgroundColor: colors.card,
    },
    logo: {
      width: 200,
      height: 200,
      resizeMode: 'contain',
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
      width: '100%',
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
    forgotPassword: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: 'right',
      marginBottom: 20,
    },
    signInButton: {
      width: '100%',
      backgroundColor: colors.primary,
      paddingVertical: 15,
      borderRadius: 8,
      alignItems: 'center',
      marginBottom: 20,
    },
    signInButtonText: {
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
      backgroundColor: colors.background,
      justifyContent: 'center',
      alignItems: 'center',
      marginHorizontal: 10,
    },
    registerLink: {
      flexDirection: 'row',
      justifyContent: 'center',
    },
    registerText: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    registerLinkText: {
      fontSize: 14,
      color: colors.primary,
      fontWeight: 'bold',
    },
  });

  return (
    <View style={themedStyles.container}>
      <Image source={require('../assets/images/icon.jpg')} style={themedStyles.logo}/>
      <Text style={themedStyles.title}>Sign In</Text>
      <Text style={themedStyles.subtitle}>Hi! Welcome back, you've been missed</Text>
      <TextInput
        style={themedStyles.input}
        placeholder="Email"
        placeholderTextColor={colors.textLight}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
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
      <TouchableOpacity onPress={() => Alert.alert('Forgot Password', 'This feature is not implemented yet.')}>
        <Text style={themedStyles.forgotPassword}>Forgot Password?</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={themedStyles.signInButton} onPress={handleLogin}>
        <Text style={themedStyles.signInButtonText}>Sign In</Text>
      </TouchableOpacity>
      <Text style={themedStyles.orText}>Or sign in with</Text>
      <View style={themedStyles.socialButtons}>
        <TouchableOpacity style={themedStyles.socialButton}>
          <Ionicons name="logo-apple" size={24} color={colors.text} />
        </TouchableOpacity>
        <TouchableOpacity style={themedStyles.socialButton} onPress={handleGoogleSignIn}>
          <Ionicons name="logo-google" size={24} color={colors.text} />
        </TouchableOpacity>
        <TouchableOpacity style={themedStyles.socialButton}>
          <Ionicons name="logo-facebook" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>
      <View style={themedStyles.registerLink}>
        <Text style={themedStyles.registerText}>Don't have an account? </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={themedStyles.registerLinkText}>Sign Up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default LoginScreen;

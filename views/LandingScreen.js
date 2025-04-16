import { View, Text, Image, StyleSheet } from 'react-native';
import React from 'react';
import { TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function LandingScreen() {

  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <Image source={require('../assets/images/img1.jpg')} style={styles.largeImage} />
        <View style={styles.rightImages}>
          <Image source={require('../assets/images/img2.jpg')} style={styles.smallImage} />
          <Image source={require('../assets/images/img3.jpg')} style={styles.smallImage} />
        </View>
      </View>

      <View style={styles.textContainer}>
        <Text style={styles.title}>
          The <Text style={styles.highlight}>Clothing Store</Text>{' '}
          That Makes You Look Your Best
        </Text>
        <Text style={styles.description}>
        Keep it short and simple.
        </Text>
      </View>

      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Let’s Get Started</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('LoginScreen')}>
      <Text style={styles.signInText}>
        Already have an account? <Text style={styles.signInLink}>Sign In</Text>
      </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#fff',
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
    color: '#000',
  },
  highlight: {
    color: '#A9744F',
    fontWeight: 'bold',
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#5C3D2E',
    paddingVertical: 14,
    paddingHorizontal: 60,
    borderRadius: 30,
    marginBottom: 20,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  signInText: {
    color: '#000',
    fontSize: 14,
  },
  signInLink: {
    color: '#5C3D2E',
    fontWeight: 'bold',
  },
});
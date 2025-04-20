import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';
import { getAuth, updateProfile, signOut } from 'firebase/auth';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';

const EditProfileScreen = () => {
  const auth = getAuth();
  const user = auth.currentUser;
  const navigation = useNavigation();
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [photoURL, setPhotoURL] = useState(user?.photoURL || null);

  const handlePickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Quyền bị từ chối', 'Bạn cần cấp quyền truy cập thư viện ảnh.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setPhotoURL(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    try {
      await updateProfile(user, {
        displayName,
        photoURL,
      });
      Alert.alert('Thành công', 'Cập nhật hồ sơ thành công!');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Lỗi', error.message);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigation.replace('LoginScreen');
    } catch (error) {
      Alert.alert('Lỗi', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chỉnh sửa hồ sơ</Text>
      <TouchableOpacity onPress={handlePickImage} style={styles.avatarContainer}>
        <Image
          source={photoURL ? { uri: photoURL } : require('../assets/images/default-avatar.jpg')}
          style={styles.avatar}
        />
        <Text style={styles.changePhotoText}>Thay đổi ảnh</Text>
      </TouchableOpacity>
      <TextInput
        style={styles.input}
        placeholder="Tên hiển thị"
        value={displayName}
        onChangeText={setDisplayName}
      />
      <TouchableOpacity style={styles.button} onPress={handleSave}>
        <Text style={styles.buttonText}>Lưu</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button, styles.orderHistoryButton]}
        onPress={() => navigation.navigate('OrderHistoryScreen')}
      >
        <Text style={styles.buttonText}>Xem lịch sử đơn hàng</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.button, styles.logoutButton]} onPress={handleLogout}>
        <Text style={styles.buttonText}>Đăng xuất</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: '#8B4513',
  },
  changePhotoText: {
    marginTop: 8,
    color: '#8B4513',
    fontSize: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#8B4513',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  orderHistoryButton: {
    backgroundColor: '#555',
  },
  logoutButton: {
    backgroundColor: '#ff4d4d',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default EditProfileScreen;
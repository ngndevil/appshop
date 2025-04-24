import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
} from 'react-native';
import { getAuth, updateProfile, signOut } from 'firebase/auth';
import { doc, setDoc, getFirestore } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system'; // ✅
import SimpleHeader from '../components/common/SimpleHeader';

const IMGUR_CLIENT_ID = '41e2797d57ce1a3';

const EditProfileScreen = () => {
  const auth = getAuth();
  const user = auth.currentUser;
  const navigation = useNavigation();
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [photoURL, setPhotoURL] = useState(user?.photoURL || null);
  const [isUploading, setIsUploading] = useState(false);

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

  // ✅ Sử dụng base64 thay vì FormData
  const uploadImageToImgur = async (imageUri) => {
    try {
      const base64 = await FileSystem.readAsStringAsync(imageUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const response = await fetch('https://api.imgur.com/3/image', {
        method: 'POST',
        headers: {
          Authorization: `Client-ID ${IMGUR_CLIENT_ID}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: base64,
          type: 'base64',
        }),
      });

      const data = await response.json();
      if (!data.success) throw new Error('Tải ảnh lên Imgur thất bại');
      return data.data.link;
    } catch (err) {
      console.error('Upload error:', err);
      throw err;
    }
  };

  const handleSave = async () => {
    try {
      setIsUploading(true);
      let uploadedPhotoURL = photoURL;

      if (photoURL && photoURL.startsWith('file://')) {
        uploadedPhotoURL = await uploadImageToImgur(photoURL);
      }

      await updateProfile(user, {
        displayName,
        photoURL: uploadedPhotoURL || null,
      });

      await setDoc(
        doc(getFirestore(), 'users', user.uid),
        {
          displayName,
          photoURL: uploadedPhotoURL || null,
          email: user.email,
        },
        { merge: true }
      );

      await auth.currentUser.reload();
      const updatedUser = auth.currentUser;
      setDisplayName(updatedUser.displayName || '');
      setPhotoURL(updatedUser.photoURL || null);

      Alert.alert('Thành công', 'Cập nhật hồ sơ thành công!');
    } catch (error) {
      Alert.alert('Lỗi', error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteAvatar = () => {
    Alert.alert('Xác nhận', 'Bạn có chắc muốn xóa ảnh đại diện?', [
      {
        text: 'Hủy',
        style: 'cancel',
      },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: async () => {
          try {
            await updateProfile(user, {
              photoURL: null,
            });
            await setDoc(
              doc(getFirestore(), 'users', user.uid),
              {
                photoURL: null,
              },
              { merge: true }
            );
            await auth.currentUser.reload();
            setPhotoURL(null);
            Alert.alert('Đã xóa ảnh đại diện');
          } catch (error) {
            Alert.alert('Lỗi khi xóa ảnh', error.message);
          }
        },
      },
    ]);
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
      <SimpleHeader title="Chỉnh sửa hồ sơ" onBack={() => navigation.goBack()} />
      <TouchableOpacity onPress={handlePickImage} style={styles.avatarContainer}>
        <Image
          source={photoURL ? { uri: photoURL } : require('../assets/images/default-avatar.jpg')}
          style={styles.avatar}
        />
        <Text style={styles.changePhotoText}>Thay đổi ảnh</Text>
      </TouchableOpacity>

      {photoURL && (
        <TouchableOpacity onPress={handleDeleteAvatar}>
          <Text style={styles.deletePhotoText}>Xóa ảnh đại diện</Text>
        </TouchableOpacity>
      )}

      <TextInput
        style={styles.input}
        placeholder="Tên hiển thị"
        value={displayName}
        onChangeText={setDisplayName}
      />
      <TouchableOpacity style={styles.button} onPress={handleSave} disabled={isUploading}>
        <Text style={styles.buttonText}>{isUploading ? 'Đang lưu...' : 'Lưu'}</Text>
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
  deletePhotoText: {
    textAlign: 'center',
    color: '#ff4d4d',
    fontSize: 14,
    marginBottom: 12,
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

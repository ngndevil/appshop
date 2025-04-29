import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  Modal,
  TouchableWithoutFeedback,
  Animated,
  Dimensions,
} from 'react-native';
import { getAuth, updateProfile, signOut } from 'firebase/auth';
import { doc, setDoc, getFirestore } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import SimpleHeader from '../components/common/SimpleHeader';
import { useTheme, themes } from '../context/ThemeContext';

const IMGUR_CLIENT_ID = '41e2797d57ce1a3';
const { width } = Dimensions.get('window');

const EditProfileScreen = () => {
  const auth = getAuth();
  const user = auth.currentUser;
  const navigation = useNavigation();
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [photoURL, setPhotoURL] = useState(user?.photoURL || null);
  const [isUploading, setIsUploading] = useState(false);
  const [themeModalVisible, setThemeModalVisible] = useState(false);
  
  // Use theme from context
  const { colors, changeTheme, currentTheme } = useTheme();
  
  // Animation for theme dropdown
  const dropdownAnimation = useRef(new Animated.Value(0)).current;

  const toggleThemeModal = () => {
    if (themeModalVisible) {
      // Close animation
      Animated.timing(dropdownAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start(() => setThemeModalVisible(false));
    } else {
      // Open animation
      setThemeModalVisible(true);
      Animated.timing(dropdownAnimation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  };
  
  // Calculate dropdown height based on animation value
  const maxHeight = 250;
  const dropdownHeight = dropdownAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, maxHeight],
  });

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

  // Existing upload function
  const uploadImageToImgur = async (imageUri) => {
    // ... existing code
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
    // ... existing code
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
    // ... existing code
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
    // ... existing code
    try {
      await signOut(auth);
      navigation.replace('LoginScreen');
    } catch (error) {
      Alert.alert('Lỗi', error.message);
    }
  };
  
  // Theme options
  const themeOptions = [
    { id: 'default', name: 'Nâu (Mặc định)', color: themes.default.primary, icon: 'invert-colors' },
    { id: 'dark', name: 'Tối', color: themes.dark.primary, icon: 'brightness-4' },
    { id: 'pink', name: 'Hồng', color: themes.pink.primary, icon: 'palette' },
    { id: 'red', name: 'Đỏ', color: themes.red.primary, icon: 'palette' },
    { id: 'blue', name: 'Xanh', color: themes.blue.primary, icon: 'palette' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.card }]}>
      <SimpleHeader title="Chỉnh sửa hồ sơ" onBack={() => navigation.goBack()} />
      <TouchableOpacity onPress={handlePickImage} style={styles.avatarContainer}>
        <Image
          source={photoURL ? { uri: photoURL } : require('../assets/images/default-avatar.jpg')}
          style={[styles.avatar, { borderColor: colors.primary }]}
        />
        <Text style={[styles.changePhotoText, { color: colors.primary }]}>Thay đổi ảnh</Text>
      </TouchableOpacity>

      {photoURL && (
        <TouchableOpacity onPress={handleDeleteAvatar}>
          <Text style={[styles.deletePhotoText, { color: colors.error }]}>Xóa ảnh đại diện</Text>
        </TouchableOpacity>
      )}

      <TextInput
        style={[styles.input, { borderColor: colors.border, color: colors.text }]}
        placeholder="Tên hiển thị"
        placeholderTextColor={colors.textLight}
        value={displayName}
        onChangeText={setDisplayName}
      />

      {/* Theme Switcher Button */}
      <TouchableOpacity
        style={[styles.themeButton, { backgroundColor: colors.primaryLighter }]}
        onPress={toggleThemeModal}
      >
        <MaterialIcons name="color-lens" size={24} color={colors.primary} style={styles.themeIcon} />
        <Text style={[styles.themeButtonText, { color: colors.text }]}>
          Đổi giao diện
        </Text>
        <MaterialIcons 
          name={themeModalVisible ? "keyboard-arrow-up" : "keyboard-arrow-down"} 
          size={24} 
          color={colors.primary} 
        />
      </TouchableOpacity>

      {/* Theme Modal Dropdown */}
      {themeModalVisible && (
        <Animated.View style={[
          styles.themeModal,
          { 
            height: dropdownHeight,
            backgroundColor: colors.card,
            borderColor: colors.border,
          }
        ]}>
          <View style={styles.themeOptions}>
            <Text style={[styles.themeModalTitle, { color: colors.text }]}>Chọn giao diện</Text>
            {themeOptions.map((theme) => (
              <TouchableOpacity
                key={theme.id}
                style={[
                  styles.themeOption,
                  currentTheme === theme.id && {
                    backgroundColor: colors.primaryLightest,
                    borderColor: colors.primary,
                  }
                ]}
                onPress={() => {
                  changeTheme(theme.id);
                  toggleThemeModal();
                }}
              >
                <View style={[styles.colorCircle, { backgroundColor: theme.color }]}>
                  {currentTheme === theme.id && (
                    <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                  )}
                </View>
                <Text style={[styles.themeOptionText, { color: colors.text }]}>{theme.name}</Text>
                <MaterialIcons name={theme.icon} size={20} color={theme.color} />
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>
      )}

      <TouchableOpacity 
        style={[styles.button, { backgroundColor: colors.primary }]} 
        onPress={handleSave} 
        disabled={isUploading}
      >
        <Text style={[styles.buttonText, { color: colors.card }]}>
          {isUploading ? 'Đang lưu...' : 'Lưu'}
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.button, styles.orderHistoryButton, { backgroundColor: colors.textSecondary }]}
        onPress={() => navigation.navigate('OrderHistoryScreen')}
      >
        <Text style={[styles.buttonText, { color: colors.card }]}>Xem lịch sử đơn hàng</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.button, styles.logoutButton, { backgroundColor: colors.error }]} 
        onPress={handleLogout}
      >
        <Text style={[styles.buttonText, { color: colors.card }]}>Đăng xuất</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
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
  },
  changePhotoText: {
    marginTop: 8,
    fontSize: 16,
  },
  deletePhotoText: {
    textAlign: 'center',
    fontSize: 14,
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  button: {
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  orderHistoryButton: {
    marginTop: 8,
  },
  logoutButton: {
    marginTop: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  themeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    justifyContent: 'space-between',
  },
  themeIcon: {
    marginRight: 8,
  },
  themeButtonText: {
    fontSize: 16,
    flex: 1,
  },
  themeModal: {
    position: 'absolute',
    top: 280, // Position below the theme button
    left: 16,
    right: 16,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 4,
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  themeModalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    paddingHorizontal: 12,
  },
  themeOptions: {
    padding: 8,
  },
  themeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginVertical: 4,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  colorCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  themeOptionText: {
    fontSize: 14,
    flex: 1,
  },
});

export default EditProfileScreen;

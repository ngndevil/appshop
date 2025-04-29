import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  StatusBar,
} from 'react-native';
import { getAuth, updateProfile, signOut } from 'firebase/auth';
import { doc, setDoc, getFirestore, getDoc } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import SimpleHeader from '../components/common/SimpleHeader';
import { useTheme } from '../context/ThemeContext';
import ThemeSelector from '../components/dropdown/ThemeSelector';

const IMGUR_CLIENT_ID = '41e2797d57ce1a3';
const { width } = Dimensions.get('window');

const EditProfileScreen = () => {
  // Base state
  const auth = getAuth();
  const db = getFirestore();
  const user = auth.currentUser;
  const navigation = useNavigation();
  const { colors } = useTheme();
  
  // Form state
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [photoURL, setPhotoURL] = useState(user?.photoURL || null);
  const [email, setEmail] = useState(user?.email || '');
  const [originalName, setOriginalName] = useState(user?.displayName || '');
  const [originalPhotoURL, setOriginalPhotoURL] = useState(user?.photoURL || null);
  
  // UI state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [hasChanges, setHasChanges] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load user data
  useEffect(() => {
    const loadUserData = async () => {
      try {
        if (user) {
          // Check if additional user data exists in Firestore
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setDisplayName(userData.displayName || user.displayName || '');
            setPhotoURL(userData.photoURL || user.photoURL || null);
            setOriginalName(userData.displayName || user.displayName || '');
            setOriginalPhotoURL(userData.photoURL || user.photoURL || null);
          } else {
            setDisplayName(user.displayName || '');
            setPhotoURL(user.photoURL || null);
            setOriginalName(user.displayName || '');
            setOriginalPhotoURL(user.photoURL || null);
          }
          setEmail(user.email || '');
        }
      } catch (error) {
        console.error("Error loading user data:", error);
        Alert.alert("Lỗi", "Không thể tải dữ liệu người dùng. Vui lòng thử lại sau.");
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, [user]);

  // Track if form has changes
  useEffect(() => {
    const nameChanged = displayName !== originalName;
    const photoChanged = photoURL !== originalPhotoURL;
    setHasChanges(nameChanged || photoChanged);
  }, [displayName, photoURL, originalName, originalPhotoURL]);

  // Image handling
  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Quyền bị từ chối', 'Bạn cần cấp quyền truy cập thư viện ảnh để thay đổi ảnh đại diện.');
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        setPhotoURL(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Lỗi", "Không thể chọn ảnh. Vui lòng thử lại.");
    }
  };

  const handleTakePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Quyền bị từ chối', 'Bạn cần cấp quyền sử dụng máy ảnh để chụp ảnh đại diện mới.');
      return;
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        setPhotoURL(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error taking photo:", error);
      Alert.alert("Lỗi", "Không thể chụp ảnh. Vui lòng thử lại.");
    }
  };

  // Upload photo to Imgur
  const uploadImageToImgur = async (imageUri) => {
    try {
      // Read image as base64
      setUploadProgress(10);
      const base64 = await FileSystem.readAsStringAsync(imageUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      
      setUploadProgress(30);
      
      // Upload to Imgur
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
      
      setUploadProgress(80);
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.data.error || 'Không thể tải ảnh lên');
      }
      
      setUploadProgress(100);
      return data.data.link;
    } catch (err) {
      console.error('Upload error:', err);
      throw err;
    }
  };

  // Handle save profile changes
  const handleSave = async () => {
    if (!hasChanges) {
      Alert.alert('Thông báo', 'Không có thay đổi để lưu.');
      return;
    }

    try {
      setIsUploading(true);
      let uploadedPhotoURL = photoURL;

      // If photo is from device (not a URL), upload it
      if (photoURL && (photoURL.startsWith('file://') || photoURL.startsWith('content://'))) {
        uploadedPhotoURL = await uploadImageToImgur(photoURL);
      }

      // Update Firebase Auth profile
      await updateProfile(user, {
        displayName,
        photoURL: uploadedPhotoURL || null,
      });

      // Update Firestore document
      await setDoc(
        doc(db, 'users', user.uid),
        {
          displayName,
          photoURL: uploadedPhotoURL || null,
          email: user.email,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );

      // Reload user to get updated info
      await user.reload();
      
      // Update state with new values
      setOriginalName(displayName);
      setOriginalPhotoURL(uploadedPhotoURL);
      setPhotoURL(uploadedPhotoURL);
      
      Alert.alert('Thành công', 'Thông tin hồ sơ đã được cập nhật!');
      setHasChanges(false);
    } catch (error) {
      console.error("Save error:", error);
      Alert.alert('Lỗi', `Không thể cập nhật hồ sơ: ${error.message}`);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // Handle delete avatar
  const handleDeleteAvatar = () => {
    Alert.alert(
      'Xác nhận xóa',
      'Bạn có chắc muốn xóa ảnh đại diện không?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsUploading(true);
              
              // Update Firebase Auth profile
              await updateProfile(user, {
                photoURL: null,
              });

              // Update Firestore document
              await setDoc(
                doc(db, 'users', user.uid),
                { photoURL: null },
                { merge: true }
              );

              // Reload user and update state
              await user.reload();
              setPhotoURL(null);
              setOriginalPhotoURL(null);
              
              Alert.alert('Thành công', 'Đã xóa ảnh đại diện!');
            } catch (error) {
              console.error("Delete avatar error:", error);
              Alert.alert('Lỗi', `Không thể xóa ảnh đại diện: ${error.message}`);
            } finally {
              setIsUploading(false);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  // Handle logout
  const handleLogout = () => {
    Alert.alert(
      'Đăng xuất',
      'Bạn có chắc muốn đăng xuất khỏi tài khoản?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Đăng xuất',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut(auth);
              navigation.reset({
                index: 0,
                routes: [{ name: 'LoginScreen' }],
              });
            } catch (error) {
              console.error("Logout error:", error);
              Alert.alert('Lỗi', `Không thể đăng xuất: ${error.message}`);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  // If still loading user data
  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.text }]}>Đang tải thông tin...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <StatusBar barStyle={colors.isDark ? 'light-content' : 'dark-content'} />
      <ScrollView 
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <SimpleHeader title="Chỉnh sửa hồ sơ" onBack={() => navigation.goBack()} />
        
        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarContainer}>
            <Image
              source={photoURL ? { uri: photoURL } : require('../assets/images/default-avatar.jpg')}
              style={[styles.avatar, { borderColor: colors.primary }]}
            />
            
            <View style={styles.imageActionButtons}>
              <TouchableOpacity 
                style={[styles.imageActionButton, { backgroundColor: colors.primary }]}
                onPress={handleTakePhoto}
                disabled={isUploading}
              >
                <FontAwesome5 name="camera" size={16} color={colors.card} />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.imageActionButton, { backgroundColor: colors.primary }]}
                onPress={handlePickImage}
                disabled={isUploading}
              >
                <FontAwesome5 name="image" size={16} color={colors.card} />
              </TouchableOpacity>
              
              {photoURL && (
                <TouchableOpacity 
                  style={[styles.imageActionButton, { backgroundColor: colors.error }]}
                  onPress={handleDeleteAvatar}
                  disabled={isUploading}
                >
                  <FontAwesome5 name="trash" size={16} color={colors.card} />
                </TouchableOpacity>
              )}
            </View>
          </View>
          
          <Text style={[styles.userEmail, { color: colors.textSecondary }]}>
            {email}
          </Text>
        </View>

        {/* Form Section */}
        <View style={styles.formSection}>
          <Text style={[styles.fieldLabel, { color: colors.text }]}>Tên hiển thị</Text>
          <TextInput
            style={[
              styles.textInput,
              { borderColor: colors.border, color: colors.text, backgroundColor: colors.card }
            ]}
            placeholder="Nhập tên hiển thị"
            placeholderTextColor={colors.textLight}
            value={displayName}
            onChangeText={setDisplayName}
            maxLength={30}
          />

          {/* Theme Selector Component */}
          <Text style={[styles.fieldLabel, { color: colors.text, marginTop: 20 }]}>
            Giao diện ứng dụng
          </Text>
          <ThemeSelector />

          {/* Upload Progress Indicator */}
          {isUploading && uploadProgress > 0 && (
            <View style={styles.progressContainer}>
              <View 
                style={[
                  styles.progressBar, 
                  { backgroundColor: colors.border, width: '100%' }
                ]}
              >
                <View 
                  style={[
                    styles.progressFill, 
                    { backgroundColor: colors.primary, width: `${uploadProgress}%` }
                  ]} 
                />
              </View>
              <Text style={[styles.progressText, { color: colors.textSecondary }]}>
                {uploadProgress < 100 ? 'Đang tải ảnh lên...' : 'Đã tải xong!'}
              </Text>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[
              styles.button, 
              { backgroundColor: hasChanges ? colors.primary : colors.disabled }
            ]}
            onPress={handleSave}
            disabled={isUploading || !hasChanges}
          >
            {isUploading ? (
              <View style={styles.buttonContent}>
                <ActivityIndicator size="small" color={colors.card} />
                <Text style={[styles.buttonText, { color: colors.card, marginLeft: 8 }]}>
                  Đang lưu...
                </Text>
              </View>
            ) : (
              <Text style={[styles.buttonText, { color: colors.card }]}>
                Lưu thay đổi
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.textSecondary }]}
            onPress={() => navigation.navigate('OrderHistoryScreen')}
          >
            <View style={styles.buttonContent}>
              <MaterialIcons name="history" size={20} color={colors.card} style={styles.buttonIcon} />
              <Text style={[styles.buttonText, { color: colors.card }]}>
                Lịch sử đơn hàng
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.error }]}
            onPress={handleLogout}
          >
            <View style={styles.buttonContent}>
              <MaterialIcons name="logout" size={20} color={colors.card} style={styles.buttonIcon} />
              <Text style={[styles.buttonText, { color: colors.card }]}>
                Đăng xuất
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  avatarSection: {
    alignItems: 'center',
    marginVertical: 16,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 2,
  },
  userEmail: {
    marginTop: 8,
    fontSize: 14,
    textAlign: 'center',
  },
  imageActionButtons: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    flexDirection: 'row',
  },
  imageActionButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  formSection: {
    marginVertical: 16,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  progressContainer: {
    marginTop: 16,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
  },
  progressText: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  actionButtons: {
    marginTop: 24,
  },
  button: {
    borderRadius: 8,
    paddingVertical: 16,
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 1,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  buttonIcon: {
    marginRight: 8,
  },
});

export default EditProfileScreen;

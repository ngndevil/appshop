import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../constants/firebaseConfig';
import SimpleHeader from '../components/common/SimpleHeader';
import { useTheme } from '../context/ThemeContext';

export default function EditProductScreen({ route, navigation }) {
  const { colors } = useTheme();
  const { product } = route.params;

  // 🧪 Debug log
  console.log('Received product:', JSON.stringify(product));

  // ✅ Kiểm tra null/undefined
  if (!product || !product.id) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.card }}>
        <Text style={{ color: colors.text }}>Không tìm thấy sản phẩm để chỉnh sửa.</Text>
      </View>
    );
  }

  const [productName, setProductName] = useState(product.product_name || '');
  const [description, setDescription] = useState(product.description || '');
  const [price, setPrice] = useState(String(product.price || ''));
  const [stock, setStock] = useState(String(product.stock || ''));
  const [imageUrl, setImageUrl] = useState(product.image_url || '');

  const handleUpdate = async () => {
    if (!productName || !price || !stock || !description || !imageUrl) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin.');
      return;
    }

    try {
      const productRef = doc(db, 'product', product.id);
      await updateDoc(productRef, {
        product_name: productName,
        description,
        price: parseInt(price),
        stock: parseInt(stock),
        image_url: imageUrl,
      });

      Alert.alert('Thành công', 'Sản phẩm đã được cập nhật.');
      navigation.goBack();
    } catch (error) {
      console.error('Lỗi khi cập nhật:', error);
      Alert.alert('Lỗi', 'Không thể cập nhật sản phẩm.');
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Xác nhận xoá',
      'Bạn có chắc muốn xoá sản phẩm này?',
      [
        { text: 'Huỷ', style: 'cancel' },
        {
          text: 'Xoá',
          style: 'destructive',
          onPress: async () => {
            try {
              const productRef = doc(db, 'product', product.id);
              await deleteDoc(productRef);
              Alert.alert('Đã xoá', 'Sản phẩm đã được xoá.');
              navigation.navigate('ProductListScreen', { refresh: true });
            } catch (error) {
              console.error('Lỗi xoá:', error);
              Alert.alert('Lỗi', 'Không thể xoá sản phẩm.');
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  // Define styles inside the component to use theme colors
  const themedStyles = StyleSheet.create({
    container: {
      padding: 20,
      backgroundColor: colors.card,
      flexGrow: 1,
    },
    label: {
      fontWeight: 'bold',
      marginTop: 12,
      color: colors.text,
    },
    input: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      padding: 10,
      marginTop: 4,
      color: colors.text,
    },
    buttonGroup: {
      marginTop: 24,
    },
    button: {
      backgroundColor: colors.primary,
      padding: 12,
      borderRadius: 8,
      marginBottom: 12,
      alignItems: 'center',
    },
    deleteButton: {
      backgroundColor: colors.error,
    },
    buttonText: {
      color: colors.card,
      fontWeight: 'bold',
    },
  });

  return (
    <ScrollView contentContainerStyle={themedStyles.container}>
      <SimpleHeader title="Chỉnh sửa sản phẩm" onBack={() => navigation.goBack()} />

      <Text style={themedStyles.label}>Tên sản phẩm</Text>
      <TextInput
        style={themedStyles.input}
        value={productName}
        onChangeText={setProductName}
        placeholderTextColor={colors.textLight}
      />

      <Text style={themedStyles.label}>Mô tả</Text>
      <TextInput
        style={themedStyles.input}
        value={description}
        onChangeText={setDescription}
        multiline
        placeholderTextColor={colors.textLight}
      />

      <Text style={themedStyles.label}>Giá (₫)</Text>
      <TextInput
        style={themedStyles.input}
        value={price}
        onChangeText={setPrice}
        keyboardType="numeric"
        placeholderTextColor={colors.textLight}
      />

      <Text style={themedStyles.label}>Tồn kho</Text>
      <TextInput
        style={themedStyles.input}
        value={stock}
        onChangeText={setStock}
        keyboardType="numeric"
        placeholderTextColor={colors.textLight}
      />

      <Text style={themedStyles.label}>Ảnh (URL)</Text>
      <TextInput
        style={themedStyles.input}
        value={imageUrl}
        onChangeText={setImageUrl}
        placeholderTextColor={colors.textLight}
      />

      {/* Nếu bạn muốn hiển thị ngày tạo sản phẩm */}
      {product.created_at && (
        <View style={{ marginTop: 12 }}>
          <Text style={themedStyles.label}>Ngày tạo</Text>
          <Text style={{ color: colors.text }}>{product.created_at.toDate().toLocaleString()}</Text>
        </View>
      )}

      <View style={themedStyles.buttonGroup}>
        <TouchableOpacity style={themedStyles.button} onPress={handleUpdate}>
          <Text style={themedStyles.buttonText}>Cập nhật sản phẩm</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[themedStyles.button, themedStyles.deleteButton]}
          onPress={handleDelete}
        >
          <Text style={themedStyles.buttonText}>Xoá sản phẩm</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
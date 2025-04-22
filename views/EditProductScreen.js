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

export default function EditProductScreen({ route, navigation }) {
  const { product } = route.params;

  // 🧪 Debug log
  console.log('Received product:', JSON.stringify(product));

  // ✅ Kiểm tra null/undefined
  if (!product || !product.id) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Không tìm thấy sản phẩm để chỉnh sửa.</Text>
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

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <SimpleHeader title="Chỉnh sửa sản phẩm" onBack={() => navigation.goBack()} />

      <Text style={styles.label}>Tên sản phẩm</Text>
      <TextInput
        style={styles.input}
        value={productName}
        onChangeText={setProductName}
      />

      <Text style={styles.label}>Mô tả</Text>
      <TextInput
        style={styles.input}
        value={description}
        onChangeText={setDescription}
        multiline
      />

      <Text style={styles.label}>Giá (₫)</Text>
      <TextInput
        style={styles.input}
        value={price}
        onChangeText={setPrice}
        keyboardType="numeric"
      />

      <Text style={styles.label}>Tồn kho</Text>
      <TextInput
        style={styles.input}
        value={stock}
        onChangeText={setStock}
        keyboardType="numeric"
      />

      <Text style={styles.label}>Ảnh (URL)</Text>
      <TextInput
        style={styles.input}
        value={imageUrl}
        onChangeText={setImageUrl}
      />

      {/* Nếu bạn muốn hiển thị ngày tạo sản phẩm */}
      {product.created_at && (
        <View style={{ marginTop: 12 }}>
          <Text style={styles.label}>Ngày tạo</Text>
          <Text>{product.created_at.toDate().toLocaleString()}</Text>
        </View>
      )}

      <View style={styles.buttonGroup}>
        <TouchableOpacity style={styles.button} onPress={handleUpdate}>
          <Text style={styles.buttonText}>Cập nhật sản phẩm</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.deleteButton]}
          onPress={handleDelete}
        >
          <Text style={styles.buttonText}>Xoá sản phẩm</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    flexGrow: 1,
  },
  label: {
    fontWeight: 'bold',
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginTop: 4,
  },
  buttonGroup: {
    marginTop: 24,
  },
  button: {
    backgroundColor: '#8B4513',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: '#B22222',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

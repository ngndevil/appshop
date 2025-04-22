import React, { useState } from 'react';
import {
  View, Text, TextInput, ScrollView,
  StyleSheet, Alert, TouchableOpacity
} from 'react-native';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../constants/firebaseConfig';
import { useNavigation } from '@react-navigation/native';
import Header from '../components/common/Header';

export default function AddProductScreen() {
  const [productId, setProductId] = useState('');
  const [productName, setProductName] = useState('');
  const [price, setPrice] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [description, setDescription] = useState('');
  const [stock, setStock] = useState('');
  const navigation = useNavigation();

  const handleAddProduct = async () => {
    if (!productId || !productName || !price || !imageUrl || !stock) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin.');
      return;
    }

    const parsedPrice = parseInt(price);
    const parsedStock = parseInt(stock);

    if (isNaN(parsedPrice) || parsedPrice < 0 || isNaN(parsedStock) || parsedStock < 0) {
      Alert.alert('Lỗi', 'Giá và số lượng phải là số hợp lệ.');
      return;
    }

    try {
      const newProduct = {
        product_id: productId,
        product_name: productName,
        price: parsedPrice,
        image_url: imageUrl,
        description,
        stock: parsedStock,
        created_at: serverTimestamp(),
      };

      await addDoc(collection(db, 'product'), newProduct); // giữ nguyên là 'product' như trong Firestore

      Alert.alert('Thành công', 'Đã thêm sản phẩm!');
      navigation.goBack();
    } catch (error) {
      console.error('Thêm sản phẩm lỗi:', error);
      Alert.alert('Lỗi', 'Không thể thêm sản phẩm. Vui lòng thử lại.');
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Thêm sản phẩm" showBackButton={true} />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <TextInput placeholder="Mã sản phẩm (VD: pro03)" placeholderTextColor="#888" style={styles.input} value={productId} onChangeText={setProductId} />
        <TextInput placeholder="Tên sản phẩm" placeholderTextColor="#888" style={styles.input} value={productName} onChangeText={setProductName} />
        <TextInput placeholder="Giá" placeholderTextColor="#888" style={styles.input} keyboardType="numeric" value={price} onChangeText={setPrice} />
        <TextInput placeholder="Link hình ảnh" placeholderTextColor="#888" style={styles.input} value={imageUrl} onChangeText={setImageUrl} />
        <TextInput placeholder="Mô tả" placeholderTextColor="#888" style={styles.input} value={description} onChangeText={setDescription} />
        <TextInput placeholder="Số lượng trong kho" placeholderTextColor="#888" style={styles.input} keyboardType="numeric" value={stock} onChangeText={setStock} />
      </ScrollView>

      <View style={styles.actionBar}>
        <TouchableOpacity style={styles.addButton} onPress={handleAddProduct}>
          <Text style={styles.addButtonText}>Thêm sản phẩm</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  content: {
    paddingBottom: 100,
    paddingTop: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 12,
    borderRadius: 6,
    paddingHorizontal: 12,
    height: 40,
  },
  actionBar: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    elevation: 10,
  },
  addButton: {
    backgroundColor: '#CC9966',
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
});

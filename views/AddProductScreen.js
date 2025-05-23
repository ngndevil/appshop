import React, { useState } from 'react';
import {
  View, Text, TextInput, ScrollView,
  StyleSheet, Alert, TouchableOpacity
} from 'react-native';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../constants/firebaseConfig';
import { useNavigation } from '@react-navigation/native';
import Header from '../components/common/Header';
import { useTheme } from '../context/ThemeContext';

export default function AddProductScreen() {
  const { colors } = useTheme();
  
  const [productId, setProductId] = useState('');
  const [category_id, setcategory_id] = useState('')
  const [productName, setProductName] = useState('');
  const [price, setPrice] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [description, setDescription] = useState('');
  const [stock, setStock] = useState('');
  const navigation = useNavigation();

  const handleAddProduct = async () => {
    if (!productId || !category_id || !productName || !price || !imageUrl || !stock) {
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
        category_id: category_id,
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

  // Move styles inside component to use theme colors
  const themedStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.card,
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
      borderColor: colors.border,
      marginBottom: 12,
      borderRadius: 6,
      paddingHorizontal: 12,
      height: 40,
      color: colors.text,
    },
    actionBar: {
      padding: 16,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      backgroundColor: colors.card,
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      elevation: 10,
      shadowColor: colors.shadow,
      shadowOffset: {
        width: 0,
        height: -2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 3,
    },
    addButton: {
      backgroundColor: colors.primaryLight,
      paddingVertical: 16,
      borderRadius: 10,
      alignItems: 'center',
    },
    addButtonText: {
      color: colors.card,
      fontSize: 18,
      fontWeight: '700',
    },
  });

  return (
    <View style={themedStyles.container}>
      <Header title="Thêm sản phẩm" showBackButton={true} />

      <ScrollView style={themedStyles.scrollView} contentContainerStyle={themedStyles.content}>
        <TextInput 
          placeholder="Mã sản phẩm (VD: pro03)" 
          placeholderTextColor={colors.textLight} 
          style={themedStyles.input} 
          value={productId} 
          onChangeText={setProductId} 
        />
        <TextInput 
          placeholder="Loại sản phẩm" 
          placeholderTextColor={colors.textLight} 
          style={themedStyles.input} 
          value={category_id} 
          onChangeText={setcategory_id} 
        />
        <TextInput 
          placeholder="Tên sản phẩm" 
          placeholderTextColor={colors.textLight} 
          style={themedStyles.input} 
          value={productName} 
          onChangeText={setProductName} 
        />
        <TextInput 
          placeholder="Giá" 
          placeholderTextColor={colors.textLight} 
          style={themedStyles.input} 
          keyboardType="numeric" 
          value={price} 
          onChangeText={setPrice} 
        />
        <TextInput 
          placeholder="Đường dẫn hình ảnh" 
          placeholderTextColor={colors.textLight} 
          style={themedStyles.input} 
          value={imageUrl} 
          onChangeText={setImageUrl} 
        />
        <TextInput 
          placeholder="Mô tả" 
          placeholderTextColor={colors.textLight} 
          style={themedStyles.input} 
          value={description} 
          onChangeText={setDescription} 
        />
        <TextInput 
          placeholder="Số lượng trong kho" 
          placeholderTextColor={colors.textLight} 
          style={themedStyles.input} 
          keyboardType="numeric" 
          value={stock} 
          onChangeText={setStock} 
        />
      </ScrollView>

      <View style={themedStyles.actionBar}>
        <TouchableOpacity style={themedStyles.addButton} onPress={handleAddProduct}>
          <Text style={themedStyles.addButtonText}>Thêm sản phẩm</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

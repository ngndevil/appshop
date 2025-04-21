import React, { useState } from 'react';
import {
  View, Text, Image, ScrollView, TouchableOpacity,
  Alert, StyleSheet, Pressable
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useCart } from '../context/CartProvider';
import Header from '../components/common/Header';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function ProductDetailScreen({ route }) {
  const { product } = route.params || {};
  const navigation = useNavigation();
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();

  if (!product) {
    return (
      <View style={styles.container}>
        <Header title="Chi tiết sản phẩm" showBackButton={true} />
        <Text style={styles.errorText}>Không tìm thấy sản phẩm</Text>
      </View>
    );
  }

  const handleAddToCart = () => {
    if (!product || !product.id) {
      Alert.alert('Lỗi', 'Không thể thêm sản phẩm vào giỏ hàng. Vui lòng thử lại.');
      return;
    }

    const cartItem = {
      ...product,
      quantity,
    };

    console.log('Adding to cart:', cartItem);
    addToCart(cartItem);
    Alert.alert('Thành công', `Đã thêm ${quantity} sản phẩm vào giỏ hàng`);
  };

  const handleBuyNow = () => {
    Alert.alert('Mua ngay', 'Chức năng này sẽ được thêm trong tương lai');
  };

  return (
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollViewContent}>
      <View style={styles.container}>
      <Header title="Chi tiết sản phẩm" showBackButton={true} />
      <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>
        <Image
          source={{ uri: product.image_url }}
          style={styles.productImage}
          
        />
        <View style={styles.infoContainer}>
          <Text style={styles.productName}>{product.product_name}</Text>
          <Text style={styles.productPrice}>{(product.price || 0).toLocaleString()}₫</Text>
        </View>

        {/* Quantity Selector */}
        <View style={styles.quantityContainer}>
          <Text style={styles.quantityLabel}>Số lượng:</Text>
          <View style={styles.quantitySelector}>
            <Pressable
              onPress={() => quantity > 1 && setQuantity(quantity - 1)}
              style={({ pressed }) => [
                styles.quantityIconButton,
                pressed && styles.quantityIconButtonPressed,
              ]}
            >
              <Ionicons name="remove-circle-outline" size={30} color="#FF5722" />
            </Pressable>
            <Text style={styles.quantityText}>{quantity}</Text>
            <Pressable
              onPress={() => quantity < (product.stock || 10) && setQuantity(quantity + 1)}
              style={({ pressed }) => [
                styles.quantityIconButton,
                pressed && styles.quantityIconButtonPressed,
              ]}
            >
              <Ionicons name="add-circle-outline" size={30} color="#FF5722" />
            </Pressable>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={styles.actionBar}>
        <TouchableOpacity
          style={styles.addToCartButton}
          onPress={handleAddToCart}
          activeOpacity={0.8}
        >
          <Text style={styles.actionButtonText}>Thêm vào giỏ</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.buyNowButton}
          onPress={handleBuyNow}
          activeOpacity={0.8}
        >
          <Text style={styles.actionButtonText}>Mua ngay</Text>
        </TouchableOpacity>
      </View>
    </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  //ScrollView Styles
  scrollView: {
    flex: 1,
    backgroundColor: '#F5F5F5', // Màu nền nhẹ để tạo độ tương phản
    paddingTop: 20,
    paddingBottom: 20, // Để tránh bị che bởi action bar
  },
  // Container Styles
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5', // Màu nền nhẹ để tạo độ tương phản
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20, // Để tránh bị che bởi action bar
  },


  // Image Styles
  productImage: {
    alignSelf: 'center',
    marginTop: 20,
    width: '80%',
    height: 350, // Tăng chiều cao để ảnh nổi bật hơn
    resizeMode: 'cover', // Đổi sang cover để ảnh không bị méo
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    backgroundColor: '#E0E0E0', // Placeholder background khi ảnh đang tải
  },

  // Info Section Styles
  infoContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: -20, // Đè lên phần ảnh để tạo hiệu ứng overlap
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  productName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 10,
  },
  productPrice: {
    fontSize: 22,
    fontWeight: '600',
    color: '#FF5722',
    marginBottom: 12,
  },

  // Quantity Selector Styles
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  quantityLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    backgroundColor: '#FAFAFA',
    height: 48,
    minWidth: 150,
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
  quantityText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    minWidth: 40,
    textAlign: 'center',
  },
  quantityIconButton: {
    padding: 6,
    borderRadius: 8,
  },
  quantityIconButtonPressed: {
    transform: [{ scale: 0.9 }],
    backgroundColor: '#F0F0F0',
  },

  // Action Bar Styles
  actionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  addToCartButton: {
    flex: 1,
    backgroundColor: '#FF5722',
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginRight: 8,
    shadowColor: '#FF5722',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 3,
  },
  buyNowButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginLeft: 8,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 3,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },

  // Error Text Style
  errorText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
});
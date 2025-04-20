import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Header from '../components/common/Header';

export default function ProductDetailScreen({ route }) {
  const { product } = route.params || {};
  const navigation = useNavigation();
  const [quantity, setQuantity] = useState(1);

  if (!product) {
    return (
      <View style={styles.container}>
        <Header title="Chi tiết sản phẩm" showBackButton={true} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Không tìm thấy thông tin sản phẩm</Text>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Quay lại</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const handleAddToCart = () => {
    // Implement your add to cart logic here
    Alert.alert('Thành công', `Đã thêm ${quantity} sản phẩm vào giỏ hàng`);
  };

  const handleBuyNow = () => {
    // Implement your buy now logic here
    Alert.alert('Mua ngay', 'Chức năng này sẽ được thêm trong tương lai');
  };

  const increaseQuantity = () => {
    if (quantity < (product.stock || 10)) {
      setQuantity(quantity + 1);
    } else {
      Alert.alert('Thông báo', 'Đã đạt số lượng tối đa có sẵn');
    }
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Chi tiết sản phẩm" showBackButton={true} />
      
      <ScrollView style={styles.scrollContainer}>
        {/* Product Image */}
        <Image 
          source={{ uri: product.image_url || 'https://via.placeholder.com/400' }}
          style={styles.productImage}
          resizeMode="cover"
        />
        
        {/* Product Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.productName}>{product.product_name || 'Không có tên'}</Text>
          <Text style={styles.productPrice}>
            {(product.price || 0).toLocaleString()}₫
          </Text>
          
          {product.sale_price && (
            <View style={styles.saleContainer}>
              <Text style={styles.originalPrice}>
                {product.price.toLocaleString()}₫
              </Text>
              <Text style={styles.discountBadge}>
                -{Math.round(((product.price - product.sale_price) / product.price) * 100)}%
              </Text>
            </View>
          )}
          
          <View style={styles.stockContainer}>
            <Text style={styles.stockText}>
              Trạng thái: {product.stock > 0 ? 'Còn hàng' : 'Hết hàng'}
            </Text>
            <Text style={styles.stockCount}>
              Số lượng: {product.stock || 0}
            </Text>
          </View>
        </View>
        
        {/* Quantity Selector */}
        <View style={styles.quantityContainer}>
          <Text style={styles.quantityLabel}>Số lượng:</Text>
          <View style={styles.quantitySelector}>
            <TouchableOpacity 
              style={styles.quantityButton} 
              onPress={decreaseQuantity}
              disabled={quantity <= 1}
            >
              <Text style={styles.quantityButtonText}>-</Text>
            </TouchableOpacity>
            
            <Text style={styles.quantityText}>{quantity}</Text>
            
            <TouchableOpacity 
              style={styles.quantityButton}
              onPress={increaseQuantity}
              disabled={quantity >= (product.stock || 10)}
            >
              <Text style={styles.quantityButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Description */}
        <View style={styles.descriptionContainer}>
          <Text style={styles.sectionTitle}>Mô tả sản phẩm</Text>
          <Text style={styles.descriptionText}>
            {product.description || 'Không có thông tin mô tả cho sản phẩm này.'}
          </Text>
        </View>
        
        {/* Specifications if available */}
        {product.specifications && (
          <View style={styles.specificationsContainer}>
            <Text style={styles.sectionTitle}>Thông số kỹ thuật</Text>
            {Object.entries(product.specifications).map(([key, value], index) => (
              <View key={index} style={styles.specRow}>
                <Text style={styles.specKey}>{key}:</Text>
                <Text style={styles.specValue}>{value}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
      
      {/* Bottom Action Bar */}
      <View style={styles.actionBar}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.addToCartButton]}
          onPress={handleAddToCart}
        >
          <Text style={styles.actionButtonText}>Thêm vào giỏ</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.buyNowButton]}
          onPress={handleBuyNow}
        >
          <Text style={styles.actionButtonText}>Mua ngay</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  scrollContainer: {
    flex: 1,
    marginBottom: 60, // Leave space for action bar
  },
  productImage: {
    width: '100%',
    height: 300,
  },
  infoContainer: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 8,
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 20,
    color: '#FF4500',
    fontWeight: 'bold',
  },
  saleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  originalPrice: {
    fontSize: 16,
    color: '#888',
    textDecorationLine: 'line-through',
    marginRight: 8,
  },
  discountBadge: {
    backgroundColor: '#FF4500',
    color: '#fff',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 12,
  },
  stockContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  stockText: {
    fontSize: 14,
    color: '#555',
  },
  stockCount: {
    fontSize: 14,
    color: '#555',
  },
  quantityContainer: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  quantityLabel: {
    fontSize: 16,
    color: '#333',
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
  },
  quantityButton: {
    backgroundColor: '#f0f0f0',
    padding: 8,
    width: 36,
    alignItems: 'center',
  },
  quantityButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  quantityText: {
    paddingHorizontal: 16,
    fontSize: 16,
  },
  descriptionContainer: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#555',
  },
  specificationsContainer: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 16,
  },
  specRow: {
    flexDirection: 'row',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  specKey: {
    flex: 1,
    fontSize: 14,
    color: '#555',
  },
  specValue: {
    flex: 2,
    fontSize: 14,
    color: '#333',
  },
  actionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    flexDirection: 'row',
    backgroundColor: '#fff',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  actionButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addToCartButton: {
    backgroundColor: '#ff9800',
  },
  buyNowButton: {
    backgroundColor: '#ff4500',
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 16,
  },
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#8B4513',
    borderRadius: 4,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});
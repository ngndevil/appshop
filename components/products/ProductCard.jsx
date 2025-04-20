import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useCart } from '../../context/CartProvider';
import { getImageUrl } from '../../constants/firebaseStorage.ts';

const ProductCard = ({ product }) => {
  const navigation = useNavigation();
  const { cartItems, setCartItems } = useCart();
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchImage = async () => {
      if (product.image_url) {
        if (product.image_url.startsWith('http')) {
          setImageUrl(product.image_url); // Full URL (e.g., imgur)
        } else {
          const url = await getImageUrl(product.image_url); // Firebase Storage
          setImageUrl(url);
        }
      }
      setLoading(false);
    };

    fetchImage();
  }, [product.image_url]);

  const handleAddToCart = () => {
    const existingItem = cartItems.find((item) => item.id === product.id);
    if (existingItem) {
      setCartItems(
        cartItems.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      );
    } else {
      setCartItems([...cartItems, { ...product, quantity: 1 }]);
    }
  };

  const handleViewDetail = () => {
    navigation.navigate('ProductDetailScreen', { product });
  };

  return (
    <View style={styles.card}>
      {loading ? (
        <View style={styles.imageContainer}>
          <ActivityIndicator size="small" color="#8B4513" />
        </View>
      ) : imageUrl ? (
        <Image source={{ uri: imageUrl }} style={styles.image} />
      ) : (
        <View style={styles.imageContainer}>
          <Text style={styles.fallbackText}>Không có ảnh</Text>
        </View>
      )}

      <Text style={styles.title}>{product.product_name || product.title || 'Sản phẩm không tên'}</Text>
      <Text style={styles.price}>{(product.price || 0).toLocaleString()}₫</Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={handleAddToCart}>
          <Text style={styles.buttonText}>Thêm vào giỏ</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.viewDetailButton]} onPress={handleViewDetail}>
          <Text style={styles.buttonText}>Chi tiết</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 16,
    margin: 8,
    backgroundColor: '#fff',
    elevation: 2,
  },
  imageContainer: {
    width: '100%',
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f2f2f2',
    borderRadius: 8,
  },
  image: {
    width: '100%',
    height: 150,
    borderRadius: 8,
  },
  fallbackText: {
    fontSize: 14,
    color: '#999',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 8,
  },
  price: {
    fontSize: 16,
    color: '#888',
    marginBottom: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    backgroundColor: '#8B4513',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  viewDetailButton: {
    backgroundColor: '#555',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
});

export default ProductCard;

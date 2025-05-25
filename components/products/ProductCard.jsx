import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useCart } from '../../context/CartProvider';
import { getImageUrl } from '../../constants/firebaseStorage.ts';
import { useTheme } from '../../context/ThemeContext';

const ProductCard = ({ product, isAdmin = false, onViewDetail, onEdit }) => {
  const navigation = useNavigation();
  const { cartItems, setCartItems } = useCart();
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const { colors } = useTheme();

  const isOutOfStock = product.stock <= 0;

  useEffect(() => {
    const fetchImage = async () => {
      if (product.image_url) {
        if (product.image_url.startsWith('http')) {
          setImageUrl(product.image_url);
        } else {
          const url = await getImageUrl(product.image_url);
          setImageUrl(url);
        }
      }
      setLoading(false);
    };

    fetchImage();
  }, [product.image_url]);

  const handleAddToCart = () => {
    if (isOutOfStock) return;

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
    if (onViewDetail) {
      onViewDetail(product);
    } else {
      navigation.navigate('ProductDetailScreen', { product });
    }
  };

  const handleEditProduct = () => {
    if (onEdit) {
      onEdit(product);
    } else {
      navigation.navigate('EditProductScreen', { product });
    }
  };

  const themedStyles = StyleSheet.create({
    card: {
      width: '100%',
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      padding: 12,
      marginBottom: 16,
      backgroundColor: colors.card,
      elevation: 2,
    },
    imageWrapper: {
      position: 'relative',
      width: '100%',
      height: 150,
      borderRadius: 8,
      overflow: 'hidden',
    },
    imageContainer: {
      width: '100%',
      height: 150,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.background,
    },
    image: {
      width: '100%',
      height: '100%',
    },
    fallbackText: {
      fontSize: 14,
      color: colors.textLight,
    },
    overlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(255, 255, 255, 0.7)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    outOfStockText: {
      color: colors.error,
      fontWeight: 'bold',
      fontSize: 18,
    },
    title: {
      fontSize: 16,
      fontWeight: 'bold',
      marginVertical: 8,
      minHeight: 40, //Đảm bảo mọi tiêu đề chiếm cùng chiều cao
      color: colors.text,
    },
    price: {
      fontSize: 14,
      color: colors.textLight,
      marginBottom: 8,
    },
    buttonContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      marginTop: 8,
      gap: 8,
    },
    button: {
      flexGrow: 1,
      flexBasis: '48%',
      paddingVertical: 8,
      borderRadius: 8,
      alignItems: 'center',
    },
    addToCartButton: {
      backgroundColor: colors.primary,
    },
    viewDetailButton: {
      backgroundColor: colors.textSecondary,
    },
    editButton: {
      backgroundColor: colors.primaryLight,
    },
    disabledButton: {
      backgroundColor: colors.disabled,
    },
    buttonText: {
      color: colors.card,
      fontWeight: 'bold',
      fontSize: 12,
    },
  });

  return (
    <View style={themedStyles.card}>
      <View style={themedStyles.imageWrapper}>
        {loading ? (
          <View style={themedStyles.imageContainer}>
            <ActivityIndicator size="small" color={colors.primary} />
          </View>
        ) : imageUrl ? (
          <Image source={{ uri: imageUrl }} style={themedStyles.image} />
        ) : (
          <View style={themedStyles.imageContainer}>
            <Text style={themedStyles.fallbackText}>Không có ảnh</Text>
          </View>
        )}
        {isOutOfStock && (
          <View style={themedStyles.overlay}>
            <Text style={themedStyles.outOfStockText}>OUT OF STOCK</Text>
          </View>
        )}
      </View>

      <Text style={themedStyles.title}>{product.product_name || product.title || 'Sản phẩm không tên'}</Text>
      <Text style={themedStyles.price}>{(product.price || 0).toLocaleString()}₫</Text>

      <View style={themedStyles.buttonContainer}>
        {!isAdmin && (
          <TouchableOpacity
            style={[themedStyles.button, themedStyles.addToCartButton, isOutOfStock && themedStyles.disabledButton]}
            onPress={handleAddToCart}
            disabled={isOutOfStock}
          >
            <Text style={themedStyles.buttonText}>Thêm vào giỏ</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={[themedStyles.button, themedStyles.viewDetailButton]} onPress={handleViewDetail}>
          <Text style={themedStyles.buttonText}>Chi tiết</Text>
        </TouchableOpacity>

        {isAdmin && (
          <TouchableOpacity style={[themedStyles.button, themedStyles.editButton]} onPress={handleEditProduct}>
            <Text style={themedStyles.buttonText}>Edit</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default ProductCard;

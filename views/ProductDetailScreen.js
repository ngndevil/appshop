import React, { useState } from 'react';
import {
  View, Text, Image, ScrollView, TouchableOpacity,
  StyleSheet, Pressable, Modal
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useCart } from '../context/CartProvider';
import Header from '../components/common/Header';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../context/ThemeContext';

export default function ProductDetailScreen({ route }) {
  const { colors } = useTheme();
  const { product } = route.params || {};
  const navigation = useNavigation();
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Define styles inside component to use theme colors
  const themedStyles = StyleSheet.create({
    // ScrollView Styles
    scrollView: {
      flex: 1,
      backgroundColor: colors.background,
      paddingTop: 20,
      paddingBottom: 20, // Avoid being covered by the action bar
    },
    // Container Styles
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContainer: {
      flex: 1,
    },
    scrollContent: {
      paddingBottom: 20, // Avoid being covered by the action bar
    },

    // Image Styles
    productImage: {
      alignSelf: 'center',
      marginTop: 20,
      width: '80%',
      height: 350, // Increased height for better prominence
      resizeMode: 'cover', // Prevent image distortion
      borderBottomLeftRadius: 16,
      borderBottomRightRadius: 16,
      backgroundColor: colors.border, // Placeholder background while loading
    },

    // Info Section Styles
    infoContainer: {
      backgroundColor: colors.card,
      borderRadius: 12,
      marginHorizontal: 16,
      marginTop: -20, // Overlap effect on the image
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 6,
      elevation: 5,
    },
    productName: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 10,
    },
    productPrice: {
      fontSize: 20,
      fontWeight: '600',
      color: colors.primary,
      marginBottom: 12,
    },

    // Quantity Selector Styles
    quantityContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingVertical: 16,
      backgroundColor: colors.card,
      marginHorizontal: 16,
      marginTop: 12,
      borderRadius: 12,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 3,
    },
    quantityLabel: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
    },
    quantitySelector: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 10,
      backgroundColor: colors.primaryLightest,
      height: 48,
      minWidth: 150,
      justifyContent: 'space-between',
      paddingHorizontal: 12,
    },
    quantityText: {
      fontSize: 20,
      fontWeight: '600',
      color: colors.text,
      minWidth: 40,
      textAlign: 'center',
    },
    quantityIconButton: {
      padding: 6,
      borderRadius: 8,
    },
    quantityIconButtonPressed: {
      transform: [{ scale: 0.9 }],
      backgroundColor: colors.primaryLighter,
    },

    // Action Bar Styles
    actionBar: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: colors.card,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 5,
    },
    addToCartButton: {
      flex: 1,
      backgroundColor: colors.primary,
      paddingVertical: 16,
      borderRadius: 10,
      alignItems: 'center',
      marginRight: 8,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.3,
      shadowRadius: 5,
      elevation: 3,
    },
    buyNowButton: {
      flex: 1,
      backgroundColor: colors.textSecondary,
      paddingVertical: 16,
      borderRadius: 10,
      alignItems: 'center',
      marginLeft: 8,
      shadowColor: colors.textSecondary,
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.3,
      shadowRadius: 5,
      elevation: 3,
    },
    actionButtonText: {
      color: colors.card,
      fontSize: 18,
      fontWeight: '700',
    },

    // Error Text Style
    errorText: {
      fontSize: 18,
      color: colors.card,
      textAlign: 'center',
      marginTop: 20,
    },
    
    // Toast Styles
    toast: {
      position: 'absolute',
      top: '50%', 
      left: '25%', 
      transform: [{ translateX: -50 }, { translateY: -50 }],
      backgroundColor: colors.textSecondary,
      padding: 16,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.5,
      shadowRadius: 4,
      elevation: 5,
    },
    toastText: {
      color: colors.card,
      fontSize: 16,
      fontWeight: '600',
    },
  });

  if (!product) {
    return (
      <View style={themedStyles.container}>
        <Header title="Chi tiết sản phẩm" showBackButton={true} />
        <Text style={themedStyles.errorText}>Không tìm thấy sản phẩm</Text>
      </View>
    );
  }

  const showToast = (message) => {
    setToastMessage(message);
    setToastVisible(true);
    setTimeout(() => {
      setToastVisible(false);
    }, 1000); // Dismiss after 1 second
  };

  const handleAddToCart = () => {
    if (!product || !product.id) {
      showToast('Không thể thêm sản phẩm vào giỏ hàng. Vui lòng thử lại.');
      return;
    }

    const cartItem = {
      ...product,
      quantity,
    };

    console.log('Adding to cart:', cartItem);
    addToCart(cartItem);
    showToast(`Đã thêm ${quantity} sản phẩm vào giỏ hàng`);
  };

  const handleBuyNow = () => {
    showToast('Chức năng này sẽ được thêm trong tương lai');
  };

  return (
    <ScrollView style={themedStyles.scrollView} contentContainerStyle={themedStyles.scrollViewContent}>
      <View style={themedStyles.container}>
        <Header title="Chi tiết sản phẩm" showBackButton={true} />
        <ScrollView style={themedStyles.scrollContainer} contentContainerStyle={themedStyles.scrollContent}>
          <Image
            source={{ uri: product.image_url }}
            style={themedStyles.productImage}
          />
          <View style={themedStyles.infoContainer}>
            <Text style={themedStyles.productName}>{product.product_name}</Text>
            <Text style={themedStyles.productPrice}>{(product.price || 0).toLocaleString()}₫</Text>
          </View>

          {/* Quantity Selector */}
          <View style={themedStyles.quantityContainer}>
            <Text style={themedStyles.quantityLabel}>Số lượng:</Text>
            <View style={themedStyles.quantitySelector}>
              <Pressable
                onPress={() => quantity > 1 && setQuantity(quantity - 1)}
                style={({ pressed }) => [
                  themedStyles.quantityIconButton,
                  pressed && themedStyles.quantityIconButtonPressed,
                ]}
              >
                <Ionicons name="remove-circle-outline" size={30} color={colors.primary} />
              </Pressable>
              <Text style={themedStyles.quantityText}>{quantity}</Text>
              <Pressable
                onPress={() => quantity < (product.stock || 10) && setQuantity(quantity + 1)}
                style={({ pressed }) => [
                  themedStyles.quantityIconButton,
                  pressed && themedStyles.quantityIconButtonPressed,
                ]}
              >
                <Ionicons name="add-circle-outline" size={30} color={colors.primary} />
              </Pressable>
            </View>
          </View>
        </ScrollView>

        {/* Bottom Action Bar */}
        <View style={themedStyles.actionBar}>
          <TouchableOpacity
            style={themedStyles.addToCartButton}
            onPress={handleAddToCart}
            activeOpacity={0.8}
          >
            <Text style={themedStyles.actionButtonText}>Thêm vào giỏ</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={themedStyles.buyNowButton}
            onPress={handleBuyNow}
            activeOpacity={0.8}
          >
            <Text style={themedStyles.actionButtonText}>Mua ngay</Text>
          </TouchableOpacity>
        </View>

        {/* Toast Message */}
        {toastVisible && (
          <View style={themedStyles.toast}>
            <Text style={themedStyles.toastText}>{toastMessage}</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

import React, { useState } from 'react';
import {
  View, Text, Image, ScrollView, TouchableOpacity,
  StyleSheet, Pressable, Modal, Animated, Dimensions
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useCart } from '../context/CartProvider';
import Header from '../components/common/Header';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../context/ThemeContext';

export default function ProductDetailScreen({ route }) {
  const { colors } = useTheme();
  const { product } = route.params || {};
  const navigation = useNavigation();
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const windowWidth = Dimensions.get('window').width;

  // Define styles inside component to use theme colors
  const themedStyles = StyleSheet.create({
    // ScrollView Styles
    scrollView: {
      flex: 1,
      backgroundColor: colors.background,
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
      paddingBottom: 80,
    },

    // Image Styles
    imageContainer: {
      width: '100%',
      height: 400,
      backgroundColor: colors.primaryLightest,
      borderBottomLeftRadius: 30,
      borderBottomRightRadius: 30,
      overflow: 'hidden',
      elevation: 4,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
    },
    productImage: {
      width: '100%',
      height: '100%',
      resizeMode: 'cover',
    },

    // Info Section Styles
    infoSection: {
      paddingHorizontal: 20,
      marginTop: 20,
    },
    brandText: {
      fontSize: 14,
      color: colors.primary,
      fontWeight: '600',
      letterSpacing: 1,
      textTransform: 'uppercase',
      marginBottom: 8,
    },
    productName: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 10,
      letterSpacing: 0.5,
    },
    productPrice: {
      fontSize: 22,
      fontWeight: '700',
      color: colors.primary,
      marginBottom: 16,
    },
    divider: {
      height: 1,
      backgroundColor: colors.border,
      marginVertical: 16,
      width: '100%',
    },

    // Description Section
    descriptionSection: {
      paddingHorizontal: 20,
      marginTop: 8,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 12,
    },
    descriptionText: {
      fontSize: 15,
      lineHeight: 22,
      color: colors.textSecondary,
      marginBottom: 16,
    },

    // Size/Variant Section
    sizeSection: {
      paddingHorizontal: 20,
      marginTop: 12,
    },
    sizeContainer: {
      flexDirection: 'row',
      marginTop: 10,
      marginBottom: 20,
    },
    sizeOption: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      paddingVertical: 8,
      paddingHorizontal: 16,
      marginRight: 12,
      minWidth: 45,
      alignItems: 'center',
    },
    sizeOptionSelected: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    sizeText: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    sizeTextSelected: {
      color: colors.card,
      fontWeight: '600',
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
      marginTop: 20,
      borderRadius: 16,
      elevation: 3,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.12,
      shadowRadius: 6,
    },
    quantityLabel: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      letterSpacing: 0.5,
    },
    quantitySelector: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 10,
      backgroundColor: colors.primaryLightest,
      height: 44,
      minWidth: 130,
      justifyContent: 'space-between',
    },
    quantityButton: {
      width: 42,
      height: '100%',
      justifyContent: 'center',
      alignItems: 'center',
    },
    quantityText: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      minWidth: 32,
      textAlign: 'center',
    },

    // Features Section
    featuresSection: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      marginTop: 24,
      marginBottom: 16,
    },
    featureItem: {
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 10,
      backgroundColor: colors.primaryLightest,
      borderRadius: 12,
      minWidth: (windowWidth - 56) / 3,
    },
    featureIcon: {
      marginBottom: 6,
    },
    featureText: {
      fontSize: 12,
      color: colors.textSecondary,
      textAlign: 'center',
      fontWeight: '500',
    },

    // Action Bar Styles
    actionBar: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: colors.background,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: -3 },
      shadowOpacity: 0.1,
      shadowRadius: 6,
      elevation: 10,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    addToCartButton: {
      flex: 1,
      backgroundColor: colors.primaryLightest,
      paddingVertical: 16,
      borderRadius: 14,
      alignItems: 'center',
      marginRight: 10,
      borderWidth: 1,
      borderColor: colors.primary,
    },
    buyNowButton: {
      flex: 1.5,
      backgroundColor: colors.primary,
      paddingVertical: 16,
      borderRadius: 14,
      alignItems: 'center',
      marginLeft: 10,
      flexDirection: 'row',
      justifyContent: 'center',
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 4,
    },
    addToCartText: {
      color: colors.primary,
      fontSize: 16,
      fontWeight: '600',
      letterSpacing: 0.5,
    },
    buyNowText: {
      color: colors.card,
      fontSize: 16,
      fontWeight: '700',
      letterSpacing: 0.5,
      marginLeft: 8,
    },

    // Toast Styles
    toast: {
      position: 'absolute',
      bottom: 100, 
      left: 20,
      right: 20,
      backgroundColor: colors.card,
      padding: 16,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 6,
      borderWidth: 1,
      borderColor: colors.primary,
      flexDirection: 'row',
    },
    toastText: {
      color: colors.text,
      fontSize: 15,
      fontWeight: '500',
      marginLeft: 8,
    },
    
    // Error State
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    errorText: {
      fontSize: 18,
      color: colors.text,
      textAlign: 'center',
      marginTop: 20,
    },
  });

  if (!product) {
    return (
      <View style={themedStyles.container}>
        <Header title="Chi tiết sản phẩm" showBackButton={true} />
        <View style={themedStyles.errorContainer}>
          <MaterialIcons name="error-outline" size={60} color={colors.error} />
          <Text style={themedStyles.errorText}>Không tìm thấy sản phẩm</Text>
        </View>
      </View>
    );
  }

  const showToast = (message) => {
    setToastMessage(message);
    setToastVisible(true);
    setTimeout(() => {
      setToastVisible(false);
    }, 2000); 
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

// In ProductDetailScreen.js
const [selectedSize, setSelectedSize] = useState('M'); // Add if size selection is needed

const handleBuyNow = () => {
  if (!product || !product.id) {
    showToast('Không thể mua sản phẩm. Vui lòng thử lại.');
    return;
  }

  const cartItem = {
    id: product.id,
    product_name: product.product_name,
    price: product.price,
    quantity,
    size: selectedSize, // Include if size selection is implemented
  };

  navigation.navigate('InformationUserScreen', {
    cartItems: [cartItem],
  });
};

// Update size selector (if size selection is implemented)

 
  return (
    <View style={themedStyles.container}>
      <ScrollView 
        style={themedStyles.scrollView} 
        contentContainerStyle={themedStyles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Header title="" showBackButton={true} transparent />
        
        {/* Product Image */}
        <View style={themedStyles.imageContainer}>
          <Image
            source={{ uri: product.image_url }}
            style={themedStyles.productImage}
          />
        </View>

        {/* Product Info */}
        <View style={themedStyles.infoSection}>
          <Text style={themedStyles.brandText}>{product.brand || 'Thương hiệu'}</Text>
          <Text style={themedStyles.productName}>{product.product_name}</Text>
          <Text style={themedStyles.productPrice}>{(product.price || 0).toLocaleString()}₫</Text>
          
          <View style={themedStyles.divider} />
        </View>

        {/* Size Options */}
        <View style={themedStyles.sizeContainer}>
  {['S', 'M', 'L', 'XL', 'XXL'].map((size) => (
    <TouchableOpacity
      key={size}
      style={[
        themedStyles.sizeOption,
        selectedSize === size ? themedStyles.sizeOptionSelected : null
      ]}
      onPress={() => setSelectedSize(size)}
    >
      <Text
        style={[
          themedStyles.sizeText,
          selectedSize === size ? themedStyles.sizeTextSelected : null
        ]}
      >
        {size}
      </Text>
    </TouchableOpacity>
  ))}
</View>

        {/* Quantity Selector */}
        <View style={themedStyles.quantityContainer}>
          <Text style={themedStyles.quantityLabel}>Số lượng:</Text>
          <View style={themedStyles.quantitySelector}>
            <TouchableOpacity
              style={themedStyles.quantityButton}
              onPress={() => quantity > 1 && setQuantity(quantity - 1)}
            >
              <Ionicons name="remove" size={20} color={colors.primary} />
            </TouchableOpacity>
            <Text style={themedStyles.quantityText}>{quantity}</Text>
            <TouchableOpacity
              style={themedStyles.quantityButton}
              onPress={() => quantity < (product.stock || 10) && setQuantity(quantity + 1)}
            >
              <Ionicons name="add" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Description */}
        <View style={themedStyles.descriptionSection}>
          <Text style={themedStyles.sectionTitle}>Mô tả sản phẩm</Text>
          <Text style={themedStyles.descriptionText}>
            {product.description || 'Sản phẩm thời trang cao cấp với chất liệu vải mềm mại, thoáng mát, thiết kế hiện đại và phù hợp với mọi dáng người.'}
          </Text>
        </View>

        {/* Features */}
        <View style={themedStyles.featuresSection}>
          <View style={themedStyles.featureItem}>
            <MaterialIcons name="local-shipping" size={22} color={colors.primary} style={themedStyles.featureIcon} />
            <Text style={themedStyles.featureText}>Giao hàng miễn phí</Text>
          </View>
          <View style={themedStyles.featureItem}>
            <MaterialIcons name="update" size={22} color={colors.primary} style={themedStyles.featureIcon} />
            <Text style={themedStyles.featureText}>Đổi trả 30 ngày</Text>
          </View>
          <View style={themedStyles.featureItem}>
            <MaterialIcons name="verified" size={22} color={colors.primary} style={themedStyles.featureIcon} />
            <Text style={themedStyles.featureText}>Bảo hành 1 năm</Text>
          </View>
        </View>
      </ScrollView>

      {/* Action Bar */}
      <View style={themedStyles.actionBar}>
        <TouchableOpacity
          style={themedStyles.addToCartButton}
          onPress={handleAddToCart}
          activeOpacity={0.8}
        >
          <Text style={themedStyles.addToCartText}>Thêm vào giỏ</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={themedStyles.buyNowButton}
          onPress={handleBuyNow}
          activeOpacity={0.8}
        >
          <MaterialIcons name="shopping-bag" size={20} color={colors.card} />
          <Text style={themedStyles.buyNowText}>Mua ngay</Text>
        </TouchableOpacity>
      </View>

      {/* Toast Message */}
      {toastVisible && (
        <View style={themedStyles.toast}>
          <Ionicons name="checkmark-circle" size={22} color={colors.primary} />
          <Text style={themedStyles.toastText}>{toastMessage}</Text>
        </View>
      )}
    </View>
  );
}

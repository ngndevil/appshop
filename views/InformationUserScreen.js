import React, { useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity,
  ScrollView, Alert, ActivityIndicator
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import Header from '../components/common/Header';
import { handleBuyNowService } from './OrderService';

export default function InformationUserScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const cartItems = route.params?.cartItems || []; // Expect cartItems from ProductDetailScreen
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);

  // Calculate total price
  const totalPrice = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleBuyNow = async () => {
    if (!cartItems.length) {
      Alert.alert('Lỗi', 'Không có sản phẩm để đặt hàng.');
      return;
    }
    if (!name.trim() || !address.trim() || !phone.trim()) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin.');
      return;
    }
    if (!/^\d{10,11}$/.test(phone)) {
      Alert.alert('Lỗi', 'Số điện thoại phải có 10-11 số.');
      return;
    }

    setIsLoading(true);
    try {
      const orderData = {
        items: cartItems.map(item => ({
          id: item.id,
          product_name: item.product_name,
          price: item.price,
          quantity: item.quantity,
          size: item.size || null,
        })),
        customerInfo: { name, address, phone },
      };

      const response = await handleBuyNowService(orderData);
      if (response.success) {
        setToastVisible(true);
        setTimeout(() => {
          setToastVisible(false);
          navigation.reset({
            index: 0,
            routes: [{ name: 'OrderHistoryScreen' }],
          });
        }, 2000);
      } else {
        Alert.alert('Lỗi', response.message || 'Không thể đặt hàng.');
      }
    } catch (error) {
      console.error('Buy Now error:', error);
      Alert.alert('Lỗi', error.message || 'Đã xảy ra lỗi khi đặt hàng.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!cartItems.length) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Header title="Thông tin người nhận" showBackButton />
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: colors.text }]}>
            Không có sản phẩm để đặt hàng.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Thông tin người nhận" showBackButton />
      <ScrollView contentContainerStyle={styles.form}>
        {/* Customer Information */}
        <Text style={[styles.label, { color: colors.text }]}>Họ và tên</Text>
        <TextInput
          style={[styles.input, { borderColor: colors.border, color: colors.text }]}
          value={name}
          onChangeText={setName}
          placeholder="Nhập tên của bạn"
          placeholderTextColor={colors.textSecondary}
          accessibilityLabel="Tên người nhận"
        />
        <Text style={[styles.label, { color: colors.text }]}>Địa chỉ</Text>
        <TextInput
          style={[styles.input, { borderColor: colors.border, color: colors.text }]}
          value={address}
          onChangeText={setAddress}
          placeholder="Nhập địa chỉ"
          placeholderTextColor={colors.textSecondary}
          accessibilityLabel="Địa chỉ giao hàng"
        />
        <Text style={[styles.label, { color: colors.text }]}>Số điện thoại</Text>
        <TextInput
          style={[styles.input, { borderColor: colors.border, color: colors.text }]}
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          placeholder="Nhập số điện thoại"
          placeholderTextColor={colors.textSecondary}
          accessibilityLabel="Số điện thoại liên lạc"
        />

        {/* Order Summary */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Tóm tắt đơn hàng</Text>
        {cartItems.map((item, index) => (
          <View key={index} style={styles.itemContainer}>
            <Text style={[styles.itemLabel, { color: colors.text }]}>
              Sản phẩm: {item.product_name}
            </Text>
            <Text style={[styles.itemValue, { color: colors.textSecondary }]}>
              Giá: {(item.price || 0).toLocaleString()}₫
            </Text>
            <Text style={[styles.itemValue, { color: colors.textSecondary }]}>
              Số lượng: {item.quantity}
            </Text>
            {item.size && (
              <Text style={[styles.itemValue, { color: colors.textSecondary }]}>
                Kích thước: {item.size}
              </Text>
            )}
          </View>
        ))}
        <Text style={[styles.totalLabel, { color: colors.text }]}>
          Tổng cộng: {totalPrice.toLocaleString()}₫
        </Text>

        {/* Confirm Button */}
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.primary }]}
          onPress={handleBuyNow}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={colors.card} />
          ) : (
            <Text style={[styles.buttonText, { color: colors.card }]}>Xác nhận mua</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Toast */}
      {toastVisible && (
        <View style={[styles.toast, { backgroundColor: colors.primary }]}>
          <Text style={[styles.toastText, { color: colors.card }]}>
            Đơn hàng đã được đặt thành công!
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  form: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginTop: 4,
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 24,
    marginBottom: 12,
  },
  itemContainer: {
    marginBottom: 12,
  },
  itemLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  itemValue: {
    fontSize: 14,
    marginTop: 4,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 16,
  },
  button: {
    marginTop: 32,
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
  },
  toast: {
    position: 'absolute',
    bottom: 50,
    left: '10%',
    right: '10%',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  toastText: {
    fontSize: 14,
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    textAlign: 'center',
  },
});
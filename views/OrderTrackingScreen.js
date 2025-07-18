import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  Alert,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import Header from '../components/common/Header';
import SlideButton from 'rn-slide-button';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../constants/firebaseConfig';
import { handleCancelOrder } from './handleCancelOrder';
import { useTheme } from '../context/ThemeContext';

const screenHeight = Dimensions.get('window').height;

const OrderTrackingScreen = ({ route, navigation }) => {
  const { colors } = useTheme();
  const { order } = route.params;
  const [status, setStatus] = useState(order.status || 'pending');
  const [confirmed, setConfirmed] = useState(
    order.status === 'processing' || order.status === 'shipped' || order.status === 'delivered'
  );
  const [isCancelling, setIsCancelling] = useState(false);

const formatDate = (createdAt) => {
    try {
      if (!createdAt) {
        return 'Không xác định';
      }
      if (typeof createdAt.toDate === 'function') {
        return createdAt.toDate().toLocaleString('vi-VN');
      }
      const date = new Date(createdAt);
      if (isNaN(date.getTime())) {
        return 'Ngày không hợp lệ';
      }
      return date.toLocaleString('vi-VN');
    } catch (e) {
      return 'Lỗi định dạng ngày';
    }
  };


  const updateStatus = async (newStatus) => {
    try {
      const orderRef = doc(db, 'orders', order.id);
      await updateDoc(orderRef, { status: newStatus });
      setStatus(newStatus);
      if (newStatus === 'processing') {
        setConfirmed(true);
      }
      Alert.alert('✅ Thành công', `Đã cập nhật trạng thái: ${newStatus}`);
    } catch (err) {
      console.error('Update error:', err);
      Alert.alert('❌ Lỗi', 'Không thể cập nhật trạng thái đơn hàng.');
    }
  };

  const cancelOrder = () => {
    Alert.alert(
      '❗ Xác nhận',
      'Bạn có chắc chắn muốn hủy đơn hàng này không?',
      [
        { text: 'Không', style: 'cancel' },
        {
          text: 'Có',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsCancelling(true);
              await handleCancelOrder(order.id, order.items);
              navigation.goBack();
            } catch (error) {
              console.error('Cancel error:', error);
            } finally {
              setIsCancelling(false);
            }
          },
        },
      ]
    );
  };

  const getStatusLabel = (statusValue) => {
    switch (statusValue) {
      case 'pending':
        return 'Đã đặt';
      case 'processing':
        return 'Đã xác nhận';
      case 'shipped':
        return 'Đang vận chuyển';
      case 'delivered':
        return 'Đã giao hàng';
      case 'cancelled':
        return 'Đã hủy';
      default:
        return 'Không xác định';
    }
  };

  // Move styles inside component to use theme colors
  const themedStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.card,
    },
    content: {
      padding: 16,
      paddingBottom: 120,
    },
    infoText: {
      color: colors.text,
    },
    sectionTitle: {
      fontWeight: 'bold',
      fontSize: 16,
      marginVertical: 12,
      color: colors.primary,
    },
    productCard: {
      flexDirection: 'row',
      backgroundColor: colors.primaryLightest,
      padding: 10,
      borderRadius: 10,
      marginBottom: 10,
    },
    image: {
      width: 60,
      height: 60,
      borderRadius: 8,
    },
    itemInfo: {
      flex: 1,
      marginLeft: 10,
      justifyContent: 'center',
    },
    productName: {
      fontWeight: 'bold',
      fontSize: 14,
      marginBottom: 2,
      color: colors.text,
    },
    total: {
      marginTop: 10,
      fontSize: 16,
      fontWeight: 'bold',
      color: colors.text,
    },
    status: {
      marginTop: 5,
      fontSize: 14,
      color: colors.primary,
    },
    date: {
      marginTop: 2,
      fontSize: 13,
      color: colors.textSecondary,
    },
    slideWrapper: {
      position: 'absolute',
      bottom: 20,
      left: 0,
      right: 0,
      alignItems: 'center',
    },
    slide: {
      backgroundColor: colors.primaryLight,
      borderRadius: 28,
      elevation: 3,
    },
    cancelButton: {
      marginBottom: 12,
      backgroundColor: colors.error,
      paddingVertical: 10,
      paddingHorizontal: 30,
      borderRadius: 25,
    },
    cancelText: {
      color: colors.card,
      fontWeight: 'bold',
    },
    statusButtons: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginTop: 25,
    },
    statusBtn: {
      backgroundColor: colors.primary,
      paddingVertical: 10,
      paddingHorizontal: 18,
      borderRadius: 20,
      color: colors.card,
      fontWeight: 'bold',
      overflow: 'hidden',
    },
  });

  return (
    <View style={themedStyles.container}>
      <Header title="Theo dõi đơn hàng" showBackButton />

      <ScrollView contentContainerStyle={themedStyles.content}>
        <Text style={themedStyles.sectionTitle}>👤 Khách hàng</Text>
        <Text style={themedStyles.infoText}>Tên: {order.customerName || 'Không có'}</Text>
        <Text style={themedStyles.infoText}>SĐT: {order.customerPhone || 'Không có'}</Text>
        <Text style={themedStyles.infoText}>Địa chỉ: {order.customerAddress || 'Không có'}</Text>

        <Text style={themedStyles.sectionTitle}>🛒 Sản phẩm</Text>
        {order.items?.map((item, index) => (
          <View key={index} style={themedStyles.productCard}>
            <Image source={{ uri: item.image_url }} style={themedStyles.image} />
            <View style={themedStyles.itemInfo}>
              <Text style={themedStyles.productName}>{item.product_name}</Text>
              <Text style={themedStyles.infoText}>Số lượng: {item.quantity}</Text>
              <Text style={themedStyles.infoText}>Giá: {(item.price || 0).toLocaleString()}₫</Text>
            </View>
          </View>
        ))}

        <Text style={themedStyles.total}>Tổng tiền: {(order.total || 0).toLocaleString()}₫</Text>
        <Text style={themedStyles.status}>Trạng thái: {getStatusLabel(status)}</Text>
        <Text style={themedStyles.date}>Ngày đặt: {formatDate(order.createdAt)}</Text>

        {confirmed && (
          <View style={themedStyles.statusButtons}>
            <Text style={themedStyles.statusBtn} onPress={() => updateStatus('shipped')}>
              🚚 Đang vận chuyển
            </Text>
            <Text style={themedStyles.statusBtn} onPress={() => updateStatus('delivered')}>
              ✅ Đã giao hàng
            </Text>
          </View>
        )}
      </ScrollView>

      {!confirmed && (
        <View style={themedStyles.slideWrapper}>
          {!isCancelling && (
            <TouchableOpacity onPress={cancelOrder} style={themedStyles.cancelButton}>
              <Text style={themedStyles.cancelText}>❌ Hủy đơn hàng</Text>
            </TouchableOpacity>
          )}

          <SlideButton
            width="90%"
            height={56}
            onReachedToEnd={() => updateStatus('processing')}
            title="Trượt để xác nhận đơn hàng"
            titleStyle={{ color: colors.card, fontWeight: '600', fontSize: 15 }}
            thumbStyle={{
              backgroundColor: colors.card,
              borderRadius: 30,
            }}
            containerStyle={themedStyles.slide}
            underlayStyle={{ backgroundColor: colors.primary }}
          />
        </View>
      )}
    </View>
  );
};

export default OrderTrackingScreen;

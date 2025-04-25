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
import { handleCancelOrder } from './handleCancelOrder'; // ✅ Import mới

const screenHeight = Dimensions.get('window').height;

const OrderTrackingScreen = ({ route, navigation }) => {
  const { order } = route.params;
  const [status, setStatus] = useState(order.status || 'pending');
  const [confirmed, setConfirmed] = useState(
    order.status === 'processing' || order.status === 'shipped' || order.status === 'delivered'
  );
  const [isCancelling, setIsCancelling] = useState(false);

  const formatDate = (createdAt) => {
    try {
      if (!createdAt) return 'Không xác định';
      if (createdAt.seconds) {
        return new Date(createdAt.seconds * 1000).toLocaleString('vi-VN');
      }
      return new Date(createdAt).toLocaleString('vi-VN');
    } catch (e) {
      return 'Invalid Date';
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
              await handleCancelOrder(order.id, order.items); // ✅ Gọi hàm hủy mới
              navigation.goBack();
            } catch (error) {
              console.error('Cancel error:', error);
              // Alert đã hiển thị sẵn trong handleCancelOrder
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

  return (
    <View style={styles.container}>
      <Header title="Theo dõi đơn hàng" showBackButton />

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>👤 Khách hàng</Text>
        <Text>Tên: {order.customerName || 'Không có'}</Text>
        <Text>SĐT: {order.customerPhone || 'Không có'}</Text>
        <Text>Địa chỉ: {order.customerAddress || 'Không có'}</Text>

        <Text style={styles.sectionTitle}>🛒 Sản phẩm</Text>
        {order.items?.map((item, index) => (
          <View key={index} style={styles.productCard}>
            <Image source={{ uri: item.image_url }} style={styles.image} />
            <View style={styles.itemInfo}>
              <Text style={styles.productName}>{item.product_name}</Text>
              <Text>Số lượng: {item.quantity}</Text>
              <Text>Giá: {(item.price || 0).toLocaleString()}₫</Text>
            </View>
          </View>
        ))}

        <Text style={styles.total}>Tổng tiền: {(order.total || 0).toLocaleString()}₫</Text>
        <Text style={styles.status}>Trạng thái: {getStatusLabel(status)}</Text>
        <Text style={styles.date}>Ngày đặt: {formatDate(order.createdAt)}</Text>

        {confirmed && (
          <View style={styles.statusButtons}>
            <Text style={styles.statusBtn} onPress={() => updateStatus('shipped')}>
              🚚 Đang vận chuyển
            </Text>
            <Text style={styles.statusBtn} onPress={() => updateStatus('delivered')}>
              ✅ Đã giao hàng
            </Text>
          </View>
        )}
      </ScrollView>

      {!confirmed && (
        <View style={styles.slideWrapper}>
          {!isCancelling && (
            <TouchableOpacity onPress={cancelOrder} style={styles.cancelButton}>
              <Text style={styles.cancelText}>❌ Hủy đơn hàng</Text>
            </TouchableOpacity>
          )}

          <SlideButton
            width="90%"
            height={56}
            onReachedToEnd={() => updateStatus('processing')}
            title="Trượt để xác nhận đơn hàng"
            titleStyle={{ color: '#fff', fontWeight: '600', fontSize: 15 }}
            thumbStyle={{
              backgroundColor: '#fff',
              borderRadius: 30,
            }}
            containerStyle={styles.slide}
            underlayStyle={{ backgroundColor: '#8B4513' }}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 16,
    paddingBottom: 120,
  },
  sectionTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginVertical: 12,
    color: '#8B4513',
  },
  productCard: {
    flexDirection: 'row',
    backgroundColor: '#f3ece7',
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
  },
  total: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#5d4037',
  },
  status: {
    marginTop: 5,
    fontSize: 14,
    color: '#8B4513',
  },
  date: {
    marginTop: 2,
    fontSize: 13,
    color: '#555',
  },
  slideWrapper: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  slide: {
    backgroundColor: '#d2b48c',
    borderRadius: 28,
    elevation: 3,
  },
  cancelButton: {
    marginBottom: 12,
    backgroundColor: '#d9534f',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  cancelText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  statusButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 25,
  },
  statusBtn: {
    backgroundColor: '#8B4513',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 20,
    color: '#fff',
    fontWeight: 'bold',
    overflow: 'hidden',
  },
});

export default OrderTrackingScreen;

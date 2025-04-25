import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, Dimensions } from 'react-native';
import Header from '../components/common/Header';
import { FontAwesome5 } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const OrderStatusScreen = ({ route }) => {
  const { order } = route.params;

  const statusSteps = [
    { key: 'placed', title: 'Đã đặt hàng', icon: 'clipboard-list', date: order.createdAt },
    { key: 'processing', title: 'Đang xử lý', icon: 'shipping-fast', date: order.processingDate },
    { key: 'shipped', title: 'Đã giao hàng', icon: 'truck', date: order.shippedDate },
    { key: 'delivered', title: 'Đã nhận hàng', icon: 'check-circle', date: order.deliveredDate },
  ];

  const currentStatus = order.status || 'placed';

  const formatDate = (timestamp) => {
    return timestamp ? new Date(timestamp).toLocaleString() : 'Chưa cập nhật';
  };

  return (
    <View style={styles.screen}>
      <Header title="Theo dõi đơn hàng" showBackButton />
      <ScrollView contentContainerStyle={styles.container}>

        {/* Danh sách sản phẩm trong đơn hàng */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sản phẩm đã đặt</Text>
          {order.items?.map((item, index) => (
            <View key={index} style={styles.productCard}>
              <Image source={{ uri: item.image }} style={styles.image} />
              <View style={styles.productInfo}>
                <Text style={styles.name}>{item.product_name || 'Sản phẩm'}</Text>
                <Text style={styles.details}>
                  Size: {item.size || 'M'} | SL: {item.quantity}
                </Text>
                <Text style={styles.price}>{(item.price * item.quantity).toLocaleString()}₫</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Chi tiết đơn hàng */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Chi tiết đơn hàng</Text>
          <View style={styles.rowBetween}>
            <Text style={styles.label}>Ngày giao dự kiến:</Text>
            <Text style={styles.value}>{formatDate(order.expectedDeliveryDate)}</Text>
          </View>
          <View style={styles.rowBetween}>
            <Text style={styles.label}>Mã theo dõi:</Text>
            <Text style={[styles.value, styles.bold]}>{order.trackingId || 'Không có'}</Text>
          </View>
          <View style={styles.rowBetween}>
            <Text style={styles.label}>Tổng cộng:</Text>
            <Text style={[styles.value, styles.bold]}>{(order.total || 0).toLocaleString()}₫</Text>
          </View>
        </View>

        {/* Trạng thái đơn hàng */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Trạng thái đơn hàng</Text>
          {statusSteps.map((step, index) => {
            const isActive =
              currentStatus === step.key ||
              statusSteps.findIndex((s) => s.key === currentStatus) > index;
            const isCurrent = currentStatus === step.key;

            return (
              <View key={step.key} style={styles.statusRow}>
                <View style={[styles.statusIconContainer, isActive && styles.activeCircle]}>
                  <FontAwesome5
                    name={step.icon}
                    size={16}
                    color={isActive ? '#fff' : '#ccc'}
                  />
                </View>
                <View style={styles.statusInfo}>
                  <Text style={[styles.statusTitle, isCurrent && styles.currentStep]}>
                    {step.title}
                  </Text>
                  <Text style={styles.statusDate}>{formatDate(step.date)}</Text>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    padding: 16,
    paddingBottom: 40,
  },
  productCard: {
    flexDirection: 'row',
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
    elevation: 1,
  },
  image: {
    width: width * 0.22,
    height: width * 0.22,
    borderRadius: 8,
    resizeMode: 'cover',
    backgroundColor: '#eee',
  },
  productInfo: {
    flex: 1,
    paddingLeft: 12,
  },
  name: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
  },
  details: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#8B4513',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  label: {
    fontSize: 14,
    color: '#555',
  },
  value: {
    fontSize: 14,
    color: '#111',
  },
  bold: {
    fontWeight: 'bold',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activeCircle: {
    backgroundColor: '#8B4513',
    borderColor: '#8B4513',
  },
  statusInfo: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  currentStep: {
    color: '#8B4513',
  },
  statusDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
});

export default OrderStatusScreen;

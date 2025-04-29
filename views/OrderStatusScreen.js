import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, Dimensions } from 'react-native';
import Header from '../components/common/Header';
import { FontAwesome5 } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');

const OrderStatusScreen = ({ route }) => {
  const { order } = route.params;
  const { colors } = useTheme();

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

  // Define styles inside component to use theme colors
  const themedStyles = StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.card,
    },
    container: {
      padding: 16,
      paddingBottom: 40,
    },
    productCard: {
      flexDirection: 'row',
      backgroundColor: colors.primaryLightest,
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
      backgroundColor: colors.border,
    },
    productInfo: {
      flex: 1,
      paddingLeft: 12,
    },
    name: {
      fontWeight: 'bold',
      fontSize: 16,
      marginBottom: 4,
      color: colors.text,
    },
    details: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 4,
    },
    price: {
      fontSize: 16,
      fontWeight: 'bold',
      color: colors.primary,
    },
    section: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      marginBottom: 10,
      color: colors.text,
    },
    rowBetween: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 6,
    },
    label: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    value: {
      fontSize: 14,
      color: colors.text,
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
      borderColor: colors.disabled,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    activeCircle: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    statusInfo: {
      flex: 1,
    },
    statusTitle: {
      fontSize: 14,
      fontWeight: 'bold',
      color: colors.text,
    },
    currentStep: {
      color: colors.primary,
    },
    statusDate: {
      fontSize: 12,
      color: colors.textLight,
      marginTop: 2,
    },
  });

  return (
    <View style={themedStyles.screen}>
      <Header title="Theo dõi đơn hàng" showBackButton />
      <ScrollView contentContainerStyle={themedStyles.container}>

        {/* Danh sách sản phẩm trong đơn hàng */}
        <View style={themedStyles.section}>
          <Text style={themedStyles.sectionTitle}>Sản phẩm đã đặt</Text>
          {order.items?.map((item, index) => (
            <View key={index} style={themedStyles.productCard}>
              <Image source={{ uri: item.image }} style={themedStyles.image} />
              <View style={themedStyles.productInfo}>
                <Text style={themedStyles.name}>{item.product_name || 'Sản phẩm'}</Text>
                <Text style={themedStyles.details}>
                  Size: {item.size || 'M'} | SL: {item.quantity}
                </Text>
                <Text style={themedStyles.price}>{(item.price * item.quantity).toLocaleString()}₫</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Chi tiết đơn hàng */}
        <View style={themedStyles.section}>
          <Text style={themedStyles.sectionTitle}>Chi tiết đơn hàng</Text>
          <View style={themedStyles.rowBetween}>
            <Text style={themedStyles.label}>Ngày giao dự kiến:</Text>
            <Text style={themedStyles.value}>{formatDate(order.expectedDeliveryDate)}</Text>
          </View>
          <View style={themedStyles.rowBetween}>
            <Text style={themedStyles.label}>Mã theo dõi:</Text>
            <Text style={[themedStyles.value, themedStyles.bold]}>{order.trackingId || 'Không có'}</Text>
          </View>
          <View style={themedStyles.rowBetween}>
            <Text style={themedStyles.label}>Tổng cộng:</Text>
            <Text style={[themedStyles.value, themedStyles.bold]}>{(order.total || 0).toLocaleString()}₫</Text>
          </View>
        </View>

        {/* Trạng thái đơn hàng */}
        <View style={themedStyles.section}>
          <Text style={themedStyles.sectionTitle}>Trạng thái đơn hàng</Text>
          {statusSteps.map((step, index) => {
            const isActive =
              currentStatus === step.key ||
              statusSteps.findIndex((s) => s.key === currentStatus) > index;
            const isCurrent = currentStatus === step.key;

            return (
              <View key={step.key} style={themedStyles.statusRow}>
                <View style={[themedStyles.statusIconContainer, isActive && themedStyles.activeCircle]}>
                  <FontAwesome5
                    name={step.icon}
                    size={16}
                    color={isActive ? colors.card : colors.disabled}
                  />
                </View>
                <View style={themedStyles.statusInfo}>
                  <Text style={[themedStyles.statusTitle, isCurrent && themedStyles.currentStep]}>
                    {step.title}
                  </Text>
                  <Text style={themedStyles.statusDate}>{formatDate(step.date)}</Text>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
};

export default OrderStatusScreen;

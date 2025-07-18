import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../constants/firebaseConfig';
import { getAuth } from 'firebase/auth';
import Header from '../components/common/Header';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';

const OrderHistoryScreen = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const auth = getAuth();
  const user = auth.currentUser;
  const navigation = useNavigation();
  const { colors } = useTheme();

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;

      try {
        const q = query(collection(db, 'orders'), where('userId', '==', user.uid));
        const querySnapshot = await getDocs(q);
        const orderList = querySnapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // Sắp xếp theo ngày mới nhất
        setOrders(orderList);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  // Create themed styles inside component
  const themedStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    listContainer: {
      padding: 16,
      paddingBottom: 20,
    },
    orderContainer: {
      backgroundColor: colors.card,
      borderRadius: 8,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    orderId: {
      fontSize: 16,
      fontWeight: 'bold',
      marginBottom: 8,
      color: colors.text,
    },
    orderDate: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 8,
    },
    orderTotal: {
      fontSize: 16,
      fontWeight: 'bold',
      color: colors.primary,
      marginBottom: 8,
    },
    orderItemsTitle: {
      fontSize: 14,
      fontWeight: 'bold',
      marginBottom: 4,
      color: colors.text,
    },
    orderItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 4,
    },
    orderItemName: {
      fontSize: 14,
      color: colors.text,
    },
    orderItemPrice: {
      fontSize: 14,
      color: colors.textLight,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.card,
    },
    loadingText: {
      marginTop: 10,
      fontSize: 16,
      color: colors.textSecondary,
    },
    emptyText: {
      textAlign: 'center',
      marginTop: 50,
      fontSize: 16,
      color: colors.textSecondary,
    },
  });

  const renderOrderItem = ({ item }) => (
    <TouchableOpacity onPress={() => navigation.navigate('OrderStatus', { order: item })}>
      <View style={themedStyles.orderContainer}>
        <Text style={themedStyles.orderId}>Mã đơn hàng: {item.id}</Text>
        <Text style={themedStyles.orderDate}>
          Ngày đặt: {new Date(item.createdAt).toLocaleString()}
        </Text>
        <Text style={themedStyles.orderTotal}>
          Tổng cộng: {(item.total || 0).toLocaleString()}₫
        </Text>
        <Text style={themedStyles.orderItemsTitle}>Sản phẩm:</Text>
        {item.items?.map((product, index) => (
          <View key={index} style={themedStyles.orderItem}>
            <Text style={themedStyles.orderItemName}>
              {product.product_name || product.title} (x{product.quantity})
            </Text>
            <Text style={themedStyles.orderItemPrice}>
              {(product.price * product.quantity).toLocaleString()}₫
            </Text>
          </View>
        ))}
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={themedStyles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={themedStyles.loadingText}>Đang tải lịch sử đơn hàng...</Text>
      </View>
    );
  }

  return (
    <View style={themedStyles.container}>
      <Header title="Lịch sử đơn hàng" showBackButton={true} />
      {orders.length === 0 ? (
        <Text style={themedStyles.emptyText}>Bạn chưa có đơn hàng nào.</Text>
      ) : (
        <FlatList
          data={orders}
          renderItem={renderOrderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={themedStyles.listContainer}
        />
      )}
    </View>
  );
};

export default OrderHistoryScreen;

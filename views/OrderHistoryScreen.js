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

const OrderHistoryScreen = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const auth = getAuth();
  const user = auth.currentUser;
  const navigation = useNavigation();

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;

      try {
        const q = query(collection(db, 'orders'), where('userId', '==', user.uid));
        const querySnapshot = await getDocs(q);
        const orderList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setOrders(orderList);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  const renderOrderItem = ({ item }) => (
    <TouchableOpacity onPress={() => navigation.navigate('OrderStatus', { order: item })}>
      <View style={styles.orderContainer}>
        <Text style={styles.orderId}>Mã đơn hàng: {item.id}</Text>
        <Text style={styles.orderDate}>Ngày đặt: {new Date(item.createdAt).toLocaleString()}</Text>
        <Text style={styles.orderTotal}>
          Tổng cộng: {(item.total || 0).toLocaleString()}₫
        </Text>
        <Text style={styles.orderItemsTitle}>Sản phẩm:</Text>
        {item.items.map((product, index) => (
          <View key={index} style={styles.orderItem}>
            <Text style={styles.orderItemName}>
              {product.product_name || product.title} (x{product.quantity})
            </Text>
            <Text style={styles.orderItemPrice}>
              {(product.price * product.quantity).toLocaleString()}₫
            </Text>
          </View>
        ))}
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8B4513" />
        <Text style={styles.loadingText}>Đang tải lịch sử đơn hàng...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="Lịch sử đơn hàng" showBackButton={true} />
      {orders.length === 0 ? (
        <Text style={styles.emptyText}>Bạn chưa có đơn hàng nào.</Text>
      ) : (
        <FlatList
          data={orders}
          renderItem={renderOrderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 20,
  },
  orderContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  orderId: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  orderDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  orderTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#8B4513',
    marginBottom: 8,
  },
  orderItemsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  orderItemName: {
    fontSize: 14,
    color: '#333',
  },
  orderItemPrice: {
    fontSize: 14,
    color: '#888',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#666',
  },
});

export default OrderHistoryScreen;

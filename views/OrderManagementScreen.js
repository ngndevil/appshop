import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../constants/firebaseConfig';
import Header from '../components/common/Header';
import { useNavigation } from '@react-navigation/native';

const OrderManagementScreen = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const orderList = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id, // Quan trọng: Lấy id của đơn hàng
          ...data,
        };
      });
      setOrders(orderList);
    } catch (error) {
      console.log('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (createdAt) => {
    if (!createdAt) return 'N/A';
    try {
      if (createdAt.seconds) {
        return new Date(createdAt.seconds * 1000).toLocaleString('vi-VN');
      }
      return new Date(createdAt).toLocaleString('vi-VN');
    } catch (e) {
      return 'Invalid Date';
    }
  };

  const renderItem = ({ item }) => {
    console.log('Render Order:', item); // 👀 Debug thông tin truyền đi
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => {
          console.log('Navigating with order:', item);
          navigation.navigate('OrderTrackingScreen', { order: item });
        }}
      >
        <View style={styles.rowBetween}>
          <Text style={styles.name}>{item.userEmail || 'Người dùng'}</Text>
          <Text style={[styles.status, getStatusStyle(item.status)]}>
            {item.status || 'Đã đặt'}
          </Text>
        </View>
        <Text style={styles.info}>Tổng tiền: {(item.total || 0).toLocaleString()}₫</Text>
        <Text style={styles.info}>Ngày đặt: {formatDate(item.createdAt)}</Text>
        <Text style={styles.tracking}>Mã theo dõi: {item.trackingId || 'Không có'}</Text>
      </TouchableOpacity>
    );
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'processing':
        return { color: '#f0ad4e' };
      case 'shipped':
        return { color: '#5bc0de' };
      case 'delivered':
        return { color: '#5cb85c' };
      default:
        return { color: '#d9534f' };
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Quản lý đơn hàng" showBackButton />

      {loading ? (
        <ActivityIndicator size="large" color="#8B4513" style={{ marginTop: 30 }} />
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16 }}
          ListEmptyComponent={<Text style={styles.empty}>Không có đơn hàng nào.</Text>}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  card: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    backgroundColor: '#fdfdfd',
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  name: {
    fontWeight: 'bold',
    fontSize: 15,
    color: '#333',
  },
  status: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  info: {
    fontSize: 13,
    color: '#555',
    marginBottom: 2,
  },
  tracking: {
    fontSize: 12,
    color: '#888',
    fontStyle: 'italic',
    marginTop: 4,
  },
  empty: {
    textAlign: 'center',
    marginTop: 40,
    color: '#999',
    fontSize: 16,
  },
});

export default OrderManagementScreen;

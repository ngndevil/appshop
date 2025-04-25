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
import DateTimePicker from '@react-native-community/datetimepicker';

const OrderManagementScreen = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('Tất cả');

  const navigation = useNavigation();

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchOrders();
    });
    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    filterByDate();
  }, [orders, selectedDate, selectedStatus]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const orderList = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
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

  const filterByDate = () => {
    const dayStart = new Date(selectedDate);
    dayStart.setHours(0, 0, 0, 0);

    const dayEnd = new Date(selectedDate);
    dayEnd.setHours(23, 59, 59, 999);

    const filtered = orders.filter(order => {
      const orderDate = order.createdAt?.seconds
        ? new Date(order.createdAt.seconds * 1000)
        : new Date(order.createdAt);

      const matchDate = orderDate >= dayStart && orderDate <= dayEnd;

      const statusMap = {
        'Đã đặt': 'processing',
        'Đang vận chuyển': 'shipped',
        'Đã giao': 'delivered',
      };

      const matchStatus =
        selectedStatus === 'Tất cả' ||
        (order.status || 'processing') === statusMap[selectedStatus];

      return matchDate && matchStatus;
    });

    setFilteredOrders(filtered);
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('vi-VN');
  };

  const renderItem = ({ item }) => {
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('OrderTrackingScreen', { order: item })}
      >
        <View style={styles.rowBetween}>
          <Text style={styles.name}>{item.userEmail || 'Người dùng'}</Text>
          <Text style={[styles.status, getStatusStyle(item.status)]}>
            {item.status === 'shipped'
              ? 'Đang vận chuyển'
              : item.status === 'delivered'
              ? 'Đã giao'
              : 'Đã đặt'}
          </Text>
        </View>
        <Text style={styles.info}>Tổng tiền: {(item.total || 0).toLocaleString()}₫</Text>
        <Text style={styles.info}>Ngày đặt: {formatDate(new Date(item.createdAt.seconds * 1000))}</Text>
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

      {/* Bộ lọc ngày */}
      <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.dateFilter}>
        <Text style={styles.dateText}>📅 {formatDate(selectedDate)}</Text>
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          onChange={(event, date) => {
            setShowDatePicker(false);
            if (date) setSelectedDate(date);
          }}
        />
      )}

      {/* Bộ lọc trạng thái */}
      <View style={styles.statusFilterContainer}>
        {['Tất cả', 'Đã đặt', 'Đang vận chuyển', 'Đã giao'].map(status => (
          <TouchableOpacity
            key={status}
            style={[
              styles.statusButton,
              selectedStatus === status && styles.statusButtonActive
            ]}
            onPress={() => setSelectedStatus(status)}
          >
            <Text
              style={[
                styles.statusText,
                selectedStatus === status && styles.statusTextActive
              ]}
            >
              {status}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Danh sách đơn hàng */}
      {loading ? (
        <ActivityIndicator size="large" color="#8B4513" style={{ marginTop: 30 }} />
      ) : (
        <FlatList
          data={filteredOrders}
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
  dateFilter: {
    padding: 10,
    alignItems: 'center',
    backgroundColor: '#eee',
  },
  dateText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
  },
  statusFilterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 10,
    paddingHorizontal: 10,
  },
  statusButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#eee',
  },
  statusButtonActive: {
    backgroundColor: '#8B4513',
  },
  statusText: {
    fontSize: 13,
    color: '#555',
  },
  statusTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default OrderManagementScreen;

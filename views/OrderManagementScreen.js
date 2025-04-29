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
import { useTheme } from '../context/ThemeContext';

const OrderManagementScreen = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('Tất cả');
  const { colors } = useTheme();

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
  

  const getStatusStyle = (status) => {
    switch (status) {
      case 'processing':
        return { color: colors.warning };
      case 'shipped':
        return { color: colors.info };
      case 'delivered':
        return { color: colors.success };
      default:
        return { color: colors.error };
    }
  };

  const themedStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.card,
    },
    card: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 10,
      padding: 12,
      marginBottom: 12,
      backgroundColor: colors.card,
    },
    rowBetween: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 6,
    },
    name: {
      fontWeight: 'bold',
      fontSize: 15,
      color: colors.text,
    },
    status: {
      fontWeight: 'bold',
      fontSize: 14,
    },
    info: {
      fontSize: 13,
      color: colors.textSecondary,
      marginBottom: 2,
    },
    tracking: {
      fontSize: 12,
      color: colors.textLight,
      fontStyle: 'italic',
      marginTop: 4,
    },
    empty: {
      textAlign: 'center',
      marginTop: 40,
      color: colors.textLight,
      fontSize: 16,
    },
    dateFilter: {
      padding: 10,
      alignItems: 'center',
      backgroundColor: colors.primaryLightest,
    },
    dateText: {
      fontSize: 15,
      fontWeight: 'bold',
      color: colors.text,
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
      backgroundColor: colors.primaryLightest,
    },
    statusButtonActive: {
      backgroundColor: colors.primary,
    },
    statusText: {
      fontSize: 13,
      color: colors.textSecondary,
    },
    statusTextActive: {
      color: colors.card,
      fontWeight: 'bold',
    },
  });

  const renderItem = ({ item }) => {
    return (
      <TouchableOpacity
        style={themedStyles.card}
        onPress={() => navigation.navigate('OrderTrackingScreen', { order: item })}
      >
        <View style={themedStyles.rowBetween}>
          <Text style={themedStyles.name}>{item.userEmail || 'Người dùng'}</Text>
          <Text style={[themedStyles.status, getStatusStyle(item.status)]}>
            {item.status === 'shipped'
              ? 'Đang vận chuyển'
              : item.status === 'delivered'
              ? 'Đã giao'
              : 'Đã đặt'}
          </Text>
        </View>
        <Text style={themedStyles.info}>Tổng tiền: {(item.total || 0).toLocaleString()}₫</Text>
        <Text style={themedStyles.info}>Ngày đặt: {formatDate(new Date(item.createdAt.seconds * 1000))}</Text>
        <Text style={themedStyles.tracking}>Mã theo dõi: {item.trackingId || 'Không có'}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={themedStyles.container}>
      <Header title="Quản lý đơn hàng" showBackButton />

      {/* Bộ lọc ngày */}
      <TouchableOpacity onPress={() => setShowDatePicker(true)} style={themedStyles.dateFilter}>
        <Text style={themedStyles.dateText}>📅 {formatDate(selectedDate)}</Text>
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
      <View style={themedStyles.statusFilterContainer}>
        {['Tất cả', 'Đã đặt', 'Đang vận chuyển', 'Đã giao'].map(status => (
          <TouchableOpacity
            key={status}
            style={[
              themedStyles.statusButton,
              selectedStatus === status && themedStyles.statusButtonActive
            ]}
            onPress={() => setSelectedStatus(status)}
          >
            <Text
              style={[
                themedStyles.statusText,
                selectedStatus === status && themedStyles.statusTextActive
              ]}
            >
              {status}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Danh sách đơn hàng */}
      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 30 }} />
      ) : (
        <FlatList
          data={filteredOrders}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16 }}
          ListEmptyComponent={<Text style={themedStyles.empty}>Không có đơn hàng nào.</Text>}
        />
      )}
    </View>
  );
};

export default OrderManagementScreen;

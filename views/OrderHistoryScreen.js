import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  BackHandler, // Thêm để xử lý nút back vật lý
} from 'react-native';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../constants/firebaseConfig';
import { getAuth } from 'firebase/auth';
import Header from '../components/common/Header';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';

const OrderHistoryScreen = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const auth = getAuth();
  const user = auth.currentUser;
  const navigation = useNavigation();
  const { colors } = useTheme();

  /**
   * Hàm chuyển đổi ngày tháng an toàn, chống crash ứng dụng.
   * Sẽ trả về một đối tượng Date hợp lệ hoặc null.
   */
  const safeGetDate = (timestamp) => {
    try {
      // Ưu tiên xử lý đối tượng Timestamp của Firebase
      if (timestamp && typeof timestamp.toDate === 'function') {
        return timestamp.toDate();
      }
      // Xử lý các dạng khác (ví dụ: chuỗi ISO)
      const date = new Date(timestamp);
      // Nếu ngày không hợp lệ (ví dụ: new Date(null)), trả về null
      if (isNaN(date.getTime())) {
        return null;
      }
      return date;
    } catch (e) {
      // Nếu có bất kỳ lỗi nào xảy ra, trả về null
      return null;
    }
  };

  // Hàm điều hướng về trang chủ
  const navigateToHome = () => {
    navigation.navigate('ProductListScreen');
  };

  // Bắt sự kiện nhấn nút "back" vật lý trên Android
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        navigateToHome(); // Gọi hàm điều hướng về trang chủ
        return true; // Ngăn chặn hành vi mặc định
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () => subscription.remove();
    }, []) // Dependency rỗng để chỉ chạy một lần khi focus
  );

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const q = query(collection(db, 'orders'), where('userId', '==', user.uid));
        const querySnapshot = await getDocs(q);
        const orderList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Sắp xếp một cách an toàn
        orderList.sort((a, b) => {
          const dateA = safeGetDate(a.createdAt);
          const dateB = safeGetDate(b.createdAt);
          // Đẩy các đơn hàng có ngày không hợp lệ xuống cuối
          if (!dateB) return -1;
          if (!dateA) return 1;
          return dateB.getTime() - dateA.getTime();
        });

        setOrders(orderList);
      } catch (error) {
        console.error("Lỗi khi tải lịch sử đơn hàng:", error);
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

  const renderOrderItem = ({ item }) => {
    // Sử dụng hàm an toàn để lấy và định dạng ngày
    const orderDate = safeGetDate(item.createdAt);
    const displayDate = orderDate
      ? orderDate.toLocaleString('vi-VN') // Định dạng 'ngày/tháng/năm, giờ:phút:giây'
      : 'Ngày không hợp lệ';

    return (
      <TouchableOpacity onPress={() => navigation.navigate('OrderStatus', { order: item })}>
        <View style={themedStyles.orderContainer}>
          <Text style={themedStyles.orderId}>Mã đơn hàng: {item.id}</Text>
          <Text style={themedStyles.orderDate}>
            Ngày đặt: {displayDate}
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
  };

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
      <Header
        title="Lịch sử đơn hàng"
        showBackButton={true}
        onBackPress={navigateToHome} // Thêm lại để xử lý nút "←" trên Header
      />
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
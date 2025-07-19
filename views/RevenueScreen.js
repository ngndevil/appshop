import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
} from 'react-native';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { LineChart } from 'react-native-chart-kit';
import { format } from 'date-fns';
import DateTimePicker from '@react-native-community/datetimepicker';
import SimpleHeader from '../components/common/SimpleHeader';

const screenWidth = Dimensions.get('window').width;

export default function RevenueScreen({navigation}) {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [selectedRange, setSelectedRange] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [dailyRevenue, setDailyRevenue] = useState(0);
  const [rangeRevenue, setRangeRevenue] = useState(0);

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    if (selectedRange) filterOrdersByRange();
    else filterOrdersByDate();
  }, [orders, selectedRange, selectedDate]);

  useEffect(() => {
    if (selectedRange) calculateRangeRevenue();
    else calculateDailyRevenue();
  }, [filteredOrders]);

  const fetchOrders = async () => {
    const db = getFirestore();
    const snapshot = await getDocs(collection(db, 'orders'));
    const fetchedOrders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setOrders(fetchedOrders);
  };

  const filterOrdersByDate = () => {
    const dayStart = new Date(selectedDate);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(selectedDate);
    dayEnd.setHours(23, 59, 59, 999);
    const filtered = orders.filter(order => {
      const rawDate = order.createdAt || order.created_at;
      if (!rawDate) return false;
      const orderDate = new Date(rawDate);
      return orderDate >= dayStart && orderDate <= dayEnd;
    });
    setFilteredOrders(filtered);
  };

  const filterOrdersByRange = () => {
    const now = new Date();
    const fromDate = new Date(now);

    if (selectedRange === '7days') fromDate.setDate(now.getDate() - 6);
    else if (selectedRange === '30days') fromDate.setDate(now.getDate() - 29);
    else if (selectedRange === '1year') fromDate.setFullYear(now.getFullYear() - 1);

    fromDate.setHours(0, 0, 0, 0);
    const filtered = orders.filter(order => {
      const rawDate = order.createdAt || order.created_at;
      if (!rawDate) return false;
      const orderDate = new Date(rawDate);
      return orderDate >= fromDate && orderDate <= now;
    });
    setFilteredOrders(filtered);
  };

  const calculateDailyRevenue = () => {
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const revenue = filteredOrders.reduce((total, order) => {
      const orderDate = new Date(order.createdAt || order.created_at);
      const currentStr = format(orderDate, 'yyyy-MM-dd');
      if (dateStr === currentStr) {
        return total + (order.items || []).reduce((sum, item) => sum + item.price * item.quantity, 0);
      }
      return total;
    }, 0);
    setDailyRevenue(revenue);
  };

  const calculateRangeRevenue = () => {
    const revenue = filteredOrders.reduce((total, order) => {
      return total + (order.items || []).reduce((sum, item) => sum + item.price * item.quantity, 0);
    }, 0);
    setRangeRevenue(revenue);
  };

  const prepareChartData = () => {
    if (!filteredOrders || filteredOrders.length === 0) {
      return { labels: ['Không có'], datasets: [{ data: [0] }] };
    }

    const dateMap = {};

    filteredOrders.forEach(order => {
      const rawDate = order.createdAt || order.created_at;
      if (!rawDate) return;
      const date = new Date(rawDate);
      if (isNaN(date)) return;

      let label = '';
      if (selectedRange === '1year') {
        label = `Tháng ${date.getMonth() + 1}`;
      } else {
        label = format(date, 'dd/MM');
      }

      const revenue = (order.items || []).reduce((sum, item) => sum + item.price * item.quantity, 0);
      dateMap[label] = (dateMap[label] || 0) + revenue;
    });

    const sortedLabels = Object.keys(dateMap).sort((a, b) => {
      const getMonth = (label) => parseInt(label.replace('Tháng ', ''));
      if (selectedRange === '1year') return getMonth(a) - getMonth(b);
      const parseDate = (str) => {
        const [d, m] = str.split('/').map(Number);
        return new Date(2024, m - 1, d);
      };
      return parseDate(a) - parseDate(b);
    });

    const data = sortedLabels.map(label => dateMap[label] ?? 0);
    return { labels: sortedLabels, datasets: [{ data }] };
  };

  const formatYAxisLabel = (value) => {
    const num = Number(value);
    if (isNaN(num)) return '0';
    if (num >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(1)}B`;
    if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
    if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
    return num.toString();
  };

  const getYAxisMax = () => {
    try {
      const chartData = prepareChartData();
      const data = chartData?.datasets?.[0]?.data || [];
      const max = Math.max(...data, 0);
      if (isNaN(max) || max === 0) return 2000000;
      const step = max > 100000000 ? 20000000 : max > 20000000 ? 10000000 : 2000000;
      return Math.ceil(max / step) * step;
    } catch (e) {
      return 2000000;
    }
  };

  const renderOrder = ({ item }) => (
    <View style={styles.orderCard}>
      <Text style={styles.orderText}>Khách: {item.userEmail || 'Ẩn danh'}</Text>
      <Text style={styles.orderText}>Tổng: {(item.total || 0).toLocaleString()}₫</Text>
      <Text style={styles.orderText}>Trạng thái: {item.status || 'Đã đặt'}</Text>
    </View>
  );

  const yMax = getYAxisMax();
  const segments = Math.max(1, yMax / (yMax > 100000000 ? 20000000 : yMax > 20000000 ? 10000000 : 2000000));

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <SimpleHeader title="Thống kê doanh thu" onBack={() => navigation.goBack()}/>

      <View style={styles.filterRow}>
        {['7days', '30days', '1year'].map(range => (
          <TouchableOpacity
            key={range}
            style={[styles.rangeButton, selectedRange === range && styles.activeButton]}
            onPress={() => setSelectedRange(prev => (prev === range ? null : range))}
          >
            <Text style={[styles.buttonText, selectedRange === range && styles.activeButtonText]}>
              {range === '7days' ? '7 ngày' : range === '30days' ? '30 ngày' : '1 năm'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {!selectedRange && (
        <TouchableOpacity style={styles.datePickerButton} onPress={() => setShowPicker(true)}>
          <Text style={styles.datePickerText}>Chọn ngày: {format(selectedDate, 'dd/MM/yyyy')}</Text>
        </TouchableOpacity>
      )}

      {showPicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          onChange={(event, date) => {
            setShowPicker(false);
            if (date) setSelectedDate(date);
          }}
        />
      )}

      <Text style={styles.revenueText}>
        {selectedRange
          ? `Doanh thu ${selectedRange === '7days' ? '7 ngày' : selectedRange === '30days' ? '30 ngày' : '1 năm'}: ${rangeRevenue.toLocaleString()}₫`
          : `Doanh thu ngày ${format(selectedDate, 'dd/MM/yyyy')}: ${dailyRevenue.toLocaleString()}₫`}
      </Text>

      <LineChart
        data={prepareChartData()}
        width={screenWidth - 32}
        height={250}
        fromZero
        yAxisLabel=""
        yAxisSuffix=""
        yAxisInterval={1}
        withInnerLines
        withOuterLines
        yLabelsOffset={8}
        formatYLabel={formatYAxisLabel}
        segments={segments}
        chartConfig={{
          backgroundGradientFrom: '#fff',
          backgroundGradientTo: '#fff',
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(44, 62, 80, ${opacity})`,
          labelColor: () => '#34495E',
          style: { borderRadius: 16 },
          formatYLabel: formatYAxisLabel,
        }}
        style={styles.chart}
      />

      <FlatList
        data={filteredOrders}
        keyExtractor={item => item.id}
        renderItem={renderOrder}
        ListEmptyComponent={<Text style={styles.emptyText}>Không có đơn hàng nào.</Text>}
        contentContainerStyle={{ paddingBottom: 32 }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    paddingBottom: 24,
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  rangeButton: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff',
  },
  activeButton: {
    backgroundColor: '#2C3E50',
    borderColor: '#2C3E50',
  },
  buttonText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#333',
  },
  activeButtonText: {
    color: '#fff',
  },
  chart: {
    marginTop: 12,
    borderRadius: 8,
  },
  datePickerButton: {
    alignSelf: 'center',
    backgroundColor: '#ddd',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 6,
  },
  datePickerText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#2C3E50',
  },
  revenueText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    textAlign: 'center',
    marginBottom: 8,
  },
  orderCard: {
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 10,
    borderColor: '#ddd',
    borderWidth: 1,
  },
  orderText: {
    fontSize: 13,
    color: '#333',
  },
  emptyText: {
    textAlign: 'center',
    color: '#888',
    marginTop: 20,
    fontSize: 14,
  },
});

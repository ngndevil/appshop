import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { BarChart } from 'react-native-chart-kit';
import Header from '../components/common/Header';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import SimpleHeader from '../components/common/SimpleHeader';
const screenWidth = Dimensions.get('window').width;

export default function RevenueScreen() {
  const [orders, setOrders] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [selectedRange, setSelectedRange] = useState('7days');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [dailyRevenue, setDailyRevenue] = useState(0);

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    filterData();
  }, [orders, selectedRange]);

  useEffect(() => {
    calculateDailyRevenue();
  }, [selectedDate, orders]);

  const fetchOrders = async () => {
    const db = getFirestore();
    const snapshot = await getDocs(collection(db, 'orders'));
    const fetchedOrders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setOrders(fetchedOrders);
  };

  const filterData = () => {
    const now = new Date();
    const rangeDate = new Date(now);

    if (selectedRange === '7days') rangeDate.setDate(now.getDate() - 6);
    else if (selectedRange === '30days') rangeDate.setDate(now.getDate() - 29);
    else if (selectedRange === '1year') rangeDate.setFullYear(now.getFullYear() - 1);

    const filtered = orders.filter(order => {
      const orderDate = new Date(order.createdAt || order.created_at);
      return orderDate >= rangeDate;
    });

    setFilteredData(filtered);
  };

  const calculateDailyRevenue = () => {
    const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
    const revenue = orders.reduce((total, order) => {
      const orderDate = new Date(order.createdAt || order.created_at);
      const dateStr = format(orderDate, 'yyyy-MM-dd');
      if (dateStr === selectedDateStr) {
        const itemRevenue = (order.items || []).reduce((sum, item) => sum + item.price * item.quantity, 0);
        return total + itemRevenue;
      }
      return total;
    }, 0);
    setDailyRevenue(revenue);
  };

  const prepareChartData = () => {
    const groupByDate = {};

    filteredData.forEach(order => {
      const date = new Date(order.createdAt || order.created_at);
      const dateStr = format(date, 'yyyy-MM-dd'); // for sorting
      const dayRevenue = (order.items || []).reduce((sum, item) => sum + item.price * item.quantity, 0);
      groupByDate[dateStr] = (groupByDate[dateStr] || 0) + dayRevenue;
    });

    const sortedDates = Object.keys(groupByDate).sort();

    const labels = [];
    const revenues = [];

    sortedDates.forEach(dateStr => {
      labels.push(format(new Date(dateStr), 'dd/MM')); // for display
      revenues.push(groupByDate[dateStr]);
    });

    return {
      labels,
      datasets: [{ data: revenues }]
    };
  };

  return (
    <View style={styles.container}>
      <SimpleHeader title="Thống kê doanh thu" showBackButton />

      <View style={styles.filterRow}>
        <TouchableOpacity
          style={[styles.rangeButton, selectedRange === '7days' && styles.activeButton]}
          onPress={() => setSelectedRange('7days')}
        >
          <Text style={[styles.buttonText, selectedRange === '7days' && styles.activeButtonText]}>7 ngày</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.rangeButton, selectedRange === '30days' && styles.activeButton]}
          onPress={() => setSelectedRange('30days')}
        >
          <Text style={[styles.buttonText, selectedRange === '30days' && styles.activeButtonText]}>30 ngày</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.rangeButton, selectedRange === '1year' && styles.activeButton]}
          onPress={() => setSelectedRange('1year')}
        >
          <Text style={[styles.buttonText, selectedRange === '1year' && styles.activeButtonText]}>1 năm</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.datePickerButton}
        onPress={() => setShowPicker(true)}
      >
        <Text style={styles.datePickerText}>
          Chọn ngày: {format(selectedDate, 'dd/MM/yyyy')}
        </Text>
      </TouchableOpacity>

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

      <Text style={styles.dailyRevenueText}>
        Doanh thu ngày {format(selectedDate, 'dd/MM/yyyy')}: {dailyRevenue.toLocaleString()}₫
      </Text>

      <BarChart
        data={prepareChartData()}
        width={screenWidth - 32}
        height={250}
        fromZero
        showValuesOnTopOfBars
        yAxisSuffix="₫"
        chartConfig={{
          backgroundGradientFrom: '#fff',
          backgroundGradientTo: '#fff',
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(44, 62, 80, ${opacity})`,
          labelColor: () => '#34495E',
          style: { borderRadius: 16 },
        }}
        style={styles.chart}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 16 },
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
  dailyRevenueText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    textAlign: 'center',
    marginBottom: 8,
  },
});

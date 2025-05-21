import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { BarChart } from 'react-native-chart-kit';
import Header from '../components/common/Header';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import SimpleHeader from '../components/common/SimpleHeader';
import { useTheme } from '../context/ThemeContext';

const screenWidth = Dimensions.get('window').width;

export default function RevenueScreen() {
  const { colors } = useTheme();
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

  const parseValidDate = (rawDate) => {
    if (!rawDate) return null;
    const date = new Date(rawDate);
    return isNaN(date.getTime()) ? null : date;
  };

  const filterData = () => {
    const now = new Date();
    const rangeDate = new Date(now);

    if (selectedRange === '7days') rangeDate.setDate(now.getDate() - 6);
    else if (selectedRange === '30days') rangeDate.setDate(now.getDate() - 29);
    else if (selectedRange === '1year') rangeDate.setFullYear(now.getFullYear() - 1);

    const filtered = orders.filter(order => {
      const orderDate = parseValidDate(order.createdAt || order.created_at);
      return orderDate && orderDate >= rangeDate;
    });

    setFilteredData(filtered);
  };

  const calculateDailyRevenue = () => {
    const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
    const revenue = orders.reduce((total, order) => {
      const orderDate = parseValidDate(order.createdAt || order.created_at);
      if (!orderDate) return total;

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
      const date = parseValidDate(order.createdAt || order.created_at);
      if (!date) return;

      const dateStr = format(date, 'yyyy-MM-dd');
      const dayRevenue = (order.items || []).reduce((sum, item) => sum + item.price * item.quantity, 0);
      groupByDate[dateStr] = (groupByDate[dateStr] || 0) + dayRevenue;
    });

    const sortedDates = Object.keys(groupByDate).sort();
    const labels = [];
    const revenues = [];

    sortedDates.forEach(dateStr => {
      const parsed = parseValidDate(dateStr);
      if (!parsed) return;
      labels.push(format(parsed, 'dd/MM'));
      revenues.push(groupByDate[dateStr]);
    });

    return {
      labels,
      datasets: [{ data: revenues }]
    };
  };

  const themedStyles = StyleSheet.create({
    container: { 
      flex: 1, 
      backgroundColor: colors.background, 
      padding: 16 
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
      borderColor: colors.border,
      backgroundColor: colors.card,
    },
    activeButton: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    buttonText: {
      fontSize: 13,
      fontWeight: '500',
      color: colors.text,
    },
    activeButtonText: {
      color: colors.card,
    },
    chart: {
      marginTop: 12,
      borderRadius: 8,
    },
    datePickerButton: {
      alignSelf: 'center',
      backgroundColor: colors.disabled,
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: 10,
      marginBottom: 6,
    },
    datePickerText: {
      fontSize: 13,
      fontWeight: '500',
      color: colors.text,
    },
    dailyRevenueText: {
      fontSize: 16,
      fontWeight: 'bold',
      color: colors.text,
      textAlign: 'center',
      marginBottom: 8,
    },
  });

  return (
    <View style={themedStyles.container}>
      <SimpleHeader title="Thống kê doanh thu" showBackButton />

      <View style={themedStyles.filterRow}>
        <TouchableOpacity
          style={[themedStyles.rangeButton, selectedRange === '7days' && themedStyles.activeButton]}
          onPress={() => setSelectedRange('7days')}
        >
          <Text style={[themedStyles.buttonText, selectedRange === '7days' && themedStyles.activeButtonText]}>7 ngày</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[themedStyles.rangeButton, selectedRange === '30days' && themedStyles.activeButton]}
          onPress={() => setSelectedRange('30days')}
        >
          <Text style={[themedStyles.buttonText, selectedRange === '30days' && themedStyles.activeButtonText]}>30 ngày</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[themedStyles.rangeButton, selectedRange === '1year' && themedStyles.activeButton]}
          onPress={() => setSelectedRange('1year')}
        >
          <Text style={[themedStyles.buttonText, selectedRange === '1year' && themedStyles.activeButtonText]}>1 năm</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={themedStyles.datePickerButton}
        onPress={() => setShowPicker(true)}
      >
        <Text style={themedStyles.datePickerText}>
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

      <Text style={themedStyles.dailyRevenueText}>
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
          backgroundGradientFrom: colors.card,
          backgroundGradientTo: colors.card,
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(139, 69, 19, ${opacity})`,
          labelColor: () => colors.text,
          style: { borderRadius: 16 },
        }}
        style={themedStyles.chart}
      />
    </View>
  );
}

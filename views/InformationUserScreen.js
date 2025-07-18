// InformationUserScreen.js

import React, { useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity,
  ScrollView, Alert, ActivityIndicator, Modal, FlatList
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import Header from '../components/common/Header';
import { handleBuyNowService } from './OrderService';
import { useCart } from '../context/CartProvider'; 
const hcmcData = {
  "Quận 1": [
    "Phường Bến Nghé",
    "Phường Bến Thành",
    "Phường Cầu Kho",
    "Phường Cầu Ông Lãnh",
    "Phường Cô Giang",
    "Phường Đa Kao",
    "Phường Nguyễn Cư Trinh",
    "Phường Nguyễn Thái Bình",
    "Phường Phạm Ngũ Lão",
    "Phường Tân Định"
  ],
  "Quận 2": [
    "Phường An Khánh",
    "Phường An Lợi Đông",
    "Phường An Phú",
    "Phường Bình An",
    "Phường Bình Khánh",
    "Phường Bình Trưng Đông",
    "Phường Bình Trưng Tây",
    "Phường Cát Lái",
    "Phường Thảo Điền",
    "Phường Thạnh Mỹ Lợi",
    "Phường Thủ Thiêm"
  ],
  "Quận 3": [
    "Phường 1",
    "Phường 2",
    "Phường 3",
    "Phường 4",
    "Phường 5",
    "Phường Võ Thị Sáu"
  ],
  "Quận 4": [
    "Phường 1",
    "Phường 2",
    "Phường 3",
    "Phường 4",
    "Phường 5",
    "Phường 6",
    "Phường 8",
    "Phường 9",
    "Phường 10",
    "Phường 13",
    "Phường 14",
    "Phường 15",
    "Phường 16",
    "Phường 18"
  ],
  "Quận 5": [
    "Phường 1",
    "Phường 2",
    "Phường 3",
    "Phường 4",
    "Phường 5",
    "Phường 6",
    "Phường 7",
    "Phường 8",
    "Phường 9",
    "Phường 10",
    "Phường 11",
    "Phường 12",
    "Phường 13",
    "Phường 14"
  ],
  "Quận 6": [
    "Phường 1",
    "Phường 2",
    "Phường 3",
    "Phường 4",
    "Phường 5",
    "Phường 6",
    "Phường 7",
    "Phường 8",
    "Phường 9",
    "Phường 10",
    "Phường 11",
    "Phường 12",
    "Phường 13",
    "Phường 14"
  ],
  "Quận 7": [
    "Phường Bình Thuận",
    "Phường Phú Mỹ",
    "Phường Phú Thuận",
    "Phường Tân Hưng",
    "Phường Tân Kiểng",
    "Phường Tân Phong",
    "Phường Tân Phú",
    "Phường Tân Quy",
    "Phường Tân Thuận Đông",
    "Phường Tân Thuận Tây"
  ],
  "Quận 8": [
    "Phường 1",
    "Phường 2",
    "Phường 3",
    "Phường 4",
    "Phường 5",
    "Phường 6",
    "Phường 7",
    "Phường 8",
    "Phường 9",
    "Phường 10",
    "Phường 11",
    "Phường 12",
    "Phường 13",
    "Phường 14",
    "Phường 15",
    "Phường 16"
  ],
  "Quận 9": [
    "Phường Hiệp Phú",
    "Phường Long Bình",
    "Phường Long Phước",
    "Phường Long Thạnh Mỹ",
    "Phường Long Trường",
    "Phường Phú Hữu",
    "Phường Phước Bình",
    "Phường Phước Long A",
    "Phường Phước Long B",
    "Phường Tân Phú",
    "Phường Tăng Nhơn Phú A",
    "Phường Tăng Nhơn Phú B",
    "Phường Trường Thạnh"
  ],
  "Quận 10": [
    "Phường 1",
    "Phường 2",
    "Phường 3",
    "Phường 4",
    "Phường 5",
    "Phường 6",
    "Phường 7",
    "Phường 8",
    "Phường 9",
    "Phường 10",
    "Phường 11",
    "Phường 12",
    "Phường 13",
    "Phường 14",
    "Phường 15"
  ],
  "Quận 11": [
    "Phường 1",
    "Phường 2",
    "Phường 3",
    "Phường 4",
    "Phường 5",
    "Phường 6",
    "Phường 7",
    "Phường 8",
    "Phường 9",
    "Phường 10",
    "Phường 11",
    "Phường 12",
    "Phường 13",
    "Phường 14",
    "Phường 15",
    "Phường 16"
  ],
  "Quận 12": [
    "Phường An Phú Đông",
    "Phường Đông Hưng Thuận",
    "Phường Hiệp Thành",
    "Phường Tân Chánh Hiệp",
    "Phường Tân Hưng Thuận",
    "Phường Tân Thới Hiệp",
    "Phường Tân Thới Nhất",
    "Phường Thạnh Lộc",
    "Phường Thạnh Xuân",
    "Phường Thới An",
    "Phường Trung Mỹ Tây"
  ],
  "Quận Bình Tân": [
    "Phường An Lạc",
    "Phường An Lạc A",
    "Phường Bình Hưng Hòa",
    "Phường Bình Hưng Hòa A",
    "Phường Bình Hưng Hòa B",
    "Phường Bình Trị Đông",
    "Phường Bình Trị Đông A",
    "Phường Bình Trị Đông B",
    "Phường Tân Tạo",
    "Phường Tân Tạo A"
  ],
  "Quận Bình Thạnh": [
    "Phường 1",
    "Phường 2",
    "Phường 3",
    "Phường 5",
    "Phường 6",
    "Phường 7",
    "Phường 11",
    "Phường 12",
    "Phường 13",
    "Phường 14",
    "Phường 15",
    "Phường 17",
    "Phường 19",
    "Phường 21",
    "Phường 22",
    "Phường 24",
    "Phường 25",
    "Phường 26",
    "Phường 27",
    "Phường 28"
  ],
  "Quận Gò Vấp": [
    "Phường 1",
    "Phường 3",
    "Phường 4",
    "Phường 5",
    "Phường 6",
    "Phường 7",
    "Phường 8",
    "Phường 9",
    "Phường 10",
    "Phường 11",
    "Phường 12",
    "Phường 13",
    "Phường 14",
    "Phường 15",
    "Phường 16",
    "Phường 17"
  ],
  "Quận Phú Nhuận": [
    "Phường 1",
    "Phường 2",
    "Phường 3",
    "Phường 4",
    "Phường 5",
    "Phường 7",
    "Phường 8",
    "Phường 9",
    "Phường 10",
    "Phường 11",
    "Phường 13",
    "Phường 15",
    "Phường 17"
  ],
  "Quận Tân Bình": [
    "Phường 1",
    "Phường 2",
    "Phường 3",
    "Phường 4",
    "Phường 5",
    "Phường 6",
    "Phường 7",
    "Phường 8",
    "Phường 9",
    "Phường 10",
    "Phường 11",
    "Phường 12",
    "Phường 13",
    "Phường 14",
    "Phường 15"
  ],
  "Quận Tân Phú": [
    "Phường Hiệp Tân",
    "Phường Hòa Thạnh",
    "Phường Phú Thạnh",
    "Phường Phú Thọ Hòa",
    "Phường Phú Trung",
    "Phường Sơn Kỳ",
    "Phường Tân Quý",
    "Phường Tân Sơn Nhì",
    "Phường Tân Thành",
    "Phường Tân Thới Hòa",
    "Phường Tây Thạnh"
  ],
  "Thành phố Thủ Đức": [
    "Phường An Khánh",
    "Phường An Lợi Đông",
    "Phường An Phú",
    "Phường Bình Chiểu",
    "Phường Bình Thọ",
    "Phường Bình Trưng Đông",
    "Phường Bình Trưng Tây",
    "Phường Cát Lái",
    "Phường Hiệp Bình Chánh",
    "Phường Hiệp Bình Phước",
    "Phường Hiệp Phú",
    "Phường Linh Chiểu",
    "Phường Linh Đông",
    "Phường Linh Tây",
    "Phường Linh Trung",
    "Phường Linh Xuân",
    "Phường Long Bình",
    "Phường Long Phước",
    "Phường Long Thạnh Mỹ",
    "Phường Long Trường",
    "Phường Phú Hữu",
    "Phường Phước Bình",
    "Phường Phước Long A",
    "Phường Phước Long B",
    "Phường Tam Bình",
    "Phường Tam Phú",
    "Phường Tân Phú",
    "Phường Tăng Nhơn Phú A",
    "Phường Tăng Nhơn Phú B",
    "Phường Thảo Điền",
    "Phường Thạnh Mỹ Lợi",
    "Phường Thủ Thiêm",
    "Phường Trường Thạnh",
    "Phường Trường Thọ"
  ],
  "Huyện Bình Chánh": [
    "Thị trấn Tân Túc",
    "Xã An Phú Tây",
    "Xã Bình Chánh",
    "Xã Bình Hưng",
    "Xã Bình Lợi",
    "Xã Đa Phước",
    "Xã Hưng Long",
    "Xã Lê Minh Xuân",
    "Xã Phạm Văn Hai",
    "Xã Phong Phú",
    "Xã Quy Đức",
    "Xã Tân Kiên",
    "Xã Tân Nhựt",
    "Xã Tân Quý Tây",
    "Xã Vĩnh Lộc A",
    "Xã Vĩnh Lộc B"
  ],
  "Huyện Cần Giờ": [
    "Thị trấn Cần Thạnh",
    "Xã An Thới Đông",
    "Xã Bình Khánh",
    "Xã Long Hòa",
    "Xã Lý Nhơn",
    "Xã Tam Thôn Hiệp",
    "Xã Thạnh An"
  ],
  "Huyện Củ Chi": [
    "Thị trấn Củ Chi",
    "Xã An Nhơn Tây",
    "Xã An Phú",
    "Xã Bình Mỹ",
    "Xã Hòa Phú",
    "Xã Nhuận Đức",
    "Xã Phạm Văn Cội",
    "Xã Phú Hòa Đông",
    "Xã Phú Mỹ Hưng",
    "Xã Phước Hiệp",
    "Xã Phước Thạnh",
    "Xã Phước Vĩnh An",
    "Xã Tân An Hội",
    "Xã Tân Phú Trung",
    "Xã Tân Thạnh Đông",
    "Xã Tân Thạnh Tây",
    "Xã Tân Thông Hội",
    "Xã Thái Mỹ",
    "Xã Trung An",
    "Xã Trung Lập Hạ",
    "Xã Trung Lập Thượng"
  ],
  "Huyện Hóc Môn": [
    "Thị trấn Hóc Môn",
    "Xã Bà Điểm",
    "Xã Đông Thạnh",
    "Xã Nhị Bình",
    "Xã Tân Hiệp",
    "Xã Tân Thới Nhì",
    "Xã Tân Xuân",
    "Xã Thới Tam Thôn",
    "Xã Trung Chánh",
    "Xã Xuân Thới Đông",
    "Xã Xuân Thới Sơn",
    "Xã Xuân Thới Thượng"
  ],
  "Huyện Nhà Bè": [
    "Thị trấn Nhà Bè",
    "Xã Hiệp Phước",
    "Xã Long Thới",
    "Xã Nhơn Đức",
    "Xã Phú Xuân",
    "Xã Phước Kiển",
    "Xã Phước Lộc"
  ]
};
const districts = Object.keys(hcmcData);

export default function InformationUserScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const cartItems = route.params?.cartItems || [];
  
  const { setCartItems } = useCart();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [streetAddress, setStreetAddress] = useState(''); // Chỉ cho số nhà, tên đường
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [selectedWard, setSelectedWard] = useState(null);

  const [isLoading, setIsLoading] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [addressModalVisible, setAddressModalVisible] = useState(false);
  
  const wards = selectedDistrict ? hcmcData[selectedDistrict] : [];

  const totalPrice = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleConfirmOrder = async () => {
    const fullAddress = `${streetAddress}, ${selectedWard}, ${selectedDistrict}, TP. Hồ Chí Minh`;

    if (!cartItems.length) {
      Alert.alert('Lỗi', 'Không có sản phẩm để đặt hàng.');
      return;
    }
    if (!name.trim() || !streetAddress.trim() || !phone.trim() || !selectedDistrict || !selectedWard) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin người nhận và địa chỉ.');
      return;
    }
    if (!/^\d{10,11}$/.test(phone)) {
      Alert.alert('Lỗi', 'Số điện thoại phải có 10-11 số.');
      return;
    }

    setIsLoading(true);
    try {
      const orderData = {
        items: cartItems.map(item => ({
          id: item.id,
          product_name: item.product_name,
          price: item.price,
          quantity: item.quantity,
          size: item.size || null,
        })),
        customerInfo: { name, address: fullAddress, phone },
      };

      const response = await handleBuyNowService(orderData);
      if (response.success) {
        setCartItems([]);
        Alert.alert('Thành công', 'Đơn hàng đã được đặt thành công!');
        setToastVisible(true);
        setTimeout(() => {
          setToastVisible(false);
          // Điều hướng tới Lịch sử đơn hàng và reset stack
          navigation.reset({
            index: 0,
            routes: [{ name: 'OrderHistoryScreen' }],
          });
        }, 2000);
      } else {
        Alert.alert('Lỗi', response.message || 'Không thể đặt hàng.');
      }
    } catch (error) {
      console.error('Confirm Order error:', error);
      Alert.alert('Lỗi', error.message || 'Đã xảy ra lỗi khi đặt hàng.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectDistrict = (district) => {
    setSelectedDistrict(district);
    setSelectedWard(null); // Reset phường khi chọn quận mới
  };
  
  const handleSelectWard = (ward) => {
    setSelectedWard(ward);
    setAddressModalVisible(false); // Đóng modal sau khi chọn xong
  };

  if (!cartItems.length) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Header title="Thông tin người nhận" showBackButton />
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: colors.text }]}>
            Không có sản phẩm để đặt hàng.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Thông tin người nhận" showBackButton />
      <ScrollView contentContainerStyle={styles.form}>
        {/* Customer Information */}
        <Text style={[styles.label, { color: colors.text }]}>Họ và tên</Text>
        <TextInput
          style={[styles.input, { borderColor: colors.border, color: colors.text }]}
          value={name} onChangeText={setName} placeholder="Nhập tên của bạn"
          placeholderTextColor={colors.textSecondary}
        />
        
        <Text style={[styles.label, { color: colors.text }]}>Số điện thoại</Text>
        <TextInput
          style={[styles.input, { borderColor: colors.border, color: colors.text }]}
          value={phone} onChangeText={setPhone} keyboardType="phone-pad"
          placeholder="Nhập số điện thoại" placeholderTextColor={colors.textSecondary}
        />
<Text style={[styles.label, { color: colors.text }]}>Thành phố</Text>
        <View style={[styles.input, styles.disabledInput]}>
            <Text style={{ color: colors.textSecondary }}>Thành phố Hồ Chí Minh</Text>
        </View>

<Text style={[styles.label, { color: colors.text }]}>Quận/Huyện và Phường/Xã</Text>
        <TouchableOpacity style={[styles.input, styles.addressPicker]} onPress={() => setAddressModalVisible(true)}>
            <Text style={{color: selectedDistrict ? colors.text : colors.textSecondary}}>
                {selectedDistrict && selectedWard ? `${selectedWard}, ${selectedDistrict}` : 'Chọn Quận/Huyện và Phường/Xã'}
            </Text>

        </TouchableOpacity>
        <Text style={[styles.label, { color: colors.text }]}>Địa chỉ (Số nhà, đường)</Text>
        <TextInput
          style={[styles.input, { borderColor: colors.border, color: colors.text }]}
          value={streetAddress} onChangeText={setStreetAddress}
          placeholder="Ví dụ: 123 Nguyễn Văn Cừ" placeholderTextColor={colors.textSecondary}
        />


        
        

        {/* Order Summary */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Tóm tắt đơn hàng</Text>
        {cartItems.map((item, index) => (
          <View key={index} style={styles.itemContainer}>
            <Text style={[styles.itemLabel, { color: colors.text }]}>
              {item.product_name} (x{item.quantity})
            </Text>
            <Text style={[styles.itemValue, { color: colors.textSecondary }]}>
              Giá: {(item.price || 0).toLocaleString()}₫
            </Text>
            {item.size && (
              <Text style={[styles.itemValue, { color: colors.textSecondary }]}>Kích thước: {item.size}</Text>
            )}
          </View>
        ))}
        <Text style={[styles.totalLabel, { color: colors.text }]}>
          Tổng cộng: {totalPrice.toLocaleString()}₫
        </Text>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.primary }]}
          onPress={handleConfirmOrder} disabled={isLoading}
        >
          {isLoading ? <ActivityIndicator color={colors.card} /> : <Text style={[styles.buttonText, { color: colors.card }]}>Xác nhận đặt hàng</Text>}
        </TouchableOpacity>
      </ScrollView>

      {/* Address Selection Modal */}
      <Modal visible={addressModalVisible} transparent={true} animationType="slide" onRequestClose={() => setAddressModalVisible(false)}>
        <View style={styles.modalContainer}>
            <View style={[styles.modalContent, {backgroundColor: colors.card}]}>
                <Text style={[styles.modalTitle, {color: colors.text}]}>Chọn địa chỉ</Text>

                <View style={styles.modalListsContainer}>
                    {/* District List */}
                    <View style={styles.listColumn}>
                        <Text style={[styles.columnTitle, {color: colors.text}]}>Quận/Huyện</Text>
                        <FlatList
                            data={districts}
                            keyExtractor={item => item}
                            renderItem={({ item }) => (
                                <TouchableOpacity style={[styles.listItem, selectedDistrict === item && {backgroundColor: colors.primaryLightest}]} onPress={() => handleSelectDistrict(item)}>
                                    <Text style={{color: colors.text}}>{item}</Text>
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                    {/* Ward List */}
                    <View style={styles.listColumn}>
                        <Text style={[styles.columnTitle, {color: colors.text}]}>Phường/Xã</Text>
                        <FlatList
                            data={wards}
                            keyExtractor={item => item}
                            renderItem={({ item }) => (
                                <TouchableOpacity style={styles.listItem} onPress={() => handleSelectWard(item)}>
                                    <Text style={{color: colors.text}}>{item}</Text>
                                </TouchableOpacity>
                            )}
                            ListEmptyComponent={<Text style={{color: colors.textSecondary, textAlign: 'center', marginTop: 20}}>Chọn quận/huyện trước</Text>}
                        />
                    </View>
                </View>
                 <TouchableOpacity style={[styles.closeButton, {backgroundColor: colors.disabled}]} onPress={() => setAddressModalVisible(false)}>
                    <Text style={{color: colors.text}}>Đóng</Text>
                </TouchableOpacity>
                
            </View>
        </View>
      </Modal>

      {/* Toast */}
      {toastVisible && (
        <View style={[styles.toast, { backgroundColor: colors.primary }]}>
          <Text style={[styles.toastText, { color: colors.card }]}>
            Đơn hàng đã được đặt thành công!
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  form: { padding: 20 },
  label: { fontSize: 16, fontWeight: '600', marginTop: 16 },
  input: { borderWidth: 1, borderRadius: 10, padding: 12, marginTop: 4, fontSize: 16 },
  addressPicker: { justifyContent: 'center' },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginTop: 24, marginBottom: 12 },
  itemContainer: { marginBottom: 12, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: '#eee'},
  itemLabel: { fontSize: 16, fontWeight: '600' },
  itemValue: { fontSize: 14, marginTop: 4 },
  totalLabel: { fontSize: 18, fontWeight: '700', marginTop: 16 },
  button: { marginTop: 32, paddingVertical: 16, borderRadius: 10, alignItems: 'center' },
  buttonText: { fontSize: 16, fontWeight: '700' },
  toast: { position: 'absolute', bottom: 50, left: '10%', right: '10%', padding: 12, borderRadius: 8, alignItems: 'center' },
  toastText: { fontSize: 14, fontWeight: '600' },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  errorText: { fontSize: 18, textAlign: 'center' },
  // Modal Styles
  modalContainer: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { height: '60%', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  modalListsContainer: { flexDirection: 'row', flex: 1 },
  listColumn: { flex: 1, borderRightWidth: 1, borderRightColor: '#eee' },
  columnTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 10, paddingHorizontal: 10},
  listItem: { padding: 15 },
  closeButton: { padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 20 },
});
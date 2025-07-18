// import React, { useState } from 'react';
// import {
//   View,
//   Text,
//   FlatList,
//   Image,
//   TouchableOpacity,
//   StyleSheet,
//   TextInput,
//   Modal,
// } from 'react-native';
// import Header from '../components/common/Header';
// import { useCart } from '../context/CartProvider';
// import { handleCheckout } from './OrderService';

// const ProductCartScreen = () => {
//   const { cartItems, increment, decrement, removeItem, setCartItems } = useCart();

//   const [modalVisible, setModalVisible] = useState(false);
//   const [customerInfo, setCustomerInfo] = useState({
//     name: '',
//     phone: '',
//     address: '',
//   });

//   const totalPrice = cartItems.reduce((total, item) => total + (item.price || 0) * item.quantity, 0);

//   const onConfirmCheckout = async () => {
//     try {
//       const success = await handleCheckout(cartItems, customerInfo);
//       if (success) {
//         setCartItems([]);
//         setModalVisible(false);
//       } else {
//         alert('Checkout failed. Please try again.');
//       }
//     } catch (error) {
//       console.error('Checkout error:', error);
//       alert('An error occurred during checkout. Please try again.');
//     }
//   };

//   const renderItem = ({ item }) => (
//     <View style={styles.itemContainer}>
//       <Image source={{ uri: item.image_url || item.image }} style={styles.image} />
//       <View style={styles.details}>
//         <Text style={styles.name}>{item.name || item.title || item.product_name}</Text>
//         <Text style={styles.price}>{(item.price || 0).toLocaleString()}₫</Text>
//         <View style={styles.quantityContainer}>
//           <TouchableOpacity onPress={() => decrement(item.id)} style={styles.button}>
//             <Text style={styles.buttonText}>-</Text>
//           </TouchableOpacity>
//           <Text style={styles.quantity}>{item.quantity}</Text>
//           <TouchableOpacity onPress={() => increment(item.id)} style={styles.button}>
//             <Text style={styles.buttonText}>+</Text>
//           </TouchableOpacity>
//         </View>
//       </View>
//       <TouchableOpacity onPress={() => removeItem(item.id)} style={styles.removeButton}>
//         <Text style={styles.removeButtonText}>Xóa</Text>
//       </TouchableOpacity>
//     </View>
//   );

//   return (
//     <View style={styles.container}>
//       <Header title="Giỏ hàng" showBackButton={true} />
//       {cartItems.length === 0 ? (
//         <Text style={styles.emptyText}>Giỏ hàng đang trống</Text>
//       ) : (
//         <>
//           <FlatList
//             data={cartItems}
//             renderItem={renderItem}
//             keyExtractor={(item) => item.id || Math.random().toString()}
//             contentContainerStyle={styles.listContainer}
//           />
//           <View style={styles.footer}>
//             <Text style={styles.totalText}>Tổng cộng: {totalPrice.toLocaleString()}₫</Text>
//             <TouchableOpacity style={styles.checkoutButton} onPress={() => setModalVisible(true)}>
//               <Text style={styles.checkoutButtonText}>Thanh toán</Text>
//             </TouchableOpacity>
//           </View>
//         </>
//       )}

//       {/* Modal nhập thông tin */}
//       <Modal
//         visible={modalVisible}
//         animationType="slide"
//         transparent={true}
//         onRequestClose={() => setModalVisible(false)}
//       >
//         <View style={styles.modalBackground}>
//           <View style={styles.modalContainer}>
//             <Text style={styles.modalTitle}>Thông tin người nhận</Text>
//             <TextInput
//               placeholder="Họ tên"
//               style={styles.input}
//               value={customerInfo.name}
//               onChangeText={(text) => setCustomerInfo({ ...customerInfo, name: text })}
//             />
//             <TextInput
//               placeholder="Số điện thoại"
//               keyboardType="phone-pad"
//               style={styles.input}
//               value={customerInfo.phone}
//               onChangeText={(text) => setCustomerInfo({ ...customerInfo, phone: text })}
//             />
//             <TextInput
//               placeholder="Địa chỉ"
//               style={styles.input}
//               value={customerInfo.address}
//               onChangeText={(text) => setCustomerInfo({ ...customerInfo, address: text })}
//             />
//             <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
//               <TouchableOpacity onPress={() => setModalVisible(false)} style={[styles.modalButton, { backgroundColor: '#ccc' }]}>
//                 <Text>Hủy</Text>
//               </TouchableOpacity>
//               <TouchableOpacity onPress={onConfirmCheckout} style={styles.modalButton}>
//                 <Text style={{ color: '#fff' }}>Xác nhận</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>
//       </Modal>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#fff',
//   },
//   listContainer: {
//     paddingHorizontal: 12,
//     paddingTop: 10,
//     paddingBottom: 80,
//   },
//   itemContainer: {
//     flexDirection: 'row',
//     marginBottom: 16,
//     borderWidth: 1,
//     borderColor: '#ddd',
//     borderRadius: 8,
//     padding: 8,
//   },
//   image: {
//     width: 100,
//     height: 100,
//     borderRadius: 8,
//   },
//   details: {
//     flex: 1,
//     marginLeft: 16,
//     justifyContent: 'space-between',
//   },
//   name: {
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
//   price: {
//     fontSize: 14,
//     color: '#888',
//   },
//   quantityContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   button: {
//     width: 32,
//     height: 32,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#ddd',
//     borderRadius: 4,
//   },
//   buttonText: {
//     fontSize: 18,
//     fontWeight: 'bold',
//   },
//   quantity: {
//     marginHorizontal: 8,
//     fontSize: 16,
//   },
//   removeButton: {
//     backgroundColor: '#ff4d4d',
//     borderRadius: 4,
//     paddingVertical: 6,
//     paddingHorizontal: 12,
//     marginLeft: 8,
//   },
//   removeButtonText: {
//     color: '#fff',
//     fontWeight: 'bold',
//     fontSize: 14,
//   },
//   emptyText: {
//     textAlign: 'center',
//     marginTop: 50,
//     fontSize: 16,
//     color: '#666',
//   },
//   footer: {
//     position: 'absolute',
//     bottom: 0,
//     left: 0,
//     right: 0,
//     padding: 16,
//     backgroundColor: '#fff',
//     borderTopWidth: 1,
//     borderTopColor: '#ddd',
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },
//   totalText: {
//     fontSize: 18,
//     fontWeight: 'bold',
//   },
//   checkoutButton: {
//     backgroundColor: '#8B4513',
//     borderRadius: 8,
//     paddingVertical: 12,
//     paddingHorizontal: 24,
//   },
//   checkoutButtonText: {
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
//   modalBackground: {
//     flex: 1,
//     backgroundColor: 'rgba(0,0,0,0.4)',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   modalContainer: {
//     backgroundColor: '#fff',
//     width: '85%',
//     borderRadius: 10,
//     padding: 20,
//   },
//   modalTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     marginBottom: 10,
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: '#ccc',
//     borderRadius: 6,
//     padding: 10,
//     marginBottom: 10,
//   },
//   modalButton: {
//     backgroundColor: '#8B4513',
//     padding: 10,
//     borderRadius: 6,
//     flex: 1,
//     alignItems: 'center',
//     marginHorizontal: 5,
//   },
// });


// export default ProductCartScreen;
import React from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Header from '../components/common/Header';
import { useCart } from '../context/CartProvider';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';

const ProductCartScreen = () => {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const { cartItems, increment, decrement, removeItem } = useCart();

  const totalPrice = cartItems.reduce((total, item) => total + (item.price || 0) * item.quantity, 0);

  const handleNavigateToCheckout = () => {
    navigation.navigate('InformationUserScreen', { cartItems });
  };

  const renderItem = ({ item }) => {
    const itemTotal = (item.price || 0) * item.quantity;

    return (
      <View style={themedStyles.itemContainer}>
        <Image source={{ uri: item.image_url || item.image }} style={themedStyles.image} />
        <View style={themedStyles.details}>
          <Text style={themedStyles.name}>{item.name || item.title || item.product_name}</Text>
          <Text style={themedStyles.price}>Giá: {(item.price || 0).toLocaleString()}₫</Text>
  
          <View style={themedStyles.quantityContainer}>
            <TouchableOpacity onPress={() => decrement(item.id)} style={themedStyles.button}>
              <Text style={themedStyles.buttonText}>-</Text>
            </TouchableOpacity>
            <Text style={themedStyles.quantity}>{item.quantity}</Text>
            <TouchableOpacity onPress={() => increment(item.id)} style={themedStyles.button}>
              <Text style={themedStyles.buttonText}>+</Text>
            </TouchableOpacity>
          </View>
  
          <Text style={themedStyles.itemTotalText}>Thành tiền: {itemTotal.toLocaleString()}₫</Text>
        </View>
  
        <TouchableOpacity onPress={() => removeItem(item.id)} style={themedStyles.removeButton}>
          <Text style={themedStyles.removeButtonText}>Xóa</Text>
        </TouchableOpacity>
      </View>
    );
  };
  
  const themedStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.card,
    },
    listContainer: {
      paddingHorizontal: 12,
      paddingTop: 10,
      paddingBottom: 80,
    },
    itemContainer: {
      flexDirection: 'row',
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      padding: 8,
      backgroundColor: colors.primaryLightest,
    },
    image: {
      width: 100,
      height: 100,
      borderRadius: 8,
    },
    details: {
      flex: 1,
      marginLeft: 16,
      justifyContent: 'space-between',
    },
    name: {
      fontSize: 15,
      fontWeight: 'bold',
      color: colors.text,
    },
    price: {
      fontSize: 14,
      color: colors.textLight,
    },
    quantityContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    button: {
      width: 32,
      height: 32,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.border,
      borderRadius: 4,
    },
    buttonText: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.text,
    },
    quantity: {
      marginHorizontal: 8,
      fontSize: 16,
      color: colors.text,
    },
    removeButton: {
      backgroundColor: colors.error,
      borderRadius: 4,
      paddingVertical: 6,
      paddingHorizontal: 12,
      marginLeft: 8,
      alignSelf: 'center',
    },
    removeButtonText: {
      color: colors.card,
      fontWeight: 'bold',
      fontSize: 14,
    },
    emptyText: {
      textAlign: 'center',
      marginTop: 50,
      fontSize: 16,
      color: colors.textSecondary,
    },
    footer: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      padding: 16,
      backgroundColor: colors.card,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    totalText: {
      fontSize: 16,
      fontWeight: 'bold',
      color: colors.text,
    },
    checkoutButton: {
      backgroundColor: colors.primary,
      borderRadius: 8,
      paddingVertical: 12,
      paddingHorizontal: 24,
    },
    checkoutButtonText: {
      color: colors.card,
      fontSize: 16,
      fontWeight: 'bold',
    },
    modalBackground: {
      flex: 1,
      backgroundColor: colors.overlay,
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContainer: {
      backgroundColor: colors.card,
      width: '85%',
      borderRadius: 10,
      padding: 20,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 10,
      color: colors.text,
    },
    input: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 6,
      padding: 10,
      marginBottom: 10,
      color: colors.text,
    },
    modalButton: {
      backgroundColor: colors.primary,
      padding: 10,
      borderRadius: 6,
      flex: 1,
      alignItems: 'center',
      marginHorizontal: 5,
    },
    cancelButton: {
      backgroundColor: colors.disabled,
    },
    cancelButtonText: {
      color: colors.text,
    },
    itemTotalText: {
      marginTop: 4,
      fontSize: 14,
      fontWeight: '500',
      color: colors.text,
    },
  });

return (
    <View style={themedStyles.container}>
      <Header title="Giỏ hàng" showBackButton={true} />
      {cartItems.length === 0 ? (
        <Text style={themedStyles.emptyText}>Giỏ hàng đang trống</Text>
      ) : (
        <>
          <FlatList
            data={cartItems}
            renderItem={renderItem}
            keyExtractor={(item) => item.id || Math.random().toString()}
            contentContainerStyle={themedStyles.listContainer}
          />
          <View style={themedStyles.footer}>
            <Text style={themedStyles.totalText}>Tổng cộng: {totalPrice.toLocaleString()}₫</Text>
            {/* THAY ĐỔI Ở ĐÂY */}
            <TouchableOpacity style={themedStyles.checkoutButton} onPress={handleNavigateToCheckout}>
              <Text style={themedStyles.checkoutButtonText}>Thanh toán</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
      
      {/* --- MODAL ĐÃ BỊ XÓA --- */}
    </View>
  );
};

export default ProductCartScreen

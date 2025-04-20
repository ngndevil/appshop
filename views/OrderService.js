// filepath: d:\reacnative\appshop\services\orderService.js
import { db } from "../constants/firebaseConfig";
import { collection, addDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { Alert } from "react-native";

export const handleCheckout = async (cartItems) => {
  if (cartItems.length === 0) {
    Alert.alert(
      "Giỏ hàng trống",
      "Vui lòng thêm sản phẩm trước khi thanh toán."
    );
    return false;
  }

  try {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) {
      Alert.alert("Lỗi", "Bạn cần đăng nhập để thực hiện thanh toán.");
      return false;
    }

    const totalPrice = cartItems.reduce(
      (total, item) => total + (item.price || 0) * (item.quantity || 1),
      0
    );

    const formattedTotalPrice = Number(totalPrice.toFixed(2));

    const order = {
      items: cartItems,
      total: formattedTotalPrice,
      createdAt: new Date().toISOString(),
      userId: user.uid,
    };

    await addDoc(collection(db, "orders"), order);

    Alert.alert(
      "Thanh toán thành công",
      `Tổng cộng: ${formattedTotalPrice.toLocaleString()}₫`
    );
    return true;
  } catch (error) {
    console.error("Checkout error:", error);
    Alert.alert("Lỗi thanh toán", error.message || "Không thể lưu đơn hàng.");
    return false;
  }
};

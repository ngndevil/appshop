import { db } from "../constants/firebaseConfig";
import {
  collection,
  doc,
  runTransaction,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { Alert } from "react-native";

export const handleCheckout = async (cartItems, customerInfo) => {
  const { name, address, phone } = customerInfo;

  if (cartItems.length === 0) {
    Alert.alert("Giỏ hàng trống", "Vui lòng thêm sản phẩm trước khi thanh toán.");
    return false;
  }

  if (!name || !address || !phone) {
    Alert.alert("Thiếu thông tin", "Vui lòng nhập đầy đủ thông tin người nhận.");
    return false;
  }

  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) {
    Alert.alert("Lỗi", "Bạn cần đăng nhập để thực hiện thanh toán.");
    return false;
  }

  try {
    await runTransaction(db, async (transaction) => {
      let totalPrice = 0;

      for (const item of cartItems) {
        const productRef = doc(db, "product", item.id);
        const productSnap = await transaction.get(productRef);

        if (!productSnap.exists()) {
          throw new Error(`Sản phẩm "${item.product_name}" không tồn tại.`);
        }

        const productData = productSnap.data();
        const stock = productData.stock || 0;

        if (item.quantity > stock) {
          throw new Error(`Sản phẩm "${item.product_name}" chỉ còn ${stock} trong kho.`);
        }

        totalPrice += (item.price || 0) * item.quantity;

        transaction.update(productRef, {
          stock: stock - item.quantity,
        });
      }

      const order = {
        items: cartItems,
        total: Number(totalPrice.toFixed(2)),
        createdAt: new Date().toISOString(),
        userId: user.uid,
        customerName: name,
        customerAddress: address,
        customerPhone: phone,
        status: 'pending',
      };

      await transaction.set(doc(collection(db, "orders")), order);
    });

    Alert.alert("Thanh toán thành công", "Đơn hàng đã được xử lý.");
    return true;
  } catch (error) {
    console.error("Checkout error:", error);
    Alert.alert("Lỗi thanh toán", error.message || "Không thể xử lý đơn hàng.");
    return false;
  }
};

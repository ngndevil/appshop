import { db } from "../constants/firebaseConfig";
import {
  collection,
  addDoc,
  doc,
  getDoc,
  updateDoc,
  runTransaction,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { Alert } from "react-native";

export const handleCheckout = async (cartItems) => {
  if (cartItems.length === 0) {
    Alert.alert("Giỏ hàng trống", "Vui lòng thêm sản phẩm trước khi thanh toán.");
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

      // Kiểm tra stock trước khi thanh toán
      for (const item of cartItems) {
        const productRef = doc(db, "product", item.id);
        const productSnap = await transaction.get(productRef);

        if (!productSnap.exists()) {
          throw new Error(`Sản phẩm "${item.product_name}" không tồn tại.`);
        }

        const productData = productSnap.data();
        const stock = productData.stock || 0;

        if (item.quantity > stock) {
          throw new Error(
            `Sản phẩm "${item.product_name}" chỉ còn ${stock} trong kho.`
          );
        }

        // Tính tổng giá và chuẩn bị cập nhật stock
        totalPrice += (item.price || 0) * item.quantity;
        transaction.update(productRef, {
          stock: stock - item.quantity,
        });
      }

      const formattedTotalPrice = Number(totalPrice.toFixed(2));

      // Thêm đơn hàng vào Firestore
      const order = {
        items: cartItems,
        total: formattedTotalPrice,
        createdAt: new Date().toISOString(),
        userId: user.uid,
      };

      await transaction.set(doc(collection(db, "orders")), order);
    });

    Alert.alert("Thanh toán thành công", `Đơn hàng đã được xử lý.`);
    return true;
  } catch (error) {
    console.error("Checkout error:", error);
    Alert.alert("Lỗi thanh toán", error.message || "Không thể xử lý đơn hàng.");
    return false;
  }
};

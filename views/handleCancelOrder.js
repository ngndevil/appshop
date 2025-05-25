import { db } from "../constants/firebaseConfig";
import { doc, runTransaction, deleteDoc } from "firebase/firestore";
import { Alert } from "react-native";

export const handleCancelOrder = async (orderId, orderItems) => {
  try {
    const orderRef = doc(db, "orders", orderId);

    await runTransaction(db, async (transaction) => {
      // ✅ BƯỚC 1: Cộng lại stock cho từng sản phẩm
      for (const item of orderItems) {
        const productRef = doc(db, "product", item.id);
        const productSnap = await transaction.get(productRef);

        if (!productSnap.exists()) {
          throw new Error(`Sản phẩm "${item.product_name}" không tồn tại.`);
        }

        const currentStock = productSnap.data().stock || 0;

        transaction.update(productRef, {
          stock: currentStock + item.quantity,
        });
      }
    });

    // XÓA ORDER SAU KHI HOÀN TẤT TRANSACTION
    await deleteDoc(orderRef);

    Alert.alert("✅ Thành công", "Đơn hàng đã được hủy và xóa khỏi hệ thống.");
  } catch (error) {
    console.error("Cancel order error:", error);
    Alert.alert("❌ Lỗi hủy đơn", error.message || "Không thể hủy đơn hàng.");
  }
};

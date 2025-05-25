import { db } from "../constants/firebaseConfig";
import { collection, doc, runTransaction, Timestamp } from "firebase/firestore";
import { getAuth } from "firebase/auth"; // Keep only one import for getAuth
import { Alert } from "react-native";
import { addDoc } from "firebase/firestore"; // Fix typo: 'addoc' should be 'addDoc'

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
    const ordersCollection = collection(db, "orders");
    const newOrderRef = doc(ordersCollection); // tạo ref cho đơn hàng mới

    await runTransaction(db, async (transaction) => {
      let totalPrice = 0;
      const validatedItems = [];

      // ✅ BƯỚC 1: ĐỌC dữ liệu tất cả sản phẩm
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

        validatedItems.push({
          ...item,
          productRef,
          stock,
        });
      }

      // ✅ BƯỚC 2: GHI dữ liệu (cập nhật tồn kho và tạo đơn hàng)
      for (const item of validatedItems) {
        totalPrice += (item.price || 0) * item.quantity;

        transaction.update(item.productRef, {
          stock: item.stock - item.quantity,
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
        status: "pending",
      };

      transaction.set(newOrderRef, order);
    });

    Alert.alert("Thanh toán thành công", "Đơn hàng đã được xử lý.");
    return true;
  } catch (error) {
    console.error("Checkout error:", error);
    Alert.alert("Lỗi thanh toán", error.message || "Không thể xử lý đơn hàng.");
    return false;
  }
};

export const handleBuyNowService = async (orderData) => {
  const { items, customerInfo } = orderData;
  const { name, address, phone } = customerInfo || {};

  if (!items || items.length === 0) {
    return { success: false, message: 'Giỏ hàng trống.' };
  }
  if (!name || !address || !phone) {
    return { success: false, message: 'Vui lòng cung cấp đầy đủ thông tin người nhận.' };
  }

  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) {
    return { success: false, message: 'Bạn cần đăng nhập để đặt hàng.' };
  }

  try {
    const ordersCollection = collection(db, 'orders');
    const newOrderRef = doc(ordersCollection);

    await runTransaction(db, async (transaction) => {
      let totalPrice = 0;
      const validatedItems = [];

      // Validate stock for each item
      for (const item of items) {
        const productRef = doc(db, 'product', item.id);
        const productSnap = await transaction.get(productRef);

        if (!productSnap.exists()) {
          throw new Error(`Sản phẩm "${item.product_name}" không tồn tại.`);
        }

        const productData = productSnap.data();
        const stock = productData.stock || 0;

        if (item.quantity > stock) {
          throw new Error(`Sản phẩm "${item.product_name}" chỉ còn ${stock} trong kho.`);
        }

        validatedItems.push({
          ...item,
          productRef,
          stock,
        });
        totalPrice += (item.price || 0) * item.quantity;
      }

      // Update stock and create order
      for (const item of validatedItems) {
        transaction.update(item.productRef, {
          stock: item.stock - item.quantity,
        });
      }

      const order = {
        items: items.map(item => ({
          product_id: item.id,
          product_name: item.product_name,
          price: item.price,
          quantity: item.quantity,
          size: item.size || null,
        })),
        total: Number(totalPrice.toFixed(2)),
        createdAt: Timestamp.now(),
        userId: user.uid,
        customerName: name,
        customerAddress: address,
        customerPhone: phone,
        status: 'pending',
      };

      transaction.set(newOrderRef, order);
    });

    return { success: true, orderId: newOrderRef.id };
  } catch (error) {
    console.error('Lỗi tạo đơn hàng:', error);
    return { success: false, message: error.message || 'Không thể tạo đơn hàng.' };
  }
};
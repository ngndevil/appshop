/**
 * App Theme System - Simplified Color Palette
 * Only contains color definitions for easy theme switching
 */

// Bảng màu chủ đạo theo tông nâu vàng (Gold Brown)
export const colors = {
  // Màu chính
  primary: '#8B4513', // Gold Brown - màu chủ đạo
  primaryLight: '#CC9966', // Light Gold - màu phụ
  primaryLighter: '#f0e6d8', // Nâu nhạt cho background khi selected
  primaryLightest: '#f9f5f0', // Kem nhạt cho background icons
  
  // Màu nền
  background: '#f8f8f8', // Nền chính cho app
  card: '#FFFFFF', // Nền cho card, header
  
  // Màu chữ
  text: '#333333', // Chữ chính
  textSecondary: '#666666', // Chữ phụ
  textLight: '#999999', // Chữ nhạt
  
  // Màu trạng thái và nhấn mạnh
  success: '#4CAF50', // Xanh lá cho thành công
  error: '#e74c3c', // Đỏ cho lỗi/cảnh báo
  warning: '#f39c12', // Cam cho cảnh báo
  info: '#3498db', // Xanh dương cho thông tin
  disabled: '#cccccc', // Màu vô hiệu hóa
  highlight: '#7B4513', // Màu nhấn mạnh (cho dot active)
  
  // Màu khuyến mãi
  sale: '#E53935', // Đỏ tươi cho nhãn giảm giá
  saleLight: '#FFEBEE', // Nền nhẹ cho badge giảm giá
  
  // Overlay & Transparency
  overlay: 'rgba(0, 0, 0, 0.5)', // Overlay đậm cho modal
  overlayLight: 'rgba(0, 0, 0, 0.2)', // Overlay nhẹ cho background
  transparent: 'transparent', // Trong suốt
  
  // Màu khác
  border: '#dddddd', // Viền
  shadow: '#000000', // Bóng đổ
};

// Gradient colors (sử dụng với linear-gradient)
export const gradients = {
  primary: [colors.primary, colors.primaryLight],
  light: [colors.primaryLightest, colors.primaryLighter],
  dark: ['#62300d', colors.primary],
};


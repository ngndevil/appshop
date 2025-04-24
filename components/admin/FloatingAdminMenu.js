import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';

export default function FloatingAdminMenu() {
  const navigation = useNavigation();
  const menuWidth = useSharedValue(0);
  const [menuVisible, setMenuVisible] = useState(false);

  const toggleMenu = () => {
    const newVisible = !menuVisible;
    setMenuVisible(newVisible);
    menuWidth.value = withTiming(newVisible ? 180 : 0, { duration: 300 });
  };

  const animatedMenuStyle = useAnimatedStyle(() => ({
    width: menuWidth.value,
    opacity: menuWidth.value > 0 ? 1 : 0,
  }));

  return (
    <View style={styles.menuContainer}>
      <Animated.View style={[styles.menuBox, animatedMenuStyle]}>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => {
            toggleMenu();
            navigation.navigate('AddProductScreen');
          }}
        >
          <Text style={styles.menuText}>Thêm sản phẩm</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => {
            toggleMenu();
            navigation.navigate('RevenueScreen');
          }}
        >
          <Text style={styles.menuText}>Xem doanh thu</Text>
        </TouchableOpacity>
      </Animated.View>

      <TouchableOpacity style={styles.menuButton} onPress={toggleMenu}>
        <Icon name="menu" size={28} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  menuContainer: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 100,
  },
  menuBox: {
    backgroundColor: '#CC9966',
    borderRadius: 16,
    padding: 8,
    marginRight: 10,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  menuItem: {
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  menuText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  menuButton: {
    backgroundColor: '#CC9966',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
});

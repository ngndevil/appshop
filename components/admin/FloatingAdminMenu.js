import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';

export default function FloatingAdminMenu() {
  const navigation = useNavigation();
  const menuWidth = useSharedValue(0);
  const [menuVisible, setMenuVisible] = useState(false);
  const { colors } = useTheme();

  const toggleMenu = () => {
    const newVisible = !menuVisible;
    setMenuVisible(newVisible);
    menuWidth.value = withTiming(newVisible ? 180 : 0, { duration: 300 });
  };

  const animatedMenuStyle = useAnimatedStyle(() => ({
    width: menuWidth.value,
    opacity: menuWidth.value > 0 ? 1 : 0,
  }));

  // Define themed styles inside component
  const themedStyles = StyleSheet.create({
    menuContainer: {
      position: 'absolute',
      bottom: 30,
      right: 20,
      flexDirection: 'row',
      alignItems: 'center',
      zIndex: 100,
    },
    menuBox: {
      backgroundColor: colors.primary,
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
      color: colors.card,
      fontWeight: 'bold',
      fontSize: 14,
    },
    menuButton: {
      backgroundColor: colors.primary,
      width: 60,
      height: 60,
      borderRadius: 30,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 8,
    },
  });

  return (
    <View style={themedStyles.menuContainer}>
      <Animated.View style={[themedStyles.menuBox, animatedMenuStyle]}>
        <TouchableOpacity
          style={themedStyles.menuItem}
          onPress={() => {
            toggleMenu();
            navigation.navigate('AddProductScreen');
          }}
        >
          <Text style={themedStyles.menuText}>Thêm sản phẩm</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={themedStyles.menuItem}
          onPress={() => {
            toggleMenu();
            navigation.navigate('RevenueScreen');
          }}
        >
          <Text style={themedStyles.menuText}>Xem doanh thu</Text>
        </TouchableOpacity>
      </Animated.View>

      <TouchableOpacity style={themedStyles.menuButton} onPress={toggleMenu}>
        <Icon name="menu" size={28} color={colors.card} />
      </TouchableOpacity>
    </View>
  );
}


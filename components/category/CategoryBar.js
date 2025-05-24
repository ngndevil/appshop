import React, { useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList,
  TouchableOpacity,
  Dimensions 
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../context/ThemeContext';

const { width: screenWidth } = Dimensions.get('window');

const CategoryBar = ({ onSelectCategory, selectedCategory = 'all' }) => {
  // Get theme colors
  const { colors } = useTheme();
  
  // Category data với icon từ MaterialCommunityIcons
  const categories = [
    { id: 'all', name: 'ALL', iconName: 'apps' },
    { id: 'T-Shirt', name: 'T-Shirt', iconName: 'tshirt-crew' },
    { id: 'Jeans', name: 'Jeans', iconName: 'jeans' },
    { id: 'Sneakers', name: 'Sneakers', iconName: 'shoe-sneaker' },
    { id: 'Boots', name: 'Boots', iconName: 'shoe-formal' },
    { id: 'Sweater', name: 'Sweater', iconName: 'tshirt-v' },
    { id: 'Sandals', name: 'Sandals', iconName: 'shoe-sandal' },
    { id: 'Jacket', name: 'Jacket', iconName: 'jacket' },
    { id: 'Hat', name: 'Hat', iconName: 'hat-fedora' },
     { id: 'Shorts', name: 'Shorts', iconName: 'hat-fedora' },
  ];

  // Flatlist reference
  const flatListRef = useRef(null);

  // Create themed styles inside component
  const themedStyles = StyleSheet.create({
    container: {
      backgroundColor: colors.card,
      paddingVertical: 15,
      marginBottom: 12,
      marginTop: 5,
      borderRadius: 8,
      shadowColor: colors.shadow,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 2,
    },
    scrollContainer: {
      paddingHorizontal: 10,
    },
    categoryItem: {
      alignItems: 'center',
      marginHorizontal: 12,
      width: 60,
    },
    iconContainer: {
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: colors.primaryLightest,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 8,
      shadowColor: colors.shadow,
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.2,
      shadowRadius: 1.5,
      elevation: 2,
    },
    selectedIconContainer: {
      backgroundColor: colors.primaryLighter,
      borderWidth: 2,
      borderColor: colors.primary,
    },
    categoryName: {
      fontSize: 12,
      color: colors.text,
      textAlign: 'center',
      fontWeight: '500',
    },
    selectedCategoryName: {
      color: colors.primary,
      fontWeight: '700',
    },
  });

  // Render category item
  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity 
      style={themedStyles.categoryItem}
      onPress={() => onSelectCategory && onSelectCategory(item.id)}
    >
      <View style={[
        themedStyles.iconContainer,
        selectedCategory === item.id ? themedStyles.selectedIconContainer : {}
      ]}>
        <Icon 
          name={item.iconName} 
          size={26} 
          color={selectedCategory === item.id ? colors.primary : colors.textSecondary} 
        />
      </View>
      <Text 
        style={[
          themedStyles.categoryName,
          selectedCategory === item.id ? themedStyles.selectedCategoryName : {}
        ]}
      >
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={themedStyles.container}>
      <FlatList
        ref={flatListRef}
        data={categories}
        renderItem={renderCategoryItem}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={themedStyles.scrollContainer}
        initialNumToRender={categories.length}
        getItemLayout={(data, index) => (
          {length: 84, offset: 84 * index, index}
        )}
        removeClippedSubviews={false}
      />
    </View>
  );
};

export default React.memo(CategoryBar);

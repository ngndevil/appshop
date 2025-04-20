import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, TextInput, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getAuth } from 'firebase/auth';
import { useCart } from '../../context/CartProvider';

const Header = ({
  title,
  showBackButton = false,
  rightComponent,
  showSearchBar = false,
  onSearch,
  searchSuggestions = [],
  onSelectProduct,
  onSubmitSearch,
  onSort,
  onFilterCategory,
}) => {
  const navigation = useNavigation();
  const auth = getAuth();
  const { cartItems } = useCart();
  const [userPhotoURL, setUserPhotoURL] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const cartItemCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setUserPhotoURL(user.photoURL);
    }
  }, []);

  const handleAvatarPress = () => {
    navigation.navigate('EditProfileScreen');
  };

  const handleOrderHistoryPress = () => {
    navigation.navigate('OrderHistoryScreen');
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
    setShowSuggestions(text.trim().length > 0);
    if (onSearch) onSearch(text);
  };

  const handlePressSearchButton = () => {
    setShowSuggestions(false);
    if (onSubmitSearch) onSubmitSearch(searchQuery);
  };

  const handleSelectSuggestion = (product) => {
    setShowSuggestions(false);
    setSearchQuery(product.product_name || '');
    if (onSelectProduct) onSelectProduct(product);
  };

  const renderSuggestion = ({ item }) => (
    <TouchableOpacity style={styles.suggestionItem} onPress={() => handleSelectSuggestion(item)}>
      <Image
        source={{ uri: item.image_url || 'https://via.placeholder.com/50' }}
        style={styles.suggestionImage}
      />
      <View style={styles.suggestionContent}>
        <Text style={styles.suggestionTitle} numberOfLines={1}>{item.product_name}</Text>
        <Text style={styles.suggestionPrice}>{(item.price || 0).toLocaleString()}₫</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.headerContainer}>
      <View style={styles.header}>
        <View style={styles.leftContainer}>
          {showBackButton && (
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={styles.backButton}>←</Text>
            </TouchableOpacity>
          )}
        </View>

        {showSearchBar ? (
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Tìm kiếm sản phẩm..."
              value={searchQuery}
              onChangeText={handleSearch}
              returnKeyType="search"
              onSubmitEditing={handlePressSearchButton}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity style={styles.searchButton} onPress={handlePressSearchButton}>
                <Text style={styles.searchButtonText}>Tìm</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <Text style={styles.title}>{title}</Text>
        )}

        <View style={styles.rightContainer}>
          {rightComponent}

          <TouchableOpacity style={styles.orderHistoryButton} onPress={handleOrderHistoryPress}>
            <Text style={styles.orderHistoryText}>Lịch sử</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cartIconContainer}
            onPress={() => navigation.navigate('ProductCartScreen')}
          >
            <Image source={require('../../assets/images/cart.png')} style={styles.cartIcon} />
            {cartItemCount > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{cartItemCount}</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={handleAvatarPress} style={styles.avatarContainer}>
            <Image
              source={userPhotoURL ? { uri: userPhotoURL } : require('../../assets/images/default-avatar.jpg')}
              style={styles.avatar}
            />
          </TouchableOpacity>
        </View>
      </View>

      {showSearchBar && showSuggestions && searchSuggestions.length > 0 && (
        <View style={styles.suggestionsContainer}>
          <FlatList
            data={searchSuggestions.slice(0, 5)}
            renderItem={renderSuggestion}
            keyExtractor={(item) => item.id}
            keyboardShouldPersistTaps="always"
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    zIndex: 100,
    position: 'relative',
    backgroundColor: '#fff',
  },
  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    elevation: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  leftContainer: {
    width: 40,
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  backButton: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 40,
  },
  avatarContainer: {
    marginLeft: 10,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#8B4513',
  },
  cartIconContainer: {
    marginLeft: 10,
    position: 'relative',
  },
  cartIcon: {
    width: 24,
    height: 24,
  },
  cartBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#8B4513',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  orderHistoryButton: {
    marginLeft: 10,
    backgroundColor: '#8B4513',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  orderHistoryText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    alignItems: 'center',
    paddingHorizontal: 10,
    marginHorizontal: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
  },
  searchButton: {
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  searchButtonText: {
    color: '#8B4513',
    fontWeight: 'bold',
  },
  suggestionsContainer: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopWidth: 0,
    borderBottomWidth: 1,
    borderColor: '#ccc',
    zIndex: 999,
    maxHeight: 250,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  suggestionImage: {
    width: 40,
    height: 40,
    borderRadius: 6,
    marginRight: 10,
  },
  suggestionContent: {
    flex: 1,
  },
  suggestionTitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  suggestionPrice: {
    fontSize: 12,
    color: 'green',
  },
});

export default Header;

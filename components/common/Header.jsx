import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, TextInput, FlatList, Modal } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getAuth } from 'firebase/auth';
import { useCart } from '../../context/CartProvider';

const { width, height } = Dimensions.get('window');

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
  const [showSortModal, setShowSortModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);

  const cartItemCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setUserPhotoURL(user.photoURL);
    }
  }, []);

  // Thêm effect listener cho ứng dụng
  useEffect(() => {
    const backHandler = () => {
      if (isSearchExpanded) {
        collapseSearch();
        return true;
      }
      return false;
    };

    return () => {
      // Cleanup event listener
    };
  }, [isSearchExpanded]);

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
    if (onSelectProduct) {
      onSelectProduct(product);
    }
  };

  const handleSort = (order) => {
    setShowSortModal(false);
    if (onSort) {
      onSort(order);
    }
  };

  // const handleFilterCategory = (category) => {
  //   setShowFilterModal(false);
  //   if (onFilterCategory) {
  //     onFilterCategory(category);
  //   }
  // }; chua co data

  const renderSuggestion = ({ item }) => (
    <TouchableOpacity style={styles.suggestionItem} onPress={() => handleSelectSuggestion(item)}>
      <Image
        source={{ uri: item.image_url || 'https://via.placeholder.com/50' }}
        style={styles.suggestionImage}
        defaultSource={require('../../assets/images/default-avatar.jpg')}
      />
      <View style={styles.suggestionContent}>
        <Text style={styles.suggestionTitle} numberOfLines={1}>{item.product_name}</Text>
        <Text style={styles.suggestionPrice}>{(item.price || 0).toLocaleString()}₫</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.headerContainer}>
      {/* Backdrop overlay khi search được mở */}
      {isSearchExpanded && (
        <TouchableWithoutFeedback onPress={collapseSearch}>
          <View style={styles.backdropOverlay} />
        </TouchableWithoutFeedback>
      )}
      
      <View style={styles.header}>
        {/* Left side - Only search icon or back button */}
        <View style={styles.leftContainer}>
  {showBackButton ? (
    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButtonContainer}>
      <Text style={styles.backButton}>←</Text>
    </TouchableOpacity>
  ) : showSearchBar ? (
    !isSearchExpanded ? (
      <TouchableOpacity 
        style={[styles.searchCircleButton, styles.searchCircleButtonShifted]} 
        onPress={toggleSearch}
      >
        <Image 
          source={require('../../assets/images/location.png')} 
          style={styles.searchIcon} 
          resizeMode="contain"
        />
      </TouchableOpacity>
    ) : null
  ) : null}
</View>

        {/* Middle - Search bar when expanded or title */}
        <View style={[
          styles.middleContainer, 
          isSearchExpanded && styles.searchActive,
          isSearchExpanded && styles.expandedMiddleContainer
        ]}>
          {showSearchBar && isSearchExpanded ? (
            <TouchableWithoutFeedback onPress={handleSearchAreaPress}>
              <View style={styles.searchContainer}>
                <TextInput
                  ref={searchInputRef}
                  style={styles.searchInput}
                  placeholder="Search..."
                  value={searchQuery}
                  onChangeText={handleSearch}
                  returnKeyType="search"
                  onSubmitEditing={handlePressSearchButton}
                  autoFocus={true}
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity style={styles.searchButton} onPress={handlePressSearchButton}>
                    <Text style={styles.searchButtonText}>Tìm</Text>
                  </TouchableOpacity>
                )}
              </View>
            </TouchableWithoutFeedback>
          ) : !showSearchBar ? (
            <Text style={styles.title}>{title}</Text>
          ) : null}
        </View>

        {/* Right side - Only show when search is NOT expanded */}
        {!isSearchExpanded && (
          <View style={styles.rightContainer}>
            {rightComponent}

          <TouchableOpacity
            style={styles.orderHistoryButton}
            onPress={handleOrderHistoryPress}
          >
            <Text style={styles.orderHistoryText}>Lịch sử</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cartIconContainer}
            onPress={() => navigation.navigate('ProductCartScreen')}
          >
            <Image
              source={require('../../assets/images/cart.png')}
              style={styles.cartIcon}
            />
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
        )}
      </View>

      {/* Search suggestions */}
      {showSearchBar && showSuggestions && searchSuggestions.length > 0 && (
        <TouchableWithoutFeedback onPress={handleSearchAreaPress}>
          <View style={[styles.suggestionsContainer, isSearchExpanded && styles.searchActive]}>
            <FlatList
              data={searchSuggestions.slice(0, 5)}
              renderItem={renderSuggestion}
              keyExtractor={(item) => item.id.toString()}
              keyboardShouldPersistTaps="always"
            />
          </View>
        </TouchableWithoutFeedback>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    zIndex: 100,
    position: 'relative',
  },
  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    elevation: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    zIndex: 100,
  },
  leftContainer: {
    width: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  middleContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  // Khi search mở rộng, middle container sẽ lấp đầy toàn bộ phần còn lại
  expandedMiddleContainer: {
    flex: 0.9, // Thay đổi từ flex: 1 xuống còn 0.9 (giảm 10%)
    justifyContent: 'center',
    marginRight: 10, // Giữ nguyên margin để không chạm vào cạnh màn hình
    height: 40
  },
  
  searchActive: {
    zIndex: 1001, // Đảm bảo hiển thị trên backdrop
  },
  backButtonContainer: {
    padding: 5,
  },
  backButton: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8B4513',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
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

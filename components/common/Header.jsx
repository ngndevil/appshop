import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, TextInput, FlatList, Modal } from 'react-native';
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
  onFilterCategory, // Thêm prop để lọc theo danh mục
}) => {
  const navigation = useNavigation();
  const auth = getAuth();
  const { cartItems } = useCart();
  const [userPhotoURL, setUserPhotoURL] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showSortModal, setShowSortModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false); // Trạng thái cho modal lọc danh mục

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

  const handleSearch = (text) => {
    setSearchQuery(text);
    setShowSuggestions(text.trim().length > 0);
    if (onSearch) {
      onSearch(text);
    }
  };

  const handlePressSearchButton = () => {
    setShowSuggestions(false);
    if (onSubmitSearch) {
      onSubmitSearch(searchQuery);
    }
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

  const handleFilterCategory = (category) => {
    setShowFilterModal(false);
    if (onFilterCategory) {
      onFilterCategory(category);
    }
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

          {showSearchBar && (
            <>
              <TouchableOpacity onPress={() => setShowSortModal(true)} style={styles.filterButton}>
                <Text style={styles.filterButtonText}>Sắp xếp</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setShowFilterModal(true)} style={styles.filterButton}>
                <Text style={styles.filterButtonText}>Lọc</Text>
              </TouchableOpacity>
            </>
          )}

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

      <Modal
        visible={showSortModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowSortModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowSortModal(false)}
        >
          <View style={styles.modalContent}>
            <TouchableOpacity style={styles.modalOption} onPress={() => handleSort('asc')}>
              <Text style={styles.modalOptionText}>Giá: Tăng dần</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalOption} onPress={() => handleSort('desc')}>
              <Text style={styles.modalOptionText}>Giá: Giảm dần</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal
        visible={showFilterModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowFilterModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowFilterModal(false)}
        >
          <View style={styles.modalContent}>
            <TouchableOpacity style={styles.modalOption} onPress={() => handleFilterCategory('')}>
              <Text style={styles.modalOptionText}>Tất cả</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalOption} onPress={() => handleFilterCategory('Áo')}>
              <Text style={styles.modalOptionText}>Áo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalOption} onPress={() => handleFilterCategory('Quần')}>
              <Text style={styles.modalOptionText}>Quần</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalOption} onPress={() => handleFilterCategory('Giày')}>
              <Text style={styles.modalOptionText}>Giày</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
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
    paddingHorizontal: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
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
  filterButton: {
    marginLeft: 10,
    backgroundColor: '#ddd',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  searchContainer: {
    flex: 1,
    marginHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInput: {
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    fontSize: 16,
    flex: 1,
  },
  searchButton: {
    marginLeft: 8,
    backgroundColor: '#8B4513',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  searchButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  suggestionsContainer: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderRadius: 8,
    maxHeight: 300,
    marginHorizontal: 16,
    marginTop: 4,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    zIndex: 1000,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  suggestionImage: {
    width: 40,
    height: 40,
    borderRadius: 4,
  },
  suggestionContent: {
    marginLeft: 12,
    flex: 1,
  },
  suggestionTitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  suggestionPrice: {
    fontSize: 13,
    color: 'green',
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    width: 200,
  },
  modalOption: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalOptionText: {
    fontSize: 16,
    textAlign: 'center',
  },
});

export default Header;
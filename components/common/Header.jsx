import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  FlatList,
  TouchableWithoutFeedback,
  Keyboard,
  Dimensions,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { getAuth } from 'firebase/auth';
import { useCart } from '../../context/CartProvider';
import Icon from 'react-native-vector-icons/Feather';

const { width, height } = Dimensions.get('window');

const Header = (props) => {
  const {
    title = '',
    showBackButton = false,
    rightComponent = null,
    showSearchBar = false,
    onSearch = () => {},
    searchSuggestions = [],
    onSelectProduct = () => {},
    onSubmitSearch = () => {},
    onSort = () => {},
    onFilterCategory = () => {},
  } = props;

  const navigation = useNavigation();
  const auth = getAuth();
  const { cartItems } = useCart();

  const [searchState, setSearchState] = React.useState({
    query: '',
    showSuggestions: false,
    isExpanded: false,
  });

  const [userPhotoURL, setUserPhotoURL] = React.useState(null);
  const searchInputRef = React.useRef(null);
  const { query, showSuggestions, isExpanded } = searchState;

  const cartItemCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  useFocusEffect(
    React.useCallback(() => {
      const user = auth.currentUser;
      if (user) {
        setUserPhotoURL(user.photoURL);
      } else {
        setUserPhotoURL(null);
      }
    }, [])
  );

  const handleAvatarPress = () => {
    navigation.navigate('EditProfileScreen');
  };

  const handleOrderHistoryPress = () => {
    navigation.navigate('OrderHistoryScreen');
  };

  const handleSearch = (text) => {
    setSearchState((prev) => ({
      ...prev,
      query: text,
      showSuggestions: text.trim().length > 0,
    }));
    onSearch(text);
  };

  const handlePressSearchButton = () => {
    setSearchState((prev) => ({
      ...prev,
      showSuggestions: false,
    }));
    onSubmitSearch(query);
    Keyboard.dismiss();
  };

  const handleSelectSuggestion = (product) => {
    setSearchState((prev) => ({
      ...prev,
      query: product.product_name || '',
      showSuggestions: false,
    }));
    onSelectProduct(product);
  };

  const toggleSearch = () => {
    const newExpandedState = !isExpanded;
    setSearchState((prev) => ({
      ...prev,
      isExpanded: newExpandedState,
    }));

    if (newExpandedState) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  };

  const collapseSearch = () => {
    if (isExpanded) {
      setSearchState((prev) => ({
        ...prev,
        isExpanded: false,
        showSuggestions: false,
      }));
      Keyboard.dismiss();
    }
  };

  const handleSearchAreaPress = (e) => {
    e.stopPropagation();
  };

  const renderSuggestion = ({ item }) => (
    <TouchableOpacity style={styles.suggestionItem} onPress={() => handleSelectSuggestion(item)}>
      <Image
        source={{ uri: item.image_url || 'https://via.placeholder.com/50' }}
        style={styles.suggestionImage}
        defaultSource={require('../../assets/images/default-avatar.jpg')}
      />
      <View style={styles.suggestionContent}>
        <Text style={styles.suggestionTitle} numberOfLines={1}>
          {item.product_name}
        </Text>
        <Text style={styles.suggestionPrice}>{(item.price || 0).toLocaleString()}₫</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.headerContainer}>
      {Boolean(isExpanded) && (
        <TouchableWithoutFeedback onPress={collapseSearch}>
          <View style={styles.backdropOverlay} />
        </TouchableWithoutFeedback>
      )}

      <View style={styles.header}>
        <View style={styles.leftContainer}>
          {showBackButton ? (
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButtonContainer}>
              <Text style={styles.backButton}>←</Text>
            </TouchableOpacity>
          ) : showSearchBar && !isExpanded ? (
            <TouchableOpacity style={[styles.searchCircleButton, styles.searchCircleButtonShifted]} onPress={toggleSearch}>
              <Icon name="search" size={18} color="#8B4513" />
            </TouchableOpacity>
          ) : null}
        </View>

        <View
          style={[
            styles.middleContainer,
            isExpanded && styles.searchActive,
            isExpanded && styles.expandedMiddleContainer,
          ]}
        >
          {showSearchBar && isExpanded ? (
            <TouchableWithoutFeedback onPress={handleSearchAreaPress}>
              <View style={styles.searchContainer}>
                <TextInput
                  ref={searchInputRef}
                  style={styles.searchInput}
                  placeholder="Tìm kiếm..."
                  value={query}
                  onChangeText={handleSearch}
                  returnKeyType="search"
                  onSubmitEditing={handlePressSearchButton}
                  autoFocus={true}
                />
                {query.length > 0 && (
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

        {!isExpanded && (
          <View style={styles.rightContainer}>
            {rightComponent}

            <TouchableOpacity style={styles.orderHistoryButton} onPress={handleOrderHistoryPress}>
              <Text style={styles.orderHistoryText}>Lịch sử</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cartIconContainer} onPress={() => navigation.navigate('ProductCartScreen')}>
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
        )}
      </View>

      {Boolean(showSearchBar && showSuggestions && searchSuggestions.length > 0) && (
        <TouchableWithoutFeedback onPress={handleSearchAreaPress}>
          <View style={[styles.suggestionsContainer, isExpanded && styles.searchActive]}>
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
    backgroundColor: '#fff',
  },
  backdropOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    height,
    width,
    backgroundColor: 'transparent',
    zIndex: 90,
  },
  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
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
  expandedMiddleContainer: {
    flex: 0.9,
    justifyContent: 'center',
    marginRight: 10,
    height: 36,
  },
  searchActive: {
    zIndex: 1001,
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
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 36,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 18,
    backgroundColor: '#f5f5f5',
    paddingLeft: 15,
    paddingRight: 5,
    flex: 1,
  },
  searchInput: {
    flex: 1,
    height: 36,
    fontSize: 14,
    color: '#333',
    padding: 0,
  },
  searchButton: {
    backgroundColor: '#8B4513',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 15,
    marginLeft: 5,
  },
  searchButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  searchCircleButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  searchCircleButtonShifted: {
    marginLeft: 15,
  },
  suggestionsContainer: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    maxHeight: 300,
    zIndex: 1000,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#eee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  suggestionItem: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    alignItems: 'center',
  },
  suggestionImage: {
    width: 50,
    height: 50,
    borderRadius: 4,
    marginRight: 12,
    backgroundColor: '#f0f0f0',
    resizeMode: 'cover',
  },
  suggestionContent: {
    flex: 1,
    justifyContent: 'center',
  },
  suggestionTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
    color: '#333',
  },
  suggestionPrice: {
    fontSize: 14,
    color: '#8B4513',
    fontWeight: 'bold',
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
});

export default Header;

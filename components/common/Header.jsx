import React,{ useEffect, useState } from 'react';
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
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useCart } from '../../context/CartProvider';
import Icon from 'react-native-vector-icons/Feather';
import { db } from '../../constants/firebaseConfig'
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import OrderManagementScreen from '@/views/OrderManagementScreen';
import { useTheme } from '../../context/ThemeContext';

const { width, height } = Dimensions.get('window');

const Header = (props) => {
  const { colors } = useTheme();
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
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
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setIsAuthenticated(true);
        try {
          const adminDocRef = doc(db, 'admin', 'adminacc');
          const adminDoc = await getDoc(adminDocRef);
          const adminData = adminDoc.data();

          const emails = Object.values(adminData || {});
          const isAdminUser = emails.includes(user.email);
          setIsAdmin(isAdminUser);
        } catch (error) {
          console.error('Lỗi kiểm tra quyền admin:', error);
        }
      } else {
        setIsAuthenticated(false);
        setLoading(false);
        navigation.navigate('LoginScreen');
      }
    });

    return () => unsubscribe();
  }, [navigation]);
  
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
    <TouchableOpacity style={themedStyles.suggestionItem} onPress={() => handleSelectSuggestion(item)}>
      <Image
        source={{ uri: item.image_url || 'https://via.placeholder.com/50' }}
        style={themedStyles.suggestionImage}
        defaultSource={require('../../assets/images/default-avatar.jpg')}
      />
      <View style={themedStyles.suggestionContent}>
        <Text style={themedStyles.suggestionTitle} numberOfLines={1}>
          {item.product_name}
        </Text>
        <Text style={themedStyles.suggestionPrice}>{(item.price || 0).toLocaleString()}₫</Text>
      </View>
    </TouchableOpacity>
  );

  const themedStyles = StyleSheet.create({
    headerContainer: {
      zIndex: 100,
      position: 'relative',
      backgroundColor: colors.card,
    },
    backdropOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      height,
      width,
      backgroundColor: colors.transparent,
      zIndex: 90,
    },
    header: {
      height: 60,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      paddingHorizontal: 10,
      elevation: 4,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
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
      color: colors.primary,
    },
    title: {
      fontSize: 18,
      fontWeight: 'bold',
      textAlign: 'center',
      color: colors.text,
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
      borderColor: colors.border,
      borderRadius: 18,
      backgroundColor: colors.background,
      paddingLeft: 15,
      paddingRight: 5,
      flex: 1,
    },
    searchInput: {
      flex: 1,
      height: 36,
      fontSize: 14,
      color: colors.text,
      padding: 0,
    },
    searchButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: 12,
      paddingVertical: 5,
      borderRadius: 15,
      marginLeft: 5,
    },
    searchButtonText: {
      color: colors.card,
      fontWeight: 'bold',
      fontSize: 12,
    },
    searchCircleButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.background,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    searchCircleButtonShifted: {
      marginLeft: 15,
    },
    suggestionsContainer: {
      position: 'absolute',
      top: 60,
      left: 0,
      right: 0,
      backgroundColor: colors.card,
      borderBottomLeftRadius: 10,
      borderBottomRightRadius: 10,
      maxHeight: 300,
      zIndex: 1000,
      elevation: 5,
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 3,
    },
    suggestionItem: {
      flexDirection: 'row',
      padding: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      alignItems: 'center',
    },
    suggestionImage: {
      width: 50,
      height: 50,
      borderRadius: 4,
      marginRight: 12,
      backgroundColor: colors.background,
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
      color: colors.text,
    },
    suggestionPrice: {
      fontSize: 14,
      color: colors.primary,
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
      borderColor: colors.primary,
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
      backgroundColor: colors.primary,
      borderRadius: 10,
      minWidth: 20,
      height: 20,
      justifyContent: 'center',
      alignItems: 'center',
    },
    cartBadgeText: {
      color: colors.card,
      fontSize: 12,
      fontWeight: 'bold',
    },
    orderHistoryButton: {
      marginLeft: 10,
      backgroundColor: colors.primary,
      borderRadius: 16,
      paddingHorizontal: 12,
      paddingVertical: 6,
    },
    orderHistoryText: {
      color: colors.card,
      fontSize: 14,
      fontWeight: 'bold',
    },
  });

  return (
    <View style={themedStyles.headerContainer}>
      {Boolean(isExpanded) && (
        <TouchableWithoutFeedback onPress={collapseSearch}>
          <View style={themedStyles.backdropOverlay} />
        </TouchableWithoutFeedback>
      )}

      <View style={themedStyles.header}>
        <View style={themedStyles.leftContainer}>
          {showBackButton ? (
            <TouchableOpacity onPress={() => navigation.goBack()} style={themedStyles.backButtonContainer}>
              <Text style={themedStyles.backButton}>←</Text>
            </TouchableOpacity>
          ) : showSearchBar && !isExpanded ? (
            <TouchableOpacity style={[themedStyles.searchCircleButton, themedStyles.searchCircleButtonShifted]} onPress={toggleSearch}>
              <Icon name="search" size={18} color={colors.primary} />
            </TouchableOpacity>
          ) : null}
        </View>

        <View
          style={[
            themedStyles.middleContainer,
            isExpanded && themedStyles.searchActive,
            isExpanded && themedStyles.expandedMiddleContainer,
          ]}
        >
          {showSearchBar && isExpanded ? (
            <TouchableWithoutFeedback onPress={handleSearchAreaPress}>
              <View style={themedStyles.searchContainer}>
                <TextInput
                  ref={searchInputRef}
                  style={themedStyles.searchInput}
                  placeholder="Tìm kiếm..."
                  placeholderTextColor={colors.textLight} // Thêm màu cho placeholder theo theme
                  value={query}
                  onChangeText={handleSearch}
                  returnKeyType="search"
                  onSubmitEditing={handlePressSearchButton}
                  autoFocus={true}
                  />
                {query.length > 0 && (
                  <TouchableOpacity style={themedStyles.searchButton} onPress={handlePressSearchButton}>
                    <Text style={themedStyles.searchButtonText}>Tìm</Text>
                  </TouchableOpacity>
                )}
              </View>
            </TouchableWithoutFeedback>
          ) : !showSearchBar ? (
            <Text style={themedStyles.title}>{title}</Text>
          ) : null}
        </View>

        {!isExpanded && (
          <View style={themedStyles.rightContainer}>
            {rightComponent}
            {!isAdmin && 
              <TouchableOpacity style={themedStyles.orderHistoryButton} onPress={handleOrderHistoryPress}>
                <Text style={themedStyles.orderHistoryText}>Lịch sử</Text>
              </TouchableOpacity>
            }
            {isAdmin &&
              <TouchableOpacity style={themedStyles.orderHistoryButton} onPress={() => navigation.navigate('OrderManagementScreen')}>
              <Text style={themedStyles.orderHistoryText}>Đơn hàng</Text>
            </TouchableOpacity>
            }
            <TouchableOpacity style={themedStyles.cartIconContainer} onPress={() => navigation.navigate('ProductCartScreen')}>
              <Image source={require('../../assets/images/cart.png')} style={themedStyles.cartIcon} />
              {cartItemCount > 0 && (
                <View style={themedStyles.cartBadge}>
                  <Text style={themedStyles.cartBadgeText}>{cartItemCount}</Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={handleAvatarPress} style={themedStyles.avatarContainer}>
              <Image
                source={userPhotoURL ? { uri: userPhotoURL } : require('../../assets/images/default-avatar.jpg')}
                style={themedStyles.avatar}
              />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {Boolean(showSearchBar && showSuggestions && searchSuggestions.length > 0) && (
        <TouchableWithoutFeedback onPress={handleSearchAreaPress}>
          <View style={[themedStyles.suggestionsContainer, isExpanded && themedStyles.searchActive]}>
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

export default Header;

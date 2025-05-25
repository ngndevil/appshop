import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StatusBar,
  ScrollView
} from 'react-native';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../constants/firebaseConfig';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useNavigation, useFocusEffect, useRoute } from '@react-navigation/native';
import Header from '../components/common/Header';
import ProductCard from '../components/products/ProductCard';
import FloatingAdminMenu from '../components/admin/FloatingAdminMenu';
import BannerCarousel from '../components/Banner/BannerCarousel';
import CategoryBar from '../components/category/CategoryBar';
import { useTheme } from '../context/ThemeContext';

// Utility function to group products into rows of 2
const chunkArray = (array, chunkSize) => {
  const chunks = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
};

export default function ProductListScreen() {
  const { colors } = useTheme();
  
  // State management
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Hooks
  const navigation = useNavigation();
  const route = useRoute();
  const auth = getAuth();

  // Authentication & Admin check
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setIsAuthenticated(false);
        setLoading(false);
        navigation.navigate('LoginScreen');
        return;
      }
      
      setIsAuthenticated(true);
      
      try {
        // Check if user is admin
        const adminDocRef = doc(db, 'admin', 'adminacc');
        const adminDoc = await getDoc(adminDocRef);
        const adminData = adminDoc.data();
        const emails = Object.values(adminData || {});
        setIsAdmin(emails.includes(user.email));
        
        fetchData();
      } catch (error) {
        console.error('Lỗi kiểm tra quyền admin:', error);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [navigation]);

  // Refresh data when screen is focused
  useFocusEffect(
    useCallback(() => {
      if (isAuthenticated) {
        fetchData();
        if (route.params?.refresh) {
          navigation.setParams({ refresh: false });
        }
      }
    }, [isAuthenticated, route.params?.refresh])
  );

  // Fetch products data
  const fetchData = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'product'));
      const items = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setProducts(items);
      setFilteredProducts(items);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể tải sản phẩm.');
    } finally {
      setLoading(false);
    }
  };

  // Search functionality
  const handleSearch = (text) => {
    if (!text.trim()) {
      setSearchSuggestions([]);
      setFilteredProducts(products);
      return;
    }
    
    const suggestions = products.filter(
      (product) =>
        product.product_name?.toLowerCase().includes(text.toLowerCase()) ||
        product.description?.toLowerCase().includes(text.toLowerCase())
    );
    setSearchSuggestions(suggestions.slice(0, 5));
  };

  // Search submission handler
  const handleSubmitSearch = (searchText) => {
    if (!searchText.trim()) return;

    const results = products.filter(
      (product) =>
        product.product_name?.toLowerCase().includes(searchText.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchText.toLowerCase())
    );

    navigation.navigate('SearchResultsScreen', {
      searchQuery: searchText,
      products: results,
    });

    setSearchSuggestions([]);
  };

  // Sort products by price
  const handleSort = (order) => {
    const sortedProducts = [...filteredProducts].sort((a, b) =>
      order === 'asc' ? (a.price || 0) - (b.price || 0) : (b.price || 0) - (a.price || 0)
    );
    setFilteredProducts(sortedProducts);
  };

  // Filter products by category_id
  const handleFilterCategory = useCallback((category) => {
    if (!category) {
      setFilteredProducts(products);
      return;
    }
    const filtered = products.filter((product) => product.category_id === category);
    setFilteredProducts(filtered);
  }, [products]);

  // Category selection handler
  const handleCategorySelect = useCallback((categoryId) => {
    setSelectedCategory(categoryId);
    handleFilterCategory(categoryId === 'all' ? null : categoryId);
  }, [handleFilterCategory]);

  // Product selection handler
  const handleSelectProduct = (product) => {
    navigation.navigate('ProductDetailScreen', { product });
  };

  // Header layout measurement
  const onHeaderLayout = (event) => {
    const { height } = event.nativeEvent.layout;
    setHeaderHeight(height);
  };

  // Define themed styles inside component
  const themedStyles = StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.card,
    },
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    fixedHeaderSection: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      backgroundColor: colors.card,
      zIndex: 10,
      elevation: 3,
      shadowColor: colors.shadow,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 3,
    },
    scrollableContent: {
      flex: 1,
      backgroundColor: colors.background,
    },
    bannerContainer: {
      marginBottom: 8,
    },
    categoryContainer: {
      marginBottom: 8,
    },
    productsContainer: {
      padding: 8,
      paddingBottom: 100,
    },
    productRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 16,
    },
    productCardContainer: {
      width: '48%', // Just under 50% to leave room for margin/padding
    },
    emptyCardSpace: {
      width: '48%',
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.card,
    },
    loadingText: {
      marginTop: 10,
      fontSize: 16,
      color: colors.textSecondary,
    },
    emptyText: {
      textAlign: 'center',
      fontSize: 16,
      color: colors.textSecondary,
      marginTop: 20,
      padding: 20,
    },
  });

  // Loading screen
  if (loading) {
    return (
      <View style={themedStyles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={themedStyles.loadingText}>Đang tải sản phẩm...</Text>
      </View>
    );
  }

  // Not authenticated
  if (!isAuthenticated) return null;

  // Group products into rows of 2
  const productRows = chunkArray(filteredProducts, 2);

  // Main UI
  return (
    <SafeAreaView style={themedStyles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.card} />
      
      <View style={themedStyles.container}>
        {/* Fixed Header Section */}
        <View style={themedStyles.fixedHeaderSection} onLayout={onHeaderLayout}>
          <Header
            showSearchBar={true}
            onSearch={handleSearch}
            searchSuggestions={searchSuggestions}
            onSelectProduct={handleSelectProduct}
            onSubmitSearch={handleSubmitSearch}
            onSort={handleSort}
            onFilterCategory={handleFilterCategory}
          />
        </View>
        
        {/* Scrollable Content with Manual Layout */}
        <ScrollView 
          style={[themedStyles.scrollableContent, { paddingTop: headerHeight }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Banner */}
          <View style={themedStyles.bannerContainer}>
            <BannerCarousel />
          </View>
          
          {/* Category Bar */}
          <View style={themedStyles.categoryContainer}>
            <CategoryBar 
              onSelectCategory={handleCategorySelect} 
              selectedCategory={selectedCategory}
            />
          </View>
          
          {/* Product Grid */}
          <View style={themedStyles.productsContainer}>
            {filteredProducts.length === 0 ? (
              <Text style={themedStyles.emptyText}>Không tìm thấy sản phẩm</Text>
            ) : (
              <>
                {productRows.map((row, rowIndex) => (
                  <View key={`row-${rowIndex}`} style={themedStyles.productRow}>
                    {row.map((product) => (
                      <View key={product.id} style={themedStyles.productCardContainer}>
                        <ProductCard
                          product={product}
                          onViewDetail={() => handleSelectProduct(product)}
                          onEdit={() => {
                            const { created_at, ...cleanProduct } = product;
                            navigation.navigate('EditProductScreen', { product: cleanProduct });
                          }}
                          isAdmin={isAdmin}
                          showAddToCart={!isAdmin}
                        />
                      </View>
                    ))}
                    {row.length === 1 && <View style={themedStyles.emptyCardSpace} />}
                  </View>
                ))}
              </>
            )}
          </View>
        </ScrollView>
        
        {/* Admin Floating Menu */}
        {isAdmin && <FloatingAdminMenu />}
      </View>
    </SafeAreaView>
  );
}



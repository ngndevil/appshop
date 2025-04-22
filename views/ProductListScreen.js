import React, { useEffect, useState, useCallback } from 'react';
import {View,Text,FlatList,StyleSheet,ActivityIndicator,Alert,TouchableOpacity,} from 'react-native';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../constants/firebaseConfig';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useNavigation, useFocusEffect,useRoute  } from '@react-navigation/native';
import Header from '../components/common/Header';
import ProductCard from '../components/products/ProductCard';

export default function ProductListScreen() {
  const route = useRoute();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const navigation = useNavigation();
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAuthenticated(true);
        setIsAdmin(user.email === 'admin@gmail.com');
        fetchData();
      } else {
        setIsAuthenticated(false);
        setLoading(false);
        navigation.navigate('LoginScreen');
      }
    });
    return () => unsubscribe();
  }, [navigation]);

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

  const handleSort = (order) => {
    const sortedProducts = [...filteredProducts].sort((a, b) =>
      order === 'asc' ? (a.price || 0) - (b.price || 0) : (b.price || 0) - (a.price || 0)
    );
    setFilteredProducts(sortedProducts);
  };

  const handleFilterCategory = (category) => {
    if (!category) {
      setFilteredProducts(products);
      return;
    }
    const filtered = products.filter((product) => product.category === category);
    setFilteredProducts(filtered);
  };

  const handleSelectProduct = (product) => {
    navigation.navigate('ProductDetailScreen', { product });
  };

  const renderItem = ({ item }) => (
    <ProductCard
      product={item}
      onViewDetail={() => handleSelectProduct(item)}
      onEdit={() => {
        const { created_at, ...cleanProduct } = item;
        navigation.navigate('EditProductScreen', { product: cleanProduct });
      }}
      
      isAdmin={isAdmin}
    />
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Đang tải sản phẩm...</Text>
      </View>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <View style={styles.container}>
      <Header
        showSearchBar={true}
        onSearch={handleSearch}
        searchSuggestions={searchSuggestions}
        onSelectProduct={handleSelectProduct}
        onSubmitSearch={handleSubmitSearch}
        onSort={handleSort}
        onFilterCategory={handleFilterCategory}
      />

      <FlatList
        data={filteredProducts}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={<Text style={styles.emptyText}>Không tìm thấy sản phẩm</Text>}
      />

      {isAdmin && (
        <View style={styles.floatingButtonContainer}>
          <TouchableOpacity
            style={styles.floatingButton}
            onPress={() => navigation.navigate('AddProductScreen')}
          >
            <Text style={styles.floatingButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginTop: 20,
  },
  floatingButtonContainer: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    zIndex: 100,
    elevation: 100,
    pointerEvents: 'box-none',
  },
  floatingButton: {
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
  floatingButtonText: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
  },
});

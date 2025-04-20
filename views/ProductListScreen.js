import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../constants/firebaseConfig';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useNavigation } from '@react-navigation/native';
import Header from '../components/common/Header';
import ProductCard from '../components/products/ProductCard';

export default function ProductListScreen() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigation = useNavigation();
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAuthenticated(true);
        fetchData();
      } else {
        setIsAuthenticated(false);
        setLoading(false);
        navigation.replace('LoginScreen');
      }
    });

    return () => unsubscribe();
  }, [navigation]);

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
    if (!searchText.trim()) {
      setFilteredProducts(products);
      return;
    }
    const results = products.filter(
      (product) =>
        product.product_name?.toLowerCase().includes(searchText.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchText.toLowerCase())
    );
    setFilteredProducts(results);
    setSearchSuggestions([]);
  };

  const handleSort = (order) => {
    const sortedProducts = [...filteredProducts].sort((a, b) => {
      if (order === 'asc') {
        return (a.price || 0) - (b.price || 0);
      } else {
        return (b.price || 0) - (a.price || 0);
      }
    });
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

  const renderItem = ({ item }) => <ProductCard product={item} />;

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
        onFilterCategory={handleFilterCategory} // Truyền hàm lọc danh mục
      />
      <FlatList
        data={filteredProducts}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={<Text style={styles.emptyText}>Không tìm thấy sản phẩm</Text>}
      />
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
    paddingBottom: 20,
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
});
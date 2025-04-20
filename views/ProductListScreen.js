import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/constants/firebaseConfig';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useNavigation } from '@react-navigation/native';
import Header from '../components/common/Header';

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
        console.log('User authenticated:', user.email);
        setIsAuthenticated(true);
        fetchData();
      } else {
        console.log('User not authenticated, redirecting to LoginScreen');
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
      const items = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      console.log('Fetched products:', items);
      setProducts(items);
      setFilteredProducts(items); // Initialize filtered products
    } catch (error) {
      console.error('Error fetching products:', error);
      Alert.alert('Error', 'Failed to fetch products. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Search handler to show suggestions as you type
  const handleSearch = (text) => {
    if (!text.trim()) {
      setSearchSuggestions([]);
      return;
    }
    
    // Find products matching the search text
    const suggestions = products.filter(product => 
      (product.product_name && product.product_name.toLowerCase().includes(text.toLowerCase())) || 
      (product.description && product.description.toLowerCase().includes(text.toLowerCase()))
    );
    
    // Limit suggestions to top 5 matches
    setSearchSuggestions(suggestions.slice(0, 5));
  };

  // When user presses "Search" button or Enter key
  const handleSubmitSearch = (searchText) => {
    if (!searchText.trim()) {
      return;
    }
    
    // Navigate to search results screen with the search query
    navigation.navigate('SearchResultsScreen', { 
      searchQuery: searchText,
      products: products.filter(product => 
        (product.product_name && product.product_name.toLowerCase().includes(searchText.toLowerCase())) || 
        (product.description && product.description.toLowerCase().includes(searchText.toLowerCase()))
      )
    });
  };

  // When user selects a suggestion
  const handleSelectProduct = (product) => {
    // Navigate to product detail screen
    navigation.navigate('ProductDetailScreen', { product });
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Image
        source={{ uri: item.image_url || 'https://via.placeholder.com/150' }}
        style={styles.image}
      />
      <Text style={styles.name}>{item.product_name || 'Unnamed Product'}</Text>
      <Text style={styles.price}>{(item.price || 0).toLocaleString()}₫</Text>
      <Text style={styles.stock}>{'Số lượng: ' + item.stock || 'out stock'}</Text>
      <Text style={styles.description}>{item.description || 'No description'}</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Loading products...</Text>
      </View>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Header 
        showSearchBar={true} 
        onSearch={handleSearch}
        searchSuggestions={searchSuggestions}
        onSelectProduct={handleSelectProduct}
        onSubmitSearch={handleSubmitSearch}
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
  // ...existing styles remain the same
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  image: {
    width: '100%',
    height: 150,
    borderRadius: 8,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 8,
  },
  price: {
    color: 'green',
    marginTop: 4,
  },
  stock: {
    color: 'gray',
    marginTop: 4,
  },
  description: {
    marginTop: 4,
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
  }
});
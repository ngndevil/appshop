import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Animated,
} from 'react-native';
import MultiSlider from '@ptomasroos/react-native-multi-slider';
import Header from '../components/common/Header';
import ProductCard from '../components/products/ProductCard';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';

export default function SearchResultsScreen({ route }) {
  const { searchQuery, products = [] } = route.params || {};

  const [sortOrder, setSortOrder] = useState('asc');
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(5000000);
  const [filteredProducts, setFilteredProducts] = useState([]);

  const [isAdmin, setIsAdmin] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filterHeight] = useState(new Animated.Value(0));

  const navigation = useNavigation();

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user?.email === 'admin@gmail.com') {
        setIsAdmin(true);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    filterAndSortProducts();
  }, [sortOrder, minPrice, maxPrice, products]);

  const filterAndSortProducts = () => {
    const filtered = products
      .filter(product => product.price >= minPrice && product.price <= maxPrice)
      .sort((a, b) =>
        sortOrder === 'asc' ? a.price - b.price : b.price - a.price
      );
    setFilteredProducts(filtered);
  };

  const resetFilters = () => {
    setSortOrder('asc');
    setMinPrice(0);
    setMaxPrice(5000000);
  };

  const toggleFilters = () => {
    if (showFilters) {
      Animated.timing(filterHeight, {
        toValue: 0,
        duration: 250,
        useNativeDriver: false,
      }).start(() => setShowFilters(false));
    } else {
      setShowFilters(true);
      Animated.timing(filterHeight, {
        toValue: 240,
        duration: 250,
        useNativeDriver: false,
      }).start();
    }
  };

  const renderProduct = ({ item }) => (
    <ProductCard
      product={item}
      onEdit={() => {
        const { created_at, ...cleanProduct } = item;
        navigation.navigate('EditProductScreen', { product: cleanProduct });
      }}
      isAdmin={isAdmin}
    />
  );

  return (
    <View style={styles.container}>
      <Header title={`Kết quả tìm kiếm: "${searchQuery}"`} showBackButton={true} />

      {/* --- Nút bật tắt bộ lọc --- */}
      <TouchableOpacity style={styles.filterToggleButton} onPress={toggleFilters}>
        <Feather name="filter" size={18} color="#fff" style={{ marginRight: 6 }} />
        <Text style={styles.filterToggleButtonText}>
          {showFilters ? 'Ẩn bộ lọc' : 'Bộ lọc'}
        </Text>
      </TouchableOpacity>

      {/* --- Bộ lọc --- */}
      {showFilters && (
        <Animated.View style={[styles.filterContainer, { height: filterHeight }]}>
          <Text style={styles.filterTitle}>Sắp xếp theo giá:</Text>
          <View style={styles.sortButtons}>
            <TouchableOpacity
              style={[styles.sortButton, sortOrder === 'asc' && styles.activeButton]}
              onPress={() => setSortOrder('asc')}
            >
              <Text style={[
                styles.sortButtonText,
                sortOrder === 'asc' && styles.activeSortButtonText
              ]}>Tăng dần</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.sortButton, sortOrder === 'desc' && styles.activeButton]}
              onPress={() => setSortOrder('desc')}
            >
              <Text style={[
                styles.sortButtonText,
                sortOrder === 'desc' && styles.activeSortButtonText
              ]}>Giảm dần</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.sliderSection}>
            <Text style={styles.sliderLabel}>
              Giá từ: {minPrice.toLocaleString()}₫ - {maxPrice.toLocaleString()}₫
            </Text>
            <MultiSlider
              values={[minPrice, maxPrice]}
              min={0}
              max={5000000}
              step={10000}
              sliderLength={300}
              onValuesChange={values => {
                setMinPrice(values[0]);
                setMaxPrice(values[1]);
              }}
              selectedStyle={{ backgroundColor: '#2C3E50' }}
              unselectedStyle={{ backgroundColor: '#D5DBDB' }}
              markerStyle={{
                height: 24,
                width: 24,
                borderRadius: 12,
                backgroundColor: '#2C3E50',
                borderWidth: 2,
                borderColor: '#fff',
              }}
              containerStyle={{ marginTop: 12 }}
            />
          </View>

          <TouchableOpacity style={styles.resetButton} onPress={resetFilters}>
            <Text style={styles.resetButtonText}>Reset bộ lọc</Text>
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* --- Hiển thị số sản phẩm --- */}
      <Text style={{ marginLeft: 16, marginTop: 10, color: '#555', fontSize: 13 }}>
        Đang hiển thị: {filteredProducts.length} sản phẩm
      </Text>

      {/* --- Danh sách sản phẩm --- */}
      <FlatList
        data={filteredProducts}
        keyExtractor={item => item.id?.toString()}
        renderItem={renderProduct}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Không tìm thấy sản phẩm phù hợp</Text>
        }
      />

      {/* --- Nút thêm sản phẩm cho admin --- */}
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
  container: { flex: 1, backgroundColor: '#f8f8f8' },

  filterToggleButton: {
    flexDirection: 'row',
    backgroundColor: '#2C3E50',
    padding: 10,
    margin: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterToggleButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },

  filterContainer: {
    overflow: 'hidden',
    backgroundColor: '#fff',
    padding: 10,
  },
  filterTitle: { fontSize: 14, fontWeight: 'bold', marginBottom: 6 },

  sortButtons: { flexDirection: 'row', marginBottom: 10 },
  sortButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginRight: 8,
    backgroundColor: '#fff',
  },
  activeButton: {
    backgroundColor: '#2C3E50',
    borderColor: '#2C3E50',
  },
  sortButtonText: { color: '#333', fontWeight: '500', fontSize: 13 },
  activeSortButtonText: { color: '#fff' },

  sliderSection: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginTop: 4,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  sliderLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#2C3E50',
    marginBottom: 6,
  },

  resetButton: {
    marginTop: 6,
    backgroundColor: '#e74c3c',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  resetButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },

  listContainer: { padding: 16 },

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

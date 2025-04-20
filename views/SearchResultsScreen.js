import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import MultiSlider from '@ptomasroos/react-native-multi-slider';
import Header from '../components/common/Header';
import ProductCard from '../components/products/ProductCard'; // ✅ Thêm dòng này

export default function SearchResultsScreen({ route }) {
  const { searchQuery, products = [] } = route.params || {};

  const [sortOrder, setSortOrder] = useState('asc');
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(10000000);
  const [filteredProducts, setFilteredProducts] = useState([]);

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
    setMaxPrice(10000000);
  };

  const renderProduct = ({ item }) => (
    <ProductCard product={item} />
  );

  return (
    <View style={styles.container}>
      <Header title={`Kết quả tìm kiếm: "${searchQuery}"`} showBackButton={true} />

      {/* --- Bộ lọc và sắp xếp --- */}
      <View style={styles.filterContainer}>
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
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.3,
              shadowRadius: 3,
              elevation: 5,
            }}
            containerStyle={{ marginTop: 12 }}
          />
        </View>

        <TouchableOpacity style={styles.resetButton} onPress={resetFilters}>
          <Text style={styles.resetButtonText}>Reset bộ lọc</Text>
        </TouchableOpacity>
      </View>

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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f8f8' },
  filterContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    zIndex: 1,
  },
  filterTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 8 },
  sortButtons: { flexDirection: 'row', marginBottom: 16 },
  sortButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginRight: 10,
    backgroundColor: '#fff',
  },
  activeButton: {
    backgroundColor: '#2C3E50',
    borderColor: '#2C3E50',
  },
  sortButtonText: { color: '#333', fontWeight: '500' },
  activeSortButtonText: { color: '#fff' },
  sliderSection: {
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginTop: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  sliderLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#2C3E50',
    marginBottom: 8,
  },
  resetButton: {
    marginTop: 8,
    backgroundColor: '#e74c3c',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  resetButtonText: { color: '#fff', fontWeight: 'bold' },
  listContainer: { padding: 16 },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginTop: 20,
  },
});

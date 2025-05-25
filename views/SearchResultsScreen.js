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
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../constants/firebaseConfig';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import FloatingAdminMenu from '../components/admin/FloatingAdminMenu';
import { useTheme } from '../context/ThemeContext';

export default function SearchResultsScreen({ route }) {
  const { searchQuery, products = [] } = route.params || {};
  const [sortOrder, setSortOrder] = useState('asc');
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(5000000);
  const [sliderMinPrice, setSliderMinPrice] = useState(0);
  const [sliderMaxPrice, setSliderMaxPrice] = useState(5000000);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filterHeight] = useState(new Animated.Value(0));

  // Lấy colors từ theme
  const { colors } = useTheme();

  const auth = getAuth();
  const navigation = useNavigation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
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
        navigation.navigate('LoginScreen');
      }
    });

    return () => unsubscribe();
  }, [navigation]);

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
    setSliderMinPrice(0);
    setSliderMaxPrice(5000000);
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
        toValue: 260,
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

  // Tạo styles động dựa trên theme
  const dynamicStyles = getDynamicStyles(colors);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title={`Kết quả tìm kiếm: "${searchQuery}"`} showBackButton={true} />

      <TouchableOpacity 
        style={[dynamicStyles.filterToggleButton]} 
        onPress={toggleFilters}
      >
        <Feather name="filter" size={18} color={colors.card} style={{ marginRight: 6 }} />
        <Text style={dynamicStyles.filterToggleButtonText}>
          {showFilters ? 'Ẩn bộ lọc' : 'Bộ lọc'}
        </Text>
      </TouchableOpacity>

      {showFilters && (
        <Animated.View style={[dynamicStyles.filterContainer, { height: filterHeight }]}>
          <Text style={[styles.filterTitle, { color: colors.text }]}>Sắp xếp theo giá:</Text>
          <View style={styles.sortButtons}>
            <TouchableOpacity
              style={[dynamicStyles.sortButton, sortOrder === 'asc' && dynamicStyles.activeButton]}
              onPress={() => setSortOrder('asc')}
            >
              <Text style={[
                dynamicStyles.sortButtonText, 
                sortOrder === 'asc' && dynamicStyles.activeSortButtonText
              ]}>
                Tăng dần
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[dynamicStyles.sortButton, sortOrder === 'desc' && dynamicStyles.activeButton]}
              onPress={() => setSortOrder('desc')}
            >
              <Text style={[
                dynamicStyles.sortButtonText, 
                sortOrder === 'desc' && dynamicStyles.activeSortButtonText
              ]}>
                Giảm dần
              </Text>
            </TouchableOpacity>
          </View>

          <View style={dynamicStyles.sliderSection}>
            <Text style={dynamicStyles.sliderLabel}>
              Giá từ: {sliderMinPrice.toLocaleString()}₫ - {sliderMaxPrice.toLocaleString()}₫
            </Text>
            <MultiSlider
              values={[sliderMinPrice, sliderMaxPrice]}
              min={0}
              max={5000000}
              step={10000}
              sliderLength={300}
              onValuesChange={values => {
                setSliderMinPrice(values[0]);
                setSliderMaxPrice(values[1]);
              }}
              selectedStyle={{ backgroundColor: colors.primary }}
              unselectedStyle={{ backgroundColor: colors.border }}
              markerStyle={{
                height: 24,
                width: 24,
                borderRadius: 12,
                backgroundColor: colors.primary,
                borderWidth: 2,
                borderColor: colors.card,
              }}
              containerStyle={{ marginTop: 12 }}
            />
          </View>

          <View style={styles.filterActions}>
            <TouchableOpacity
              style={[styles.button, dynamicStyles.applyButton]}
              onPress={() => {
                setMinPrice(sliderMinPrice);
                setMaxPrice(sliderMaxPrice);
              }}
            >
              <Text style={dynamicStyles.buttonText}>Áp dụng</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, dynamicStyles.resetButton]}
              onPress={resetFilters}
            >
              <Text style={dynamicStyles.buttonText}>Reset bộ lọc</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}

      <Text style={{ marginLeft: 16, marginTop: 10, color: colors.textSecondary, fontSize: 13 }}>
        Đang hiển thị: {filteredProducts.length} sản phẩm
      </Text>

      <FlatList
        data={filteredProducts}
        keyExtractor={item => item.id?.toString()}
        renderItem={renderProduct}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            Không tìm thấy sản phẩm phù hợp
          </Text>
        }
      />

      {isAdmin && <FloatingAdminMenu />}
    </View>
  );
}

// Style tĩnh - các thuộc tính không phụ thuộc vào theme
const styles = StyleSheet.create({
  container: { flex: 1 },
  sortButtons: { flexDirection: 'row', marginBottom: 10 },
  filterTitle: { fontSize: 14, fontWeight: 'bold', marginBottom: 6 },
  filterActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  listContainer: { padding: 16 },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    marginTop: 20,
  }
});

// Style động - các thuộc tính phụ thuộc vào theme
const getDynamicStyles = (colors) => ({
  filterToggleButton: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    padding: 10,
    margin: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterToggleButtonText: {
    color: colors.card,
    fontSize: 14,
    fontWeight: 'bold',
  },
  filterContainer: {
    overflow: 'hidden',
    backgroundColor: colors.card,
    padding: 10,
  },
  sortButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    marginRight: 8,
    backgroundColor: colors.card,
  },
  activeButton: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  sortButtonText: { color: colors.text, fontWeight: '500', fontSize: 13 },
  activeSortButtonText: { color: colors.card },
  sliderSection: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
    backgroundColor: colors.card,
    borderRadius: 10,
    marginTop: 4,
    marginBottom: 8,
    shadowColor: colors.shadow,
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  sliderLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.primary,
    marginBottom: 6,
  },
  applyButton: {
    backgroundColor: colors.success,
  },
  resetButton: {
    backgroundColor: colors.error,
  },
  buttonText: {
    color: colors.card,
    fontWeight: 'bold',
    fontSize: 13,
  },
});
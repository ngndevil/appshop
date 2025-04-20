import React from 'react';
import { View, Text, FlatList, StyleSheet, Image } from 'react-native';
import Header from '../components/common/Header';

export default function SearchResultsScreen({ route, navigation }) {
  const { searchQuery, products = [] } = route.params || {};
  
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

  return (
    <View style={styles.container}>
      <Header 
        title={`Kết quả tìm kiếm: "${searchQuery}"`}
        showBackButton={true}
      />
      
      <FlatList
        data={products}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Không tìm thấy sản phẩm phù hợp</Text>
        }
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
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginTop: 20,
  }
});
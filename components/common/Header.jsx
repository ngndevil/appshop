import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, TextInput, FlatList, Modal } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getAuth } from 'firebase/auth';

const Header = ({ title, showBackButton = false, rightComponent, showSearchBar = false, onSearch, searchSuggestions = [], onSelectProduct, onSubmitSearch }) => {
  const navigation = useNavigation();
  const auth = getAuth();
  const [userPhotoURL, setUserPhotoURL] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  useEffect(() => {
    // Get current user's photo URL
    const user = auth.currentUser;
    if (user) {
      setUserPhotoURL(user.photoURL);
    }
  }, []);
  
  const handleAvatarPress = () => {
    navigation.navigate('EditProfileScreen');
  };
  
  const handleSearch = (text) => {
    setSearchQuery(text);
    
    // Show suggestions only if there's text
    setShowSuggestions(text.trim().length > 0);
    
    if (onSearch) {
      onSearch(text);
    }
  };
  
  const handlePressSearchButton = () => {
    setShowSuggestions(false);
    if (onSubmitSearch) {
      onSubmitSearch(searchQuery);
    }
  };
  
  const handleSelectSuggestion = (product) => {
    setShowSuggestions(false);
    setSearchQuery(product.product_name || '');
    if (onSelectProduct) {
      onSelectProduct(product);
    }
  };
  
  const renderSuggestion = ({ item }) => (
    <TouchableOpacity 
      style={styles.suggestionItem} 
      onPress={() => handleSelectSuggestion(item)}
    >
      <Image 
        source={{ uri: item.image_url || 'https://via.placeholder.com/50' }} 
        style={styles.suggestionImage} 
      />
      <View style={styles.suggestionContent}>
        <Text style={styles.suggestionTitle} numberOfLines={1}>{item.product_name}</Text>
        <Text style={styles.suggestionPrice}>{(item.price || 0).toLocaleString()}₫</Text>
      </View>
    </TouchableOpacity>
  );
  
  return (
    <View style={styles.headerContainer}>
      <View style={styles.header}>
        <View style={styles.leftContainer}>
          {showBackButton && (
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={styles.backButton}>←</Text>
            </TouchableOpacity>
          )}
        </View>
        
        {showSearchBar ? (
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Tìm kiếm sản phẩm..."
              value={searchQuery}
              onChangeText={handleSearch}
              returnKeyType="search"
              onSubmitEditing={handlePressSearchButton}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity style={styles.searchButton} onPress={handlePressSearchButton}>
                <Text style={styles.searchButtonText}>Tìm</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <Text style={styles.title}>{title}</Text>
        )}
        
        <View style={styles.rightContainer}>
          {rightComponent}
          
          <TouchableOpacity onPress={handleAvatarPress} style={styles.avatarContainer}>
            <Image 
              source={userPhotoURL ? { uri: userPhotoURL } : require('../../assets/images/default-avatar.jpg')}
              style={styles.avatar} 
            />
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Suggestions Popup */}
      {showSearchBar && showSuggestions && searchSuggestions.length > 0 && (
        <View style={styles.suggestionsContainer}>
          <FlatList
            data={searchSuggestions.slice(0, 5)} // Limit to 5 suggestions
            renderItem={renderSuggestion}
            keyExtractor={(item) => item.id}
            keyboardShouldPersistTaps="always"
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    zIndex: 100, // Ensure suggestions appear on top
    position: 'relative',
  },
  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  leftContainer: {
    width: 40,
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  backButton: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    minWidth: 40,
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
  searchContainer: {
    flex: 1,
    marginHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInput: {
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    fontSize: 16,
    flex: 1,
  },
  searchButton: {
    marginLeft: 8,
    backgroundColor: '#8B4513',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  searchButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  suggestionsContainer: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderRadius: 8,
    maxHeight: 300,
    marginHorizontal: 16,
    marginTop: 4,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    zIndex: 1000,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  suggestionImage: {
    width: 40,
    height: 40,
    borderRadius: 4,
  },
  suggestionContent: {
    marginLeft: 12,
    flex: 1,
  },
  suggestionTitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  suggestionPrice: {
    fontSize: 13,
    color: 'green',
    marginTop: 2,
  }
});

export default Header;
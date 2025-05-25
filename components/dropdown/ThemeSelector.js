import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Modal,
  Pressable,
  FlatList,
  Dimensions,
  Platform,
} from 'react-native';
import { MaterialIcons, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme, themes } from '../../context/ThemeContext';

const { width, height } = Dimensions.get('window');

const ThemeSelector = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const { colors, changeTheme, currentTheme } = useTheme();
  
  // Animation values
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  
  // Theme options
  const themeOptions = [
    { id: 'default', name: 'Coffee', color: themes.default.primary, icon: 'coffee' },
    { id: 'dark', name: 'Purple Moon', color: themes.dark.primary, icon: 'set-center-right' },
    { id: 'pink', name: 'Sweet Candy', color: themes.pink.primary, icon: 'candy' },
    { id: 'red', name: 'Fire', color: themes.red.primary, icon: 'fire' },
    { id: 'blue', name: 'Blue Lemon', color: themes.blue.primary, icon: 'fruit-citrus' },
  ];
  
  // Find current theme info
  const currentThemeInfo = themeOptions.find(t => t.id === currentTheme) || themeOptions[0];

  // Modal animation
  const showModal = () => {
    setModalVisible(true);
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const hideModal = () => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setModalVisible(false);
    });
  };

  // Handle theme selection
  const handleSelectTheme = (themeId) => {
    changeTheme(themeId);
    hideModal();
  };

  // Render item for theme list
  const renderThemeItem = ({ item }) => {
    const isSelected = currentTheme === item.id;
    
    return (
      <TouchableOpacity
        activeOpacity={0.7}
        style={[
          styles.themeOption,
          isSelected && {
            backgroundColor: colors.primaryLightest,
            borderColor: colors.primary,
          }
        ]}
        onPress={() => handleSelectTheme(item.id)}
      >
        <View style={styles.optionLeft}>
          <View 
            style={[
              styles.colorBadge, 
              { backgroundColor: item.color }
            ]}
          >
            {isSelected && (
              <Ionicons name="checkmark" size={16} color="#FFFFFF" />
            )}
          </View>
          <Text 
            style={[
              styles.optionText, 
              { color: colors.text },
              isSelected && { fontWeight: '600' }
            ]}
          >
            {item.name}
          </Text>
        </View>
        
        <View style={styles.optionRight}>
          <MaterialCommunityIcons name={item.icon} size={22} color={item.color} />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Theme button */}
      <TouchableOpacity
        activeOpacity={0.7}
        style={[
          styles.themeButton,
          { 
            backgroundColor: colors.card,
            borderColor: colors.border,
          }
        ]}
        onPress={showModal}
      >
        <View style={styles.buttonContent}>
          <View 
            style={[
              styles.colorIndicator, 
              { backgroundColor: currentThemeInfo.color }
            ]} 
          />
          <Text style={[styles.themeButtonText, { color: colors.text }]}>
            {currentThemeInfo.name}
          </Text>
        </View>
        <MaterialIcons 
          name="keyboard-arrow-down" 
          size={24} 
          color={colors.textSecondary} 
        />
      </TouchableOpacity>

      {/* Theme selector modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="none"
        onRequestClose={hideModal}
      >
        <View style={styles.modalContainer}>
          <Pressable 
            style={styles.backdrop}
            onPress={hideModal}
          />
          
          <Animated.View
            style={[
              styles.modalContent,
              { 
                backgroundColor: colors.card,
                borderColor: colors.border,
                opacity: opacityAnim,
                transform: [{ scale: scaleAnim }]
              }
            ]}
          >
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Chọn giao diện
              </Text>
            </View>
            
            <FlatList
              data={themeOptions}
              renderItem={renderThemeItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.themeListContent}
              showsVerticalScrollIndicator={true}
              style={styles.themeList}
              scrollEnabled={true}
              initialNumToRender={5}
            />
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 1,
    width: '100%',
    marginBottom: 16,
  },
  themeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  colorIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 1,
    elevation: 1,
  },
  themeButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: width * 0.85,
    maxHeight: height * 0.7,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 10,
  },
  modalHeader: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  themeList: {
    flexGrow: 0,
    maxHeight: height * 0.45,
  },
  themeListContent: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  themeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginVertical: 4,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  colorBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  optionText: {
    fontSize: 16,
    flex: 1,
  },
  optionRight: {
    paddingLeft: 8,
  }
});

export default ThemeSelector;

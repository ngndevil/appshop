import React, { useState, useEffect } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from '../views/LoginScreen';
import RegisterScreen from '../views/ResigterScreen';
import ProductListScreen from '../views/ProductListScreen';
import LandingScreen from '../views/LandingScreen';
import EditProfileScreen from '../views/EditProfileScreen';
import SearchResultsScreen from '../views/SearchResultsScreen';
import ProductDetailScreen from '../views/ProductDetailScreen';
import {CartProvider} from '../context/CartProvider';
import ProductCartScreen from '../views/ProductCartScreen';
import OrderHistoryScreen from '../views/OrderHistoryScreen';
import AddProductScreen from '../views/AddProductScreen';
import EditProductScreen from '../views/EditProductScreen';
import RevenueScreen from '../views/RevenueScreen';
const Stack = createStackNavigator();

export default function App() {
  return (
    <CartProvider>
    <Stack.Navigator initialRouteName="LandingScreen" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="LandingScreen" component={LandingScreen} />
      <Stack.Screen name="LoginScreen" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="OrderHistoryScreen" component={OrderHistoryScreen} />
      <Stack.Screen name="ProductListScreen" component={ProductListScreen} />
      <Stack.Screen name="EditProfileScreen" component={EditProfileScreen} />
      <Stack.Screen name="SearchResultsScreen" component={SearchResultsScreen} />
      <Stack.Screen name="ProductDetailScreen" component={ProductDetailScreen} />
      <Stack.Screen name="ProductCartScreen" component={ProductCartScreen} />
      <Stack.Screen name="AddProductScreen" component={AddProductScreen} />
      <Stack.Screen name="EditProductScreen" component={EditProductScreen} />
      <Stack.Screen name="RevenueScreen" component={RevenueScreen} />
    </Stack.Navigator>
  </CartProvider>
  );
}
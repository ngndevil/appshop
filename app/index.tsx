import { registerRootComponent } from 'expo';
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from '../views/LoginScreen';
import RegisterScreen from '../views/ResigterScreen';
import ProductListScreen from '../views/ProductListScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
      <Stack.Navigator initialRouteName="LoginScreen" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="LoginScreen" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="ProductListScreen" component={ProductListScreen} />
      </Stack.Navigator>
  );
}



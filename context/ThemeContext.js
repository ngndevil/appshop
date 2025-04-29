import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { defaultTheme, darkTheme, pinkTheme, redTheme, blueTheme } from '../styles/themes';

export const ThemeContext = createContext();

export const themes = {
  default: defaultTheme,
  dark: darkTheme,
  pink: pinkTheme,
  red: redTheme,
  blue: blueTheme
};

export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState('default');
  const [colors, setColors] = useState(themes.default);

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('userTheme');
      if (savedTheme) {
        setCurrentTheme(savedTheme);
        setColors(themes[savedTheme]);
      }
    } catch (error) {
      console.log('Error loading theme:', error);
    }
  };

  const changeTheme = async (themeName) => {
    try {
      await AsyncStorage.setItem('userTheme', themeName);
      setCurrentTheme(themeName);
      setColors(themes[themeName]);
    } catch (error) {
      console.log('Error saving theme:', error);
    }
  };

  return (
    <ThemeContext.Provider value={{ colors, currentTheme, changeTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
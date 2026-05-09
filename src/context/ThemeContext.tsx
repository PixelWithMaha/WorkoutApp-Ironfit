import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ThemeContextType {
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
  toggleDarkMode: () => void;
  theme: {
    background: string;
    card: string;
    text: string;
    subtext: string;
    border: string;
    iconBg: string;
    primary: string;
  };
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [darkMode, setDarkModeState] = useState(false);

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('darkMode');
      if (savedTheme !== null) {
        setDarkModeState(JSON.parse(savedTheme));
      }
    } catch (error) {
      console.error('Error loading theme:', error);
    }
  };

  const setDarkMode = async (value: boolean) => {
    setDarkModeState(value);
    try {
      await AsyncStorage.setItem('darkMode', JSON.stringify(value));
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  const toggleDarkMode = () => setDarkMode(!darkMode);

  const theme = {
    background: darkMode ? '#0B0B0D' : '#F8FAFC',
    card: darkMode ? '#1C1C1E' : '#FFFFFF',
    text: darkMode ? '#FFFFFF' : '#0B0B0D',
    subtext: darkMode ? '#8E8E93' : '#64748B',
    border: darkMode ? '#2C2C2E' : '#E2E8F0',
    iconBg: darkMode ? '#2C2C2E' : '#F8FAFC',
    primary: darkMode ? '#2F69FF' : '#12015C',
  };

  return (
    <ThemeContext.Provider value={{ darkMode, setDarkMode, toggleDarkMode, theme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

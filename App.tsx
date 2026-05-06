import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { StepProvider } from './src/context/StepContext';

export default function App() {
  return (
    <SafeAreaProvider>
      <StepProvider>
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      </StepProvider>
    </SafeAreaProvider>
  );
}

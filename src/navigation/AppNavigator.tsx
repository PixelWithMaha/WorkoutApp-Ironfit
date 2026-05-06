import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import OnboardingScreen from '../screens/OnboardingScreen';
import LoginScreen from '../screens/LoginScreen';
import TabNavigator from './TabNavigator';
import AllWorkoutsScreen from '../screens/AllWorkoutsScreen';
import WorkoutDetailScreen from '../screens/WorkoutDetailScreen';

import ProgressScreen from '../screens/ProgressScreen';
import SettingsScreen from '../screens/SettingsScreen';

export type RootStackParamList = {
  Onboarding: undefined;
  Login: undefined;
  MainTabs: undefined;
  AllWorkouts: undefined;
  Progress: undefined;
  Settings: undefined;
  WorkoutDetail: { workout: any };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerShown: false,
        animation: 'slide_from_right' 
      }}
    >
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="MainTabs" component={TabNavigator} />
      <Stack.Screen name="AllWorkouts" component={AllWorkoutsScreen} />
      <Stack.Screen name="Progress" component={ProgressScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="WorkoutDetail" component={WorkoutDetailScreen} />
    </Stack.Navigator>
  );
}

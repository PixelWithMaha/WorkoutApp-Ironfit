import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import OnboardingScreen from '../screens/OnboardingScreen';
import LoginScreen from '../screens/LoginScreen';
import TabNavigator from './TabNavigator';
import AllWorkoutsScreen from '../screens/AllWorkoutsScreen';
import WorkoutDetailScreen from '../screens/WorkoutDetailScreen';

export type RootStackParamList = {
  Onboarding: undefined;
  Login: undefined;
  MainTabs: undefined;
  AllWorkouts: undefined;
  WorkoutDetail: { workout: any };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="MainTabs" component={TabNavigator} />
      <Stack.Screen name="AllWorkouts" component={AllWorkoutsScreen} />
      <Stack.Screen name="WorkoutDetail" component={WorkoutDetailScreen} />
    </Stack.Navigator>
  );
}

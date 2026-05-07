import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Check, ChevronsRight } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors } from '../theme/colors';
import { useTheme } from '../context/ThemeContext';
import { StatusBar } from 'react-native';

const { width } = Dimensions.get('window');

type RootStackParamList = {
  Onboarding: undefined;
  Login: undefined;
  MainTabs: undefined;
};

type OnboardingNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Onboarding'>;

export default function OnboardingScreen() {
  const navigation = useNavigation<OnboardingNavigationProp>();
  const { theme, darkMode } = useTheme();
  const [isPressed, setIsPressed] = useState(false);

  const brandPrimary = theme.primary;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={darkMode ? 'light-content' : 'dark-content'} />
      <View style={styles.graphicContainer}>
        <Svg width={width} height={width} viewBox="0 0 400 400">
          <Path
            d="M -50 220 Q 200 -50 450 220"
            fill="none"
            stroke={brandPrimary}
            strokeWidth="50"
          />
          <Path
            d="M -50 350 Q 200 80 450 350"
            fill="none"
            stroke={brandPrimary}
            strokeWidth="50"
          />
        </Svg>
      </View>

      <View style={styles.contentContainer}>
        <Text style={[styles.title, { color: brandPrimary }]}>Stay on Top of{'\n'}Your Health</Text>

        <TouchableOpacity
          activeOpacity={0.9}
          onPressIn={() => setIsPressed(true)}
          onPressOut={() => setIsPressed(false)}
          onPress={() => navigation.navigate('Login')}
          style={[
            styles.button,
            { backgroundColor: brandPrimary, transform: [{ scale: isPressed ? 0.98 : 1 }] }
          ]}
        >
          <View style={[styles.iconCircle, { backgroundColor: theme.card }]}>
            <Check size={24} color={brandPrimary} strokeWidth={3} />
          </View>

          <Text style={styles.buttonText}>Get Started</Text>

          <View style={styles.chevronContainer}>
            <ChevronsRight size={24} color="white" strokeWidth={2.5} />
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  graphicContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginTop: 40,
  },
  contentContainer: {
    paddingHorizontal: 30,
    paddingBottom: 60,
    alignItems: 'center',
  },
  title: {
    fontSize: 40,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 48,
    lineHeight: 44,
  },
  button: {
    width: '100%',
    height: 70,
    borderRadius: 35,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  chevronContainer: {
    paddingRight: 10,
  },
});
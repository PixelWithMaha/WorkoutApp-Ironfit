import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors } from '../theme/colors';

const { width } = Dimensions.get('window');

type RootStackParamList = {
  Onboarding: undefined;
  Login: undefined;
  MainTabs: undefined;
};

type OnboardingNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Onboarding'>;

export default function OnboardingScreen() {
  const navigation = useNavigation<OnboardingNavigationProp>();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.graphicContainer}>
        <Svg width={width} height={width * 1.2} viewBox={`0 0 ${width} ${width * 1.2}`}>
          {/* Abstract arcs representation */}
          <Path d={`M -50 ${width * 0.8} Q ${width / 2} -100 ${width + 50} ${width * 0.8}`} fill="none" stroke={colors.primary} strokeWidth={80} />
          <Path d={`M -50 ${width * 1.1} Q ${width / 2} 50 ${width + 50} ${width * 1.1}`} fill="none" stroke={colors.primary} strokeWidth={80} />
          <Path d={`M -50 ${width * 1.4} Q ${width / 2} 200 ${width + 50} ${width * 1.4}`} fill="none" stroke={colors.primary} strokeWidth={80} />
        </Svg>
      </View>

      <View style={styles.contentContainer}>
        <Text style={styles.title}>Stay on Top of{'\n'}Your Health</Text>
        
        <TouchableOpacity 
          style={styles.button}
          onPress={() => navigation.navigate('Login')}
        >
          <View style={styles.iconCircle}>
            <Feather name="check" size={20} color={colors.primary} />
          </View>
          <Text style={styles.buttonText}>Get Started</Text>
          <Feather name="chevrons-right" size={24} color={colors.white} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  graphicContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginTop: 40,
  },
  contentContainer: {
    paddingHorizontal: 30,
    paddingBottom: 50,
  },
  title: {
    fontSize: 40,
    fontWeight: '800',
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 48,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    paddingRight: 20,
    height: 70,
  },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '600',
  },
});

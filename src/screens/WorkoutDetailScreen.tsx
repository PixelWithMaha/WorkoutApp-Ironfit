import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Animated } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { colors } from '../theme/colors';
import { useStepContext } from '../context/StepContext';

export default function WorkoutDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { workout } = route.params;
  const { currentSteps, currentCalories } = useStepContext();

  const [isActive, setIsActive] = useState(true);
  const [seconds, setSeconds] = useState(0);
  const [initialSteps] = useState(currentSteps);
  const [initialCalories] = useState(currentCalories);
  const [heartRate, setHeartRate] = useState(72);

  const workoutSteps = Math.max(0, currentSteps - initialSteps);
  const workoutCalories = Math.max(0, currentCalories - initialCalories);
  const distance = (workoutSteps * 0.75).toFixed(1); // meters

  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    let interval: any;
    if (isActive) {
      interval = setInterval(() => {
        setSeconds(s => s + 1);
        // Simulate heart rate variation
        setHeartRate(prev => {
          const change = Math.floor(Math.random() * 5) - 2;
          const newVal = prev + change;
          return Math.min(Math.max(newVal, 110), 160);
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive]);

  useEffect(() => {
    if (isActive) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.1, duration: 500, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isActive]);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleStop = () => {
    setIsActive(false);
    // In a real app, we'd save the workout summary to Firebase here
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="x" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{workout.title} Mode</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.mainDisplay}>
        <Text style={styles.timeLabel}>Workout Duration</Text>
        <Text style={styles.timeValue}>{formatTime(seconds)}</Text>
        
        <View style={styles.heartRateContainer}>
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <MaterialCommunityIcons name="heart" size={40} color="#FF5252" />
          </Animated.View>
          <Text style={styles.heartRateValue}>{heartRate}</Text>
          <Text style={styles.heartRateUnit}>BPM</Text>
        </View>
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Steps</Text>
          <Text style={styles.statValue}>{workoutSteps}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Calories</Text>
          <Text style={styles.statValue}>{workoutCalories.toFixed(1)}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Distance</Text>
          <Text style={styles.statValue}>{distance}</Text>
          <Text style={styles.statUnit}>m</Text>
        </View>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity 
          style={[styles.controlButton, styles.stopButton]} 
          onPress={handleStop}
        >
          <Text style={styles.stopButtonText}>End Workout</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A', // Premium Dark Blue
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F8FAFC',
  },
  mainDisplay: {
    alignItems: 'center',
    marginTop: 40,
  },
  timeLabel: {
    fontSize: 16,
    color: '#94A3B8',
    marginBottom: 10,
  },
  timeValue: {
    fontSize: 72,
    fontWeight: 'bold',
    color: '#F8FAFC',
    fontVariant: ['tabular-nums'],
  },
  heartRateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    backgroundColor: 'rgba(255, 82, 82, 0.1)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 30,
  },
  heartRateValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FF5252',
    marginLeft: 10,
  },
  heartRateUnit: {
    fontSize: 14,
    color: '#FF5252',
    marginLeft: 4,
    marginTop: 10,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 60,
    paddingHorizontal: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 5,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F8FAFC',
  },
  statUnit: {
    fontSize: 12,
    color: '#94A3B8',
  },
  controls: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  controlButton: {
    paddingVertical: 18,
    paddingHorizontal: 60,
    borderRadius: 30,
    width: '80%',
    alignItems: 'center',
  },
  stopButton: {
    backgroundColor: '#FF5252',
  },
  stopButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

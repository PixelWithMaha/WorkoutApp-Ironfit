import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { styles } from '../styles/homeStyles';

import { useTheme } from '../context/ThemeContext';

interface WorkoutCardProps {
  title: string;
  desc: string;
  isLight?: boolean;
  onPress?: () => void;
}

const WorkoutCard = ({ title, desc, isLight = false, onPress }: WorkoutCardProps) => {
  const { theme, darkMode } = useTheme();
  
  return (
    <View style={[
      styles.workoutCard, 
      { backgroundColor: darkMode ? theme.card : (isLight ? '#F2F2F7' : styles.workoutCard.backgroundColor) }
    ]}>
      <Text style={[styles.workoutTitle, { color: theme.text }]}>{title}</Text>
      <Text style={[styles.workoutDesc, { color: theme.subtext }]}>{desc}</Text>
      <TouchableOpacity style={[styles.startButton, { backgroundColor: theme.primary }]} onPress={onPress}>
        <Text style={styles.startButtonText}>Start Workout</Text>
      </TouchableOpacity>
    </View>
  );
};

export default WorkoutCard;

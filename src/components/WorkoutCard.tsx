import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { styles } from '../styles/homeStyles';

interface WorkoutCardProps {
  title: string;
  desc: string;
  isLight?: boolean;
}

const WorkoutCard = ({ title, desc, isLight = false }: WorkoutCardProps) => (
  <View style={[styles.workoutCard, isLight && { backgroundColor: '#F2F2F7' }]}>
    <Text style={styles.workoutTitle}>{title}</Text>
    <Text style={styles.workoutDesc}>{desc}</Text>
    <TouchableOpacity style={styles.startButton}>
      <Text style={styles.startButtonText}>Start Workout</Text>
    </TouchableOpacity>
  </View>
);

export default WorkoutCard;

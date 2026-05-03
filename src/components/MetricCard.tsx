import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../styles/homeStyles';

interface MetricCardProps {
  label: string;
  value: string | number;
  unit: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

const MetricCard = ({ label, value, unit, icon, color }: MetricCardProps) => (
  <View style={styles.metricCard}>
    <View style={styles.metricCardTop}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Ionicons name={icon} size={16} color={color} />
    </View>
    <Text style={styles.metricValueText}>
      {value} <Text style={styles.metricUnitText}>{unit}</Text>
    </Text>
  </View>
);

export default MetricCard;

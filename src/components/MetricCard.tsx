import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../styles/homeStyles';

interface MetricCardProps {
  label: string;
  value: string | number;
  unit: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  onPress?: () => void;
}

const MetricCard = ({ label, value, unit, icon, color, onPress }: MetricCardProps) => (
  <TouchableOpacity 
    style={styles.metricCard} 
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={styles.metricCardTop}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Ionicons name={icon} size={16} color={color} />
    </View>
    <Text style={styles.metricValueText}>
      {value} <Text style={styles.metricUnitText}>{unit}</Text>
    </Text>
  </TouchableOpacity>
);

export default MetricCard;

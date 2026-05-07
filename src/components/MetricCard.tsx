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
  theme?: any;
}

const MetricCard = ({ label, value, unit, icon, color, onPress, theme }: MetricCardProps) => (
  <TouchableOpacity 
    style={[styles.metricCard, theme && { backgroundColor: theme.card }]} 
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={styles.metricCardTop}>
      <Text style={[styles.metricLabel, theme && { color: theme.subtext }]}>{label}</Text>
      <Ionicons name={icon} size={16} color={color} />
    </View>
    <Text style={[styles.metricValueText, theme && { color: theme.text }]}>
      {value} <Text style={[styles.metricUnitText, theme && { color: theme.subtext }]}>{unit}</Text>
    </Text>
  </TouchableOpacity>
);

export default MetricCard;

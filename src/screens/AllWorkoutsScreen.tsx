import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../theme/colors';

const workouts = [
  { id: '1', title: 'Running', icon: 'run', type: 'material', desc: 'High intensity cardio' },
  { id: '2', title: 'Walking', icon: 'walk', type: 'material', desc: 'Steady pace walking' },
  { id: '3', title: 'Biking', icon: 'bike', type: 'material', desc: 'Indoor or outdoor cycling' },
];

export default function AllWorkoutsScreen() {
  const navigation = useNavigation<any>();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>All Workouts</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {workouts.map((workout) => (
          <TouchableOpacity 
            key={workout.id} 
            style={styles.card}
            onPress={() => navigation.navigate('WorkoutDetail', { workout })}
          >
            <View style={styles.iconContainer}>
              <MaterialCommunityIcons name={workout.icon as any} size={32} color={colors.primary} />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.title}>{workout.title}</Text>
              <Text style={styles.desc}>{workout.desc}</Text>
            </View>
            <Feather name="chevron-right" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  content: {
    padding: 20,
    gap: 15,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: 15,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: '#F5F3FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  desc: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
});

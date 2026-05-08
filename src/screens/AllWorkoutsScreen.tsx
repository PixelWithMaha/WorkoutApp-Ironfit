import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, ActivityIndicator, StatusBar } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../theme/colors';
import { useTheme } from '../context/ThemeContext';
import { db } from '../config/firebase';
import { collection, onSnapshot } from 'firebase/firestore';

const WORKOUT_ICONS: Record<string, string> = {
  Running: 'run',
  Walking: 'walk',
  Biking: 'bike',
  Weights: 'weight-lifter',
  Yoga: 'meditation',
  HIIT: 'lightning-bolt',
  Swimming: 'swim',
  Stretching: 'human-handsup',
};

export default function AllWorkoutsScreen() {
  const navigation = useNavigation<any>();
  const { theme, darkMode } = useTheme();
  const [workouts, setWorkouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'workouts'), (snapshot) => {
      const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      if (list.length > 0) {
        setWorkouts(list);
      } else {
        setWorkouts([
          { id: '1', title: 'Running', type: 'Running', desc: 'High intensity cardio' },
          { id: '2', title: 'Walking', type: 'Walking', desc: 'Steady pace walking' },
          { id: '3', title: 'Biking', type: 'Biking', desc: 'Indoor or outdoor cycling' },
        ]);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={darkMode ? 'light-content' : 'dark-content'} />
      <View style={[styles.header, { borderBottomColor: theme.border, borderBottomWidth: 1 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>All Workouts</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {loading ? (
          <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 40 }} />
        ) : (
          workouts.map((workout) => (
            <TouchableOpacity
              key={workout.id}
              style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}
              onPress={() => navigation.navigate('WorkoutDetail', { workout })}
            >
              <View style={[styles.iconContainer, { backgroundColor: theme.background }]}>
                <MaterialCommunityIcons

                  name={(workout.iconName || 'dumbbell') as any}
                  size={32}
                  color={theme.primary}
                />
              </View>
              <View style={styles.textContainer}>
                <Text style={[styles.title, { color: theme.text }]}>{workout.title}</Text>

                <Text style={[styles.desc, { color: theme.subtext }]}>
                  {workout.difficulty} • {workout.duration} mins • {workout.calories} kcal
                </Text>
              </View>
              <Feather name="chevron-right" size={20} color={theme.subtext} />
            </TouchableOpacity>
          ))
        )}
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
    color: colors.text,
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
    color: colors.text,
  },
  desc: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
});

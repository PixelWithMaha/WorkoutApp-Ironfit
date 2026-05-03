import React, { useState, useEffect } from 'react';
import { ScrollView, Text, TouchableOpacity, View, SafeAreaView, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { db, auth } from '../config/firebase';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { styles, PRIMARY_COLOR } from '../styles/homeStyles';
import MetricCard from '../components/MetricCard';
import WorkoutCard from '../components/WorkoutCard';
import { useStepContext } from '../context/StepContext';
import { useNavigation } from '@react-navigation/native';

const defaultHealthData = [
  { month: 'Jan', value: 40 }, { month: 'Feb', value: 60 }, { month: 'Mar', value: 35 },
  { month: 'Apr', value: 85 }, { month: 'May', value: 55 }, { month: 'Jun', value: 95 },
  { month: 'Jul', value: 50 }, { month: 'Aug', value: 75 }, { month: 'Sep', value: 60 },
  { month: 'Oct', value: 90 }, { month: 'Nov', value: 45 }, { month: 'Dec', value: 70 },
];

export default function HomeScreen() {
  const [userData, setUserData] = useState<any>(null);
  const [workouts, setWorkouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation<any>();
  const { currentSteps, currentCalories } = useStepContext();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userId = auth.currentUser?.uid;
        if (userId) {
          const userDocRef = doc(db, 'users', userId);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            setUserData(userDocSnap.data());
          }
        } else {
          setUserData({
            name: 'Sarah',
            metrics: { water: 2.9, calories: 2.9, heartRate: 76 },
            healthData: defaultHealthData,
          });
        }

        const workoutsCollection = collection(db, 'workouts');
        const workoutsSnapshot = await getDocs(workoutsCollection);
        const workoutsList = workoutsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        if (workoutsList.length > 0) {
          setWorkouts(workoutsList);
        } else {
          // Fallback workouts
          setWorkouts([
            { id: '1', title: "Running", desc: "Burn fat and boost\nendurance with a steady run.", isLight: false },
            { id: '2', title: "Biking", desc: "Strengthen your legs and\nimprove stamina, indoors or out.", isLight: true }
          ]);
        }
      } catch (error) {
        console.error("Error fetching data: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={PRIMARY_COLOR} />
      </SafeAreaView>
    );
  }

  const displayHealthData = userData?.healthData || defaultHealthData;
  const metrics = userData?.metrics || { water: 0, calories: 0, heartRate: 0 };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.avatarPlaceholder} />
            <View>
              <Text style={styles.greeting}>Hi, {userData?.name || 'User'}!</Text>
              <Text style={styles.subtitle}>Ready to crush your health goals today?</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.notificationButton}>
            <Feather name="bell" size={22} color="#1C1C1E" />
            <View style={styles.notificationDot} />
          </TouchableOpacity>
        </View>

        {/* Custom Bar Chart Section */}
        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <View style={styles.chartTitleContainer}>
              <MaterialCommunityIcons name="chart-bell-curve-cumulative" size={20} color={PRIMARY_COLOR} />
              <Text style={styles.chartTitle}>Health Status</Text>
            </View>
            <TouchableOpacity style={styles.dropdown}>
              <Text style={styles.dropdownText}>Monthly</Text>
              <Feather name="chevron-down" size={14} color="#A0A0A0" />
            </TouchableOpacity>
          </View>

          <View style={styles.chartBars}>
            {displayHealthData.map((item: any, index: number) => (
              <View key={index} style={styles.barGroup}>
                <View style={styles.barTrack}>
                  <View style={[styles.barFill, { height: `${item.value}%` }]} />
                </View>
                <Text style={styles.barLabel}>{item.month}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Metrics Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Your Metrics</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Progress')}>
            <Text style={styles.seeAll}>see all</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.metricsGrid}>
          <MetricCard label="Water" value={metrics.water} unit="Liters" icon="water" color="#2196F3" />
          <MetricCard label="Calories" value={currentCalories || metrics.calories} unit="Cal" icon="flame" color="#FFC107" />
          <MetricCard label="Heart Rate" value={metrics.heartRate} unit="Bpm" icon="heart" color="#7E57C2" />
        </View>

        {/* Suggested Workouts Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Suggested Workouts</Text>
          <TouchableOpacity onPress={() => navigation.navigate('AllWorkouts')}>
            <Text style={styles.seeAll}>see all</Text>
          </TouchableOpacity>
        </View>

        {workouts.map((workout: any) => (
          <WorkoutCard
            key={workout.id}
            title={workout.title}
            desc={workout.desc}
            isLight={workout.isLight}
            onPress={() => navigation.navigate('WorkoutDetail', { workout })}
          />
        ))}

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

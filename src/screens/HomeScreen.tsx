import React, { useState, useEffect } from 'react';
import { ScrollView, Text, TouchableOpacity, View, SafeAreaView, ActivityIndicator, Modal, StyleSheet, Dimensions } from 'react-native';
import { MaterialCommunityIcons, Feather, Ionicons } from '@expo/vector-icons';
import { db, auth } from '../config/firebase';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { styles, PRIMARY_COLOR } from '../styles/homeStyles';
import MetricCard from '../components/MetricCard';
import WorkoutCard from '../components/WorkoutCard';
import { useStepContext } from '../context/StepContext';
import { useNavigation } from '@react-navigation/native';

const { height } = Dimensions.get('window');

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
  const [showNotifications, setShowNotifications] = useState(false);
  const navigation = useNavigation<any>();
  const { currentSteps, currentCalories, notifications, clearNotifications } = useStepContext();

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

  const getNotifIcon = (type: string) => {
    switch (type) {
      case 'workout': return { name: 'barbell', color: '#3B82F6', iconSet: Ionicons };
      case 'water': return { name: 'water', color: '#0EA5E9', iconSet: Ionicons };
      case 'goal': return { name: 'target', color: '#10B981', iconSet: Feather };
      case 'motivation': return { name: 'rocket-outline', color: '#F59E0B', iconSet: Ionicons };
      case 'warning': return { name: 'alert-circle', color: '#EF4444', iconSet: Feather };
      default: return { name: 'bell', color: PRIMARY_COLOR, iconSet: Feather };
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={PRIMARY_COLOR} />
      </SafeAreaView>
    );
  }

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
          <TouchableOpacity style={styles.notificationButton} onPress={() => setShowNotifications(true)}>
            <Feather name="bell" size={22} color="#1C1C1E" />
            {notifications.length > 0 && <View style={localStyles.badge} />}
          </TouchableOpacity>
        </View>

        {/* Notification Hub Modal */}
        <Modal
          visible={showNotifications}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowNotifications(false)}
        >
          <View style={localStyles.modalOverlay}>
            <View style={localStyles.modalContent}>
              <View style={localStyles.modalHeader}>
                <Text style={localStyles.modalTitle}>Notification Hub</Text>
                <TouchableOpacity onPress={() => setShowNotifications(false)}>
                  <Ionicons name="close-circle" size={28} color="#94A3B8" />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: height * 0.6 }}>
                {notifications.length === 0 ? (
                  <View style={localStyles.emptyContainer}>
                    <Ionicons name="notifications-off-outline" size={60} color="#CBD5E1" />
                    <Text style={localStyles.emptyText}>No notifications yet.</Text>
                    <Text style={localStyles.emptySub}>We'll alert you about goals & workouts!</Text>
                  </View>
                ) : (
                  notifications.map((notif) => {
                    const iconConfig = getNotifIcon(notif.type);
                    const IconComponent = iconConfig.iconSet;
                    return (
                      <View key={notif.id} style={localStyles.notifCard}>
                        <View style={[localStyles.iconCircle, { backgroundColor: iconConfig.color + '15' }]}>
                          <IconComponent name={iconConfig.name as any} size={20} color={iconConfig.color} />
                        </View>
                        <View style={{ flex: 1 }}>
                          <View style={localStyles.notifTextRow}>
                            <Text style={localStyles.notifTitle}>{notif.title}</Text>
                            <Text style={localStyles.notifTime}>{notif.time}</Text>
                          </View>
                          <Text style={localStyles.notifMessage}>{notif.message}</Text>
                        </View>
                      </View>
                    );
                  })
                )}
              </ScrollView>

              {notifications.length > 0 && (
                <TouchableOpacity style={localStyles.clearButton} onPress={() => { clearNotifications(); setShowNotifications(false); }}>
                  <Text style={localStyles.clearButtonText}>Clear All</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </Modal>

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
            {(userData?.healthData || defaultHealthData).map((item: any, index: number) => (
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

const localStyles = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#EF4444',
    borderWidth: 2,
    borderColor: 'white',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    minHeight: height * 0.4,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  notifCard: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  notifTextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  notifTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  notifTime: {
    fontSize: 11,
    color: '#94A3B8',
  },
  notifMessage: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#475569',
    marginTop: 16,
  },
  emptySub: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 40,
  },
  clearButton: {
    backgroundColor: '#F1F5F9',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 12,
  },
  clearButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#475569',
  },
});

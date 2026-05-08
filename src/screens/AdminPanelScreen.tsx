import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
  StatusBar,
  useWindowDimensions
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { db, auth } from '../config/firebase';
import { collection, addDoc, deleteDoc, doc, onSnapshot, serverTimestamp } from 'firebase/firestore';

interface Workout {
  id: string;
  title: string;
  desc: string;
  type: string;
  isLight: boolean;
  createdAt?: any;
}

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

const WORKOUT_TYPES = Object.keys(WORKOUT_ICONS);

export default function AdminPanelScreen() {
  const navigation = useNavigation<any>();
  const { theme, darkMode } = useTheme();
  const { width } = useWindowDimensions();

  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newWorkout, setNewWorkout] = useState({
    title: '',
    desc: '',
    type: 'Running',
  });

  // Real-time listener for workouts
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'workouts'),
      (snapshot) => {
        const workoutList: Workout[] = snapshot.docs.map(docSnap => ({
          id: docSnap.id,
          ...docSnap.data(),
        } as Workout));
        setWorkouts(workoutList);
        setLoading(false);
      },
      (error) => {
        console.error('Error listening to workouts:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleAddWorkout = async () => {
    if (!newWorkout.title.trim()) {
      Alert.alert('Error', 'Please enter a workout title.');
      return;
    }
    if (!newWorkout.desc.trim()) {
      Alert.alert('Error', 'Please enter a workout description.');
      return;
    }

    setSaving(true);
    try {
      await addDoc(collection(db, 'workouts'), {
        title: newWorkout.title.trim(),
        desc: newWorkout.desc.trim(),
        type: newWorkout.type,
        isLight: false,
        createdAt: serverTimestamp(),
      });
      setModalVisible(false);
      setNewWorkout({ title: '', desc: '', type: 'Running' });
      Alert.alert('Success', 'Workout added successfully! Users will see it instantly.');
    } catch (error) {
      console.error('Error adding workout:', error);
      Alert.alert('Error', 'Failed to add workout. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteWorkout = (workout: Workout) => {
    Alert.alert(
      'Delete Workout',
      `Are you sure you want to delete "${workout.title}"? This will remove it for all users immediately.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'workouts', workout.id));
            } catch (error) {
              console.error('Error deleting workout:', error);
              Alert.alert('Error', 'Failed to delete workout.');
            }
          },
        },
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout from admin panel?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        onPress: async () => {
          await auth.signOut();
          navigation.replace('Login');
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={darkMode ? 'light-content' : 'dark-content'} />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
        <View style={styles.headerLeft}>
          <View style={[styles.adminIcon, { backgroundColor: theme.primary + '20' }]}>
            <Feather name="shield" size={20} color={theme.primary} />
          </View>
          <View>
            <Text style={[styles.headerTitle, { color: theme.text }]}>Admin Panel</Text>
            <Text style={[styles.headerSubtitle, { color: theme.subtext }]}>Manage Workouts</Text>
          </View>
        </View>
        <TouchableOpacity onPress={handleLogout} style={[styles.logoutBtn, { backgroundColor: '#EF4444' + '15' }]}>
          <Feather name="log-out" size={18} color="#EF4444" />
        </TouchableOpacity>
      </View>

      {/* Stats Bar */}
      <View style={[styles.statsBar, { backgroundColor: theme.card }]}>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: theme.primary }]}>{workouts.length}</Text>
          <Text style={[styles.statLabel, { color: theme.subtext }]}>Total Workouts</Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: '#22C55E' }]}>Live</Text>
          <Text style={[styles.statLabel, { color: theme.subtext }]}>Sync Status</Text>
        </View>
      </View>

      {/* Workout List */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.primary} />
            <Text style={[styles.loadingText, { color: theme.subtext }]}>Loading workouts...</Text>
          </View>
        ) : workouts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="dumbbell" size={64} color={theme.border} />
            <Text style={[styles.emptyTitle, { color: theme.text }]}>No Workouts Yet</Text>
            <Text style={[styles.emptyText, { color: theme.subtext }]}>
              Tap the + button below to add your first workout.
            </Text>
          </View>
        ) : (
          workouts.map((workout) => (
            <View key={workout.id} style={[styles.workoutCard, { backgroundColor: theme.card }]}>
              <View style={[styles.workoutIconContainer, { backgroundColor: theme.primary + '15' }]}>
                <MaterialCommunityIcons
                  name={(WORKOUT_ICONS[workout.type] || 'dumbbell') as any}
                  size={28}
                  color={theme.primary}
                />
              </View>
              <View style={styles.workoutInfo}>
                <Text style={[styles.workoutTitle, { color: theme.text }]}>{workout.title}</Text>
                <Text style={[styles.workoutDesc, { color: theme.subtext }]} numberOfLines={2}>
                  {workout.desc}
                </Text>
                {workout.type && (
                  <View style={[styles.typeBadge, { backgroundColor: theme.primary + '15' }]}>
                    <Text style={[styles.typeBadgeText, { color: theme.primary }]}>{workout.type}</Text>
                  </View>
                )}
              </View>
              <TouchableOpacity
                style={[styles.deleteBtn, { backgroundColor: '#EF4444' + '15' }]}
                onPress={() => handleDeleteWorkout(workout)}
              >
                <Feather name="trash-2" size={18} color="#EF4444" />
              </TouchableOpacity>
            </View>
          ))
        )}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Add Button */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: theme.primary }]}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.8}
      >
        <Feather name="plus" size={28} color="white" />
      </TouchableOpacity>

      {/* Add Workout Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Add New Workout</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Feather name="x" size={24} color={theme.text} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.inputLabel, { color: theme.text }]}>Workout Title</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
              placeholder="e.g. Morning Jogging"
              placeholderTextColor={theme.subtext}
              value={newWorkout.title}
              onChangeText={(text) => setNewWorkout({ ...newWorkout, title: text })}
            />

            <Text style={[styles.inputLabel, { color: theme.text }]}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
              placeholder="e.g. Burn fat and boost endurance with a steady run."
              placeholderTextColor={theme.subtext}
              value={newWorkout.desc}
              onChangeText={(text) => setNewWorkout({ ...newWorkout, desc: text })}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />

            <Text style={[styles.inputLabel, { color: theme.text }]}>Type</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeSelector}>
              {WORKOUT_TYPES.map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.typeChip,
                    { backgroundColor: theme.background, borderColor: theme.border },
                    newWorkout.type === type && { backgroundColor: theme.primary, borderColor: theme.primary },
                  ]}
                  onPress={() => setNewWorkout({ ...newWorkout, type })}
                >
                  <MaterialCommunityIcons
                    name={(WORKOUT_ICONS[type]) as any}
                    size={16}
                    color={newWorkout.type === type ? 'white' : theme.subtext}
                  />
                  <Text
                    style={[
                      styles.typeChipText,
                      { color: theme.subtext },
                      newWorkout.type === type && { color: 'white' },
                    ]}
                  >
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={[styles.saveButton, { backgroundColor: theme.primary }, saving && { opacity: 0.7 }]}
              onPress={handleAddWorkout}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.saveButtonText}>Add Workout</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  adminIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  logoutBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsBar: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 16,
    padding: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
  },
  statDivider: {
    width: 1,
    height: '100%',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  loadingContainer: {
    alignItems: 'center',
    marginTop: 60,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 60,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  workoutCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
  },
  workoutIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  workoutInfo: {
    flex: 1,
  },
  workoutTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  workoutDesc: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 6,
  },
  typeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  deleteBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    paddingBottom: 40,
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
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 16,
    marginLeft: 4,
  },
  input: {
    borderRadius: 14,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
  },
  textArea: {
    minHeight: 80,
    paddingTop: 14,
  },
  typeSelector: {
    flexDirection: 'row',
    marginTop: 4,
    marginBottom: 8,
  },
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    marginRight: 8,
    borderWidth: 1,
    gap: 6,
  },
  typeChipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  saveButton: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

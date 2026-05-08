import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity,
  TextInput, Modal, Alert, ActivityIndicator, StatusBar, BackHandler
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { db, auth } from '../config/firebase';
import { collection, addDoc, deleteDoc, doc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { useTheme } from '../context/ThemeContext';

const ICON_OPTIONS = [
  { name: 'run', label: 'Running' }, { name: 'walk', label: 'Walking' },
  { name: 'bike', label: 'Biking' }, { name: 'weight-lifter', label: 'Weights' },
  { name: 'meditation', label: 'Yoga' }, { name: 'lightning-bolt', label: 'HIIT' },
  { name: 'swim', label: 'Swimming' }, { name: 'human-handsup', label: 'Stretch' },
  { name: 'fire', label: 'Burn' }, { name: 'heart-pulse', label: 'Cardio' }
];

const CATEGORIES = ['Weights', 'Cardio', 'Yoga', 'HIIT'];
const DIFFICULTIES = ['Beginner', 'Intermediate', 'Advanced'];

export default function AdminPanelScreen() {
  const { theme, darkMode } = useTheme();
  const navigation = useNavigation<any>();
  const [workouts, setWorkouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);

  const [newWorkout, setNewWorkout] = useState({
    title: '', category: 'Cardio', duration: '',
    difficulty: 'Beginner', iconName: 'run',
    calories: '', description: '',
  });

  useEffect(() => {
    const backAction = () => {
      Alert.alert("Hold on!", "Are you sure you want to exit the Admin Panel? You must logout to leave safely.", [
        { text: "Cancel", onPress: () => null, style: "cancel" },
        { text: "Logout", onPress: handleLogout }
      ]);
      return true;
    };

    const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);
    return () => backHandler.remove();
  }, []);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'workouts'), (snapshot) => {
      setWorkouts(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigation.replace('Login');
    } catch (error) {
      Alert.alert("Error", "Logout failed.");
    }
  };

  const handleAddWorkout = async () => {
    const { title, description, duration, calories } = newWorkout;
    if (!title || !description || !duration || !calories) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }
    setSaving(true);
    try {
      await addDoc(collection(db, 'workouts'), {
        ...newWorkout,
        duration: parseInt(newWorkout.duration),
        calories: parseInt(newWorkout.calories),
        createdAt: serverTimestamp(),
      });
      setModalVisible(false);
      setNewWorkout({ title: '', category: 'Cardio', duration: '', difficulty: 'Beginner', iconName: 'run', calories: '', description: '' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={darkMode ? 'light-content' : 'dark-content'} />

      <View style={[styles.header, { backgroundColor: theme.card }]}>
        <View>
          <Text style={[styles.welcomeText, { color: theme.subtext }]}>Welcome Back,</Text>
          <Text style={[styles.adminName, { color: theme.text }]}>Admin Chief 👋</Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Feather name="log-out" size={20} color="#EF4444" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.statsContainer}>
          <View style={[styles.statBox, { backgroundColor: theme.primary }]}>
            <Text style={[styles.statNum, { color: '#FFFFFF' }]}>{workouts.length}</Text>
            <Text style={[styles.statLabel, { color: 'rgba(255,255,255,0.7)' }]}>Active Workouts</Text>
          </View>
          <View style={[styles.statBox, { backgroundColor: '#22C55E15' }]}>
            <Text style={[styles.statNum, { color: '#22C55E' }]}>Live</Text>
            <Text style={[styles.statLabel, { color: theme.subtext }]}>DB Status</Text>
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: theme.text }]}>Workout Inventory</Text>

        {loading ? (
          <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 50 }} />
        ) : workouts.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="database-off" size={60} color={theme.border} />
            <Text style={{ color: theme.subtext, marginTop: 10 }}>No workouts found in system.</Text>
          </View>
        ) : (
          workouts.map((item) => (
            <View key={item.id} style={[styles.card, { backgroundColor: theme.background, borderColor: theme.border }]}>
              <View style={[styles.iconCircle, { backgroundColor: theme.primary }]}>
                <MaterialCommunityIcons name={item.iconName as any} size={24} color={theme.iconBg} />
              </View>
              <View style={{ flex: 1, marginLeft: 15 }}>
                <Text style={[styles.workoutTitle, { color: theme.text }]}>{item.title}</Text>
                <Text style={[styles.workoutDetails, { color: theme.subtext }]}>
                  {item.category} • {item.difficulty}
                </Text>
              </View>
              <TouchableOpacity onPress={() => deleteDoc(doc(db, 'workouts', item.id))} style={styles.deleteBtn}>
                <Feather name="trash-2" size={18} color="#FF8A8A" />
              </TouchableOpacity>
            </View>
          ))
        )}
        <View style={{ height: 100 }} />
      </ScrollView>

      <TouchableOpacity style={[styles.fab, { backgroundColor: theme.primary }]} onPress={() => setModalVisible(true)}>
        <Feather name="plus" size={30} color="white" />
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Configure New Workout</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Feather name="x" size={24} color={theme.text} />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={[styles.label, { color: theme.text }]}>Workout Title</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.background, color: theme.text }]}
                value={newWorkout.title}
                onChangeText={(t) => setNewWorkout({ ...newWorkout, title: t })}
                placeholder="Name of session"
                placeholderTextColor={theme.subtext}
              />

              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.label, { color: theme.text }]}>Duration (min)</Text>
                  <TextInput
                    keyboardType="numeric"
                    style={[styles.input, { backgroundColor: theme.background, color: theme.text }]}
                    value={newWorkout.duration}
                    onChangeText={(t) => setNewWorkout({ ...newWorkout, duration: t })}
                    placeholder="20"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.label, { color: theme.text }]}>Calories</Text>
                  <TextInput
                    keyboardType="numeric"
                    style={[styles.input, { backgroundColor: theme.background, color: theme.text }]}
                    value={newWorkout.calories}
                    onChangeText={(t) => setNewWorkout({ ...newWorkout, calories: t })}
                    placeholder="150"
                  />
                </View>
              </View>

              <Text style={[styles.label, { color: theme.text }]}>Pick Visual Icon</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 5 }}>
                {ICON_OPTIONS.map((icon) => (
                  <TouchableOpacity
                    key={icon.name}
                    onPress={() => setNewWorkout({ ...newWorkout, iconName: icon.name })}
                    style={[
                      styles.iconChip,
                      { backgroundColor: theme.background, borderColor: theme.border },
                      newWorkout.iconName === icon.name && { borderColor: theme.primary, backgroundColor: theme.primary + '15' }
                    ]}
                  >
                    <MaterialCommunityIcons name={icon.name as any} size={22} color={newWorkout.iconName === icon.name ? theme.primary : theme.subtext} />
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={[styles.label, { color: theme.text }]}>Category</Text>
              <View style={styles.row}>
                {CATEGORIES.map(cat => (
                  <TouchableOpacity
                    key={cat}
                    onPress={() => setNewWorkout({ ...newWorkout, category: cat })}
                    style={[styles.chip, { borderColor: theme.border }, newWorkout.category === cat && { backgroundColor: theme.primary, borderColor: theme.primary }]}
                  >
                    <Text style={{ color: newWorkout.category === cat ? 'white' : theme.subtext }}>{cat}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[styles.label, { color: theme.text }]}>Difficulty</Text>
              <View style={styles.row}>
                {DIFFICULTIES.map(diff => (
                  <TouchableOpacity
                    key={diff}
                    onPress={() => setNewWorkout({ ...newWorkout, difficulty: diff })}
                    style={[styles.chip, { borderColor: theme.border }, newWorkout.difficulty === diff && { backgroundColor: theme.primary, borderColor: theme.primary }]}
                  >
                    <Text style={{ color: newWorkout.difficulty === diff ? 'white' : theme.subtext }}>{diff}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[styles.label, { color: theme.text }]}>Description</Text>
              <TextInput
                multiline
                style={[styles.input, { backgroundColor: theme.background, color: theme.text, height: 80 }]}
                value={newWorkout.description}
                onChangeText={(t) => setNewWorkout({ ...newWorkout, description: t })}
                placeholder="What will users do?"
              />

              <TouchableOpacity style={[styles.saveBtn, { backgroundColor: theme.primary }]} onPress={handleAddWorkout}>
                {saving ? <ActivityIndicator color="white" /> : <Text style={styles.saveBtnText}>Publish Workout</Text>}
              </TouchableOpacity>
              <View style={{ height: 50 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    padding: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 10
  },
  welcomeText:
  {
    fontSize: 14,
    fontWeight: '500'
  },
  adminName:
  {
    fontSize: 22,
    fontWeight: '800'
  },
  logoutBtn:
  {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EF444415',
    padding: 10,
    borderRadius: 12,
    gap: 5
  },
  logoutText:
  {
    color: '#EF4444',
    fontWeight: 'bold',
    fontSize: 12
  },
  statsContainer:
  {
    flexDirection: 'row',
    gap: 15,
    paddingHorizontal: 24,
    marginTop: 20
  },
  statBox:
  {
    flex: 1,
    padding: 20,
    borderRadius: 20,
    alignItems: 'center'
  },
  statNum:
  {
    fontSize: 24,
    fontWeight: 'bold'
  },
  statLabel:
  {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4
  },
  sectionTitle:
  {
    fontSize: 18,
    fontWeight: '700',
    marginHorizontal: 24,
    marginTop: 30,
    marginBottom: 15
  },
  scrollContent:
    { paddingBottom: 20 },
  card:
  {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 24,
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 1,
    elevation: 4
  },
  iconCircle:
  {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center'
  },
  workoutTitle:
  {
    fontSize: 16,
    fontWeight: '700'
  },
  workoutDetails:
  {
    fontSize: 12,
    marginTop: 2
  },
  deleteBtn:
    { padding: 8 },
  fab:
  {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 64,
    height: 64,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8
  },
  modalOverlay:
  {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end'
  },
  modalContent:
  {
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    padding: 25,
    maxHeight: '92%'
  },
  modalHeader:
  {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20
  },
  modalTitle:
  {
    fontSize: 20,
    fontWeight: 'bold'
  },
  label:
  {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 15,
    marginBottom: 8
  },
  input:
  {
    borderRadius: 15,
    padding: 15,
    fontSize: 16
  },
  row:
  {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  chip:
  {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1
  },
  iconChip:
  {
    padding: 12,
    borderRadius: 15,
    borderWidth: 2,
    marginRight: 10
  },
  saveBtn:
  {
    marginTop: 30,
    padding: 18,
    borderRadius: 18,
    alignItems: 'center',
    elevation: 4
  },
  saveBtnText:
  {
    color: 'white',
    fontWeight: '800',
    fontSize: 16
  },
  emptyState:
  {
    alignItems: 'center',
    marginTop: 60
  }
});
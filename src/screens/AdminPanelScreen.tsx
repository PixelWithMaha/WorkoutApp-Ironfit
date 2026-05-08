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
  BackHandler
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { db, auth } from '../config/firebase';
import { collection, addDoc, deleteDoc, doc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { useTheme } from '../context/ThemeContext';

const ICON_OPTIONS = [
  { name: 'run', label: 'Running' },
  { name: 'walk', label: 'Walking' },
  { name: 'bike', label: 'Biking' },
  { name: 'weight-lifter', label: 'Weights' },
  { name: 'meditation', label: 'Yoga' },
  { name: 'lightning-bolt', label: 'HIIT' },
  { name: 'swim', label: 'Swimming' },
  { name: 'human-handsup', label: 'Stretch' },
  { name: 'fire', label: 'Burn' },
  { name: 'heart-pulse', label: 'Cardio' }
];

const CATEGORIES = ['Weights', 'Cardio', 'Yoga', 'HIIT'];
const DIFFICULTIES = ['Beginner', 'Intermediate', 'Advanced'];

export default function AdminPanelScreen() {
  const { theme, darkMode } = useTheme();
  const navigation = useNavigation<any>();

  const [activeTab, setActiveTab] = useState<'workouts' | 'users'>('workouts');
  const [workouts, setWorkouts] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);

  const [newWorkout, setNewWorkout] = useState({
    title: '',
    category: 'Cardio',
    duration: '',
    difficulty: 'Beginner',
    iconName: 'run',
    calories: '',
    description: '',
  });

  useEffect(() => {
    const backAction = () => {
      Alert.alert("Admin Exit", "Logout to leave the panel safely.", [
        { text: "Cancel", style: "cancel" },
        { text: "Logout", onPress: handleLogout }
      ]);
      return true;
    };
    const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);
    return () => backHandler.remove();
  }, []);

  useEffect(() => {
    setLoading(true);
    const unsubWorkouts = onSnapshot(collection(db, 'workouts'), (snapshot) => {
      setWorkouts(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
      if (activeTab === 'workouts') setLoading(false);
    });

    const unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      setUsers(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
      if (activeTab === 'users') setLoading(false);
    });

    return () => {
      unsubWorkouts();
      unsubUsers();
    };
  }, [activeTab]);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigation.replace('Login');
    } catch (e) {
      Alert.alert("Error", "Logout failed.");
    }
  };

  const handleDeleteUser = (userId: string, userName: string) => {
    Alert.alert("Confirm Delete", `Are you sure you want to remove ${userName}?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete User", style: "destructive", onPress: async () => await deleteDoc(doc(db, 'users', userId)) }
    ]);
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
          <Text style={[styles.welcomeText, { color: theme.subtext }]}>IronFit Master</Text>
          <Text style={[styles.adminName, { color: theme.text }]}>Admin Panel 👋</Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Feather name="log-out" size={18} color="#EF4444" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.tabContainer, { backgroundColor: darkMode ? '#1F2937' : '#E5E7EB' }]}>
        <TouchableOpacity
          onPress={() => setActiveTab('workouts')}
          style={[styles.tab, activeTab === 'workouts' && { backgroundColor: theme.primary }]}
        >
          <Text style={[styles.tabText, { color: activeTab === 'workouts' ? '#FFF' : theme.subtext }]}>Workouts</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab('users')}
          style={[styles.tab, activeTab === 'users' && { backgroundColor: theme.primary }]}
        >
          <Text style={[styles.tabText, { color: activeTab === 'users' ? '#FFF' : theme.subtext }]}>Users</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {loading ? (
          <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 50 }} />
        ) : activeTab === 'workouts' ? (
          <View>
            {workouts.map((item) => (
              <View key={item.id} style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <View style={[styles.iconCircle, { backgroundColor: theme.primary }]}>
                  <MaterialCommunityIcons name={item.iconName as any} size={24} color="#FFFFFF" />
                </View>
                <View style={{ flex: 1, marginLeft: 15 }}>
                  <Text style={[styles.workoutTitle, { color: theme.text }]}>{item.title}</Text>
                  <Text style={[styles.workoutDetails, { color: theme.subtext }]}>{item.category} • {item.difficulty}</Text>
                </View>
                <TouchableOpacity onPress={() => deleteDoc(doc(db, 'workouts', item.id))} style={styles.deleteBtn}>
                  <Feather name="trash-2" size={18} color="#FF8A8A" />
                </TouchableOpacity>
              </View>
            ))}

            <TouchableOpacity
              style={[styles.card, styles.addCard, { backgroundColor: theme.card, borderColor: theme.primary, borderStyle: 'dashed' }]}
              onPress={() => setModalVisible(true)}
            >
              <View style={[styles.iconCircle, { backgroundColor: theme.primary + '20' }]}>
                <Feather name="plus" size={24} color={theme.primary} />
              </View>
              <View style={{ flex: 1, marginLeft: 15 }}>
                <Text style={[styles.workoutTitle, { color: theme.primary }]}>Add New Workout</Text>
                <Text style={[styles.workoutDetails, { color: theme.subtext }]}>Create a new session for your users</Text>
              </View>
            </TouchableOpacity>
          </View>
        ) : (
          users.map((user) => (
            <View key={user.id} style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <View style={[styles.iconCircle, { backgroundColor: theme.primary + '15' }]}>
                <Feather name="user" size={22} color={theme.primary} />
              </View>
              <View style={{ flex: 1, marginLeft: 15 }}>
                <Text style={[styles.workoutTitle, { color: theme.text }]}>{user.name || 'Anonymous'}</Text>
                <Text style={[styles.workoutDetails, { color: theme.subtext }]}>{user.email}</Text>
              </View>
              <TouchableOpacity onPress={() => handleDeleteUser(user.id, user.name)} style={styles.deleteBtn}>
                <MaterialCommunityIcons name="account-remove-outline" size={22} color={theme.primary} />
              </TouchableOpacity>
            </View>
          ))
        )}
        <View style={{ height: 100 }} />
      </ScrollView>

      {activeTab === 'workouts' && (
        <TouchableOpacity style={[styles.fab, { backgroundColor: theme.primary }]} onPress={() => setModalVisible(true)}>
          <Feather name="plus" size={30} color="white" />
        </TouchableOpacity>
      )}

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>New Workout</Text>
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
                placeholder="e.g Full Body Workout"
                placeholderTextColor={theme.subtext}
              />

              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.label, { color: theme.text }]}>Duration (min)</Text>
                  <TextInput
                    keyboardType="numeric"
                    placeholder="e.g 30 mins"
                    placeholderTextColor={theme.subtext}
                    style={[styles.input, { backgroundColor: theme.background, color: theme.text }]}
                    value={newWorkout.duration}
                    onChangeText={(t) => setNewWorkout({ ...newWorkout, duration: t })}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.label, { color: theme.text }]}>Calories</Text>
                  <TextInput
                    keyboardType="numeric"
                    placeholder="e.g 400 kcal"
                    placeholderTextColor={theme.subtext}
                    style={[styles.input, { backgroundColor: theme.background, color: theme.text }]}
                    value={newWorkout.calories}
                    onChangeText={(t) => setNewWorkout({ ...newWorkout, calories: t })}
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
                placeholder='e.g High intensity cardio'
                placeholderTextColor={theme.subtext}
                onChangeText={(t) => setNewWorkout({ ...newWorkout, description: t })}
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
  container:
  {
    flex: 1
  },
  header:
  {
    padding: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
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
    backgroundColor: '#EF444410',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12
  },
  logoutText:
  {
    color: '#EF4444',
    fontWeight: 'bold',
    fontSize: 13,
    marginLeft: 6
  },
  tabContainer:
  {
    flexDirection: 'row',
    marginHorizontal: 24,
    marginBottom: 20,
    borderRadius: 15,
    padding: 5
  },
  tab:
  {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 12
  },
  tabText:
  {
    fontWeight: '700',
    fontSize: 14
  },
  scrollContent:
  {
    paddingBottom: 20
  },
  card:
  {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 24,
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 1,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  addCard:
  {
    borderWidth: 2,
    marginBottom: 30
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
  {
    padding: 8
  },
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
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4
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
    paddingHorizontal: 16,
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
    alignItems: 'center'
  },
  saveBtnText:
  {
    color: 'white',
    fontWeight: '800',
    fontSize: 16
  }
});
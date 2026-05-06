import React, { useState, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  SafeAreaView, 
  Modal, 
  TextInput,
  ActivityIndicator,
  Alert
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useWorkoutPlans, WorkoutPlan } from '../hooks/useWorkoutPlans';

const WORKOUT_TYPES = ['Running', 'Cycling', 'Weights', 'Yoga', 'HIIT'];

export default function CalendarScreen() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newPlan, setNewPlan] = useState({ title: '', type: 'Running', duration: '30' });
  
  const { plans, loading, addPlan, deletePlan } = useWorkoutPlans();

  
  const selectedDayPlans = useMemo(() => {
    return plans.filter(plan => plan.date === selectedDate);
  }, [plans, selectedDate]);

  
  const markedDates = useMemo(() => {
    const marks: any = {};
    plans.forEach(plan => {
      marks[plan.date] = {
        marked: true,
        dotColor: colors.primary,
        selected: plan.date === selectedDate,
        selectedColor: plan.date === selectedDate ? colors.primary : undefined
      };
    });
    
    
    if (!marks[selectedDate]) {
      marks[selectedDate] = { selected: true, selectedColor: colors.primary };
    }
    
    return marks;
  }, [plans, selectedDate]);

  const handleAddPlan = async () => {
    console.log("[CalendarScreen] handleAddPlan triggered");
    if (!newPlan.title) {
      Alert.alert("Error", "Please enter a title for your workout.");
      return;
    }

    try {
      console.log("[CalendarScreen] Calling addPlan...");
      await addPlan({
        title: newPlan.title,
        type: newPlan.type,
        duration: `${newPlan.duration} min`,
        date: selectedDate,
        completed: false
      });
      console.log("[CalendarScreen] addPlan finished");
    } catch (error) {
      console.error("[CalendarScreen] Error in handleAddPlan:", error);
    } finally {
      setModalVisible(false);
      setNewPlan({ title: '', type: 'Running', duration: '30' });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Workout Planner</Text>
          <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.addButton}>
            <Feather name="plus" size={24} color={colors.white} />
          </TouchableOpacity>
        </View>

        {}
        <View style={styles.calendarCard}>
          <Calendar
            onDayPress={(day: any) => setSelectedDate(day.dateString)}
            markedDates={markedDates}
            theme={{
              todayTextColor: colors.primary,
              arrowColor: colors.primary,
              monthTextColor: colors.primary,
              indicatorColor: colors.primary,
              textDayFontWeight: '500',
              textMonthFontWeight: 'bold',
              textDayHeaderFontWeight: 'bold',
              selectedDayBackgroundColor: colors.primary,
              selectedDayTextColor: colors.white,
            }}
          />
        </View>

        {}
        <View style={styles.plansHeader}>
          <Text style={styles.plansTitle}>
            Plans for {new Date(selectedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </Text>
        </View>

        {loading ? (
          <ActivityIndicator color={colors.primary} size="large" style={{ marginTop: 40 }} />
        ) : selectedDayPlans.length > 0 ? (
          selectedDayPlans.map((plan) => (
            <View key={plan.id} style={styles.planCard}>
              <View style={[styles.typeIndicator, { backgroundColor: colors.primaryLight }]} />
              <View style={styles.planInfo}>
                <Text style={styles.planTitle}>{plan.title}</Text>
                <Text style={styles.planType}>{plan.type} • {plan.duration}</Text>
              </View>
              <TouchableOpacity onPress={() => deletePlan(plan.id)} style={styles.deleteButton}>
                <Feather name="trash-2" size={18} color={colors.error} />
              </TouchableOpacity>
            </View>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="calendar-blank" size={64} color="#E5E5EA" />
            <Text style={styles.emptyText}>No workouts planned for this day.</Text>
            <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.emptyAddButton}>
              <Text style={styles.emptyAddText}>Schedule One</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Plan Workout</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Feather name="x" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Workout Title (e.g. Morning Jog)"
              value={newPlan.title}
              onChangeText={(text) => setNewPlan({...newPlan, title: text})}
            />

            <Text style={styles.inputLabel}>Type</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeSelector}>
              {WORKOUT_TYPES.map(type => (
                <TouchableOpacity 
                  key={type}
                  style={[styles.typeTab, newPlan.type === type && styles.activeTypeTab]}
                  onPress={() => setNewPlan({...newPlan, type})}
                >
                  <Text style={[styles.typeTabText, newPlan.type === type && styles.activeTypeTabText]}>{type}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.inputLabel}>Duration (minutes)</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              placeholder="30"
              value={newPlan.duration}
              onChangeText={(text) => setNewPlan({...newPlan, duration: text})}
            />

            <TouchableOpacity style={styles.saveButton} onPress={handleAddPlan}>
              <Text style={styles.saveButtonText}>Add to Calendar</Text>
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
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  calendarCard: {
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: 12,
    marginBottom: 32,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
  },
  plansHeader: {
    marginBottom: 16,
  },
  plansTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  planCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  typeIndicator: {
    width: 4,
    height: '100%',
    borderRadius: 2,
    marginRight: 16,
  },
  planInfo: {
    flex: 1,
  },
  planTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  planType: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  deleteButton: {
    padding: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  emptyAddButton: {
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  emptyAddText: {
    color: colors.primary,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.white,
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
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginTop: 20,
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#F8F9FB',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.text,
  },
  typeSelector: {
    flexDirection: 'row',
  },
  typeTab: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#F8F9FB',
    marginRight: 8,
  },
  activeTypeTab: {
    backgroundColor: colors.primary,
  },
  typeTabText: {
    color: colors.textSecondary,
    fontWeight: '600',
  },
  activeTypeTabText: {
    color: colors.white,
  },
  saveButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 32,
  },
  saveButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

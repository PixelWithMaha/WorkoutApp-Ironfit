import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  Modal,
  TextInput,
  ActivityIndicator,
  Alert
} from 'react-native';
import { Feather, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useStepContext } from '../context/StepContext';
import { useTrips } from '../hooks/useTrips';
import { useHistory } from '../hooks/useHistory';

const { width } = Dimensions.get('window');

const TABS = ['1 Week', '2 Week', '3 Week', '1 Month'];

export default function HistoryScreen() {
  const [activeTab, setActiveTab] = useState('1 Week');
  const { currentSteps, currentDistance, manualSync } = useStepContext();
  const { trips, addTrip, loading: tripsLoading } = useTrips();
  const { weeklyData, increase, loading: historyLoading, seedDummyData } = useHistory();

  const [modalVisible, setModalVisible] = useState(false);
  const [newTrip, setNewTrip] = useState({ title: '', distance: '', timeRange: '8:00 AM - 9:00 AM', avgBpm: '95' });

  const handleManualSync = async () => {
    try {
      await manualSync();
      Alert.alert("Sync Started", "Fetching latest data from your watch...");
    } catch (error) {
      Alert.alert("Sync Error", "Could not connect to Health Connect.");
    }
  };

  const handleSeed = async () => {
    await seedDummyData();
    Alert.alert("Success", "Dummy historical data has been inserted!");
  };

  const handleAddTrip = async () => {
    if (newTrip.title && newTrip.distance) {
      // Wrap the 4 values into ONE object { }
      await addTrip({
        title: newTrip.title,
        distance: parseFloat(newTrip.distance),
        timeRange: newTrip.timeRange,
        avgBpm: parseInt(newTrip.avgBpm)
      });

      setModalVisible(false);
      setNewTrip({ title: '', distance: '', timeRange: '8:00 AM - 9:00 AM', avgBpm: '95' });
    }
  };


  // Filter logic for metrics row based on tabs
  const getStatsForTab = () => {
    switch (activeTab) {
      case '1 Week':
        return { dist: currentDistance, steps: currentSteps };
      case '2 Week':
        const w2 = weeklyData.find(d => d.weekLabel === 'Last Week');
        return { dist: (currentDistance + (w2?.distance || 0)).toFixed(2), steps: currentSteps + (w2?.steps || 0) };
      case '3 Week':
        const w3 = weeklyData.filter(d => d.weekLabel.includes('Week'));
        const dist3 = w3.reduce((acc, curr) => acc + curr.distance, currentDistance);
        const steps3 = w3.reduce((acc, curr) => acc + curr.steps, currentSteps);
        return { dist: dist3.toFixed(2), steps: steps3 };
      case '1 Month':
        const totalDist = weeklyData.reduce((acc, curr) => acc + curr.distance, currentDistance);
        const totalSteps = weeklyData.reduce((acc, curr) => acc + curr.steps, currentSteps);
        return { dist: totalDist.toFixed(2), steps: totalSteps };
      default:
        return { dist: currentDistance, steps: currentSteps };
    }
  };

  const stats = getStatsForTab();
  const distPerHour = (parseFloat(stats.dist.toString()) / 1.5).toFixed(2);


  // Calculate workout intensity
  const getIntensity = (steps: number) => {
    if (steps < 2000) return { label: 'Low', color: '#F97316' }; // Orange
    if (steps < 7000) return { label: 'Normal', color: '#22C55E' }; // Green
    return { label: 'High', color: '#3B82F6' }; // Blue
  };
  const intensity = getIntensity(currentSteps);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Step</Text>
          <View style={{ flexDirection: 'row' }}>
            <TouchableOpacity onPress={handleManualSync} style={[styles.notificationButton, { marginRight: 12 }]}>
              <MaterialCommunityIcons name="watch-variant" size={24} color={colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSeed} style={styles.notificationButton}>
              <Feather name="database" size={24} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Activity & Steps */}
        <Text style={styles.activitySubtitle}>Walk & Run Activity</Text>
        <View style={styles.stepsContainer}>
          <FontAwesome5 name="running" size={32} color={colors.primary} style={styles.runIcon} />
          <Text style={styles.stepCount}>
            {currentSteps}
          </Text>
          <Text style={styles.stepLabel}>Steps</Text>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          {TABS.map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.activeTab]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Distance Increase Card */}
        <View style={styles.increaseCard}>
          <View style={styles.increaseIconContainer}>
            <Feather name="trending-up" size={24} color={colors.white} />
          </View>
          <View style={styles.increaseTextContainer}>
            <Text style={styles.increaseTitle}>Distance Increase {increase}%</Text>
            <Text style={styles.increaseSubtitle}>Real-time: {currentDistance} Km</Text>
          </View>
          <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.addTripButton}>
            <Feather name="plus-circle" size={28} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Metrics Row */}
        <View style={styles.metricsRow}>
          <View style={styles.metricItem}>
            <Text style={styles.metricItemLabel}>Dist ({activeTab})</Text>
            <Text style={styles.metricItemValue}>{stats.dist} <Text style={styles.metricItemUnit}>Km</Text></Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricItemLabel}>Dist / hr</Text>
            <Text style={styles.metricItemValue}>{distPerHour} <Text style={styles.metricItemUnit}>Km</Text></Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricItemLabel}>Intensity</Text>
            <Text style={[styles.metricItemValue, { color: intensity.color }]}>{intensity.label}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Recent Activities Horizontal Scroll */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.recentActivities}>
          {tripsLoading ? (
            <ActivityIndicator color={colors.primary} style={{ marginLeft: 20 }} />
          ) : trips.length > 0 ? (
            trips.map(trip => (
              <View key={trip.id} style={styles.activityCard}>
                <View style={styles.activityIconCircle}>
                  <MaterialCommunityIcons name="map-marker-distance" size={24} color={colors.primary} />
                </View>
                <Text style={styles.activityTime}>{trip.timeRange}</Text>
                <Text style={styles.activityName}>{trip.title}</Text>
                <Text style={styles.activityDetails}>AVG {trip.avgBpm} BPM - {trip.distance} Km</Text>
              </View>
            ))
          ) : (
            <View style={[styles.activityCard, { justifyContent: 'center' }]}>
              <Text style={styles.activityName}>No trips logged yet</Text>
            </View>
          )}
        </ScrollView>

        {/* Add Trip Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Log a Commute / Trip</Text>

              <TextInput
                style={styles.input}
                placeholder="Trip Title (e.g. Office Commute)"
                value={newTrip.title}
                onChangeText={(text) => setNewTrip({ ...newTrip, title: text })}
              />
              <TextInput
                style={styles.input}
                placeholder="Distance (Km)"
                keyboardType="numeric"
                value={newTrip.distance}
                onChangeText={(text) => setNewTrip({ ...newTrip, distance: text })}
              />
              <TextInput
                style={styles.input}
                placeholder="Time Range (e.g. 9 AM - 10 AM)"
                value={newTrip.timeRange}
                onChangeText={(text) => setNewTrip({ ...newTrip, timeRange: text })}
              />

              <View style={styles.modalButtons}>
                <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={() => setModalVisible(false)}>
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={handleAddTrip}>
                  <Text style={styles.buttonText}>Log Trip</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Highlights */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Highlights</Text>
          <TouchableOpacity><Text style={styles.seeAll}>See All</Text></TouchableOpacity>
        </View>
        <Text style={styles.highlightsDesc}>
          Your daily distance is improving, great job!{'\n'}
          Compared to last week, you've increased your distance by {increase}%!
        </Text>

        <View style={[styles.increaseCard, { marginTop: 16, marginBottom: 100, backgroundColor: colors.white }]}>
          <View>
            <Text style={[styles.increaseTitle, { fontSize: 24, color: colors.text }]}>3.2 <Text style={{ fontSize: 14, color: colors.textSecondary, fontWeight: 'normal' }}>Km/day</Text></Text>
          </View>
          <View style={[styles.tab, styles.activeTab, { paddingVertical: 8, paddingHorizontal: 16 }]}>
            <Text style={styles.activeTabText}>11 - 17 September</Text>
          </View>
        </View>

      </ScrollView>
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
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  activitySubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  stepsContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 24,
  },
  runIcon: {
    marginRight: 12,
  },
  stepCount: {
    fontSize: 48,
    fontWeight: 'bold',
    color: colors.text,
    marginRight: 8,
  },
  stepLabel: {
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 30,
    padding: 4,
    marginBottom: 24,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 26,
  },
  activeTab: {
    backgroundColor: colors.primary,
  },
  tabText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  activeTabText: {
    color: colors.white,
  },
  increaseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: 16,
    borderRadius: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  increaseIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  increaseTextContainer: {
    flex: 1,
  },
  increaseTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  increaseSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  metricItem: {
    flex: 1,
  },
  metricItemLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  metricItemValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  metricItemUnit: {
    fontSize: 14,
    fontWeight: 'normal',
    color: colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginBottom: 24,
  },
  recentActivities: {
    marginBottom: 32,
    marginHorizontal: -24,
    paddingHorizontal: 24,
  },
  activityCard: {
    width: width * 0.6,
    marginRight: 16,
  },
  activityMapPlaceholder: {
    height: 120,
    backgroundColor: '#E5E5EA',
    borderRadius: 16,
    marginBottom: 12,
  },
  activityTime: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  activityName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  activityDetails: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  seeAll: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  highlightsDesc: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  addTripButton: {
    padding: 4,
  },
  activityIconCircle: {
    width: 120,
    height: 120,
    borderRadius: 16,
    backgroundColor: '#F0F9FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F1F5F9',
    marginRight: 10,
  },
  saveButton: {
    backgroundColor: colors.primary,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.white,
  },
});

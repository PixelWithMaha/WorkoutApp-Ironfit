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
  Alert,
  Image,
  useWindowDimensions
} from 'react-native';
import { Feather, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useStepContext } from '../context/StepContext';
import { useTrips } from '../hooks/useTrips';
import { useHistory } from '../hooks/useHistory';
import { useTheme } from '../context/ThemeContext';
import { StatusBar } from 'react-native';



const TABS = ['1 Week', '2 Week', '3 Week', '1 Month'];

export default function HistoryScreen() {
  const { theme, darkMode } = useTheme();
  const { width } = useWindowDimensions();
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

  const getIntensity = (steps: number) => {
    if (steps < 2000) return { label: 'Low', color: '#F97316' }; 
    if (steps < 7000) return { label: 'Normal', color: '#22C55E' }; 
    return { label: 'High', color: theme.primary }; 
  };
  const intensity = getIntensity(currentSteps);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={darkMode ? 'light-content' : 'dark-content'} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Step</Text>
          <View style={{ flexDirection: 'row' }}>
            <TouchableOpacity onPress={handleManualSync} style={[styles.notificationButton, { marginRight: 12, backgroundColor: theme.card }]}>
              <MaterialCommunityIcons name="watch-variant" size={24} color={theme.primary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSeed} style={[styles.notificationButton, { backgroundColor: theme.card }]}>
              <Feather name="database" size={24} color={theme.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {}
        <Text style={[styles.activitySubtitle, { color: theme.subtext }]}>Walk & Run Activity</Text>
        <View style={styles.stepsContainer}>
          <FontAwesome5 name="running" size={32} color={theme.primary} style={styles.runIcon} />
          <Text style={[styles.stepCount, { color: theme.text }]}>
            {currentSteps}
          </Text>
          <Text style={[styles.stepLabel, { color: theme.subtext }]}>Steps</Text>
        </View>

        <View style={[styles.tabsContainer, { backgroundColor: theme.card }]}>
          {TABS.map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && { backgroundColor: theme.primary }]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, { color: activeTab === tab ? colors.white : theme.subtext }]}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={[styles.increaseCard, { backgroundColor: theme.card }]}>
          <View style={[styles.increaseIconContainer, { backgroundColor: theme.primary }]}>
            <Feather name="trending-up" size={24} color={colors.white} />
          </View>
          <View style={styles.increaseTextContainer}>
            <Text style={[styles.increaseTitle, { color: theme.text }]}>Distance Increase {increase}%</Text>
            <Text style={[styles.increaseSubtitle, { color: theme.subtext }]}>Real-time: {currentDistance} Km</Text>
          </View>
          <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.addTripButton}>
            <Feather name="plus-circle" size={28} color={theme.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.metricsRow}>
          <View style={styles.metricItem}>
            <Text style={[styles.metricItemLabel, { color: theme.subtext }]}>Dist ({activeTab})</Text>
            <Text style={[styles.metricItemValue, { color: theme.text }]}>{stats.dist} <Text style={[styles.metricItemUnit, { color: theme.subtext }]}>Km</Text></Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={[styles.metricItemLabel, { color: theme.subtext }]}>Dist / hr</Text>
            <Text style={[styles.metricItemValue, { color: theme.text }]}>{distPerHour} <Text style={[styles.metricItemUnit, { color: theme.subtext }]}>Km</Text></Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={[styles.metricItemLabel, { color: theme.subtext }]}>Intensity</Text>
            <Text style={[styles.metricItemValue, { color: intensity.color }]}>{intensity.label}</Text>
          </View>
        </View>

        <View style={[styles.divider, { backgroundColor: theme.border }]} />

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.recentActivities}>
          {tripsLoading ? (
            <ActivityIndicator color={theme.primary} style={{ marginLeft: 20 }} />
          ) : trips.length > 0 ? (
            trips.map(trip => (
              <View key={trip.id} style={styles.activityCard}>
                <View style={[styles.activityIconCircle, { backgroundColor: theme.card }]}>
                  <MaterialCommunityIcons name="map-marker-distance" size={24} color={theme.primary} />
                </View>
                <Text style={[styles.activityTime, { color: theme.subtext }]}>{trip.timeRange}</Text>
                <Text style={[styles.activityName, { color: theme.text }]}>{trip.title}</Text>
                <Text style={[styles.activityDetails, { color: theme.subtext }]}>AVG {trip.avgBpm} BPM - {trip.distance} Km</Text>
              </View>
            ))
          ) : (
            <View style={[styles.activityCard, { justifyContent: 'center' }]}>
              <Text style={[styles.activityName, { color: theme.text }]}>No trips logged yet</Text>
            </View>
          )}
        </ScrollView>

        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Log a Commute / Trip</Text>

              <TextInput
                style={[styles.input, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                placeholder="Trip Title (e.g. Office Commute)"
                placeholderTextColor={theme.subtext}
                value={newTrip.title}
                onChangeText={(text) => setNewTrip({ ...newTrip, title: text })}
              />
              <TextInput
                style={[styles.input, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                placeholder="Distance (Km)"
                placeholderTextColor={theme.subtext}
                keyboardType="numeric"
                value={newTrip.distance}
                onChangeText={(text) => setNewTrip({ ...newTrip, distance: text })}
              />
              <TextInput
                style={[styles.input, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                placeholder="Time Range (e.g. 9 AM - 10 AM)"
                placeholderTextColor={theme.subtext}
                value={newTrip.timeRange}
                onChangeText={(text) => setNewTrip({ ...newTrip, timeRange: text })}
              />

              <View style={styles.modalButtons}>
                <TouchableOpacity style={[styles.button, styles.cancelButton, { backgroundColor: theme.background }]} onPress={() => setModalVisible(false)}>
                  <Text style={[styles.buttonText, { color: theme.text }]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.button, styles.saveButton, { backgroundColor: theme.primary }]} onPress={handleAddTrip}>
                  <Text style={styles.buttonText}>Log Trip</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Highlights</Text>
          <TouchableOpacity><Text style={[styles.seeAll, { color: theme.primary }]}>See All</Text></TouchableOpacity>
        </View>
        <Text style={[styles.highlightsDesc, { color: theme.subtext }]}>
          Your daily distance is improving, great job!{'\n'}
          Compared to last week, you've increased your distance by {increase}%!
        </Text>

        <View style={[styles.increaseCard, { marginTop: 16, marginBottom: 100, backgroundColor: theme.card }]}>
          <View>
            <Text style={[styles.increaseTitle, { fontSize: 24, color: theme.text }]}>3.2 <Text style={{ fontSize: 14, color: theme.subtext, fontWeight: 'normal' }}>Km/day</Text></Text>
          </View>
          <View style={[styles.tab, { backgroundColor: theme.primary, paddingVertical: 8, paddingHorizontal: 16 }]}>
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
    width: 150,
    marginRight: 20,
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
    width: 150,
    height: 150,
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
    backgroundColor: '#E2E8F0',
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
  cancelButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#475569',
  },
});

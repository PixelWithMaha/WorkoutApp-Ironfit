import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Switch,
  Linking,
  AppState,
  Modal,
  ActivityIndicator,
  Animated,
  Platform
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { useStepContext } from '../context/StepContext';
import { useTheme } from '../context/ThemeContext';
import { useNavigation } from '@react-navigation/native';

export default function HybridTrackerScreen() {
  const { theme, darkMode } = useTheme();
  const navigation = useNavigation();
  const {
    currentSteps,
    phoneSteps,
    watchSteps,
    isUsingWatchData,
    setIsUsingWatchData,
    isStale,
    isSyncing,
    manualSync
  } = useStepContext();

  const [showSyncModal, setShowSyncModal] = useState(false);
  const appState = useRef(AppState.currentState);
  const isSyncingRef = useRef(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {

        handleReturnToApp();
      }
      appState.current = nextAppState;
    });

    return () => subscription.remove();
  }, []);

  const handleReturnToApp = async () => {
    if (isSyncingRef.current) return;

    isSyncingRef.current = true;
    setShowSyncModal(true);

    try {
      await manualSync();
    } finally {
      setTimeout(() => {
        setShowSyncModal(false);
        isSyncingRef.current = false;
      }, 1500);
    }
  };

  const animateToggle = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 1.05, duration: 100, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>Hybrid Step Tracker</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        {/* Main Display */}
        <Animated.View style={[
          styles.mainCard,
          { backgroundColor: theme.card, transform: [{ scale: scaleAnim }] }
        ]}>
          <Text style={[styles.stepsLabel, { color: theme.subtext }]}>
            {isUsingWatchData ? "Watch Steps" : "Phone Steps"}
          </Text>
          <Text style={[styles.stepsValue, { color: theme.primary }]}>
            {currentSteps.toLocaleString()}
          </Text>
          <View style={styles.sourceIndicator}>
            <Ionicons
              name={isUsingWatchData ? "watch" : "phone-portrait"}
              size={20}
              color={theme.primary}
            />
            <Text style={[styles.sourceText, { color: theme.primary }]}>
              Live {isUsingWatchData ? "Watch" : "Accelerometer"}
            </Text>
          </View>
        </Animated.View>

        {/* Source Toggle */}
        <View style={[styles.toggleCard, { backgroundColor: theme.card }]}>
          <View style={styles.toggleRow}>
            <View>
              <Text style={[styles.toggleTitle, { color: theme.text }]}>Use Watch Data</Text>
              <Text style={[styles.toggleSub, { color: theme.subtext }]}>
                Syncs with Mi Fitness / Health Connect
              </Text>
            </View>
            <Switch
              value={isUsingWatchData}
              onValueChange={(val) => {
                setIsUsingWatchData(val);
                animateToggle();
              }}
              trackColor={{ false: '#CBD5E1', true: theme.primary + '80' }}
              thumbColor={isUsingWatchData ? theme.primary : '#F4F3F4'}
            />
          </View>
        </View>


        <View style={[styles.infoCard, { backgroundColor: theme.card }]}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={[styles.statLabel, { color: theme.subtext }]}>Phone</Text>
              <Text style={[styles.statValue, { color: theme.text }]}>{phoneSteps}</Text>
            </View>
            <View style={[styles.divider, { backgroundColor: theme.border }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statLabel, { color: theme.subtext }]}>Watch</Text>
              <Text style={[styles.statValue, { color: theme.text }]}>{watchSteps}</Text>
            </View>
          </View>

          {isUsingWatchData && isStale && (
            <View style={styles.warningBox}>
              <Feather name="alert-triangle" size={18} color="#EF4444" />
              <Text style={styles.warningText}>Watch data is stale. Please sync now.</Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.syncButton, { backgroundColor: theme.primary }]}
            onPress={handleReturnToApp}
          >
            <MaterialCommunityIcons name="sync" size={22} color="white" />
            <Text style={styles.syncButtonText}>Sync Watch Data</Text>
          </TouchableOpacity>
          <Text style={[styles.syncHint, { color: theme.subtext }]}>
            Fetches latest data from Health Connect
          </Text>
        </View>
      </View>

      <Modal visible={showSyncModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <ActivityIndicator size="large" color={theme.primary} />
            <Text style={[styles.modalText, { color: theme.text }]}>Updating from Health Connect...</Text>
            <Text style={[styles.modalSub, { color: theme.subtext }]}>Fetching your latest metrics</Text>
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
    paddingVertical: 15,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 20,
    gap: 20,
  },
  mainCard: {
    borderRadius: 30,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  stepsLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  stepsValue: {
    fontSize: 64,
    fontWeight: '900',
    letterSpacing: -1,
  },
  sourceIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    gap: 6,
  },
  sourceText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  toggleCard: {
    borderRadius: 20,
    padding: 20,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggleTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  toggleSub: {
    fontSize: 12,
    marginTop: 2,
  },
  infoCard: {
    borderRadius: 24,
    padding: 24,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 13,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  divider: {
    width: 1,
    height: '100%',
  },
  warningBox: {
    flexDirection: 'row',
    backgroundColor: '#FEF2F2',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
  },
  warningText: {
    color: '#B91C1C',
    fontSize: 13,
    fontWeight: '500',
  },
  syncButton: {
    flexDirection: 'row',
    height: 60,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  syncButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  syncHint: {
    textAlign: 'center',
    fontSize: 12,
    marginTop: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    padding: 30,
    borderRadius: 24,
    alignItems: 'center',
    gap: 15,
  },
  modalText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalSub: {
    fontSize: 13,
    textAlign: 'center',
  }
});

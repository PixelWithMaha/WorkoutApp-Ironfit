import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { AppState, Platform } from 'react-native';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import {
  initialize,
  requestPermission,
  readRecords
} from 'react-native-health-connect';

interface StepContextData {
  currentSteps: number;
  currentCalories: number;
  currentDistance: number;
  currentHeartRate: number;
  notifications: any[];
  isSyncing: boolean;
  manualSync: () => Promise<void>;
  syncStepsToFirestore: (steps: number, calories?: number, heartRate?: number) => Promise<void>;
  clearNotifications: () => void;
}

const StepContext = createContext<StepContextData | undefined>(undefined);

export function StepProvider({ children }: { children: React.ReactNode }) {
  const [currentSteps, setCurrentSteps] = useState(0);
  const [currentCalories, setCurrentCalories] = useState(0);
  const [currentDistance, setCurrentDistance] = useState(0);
  const [currentHeartRate, setCurrentHeartRate] = useState(0);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const stepsRef = useRef(0);
  const lastSyncedSteps = useRef(0);

  const CALORIES_PER_STEP = 0.045;
  const DISTANCE_PER_STEP = 0.000762;

  useEffect(() => {
    stepsRef.current = currentSteps;
    // We only set distance here. Calories will be fetched from watch or calculated as fallback.
    setCurrentDistance(parseFloat((currentSteps * DISTANCE_PER_STEP).toFixed(2)));
  }, [currentSteps]);

  const addNotification = (title: string, message: string, type: 'workout' | 'water' | 'goal' | 'motivation' | 'warning' | 'info' = 'info') => {
    const newNotif = {
      id: Date.now().toString() + Math.random(),
      title,
      message,
      type,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setNotifications(prev => [newNotif, ...prev].slice(0, 10));
  };

  const clearNotifications = () => setNotifications([]);

  useEffect(() => {
    if (isLoaded) {
      const checkGoal = () => {
        if (currentSteps >= 10000 && lastSyncedSteps.current < 10000) {
          addNotification("Goal Reached! 🏆", "You've crushed your 10,000 steps goal! Fantastic work.", "goal");
        } else if (currentSteps >= 5000 && lastSyncedSteps.current < 5000) {
          addNotification("Halfway Point", "You've hit 5,000 steps. You're making great progress!", "goal");
        }
      };
      checkGoal();
    }
  }, [isLoaded, currentSteps]);

  const syncWatchData = async () => {
    if (Platform.OS !== 'android') return;
    setIsSyncing(true);

    try {
      await initialize();
      await requestPermission([
        { accessType: 'read', recordType: 'Steps' },
        { accessType: 'read', recordType: 'ActiveCaloriesBurned' },
        { accessType: 'read', recordType: 'HeartRate' },
        { accessType: 'read', recordType: 'Distance' }
      ]);

      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const endTime = new Date().toISOString();
      const startTime = startOfDay.toISOString();

      // 1. Fetch Steps
      const stepsResponse = await readRecords('Steps', {
        timeRangeFilter: { operator: 'between', startTime, endTime },
      });

      // 2. Fetch Calories
      const caloriesResponse = await readRecords('ActiveCaloriesBurned', {
        timeRangeFilter: { operator: 'between', startTime, endTime },
      });

      // 3. Fetch Heart Rate
      const heartRateResponse = await readRecords('HeartRate', {
        timeRangeFilter: { operator: 'between', startTime, endTime },
      });

      // 4. Fetch Distance
      const distanceResponse = await readRecords('Distance', {
        timeRangeFilter: { operator: 'between', startTime, endTime },
      });

      const miFitnessSource = 'com.xiaomi.wearable';
      const miHealthSource = 'com.mi.health';

      // Process Steps
      const stepSourceAudit: { [key: string]: number } = {};
      stepsResponse.records.forEach((record: any) => {
        const origin = record.metadata?.dataOrigin || 'unknown';
        stepSourceAudit[origin] = (stepSourceAudit[origin] || 0) + (record.count || 0);
      });

      let officialSteps = stepSourceAudit[miFitnessSource] || stepSourceAudit[miHealthSource] || Math.max(...Object.values(stepSourceAudit), 0);

      // Process Calories
      const calorieSourceAudit: { [key: string]: number } = {};
      caloriesResponse.records.forEach((record: any) => {
        const origin = record.metadata?.dataOrigin || 'unknown';
        calorieSourceAudit[origin] = (calorieSourceAudit[origin] || 0) + (record.energy?.kilocalories || 0);
      });

      let officialCalories = calorieSourceAudit[miFitnessSource] || calorieSourceAudit[miHealthSource] || Math.max(...Object.values(calorieSourceAudit), 0);

      // If watch reported 0 calories but had steps, use fallback calculation
      if (officialCalories === 0 && officialSteps > 0) {
        officialCalories = parseFloat((officialSteps * CALORIES_PER_STEP).toFixed(2));
      }

      // Process Distance
      const distanceSourceAudit: { [key: string]: number } = {};
      distanceResponse.records.forEach((record: any) => {
        const origin = record.metadata?.dataOrigin || 'unknown';
        distanceSourceAudit[origin] = (distanceSourceAudit[origin] || 0) + (record.distance?.inKilometers || 0);
      });

      let officialDistance = distanceSourceAudit[miFitnessSource] || distanceSourceAudit[miHealthSource] || Math.max(...Object.values(distanceSourceAudit), 0);

      if (officialDistance === 0 && officialSteps > 0) {
        officialDistance = parseFloat((officialSteps * DISTANCE_PER_STEP).toFixed(2));
      }

      // Process Heart Rate
      let officialHeartRate = 0;
      if (heartRateResponse.records.length > 0) {
        // Find latest sample from preferred sources or just latest overall
        const miSamples = heartRateResponse.records.filter((r: any) =>
          r.metadata?.dataOrigin === miFitnessSource || r.metadata?.dataOrigin === miHealthSource
        );
        const targetRecords = miSamples.length > 0 ? miSamples : heartRateResponse.records;
        const latestRecord = targetRecords[targetRecords.length - 1];
        if (latestRecord.samples && latestRecord.samples.length > 0) {
          officialHeartRate = latestRecord.samples[latestRecord.samples.length - 1].beatsPerMinute;
        }
      }

      console.log(`[Watch Sync] Steps: ${officialSteps}, Cal: ${officialCalories}, Dist: ${officialDistance}, HR: ${officialHeartRate}`);

      // Update state
      setCurrentSteps(officialSteps);
      setCurrentCalories(officialCalories);
      setCurrentDistance(officialDistance);
      if (officialHeartRate > 0) setCurrentHeartRate(officialHeartRate);

      // Sync to Firestore if changed
      if (officialSteps !== lastSyncedSteps.current || officialHeartRate !== currentHeartRate) {
        await syncStepsToFirestore(officialSteps, officialCalories, officialHeartRate, officialDistance);
        lastSyncedSteps.current = officialSteps;
      }

    } catch (error) {
      console.log("[StepContext] Sync error:", error);
    } finally {
      setIsSyncing(false);
    }
  };

  const syncStepsToFirestore = async (steps: number, calories?: number, heartRate?: number, distance?: number) => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    try {
      const cal = calories !== undefined ? calories : parseFloat((steps * CALORIES_PER_STEP).toFixed(2));
      const dist = distance !== undefined ? distance : parseFloat((steps * DISTANCE_PER_STEP).toFixed(2));

      const docRef = doc(db, `users/${userId}/weeklySummary/currentWeek`);
      await setDoc(docRef, {
        steps,
        calories: cal,
        distance: dist,
        heartRate: heartRate || currentHeartRate,
        lastUpdated: new Date().toISOString()
      }, { merge: true });

      // Also update main user metrics for real-time dashboard
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        "metrics.calories": cal,
        "metrics.heartRate": heartRate || currentHeartRate,
        "metrics.steps": steps,
        "metrics.distance": dist
      }).catch(() => { }); // Ignore if user doc structure differs

    } catch (error) {
      console.error("[StepContext] Firebase Error:", error);
    }
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      const userId = auth.currentUser?.uid;
      if (!userId) {
        setIsLoaded(true);
        return;
      }
      try {
        const docRef = doc(db, `users/${userId}/weeklySummary/currentWeek`);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setCurrentSteps(data.steps || 0);
          setCurrentCalories(data.calories || 0);
          setCurrentHeartRate(data.heartRate || 0);
          lastSyncedSteps.current = data.steps || 0;
        }
      } catch (err) {
        console.error("[StepContext] Initial Fetch Error:", err);
      } finally {
        setIsLoaded(true);
      }
    };

    fetchInitialData();
  }, [auth.currentUser?.uid]);

  useEffect(() => {
    if (isLoaded) {
      syncWatchData();
      const interval = setInterval(syncWatchData, 120000); // Auto sync every 2 mins
      return () => clearInterval(interval);
    }
  }, [isLoaded]);

  return (
    <StepContext.Provider value={{
      currentSteps,
      currentCalories,
      currentDistance,
      currentHeartRate,
      notifications,
      isSyncing,
      manualSync: syncWatchData,
      syncStepsToFirestore,
      clearNotifications
    }}>
      {children}
    </StepContext.Provider>
  );
}

export const useStepContext = () => {
  const context = useContext(StepContext);
  if (!context) throw new Error("useStepContext must be used within StepProvider");
  return context;
};
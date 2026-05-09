import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { AppState, Platform } from 'react-native';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import {
  initialize,
  requestPermission,
  readRecords
} from 'react-native-health-connect';
import { Accelerometer } from 'expo-sensors';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface StepContextData {
  currentSteps: number;
  phoneSteps: number;
  watchSteps: number;
  isUsingWatchData: boolean;
  setIsUsingWatchData: (val: boolean) => void;
  isStale: boolean;
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
      if (currentSteps >= 10000 && lastSyncedSteps.current < 10000) {
        addNotification("Goal Reached! 🏆", "You've crushed your 10,000 steps goal! Fantastic work.", "goal");
      } else if (currentSteps >= 5000 && lastSyncedSteps.current < 5000) {
        addNotification("Halfway Point", "You've hit 5,000 steps. You're making great progress!", "goal");
      }
    }
  }, [isLoaded, currentSteps]);


  useEffect(() => {
    const fetchInitialData = async () => {
      const userId = auth.currentUser?.uid;
      if (!userId) { setIsLoaded(true); return; }
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
      const interval = setInterval(syncWatchData, 120000);
      return () => clearInterval(interval);
    }
  }, [isLoaded]);


  const [phoneSteps, setPhoneSteps] = useState(0);
  const [watchSteps, setWatchSteps] = useState(0);
  const [isUsingWatchData, setIsUsingWatchData] = useState(true);
  const [isStale, setIsStale] = useState(false);

  const CALORIES_PER_STEP = 0.045;
  const DISTANCE_PER_STEP = 0.000762;
  const STEP_THRESHOLD = 1.25;
  const RESET_THRESHOLD = 1.1;


  const phoneStepsRef = useRef(0);
  const lastMagnitude = useRef(0);
  const isStepAbove = useRef(false);


  useEffect(() => {
    phoneStepsRef.current = phoneSteps;
  }, [phoneSteps]);


  useEffect(() => {
    const stepsToUse = isUsingWatchData ? watchSteps : phoneSteps;
    setCurrentSteps(stepsToUse);
    stepsRef.current = stepsToUse;
    setCurrentDistance(parseFloat((stepsToUse * DISTANCE_PER_STEP).toFixed(2)));
  }, [phoneSteps, watchSteps, isUsingWatchData]);

  const savePhoneStepsToFirestore = useCallback(async (steps: number) => {
    const userId = auth.currentUser?.uid;
    if (!userId || steps === 0) return;
    try {
      const docRef = doc(db, `users/${userId}/weeklySummary/currentWeek`);
      await setDoc(docRef, {
        phoneSteps: steps,
        phoneStepsDate: new Date().toDateString(),
        phoneStepsLastSaved: new Date().toISOString(),
      }, { merge: true });
      console.log(`[PhoneSteps] Saved ${steps} steps to Firestore`);
    } catch (error) {
      console.error("[PhoneSteps] Save error:", error);
    }
  }, []);


  useEffect(() => {
    if (!isLoaded) return;
    const loadPhoneSteps = async () => {
      try {
        const todayDate = new Date().toDateString();
        
        // 1. Try Local Storage first (instant, no network latency)
        const localDate = await AsyncStorage.getItem('@phoneStepsDate');
        const localSteps = await AsyncStorage.getItem('@phoneSteps');
        
        let initialSteps = 0;
        
        if (localDate === todayDate && localSteps) {
          initialSteps = parseInt(localSteps, 10);
          console.log(`[PhoneSteps] Restored ${initialSteps} steps from AsyncStorage`);
        } else {
          // 2. Try Firestore fallback if local storage is missing or new day
          const userId = auth.currentUser?.uid;
          if (userId) {
            const docRef = doc(db, `users/${userId}/weeklySummary/currentWeek`);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
              const data = docSnap.data();
              if (data.phoneStepsDate === todayDate && data.phoneSteps) {
                initialSteps = data.phoneSteps;
                console.log(`[PhoneSteps] Restored ${initialSteps} steps from Firestore`);
              }
            }
          }
        }
        
        setPhoneSteps(initialSteps);
        phoneStepsRef.current = initialSteps;
        
        // Sync local storage to ensure it's up-to-date
        await AsyncStorage.setItem('@phoneStepsDate', todayDate);
        await AsyncStorage.setItem('@phoneSteps', initialSteps.toString());
        
      } catch (error) {
        console.error("[PhoneSteps] Load error:", error);
      }
    };
    loadPhoneSteps();
  }, [isLoaded]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'background' || nextState === 'inactive') {
        const steps = phoneStepsRef.current;
        if (steps > 0) {
          console.log(`[PhoneSteps] App backgrounded — saving ${steps} steps`);
          savePhoneStepsToFirestore(steps);
        }
      }
    });
    return () => subscription.remove();
  }, [savePhoneStepsToFirestore]);

  useEffect(() => {
    let subscription: any;
    Accelerometer.setUpdateInterval(100);
    subscription = Accelerometer.addListener(data => {
      const magnitude = Math.sqrt(data.x * data.x + data.y * data.y + data.z * data.z);
      if (magnitude > STEP_THRESHOLD && !isStepAbove.current) {
        isStepAbove.current = true;
        setPhoneSteps(prev => {
          const newSteps = prev + 1;
          AsyncStorage.setItem('@phoneSteps', newSteps.toString());
          AsyncStorage.setItem('@phoneStepsDate', new Date().toDateString());
          return newSteps;
        });
      } else if (magnitude < RESET_THRESHOLD) {
        isStepAbove.current = false;
      }
      lastMagnitude.current = magnitude;
    });
    return () => subscription && subscription.remove();
  }, []);


  useEffect(() => {
    const interval = setInterval(() => {
      const steps = phoneStepsRef.current;
      if (steps > 0) savePhoneStepsToFirestore(steps);
    }, 360000);
    return () => clearInterval(interval);
  }, [savePhoneStepsToFirestore]);

  const syncStepsToFirestore = useCallback(async (steps: number, calories?: number, heartRate?: number, distance?: number) => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;
    try {
      const cal = calories !== undefined ? calories : parseFloat((steps * CALORIES_PER_STEP).toFixed(2));
      const dist = distance !== undefined ? distance : parseFloat((steps * DISTANCE_PER_STEP).toFixed(2));
      const docRef = doc(db, `users/${userId}/weeklySummary/currentWeek`);
      await setDoc(docRef, {
        steps, calories: cal, distance: dist, heartRate: heartRate || currentHeartRate, lastUpdated: new Date().toISOString()
      }, { merge: true });
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        "metrics.calories": cal, "metrics.heartRate": heartRate || currentHeartRate, "metrics.steps": steps, "metrics.distance": dist
      }).catch(() => { });
    } catch (error) {
      console.error("[StepContext] Firebase Error:", error);
    }
  }, [auth.currentUser?.uid, currentHeartRate, CALORIES_PER_STEP, DISTANCE_PER_STEP]);

  const syncWatchData = useCallback(async () => {
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
      const stepsResponse = await readRecords('Steps', { timeRangeFilter: { operator: 'between', startTime, endTime } });
      const caloriesResponse = await readRecords('ActiveCaloriesBurned', { timeRangeFilter: { operator: 'between', startTime, endTime } });
      const heartRateResponse = await readRecords('HeartRate', { timeRangeFilter: { operator: 'between', startTime, endTime } });
      const distanceResponse = await readRecords('Distance', { timeRangeFilter: { operator: 'between', startTime, endTime } });
      const miFitnessSource = 'com.xiaomi.wearable';
      const miHealthSource = 'com.mi.health';
      const stepSourceAudit: { [key: string]: number } = {};
      stepsResponse.records.forEach((record: any) => {
        const origin = record.metadata?.dataOrigin || 'unknown';
        stepSourceAudit[origin] = (stepSourceAudit[origin] || 0) + (record.count || 0);
      });
      let officialSteps = stepSourceAudit[miFitnessSource] || stepSourceAudit[miHealthSource] || Math.max(...Object.values(stepSourceAudit), 0);
      const lastModified = stepsResponse.records.reduce((latest: number, record: any) => {
        const time = new Date(record.metadata?.lastModifiedTime || 0).getTime();
        return Math.max(latest, time);
      }, 0);
      const tenMinutesAgo = Date.now() - (10 * 60 * 1000);
      setIsStale(lastModified > 0 && lastModified < tenMinutesAgo);
      const calorieSourceAudit: { [key: string]: number } = {};
      caloriesResponse.records.forEach((record: any) => {
        const origin = record.metadata?.dataOrigin || 'unknown';
        calorieSourceAudit[origin] = (calorieSourceAudit[origin] || 0) + (record.energy?.kilocalories || 0);
      });
      let officialCalories = calorieSourceAudit[miFitnessSource] || calorieSourceAudit[miHealthSource] || Math.max(...Object.values(calorieSourceAudit), 0);
      if (officialCalories === 0 && officialSteps > 0) officialCalories = parseFloat((officialSteps * CALORIES_PER_STEP).toFixed(2));
      const distanceSourceAudit: { [key: string]: number } = {};
      distanceResponse.records.forEach((record: any) => {
        const origin = record.metadata?.dataOrigin || 'unknown';
        distanceSourceAudit[origin] = (distanceSourceAudit[origin] || 0) + (record.distance?.inKilometers || 0);
      });
      let officialDistance = distanceSourceAudit[miFitnessSource] || distanceSourceAudit[miHealthSource] || Math.max(...Object.values(distanceSourceAudit), 0);
      if (officialDistance === 0 && officialSteps > 0) officialDistance = parseFloat((officialSteps * DISTANCE_PER_STEP).toFixed(2));
      let officialHeartRate = 0;
      if (heartRateResponse.records.length > 0) {
        const miSamples = heartRateResponse.records.filter((r: any) => r.metadata?.dataOrigin === miFitnessSource || r.metadata?.dataOrigin === miHealthSource);
        const targetRecords = miSamples.length > 0 ? miSamples : heartRateResponse.records;
        const latestRecord = targetRecords[targetRecords.length - 1];
        if (latestRecord.samples && latestRecord.samples.length > 0) officialHeartRate = latestRecord.samples[latestRecord.samples.length - 1].beatsPerMinute;
      }
      setWatchSteps(officialSteps);
      setCurrentCalories(officialCalories);
      setCurrentDistance(officialDistance);
      if (officialHeartRate > 0) setCurrentHeartRate(officialHeartRate);
      const currentEffectiveSteps = isUsingWatchData ? officialSteps : phoneStepsRef.current;
      setIsStale(false);
      if (currentEffectiveSteps !== lastSyncedSteps.current || officialHeartRate !== currentHeartRate) {
        await syncStepsToFirestore(currentEffectiveSteps, officialCalories, officialHeartRate, officialDistance);
        lastSyncedSteps.current = currentEffectiveSteps;
      }
    } catch (error) {
      console.log("[StepContext] Sync error:", error);
    } finally {
      setIsSyncing(false);
    }
  }, [isUsingWatchData, currentHeartRate, syncStepsToFirestore, CALORIES_PER_STEP, DISTANCE_PER_STEP]);

  return (
    <StepContext.Provider value={{
      currentSteps,
      phoneSteps,
      watchSteps,
      isUsingWatchData,
      setIsUsingWatchData,
      isStale,
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
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { AppState, Platform } from 'react-native';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import {
  initialize,
  requestPermission,
  aggregateRecord,
  readRecords
} from 'react-native-health-connect';

interface StepContextData {
  currentSteps: number;
  currentCalories: number;
  currentDistance: number;
  notifications: any[];
  manualSync: () => Promise<void>;
  syncStepsToFirestore: (steps: number) => Promise<void>;
  clearNotifications: () => void;
}

const StepContext = createContext<StepContextData | undefined>(undefined);

export function StepProvider({ children }: { children: React.ReactNode }) {
  const [currentSteps, setCurrentSteps] = useState(0);
  const [currentCalories, setCurrentCalories] = useState(0);
  const [currentDistance, setCurrentDistance] = useState(0);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const stepsRef = useRef(0);
  const lastSyncedSteps = useRef(0);

  const CALORIES_PER_STEP = 0.045;
  const DISTANCE_PER_STEP = 0.000762;

  useEffect(() => {
    stepsRef.current = currentSteps;
    setCurrentCalories(parseFloat((currentSteps * CALORIES_PER_STEP).toFixed(2)));
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

  // Automation: Generate helpful reminders
  useEffect(() => {
    if (isLoaded) {
      // 1. Initial Motivation on Load
      setTimeout(() => {
        addNotification("Morning Motivation", "Believe in yourself and you will be unstoppable. Let's hit your goals!", "motivation");
      }, 3000);

      // 2. Goal Progress Checker
      const checkGoal = () => {
        if (currentSteps >= 10000 && lastSyncedSteps.current < 10000) {
          addNotification("Goal Reached! 🏆", "You've crushed your 10,000 steps goal! Fantastic work.", "goal");
        } else if (currentSteps >= 5000 && lastSyncedSteps.current < 5000) {
          addNotification("Halfway Point", "You've hit 5,000 steps. You're making great progress!", "goal");
        }
      };
      checkGoal();

      // 3. Water Intake (Every 45 mins)
      const waterTimer = setInterval(() => {
        addNotification("Hydration Reminder", "Time for a glass of water to keep your metabolism high.", "water");
      }, 2700000);

      return () => clearInterval(waterTimer);
    }
  }, [isLoaded, currentSteps]);

  const syncWatchData = async () => {
    if (Platform.OS !== 'android') return;

    try {
      await initialize();

      setTimeout(async () => {
        try {
          await requestPermission([{ accessType: 'read', recordType: 'Steps' }]);

          const startOfDay = new Date();
          startOfDay.setHours(0, 0, 0, 0);

          const response = await readRecords('Steps', {
            timeRangeFilter: {
              operator: 'between',
              startTime: startOfDay.toISOString(),
              endTime: new Date().toISOString(),
            },
          });

          const sourceAudit: { [key: string]: number } = {};
          response.records.forEach((record: any) => {
            const origin = record.metadata?.dataOrigin || 'unknown';
            const count = record.count || 0;
            sourceAudit[origin] = (sourceAudit[origin] || 0) + count;
          });

          console.log("--- HEALTH CONNECT SOURCE AUDIT ---");
          console.table(sourceAudit);

          const miFitnessSource = 'com.xiaomi.wearable';
          const miHealthSource = 'com.mi.health';

          let officialCount = 0;
          if (sourceAudit[miFitnessSource]) {
            officialCount = sourceAudit[miFitnessSource];
          } else if (sourceAudit[miHealthSource]) {
            officialCount = sourceAudit[miHealthSource];
          } else {
            officialCount = Math.max(...Object.values(sourceAudit), 0);
          }

          console.log(`[Clean Sync] Mi Fitness Total: ${officialCount}`);

          if (officialCount < stepsRef.current && officialCount > 0 && stepsRef.current > 0) {
            const diff = stepsRef.current - officialCount;
            if (diff > 10) {
              console.warn(`[StepContext] Inconsistency blocked. Watch: ${officialCount}, Local: ${stepsRef.current}`);
              addNotification(
                "Sync Inconsistency",
                `Your watch reported ${officialCount} steps, which is lower than the local ${stepsRef.current}. Syncing in progress...`,
                "warning"
              );
              return;
            }
          }

          if (officialCount > 0) {
            setCurrentSteps(officialCount);
            if (officialCount !== lastSyncedSteps.current) {
              await syncStepsToFirestore(officialCount);
              lastSyncedSteps.current = officialCount;
            }
          }
        } catch (err) {
          console.log("[StepContext] Error during raw read:", err);
        }
      }, 500);
    } catch (error) {
      console.log("[StepContext] Init error:", error);
    }
  };

  const syncStepsToFirestore = async (steps: number) => {
    const userId = auth.currentUser?.uid || 'test_user_123';
    try {
      const calories = parseFloat((steps * CALORIES_PER_STEP).toFixed(2));
      const distance = parseFloat((steps * DISTANCE_PER_STEP).toFixed(2));
      const docRef = doc(db, 'users', userId, 'weeklySummary', 'currentWeek');

      await setDoc(docRef, { steps, calories, distance }, { merge: true });
      console.log("[StepContext] Firestore Updated:", steps);
    } catch (error) {
      console.error("[StepContext] Firebase Error:", error);
    }
  };

  useEffect(() => {
    const fetchInitialSteps = async () => {
      const userId = auth.currentUser?.uid || 'test_user_123';
      try {
        const docRef = doc(db, 'users', userId, 'weeklySummary', 'currentWeek');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setCurrentSteps(data.steps || 0);
          lastSyncedSteps.current = data.steps || 0;
        }
      } finally {
        setIsLoaded(true);
      }
    };

    fetchInitialSteps();
  }, []);

  useEffect(() => {
    if (isLoaded) {
      syncWatchData();
      const interval = setInterval(syncWatchData, 120000);
      return () => clearInterval(interval);
    }
  }, [isLoaded]);

  return (
    <StepContext.Provider value={{
      currentSteps,
      currentCalories,
      currentDistance,
      notifications,
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
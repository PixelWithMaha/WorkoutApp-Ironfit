import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { AppState, Platform } from 'react-native';
import { Pedometer, Accelerometer } from 'expo-sensors';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import {
  initialize,
  requestPermission,
  aggregateRecord,
} from 'react-native-health-connect';

interface StepContextData {
  currentSteps: number;
  currentCalories: number;
  currentDistance: number;
  isHealthConnectActive: boolean;
  syncStepsToFirestore: (steps: number) => Promise<void>;
  manualSync: () => Promise<void>;
}

const StepContext = createContext<StepContextData>({
  currentSteps: 0,
  currentCalories: 0,
  currentDistance: 0,
  isHealthConnectActive: false,
  syncStepsToFirestore: async () => { },
  manualSync: async () => { }
});

export function StepProvider({ children }: { children: React.ReactNode }) {
  const [currentSteps, setCurrentSteps] = useState(0);
  const [currentCalories, setCurrentCalories] = useState(0);
  const [currentDistance, setCurrentDistance] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isHealthConnectActive, setIsHealthConnectActive] = useState(false);

  const stepsRef = useRef(0);
  const lastSyncedSteps = useRef(0);
  const initialStepsLoaded = useRef(0);

  const CALORIES_PER_STEP = 0.045;
  const DISTANCE_PER_STEP = 0.000762; // 0.762 meters per step in km

  // Keep ref in sync
  useEffect(() => {
    stepsRef.current = currentSteps;
  }, [currentSteps]);

  // Sync calories and distance
  useEffect(() => {
    setCurrentCalories(parseFloat((currentSteps * CALORIES_PER_STEP).toFixed(2)));
    setCurrentDistance(parseFloat((currentSteps * DISTANCE_PER_STEP).toFixed(2)));
  }, [currentSteps]);

  // Sync to Firestore on app state change
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState.match(/inactive|background/)) {
        if (isLoaded && stepsRef.current >= lastSyncedSteps.current) {
          syncStepsToFirestore(stepsRef.current);
        }
      }
    });

    return () => subscription.remove();
  }, [isLoaded]);

  // Health Connect Sync Logic (Watch-First)
  const syncWatchData = async () => {
    if (Platform.OS !== 'android') return;

    try {
      const isInitialized = await initialize();
      if (!isInitialized) return;

      setTimeout(async () => {
        try {
          await requestPermission([{ accessType: 'read', recordType: 'Steps' }]);

          const startOfDay = new Date();
          startOfDay.setHours(0, 0, 0, 0);

          const result = await aggregateRecord({
            recordType: 'Steps',
            timeRangeFilter: {
              operator: 'between',
              startTime: startOfDay.toISOString(),
              endTime: new Date().toISOString(),
            },
          });

          const totalWatchSteps = result?.COUNT_TOTAL || 0;
          console.log(`[Health Connect] Syncing. Watch: ${totalWatchSteps}, Local: ${stepsRef.current}`);

          if (totalWatchSteps > 0) {
            setIsHealthConnectActive(true);

            setCurrentSteps(totalWatchSteps);
            if (totalWatchSteps !== lastSyncedSteps.current) {
              syncStepsToFirestore(totalWatchSteps);
              lastSyncedSteps.current = totalWatchSteps;
            }
          }
        } catch (err) {
          console.error("[Health Connect] Aggregate error:", err);
        }
      }, 500);
    } catch (error) {
      console.error("[Health Connect] Init error:", error);
    }
  };

  const manualSync = async () => {
    console.log("[StepContext] Manual sync triggered...");
    await syncWatchData();
  };

  useEffect(() => {
    if (!isLoaded || Platform.OS !== 'android') return;
    syncWatchData();
    const interval = setInterval(syncWatchData, 120000);
    return () => clearInterval(interval);
  }, [isLoaded]);

  useEffect(() => {
    const fetchInitialSteps = async () => {
      const userId = auth.currentUser?.uid || 'test_user_123';
      try {
        const docRef = doc(db, 'users', userId, 'weeklySummary', 'currentWeek');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.steps !== undefined) {
            setCurrentSteps(data.steps);
            stepsRef.current = data.steps;
            lastSyncedSteps.current = data.steps;
            initialStepsLoaded.current = data.steps;
          }
        }
      } catch (error) {
        console.error("Error fetching initial steps:", error);
      } finally {
        setIsLoaded(true);
      }
    };
    fetchInitialSteps();
  }, [auth.currentUser?.uid]);


  useEffect(() => {
    if (!isLoaded || isHealthConnectActive) {
      console.log("[StepContext] Internal sensors disabled (Health Connect is active).");
      return;
    }

    let subscription: any = null;

    const subscribeToPedometer = async () => {
      let useFallback = false;
      const isAvailable = await Pedometer.isAvailableAsync();

      if (!isAvailable) {
        useFallback = true;
      } else {
        const { status } = await Pedometer.requestPermissionsAsync();
        if (status !== 'granted') {
          useFallback = true;
        }
      }

      if (useFallback) {
        Accelerometer.setUpdateInterval(150);
        let lastMag = 0;
        let lastStepTime = 0;

        subscription = Accelerometer.addListener((data) => {
          const { x, y, z } = data;
          const magnitude = Math.sqrt(x * x + y * y + z * z);
          const threshold = 1.25;

          if (magnitude > threshold && lastMag <= threshold) {
            const now = Date.now();
            if (now - lastStepTime > 300) {
              lastStepTime = now;
              setCurrentSteps((prev) => {
                const nextSteps = prev + 1;
                if (nextSteps - lastSyncedSteps.current >= 50) {
                  syncStepsToFirestore(nextSteps);
                  lastSyncedSteps.current = nextSteps;
                }
                return nextSteps;
              });
            }
          }
          lastMag = magnitude;
        });
      } else {
        subscription = Pedometer.watchStepCount((result) => {
          const totalSteps = initialStepsLoaded.current + result.steps;
          setCurrentSteps(totalSteps);
          if (totalSteps - lastSyncedSteps.current >= 10) {
            syncStepsToFirestore(totalSteps);
            lastSyncedSteps.current = totalSteps;
          }
        });
      }
    };

    subscribeToPedometer();
    return () => {
      if (subscription) subscription.remove();
    };
  }, [isLoaded, isHealthConnectActive]);

  const syncStepsToFirestore = async (steps: number) => {
    const userId = auth.currentUser?.uid || 'test_user_123';
    if (userId) {
      try {
        const calories = parseFloat((steps * CALORIES_PER_STEP).toFixed(2));
        const distance = parseFloat((steps * DISTANCE_PER_STEP).toFixed(2));
        const docRef = doc(db, 'users', userId, 'weeklySummary', 'currentWeek');
        await setDoc(docRef, { steps, calories, distance }, { merge: true });
        console.log("Firestore sync success:", steps);
      } catch (error) {
        console.error("Error syncing steps: ", error);
      }
    }
  };

  return (
    <StepContext.Provider value={{
      currentSteps,
      currentCalories,
      currentDistance,
      isHealthConnectActive,
      syncStepsToFirestore,
      manualSync
    }}>
      {children}
    </StepContext.Provider>
  );
}

export function useStepContext() {
  return useContext(StepContext);
}

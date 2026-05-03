import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Pedometer, Accelerometer } from 'expo-sensors';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db, auth } from '../config/firebase';

interface StepContextData {
  currentSteps: number;
  currentCalories: number;
}

const StepContext = createContext<StepContextData>({
  currentSteps: 0,
  currentCalories: 0
});

export function StepProvider({ children }: { children: React.ReactNode }) {
  const [currentSteps, setCurrentSteps] = useState(0);
  const [currentCalories, setCurrentCalories] = useState(0);
  const lastSyncedSteps = useRef(0);
  const initialStepsLoaded = useRef(0);

  const CALORIES_PER_STEP = 0.045;

  // Sync calories whenever steps update
  useEffect(() => {
    setCurrentCalories(parseFloat((currentSteps * CALORIES_PER_STEP).toFixed(2)));
  }, [currentSteps]);

  // Load initial steps from Firestore on mount
  useEffect(() => {
    const fetchInitialSteps = async () => {
      const userId = auth.currentUser?.uid || 'test_user_123';
      try {
        const docRef = doc(db, 'users', userId, 'weeklySummary', 'currentWeek');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.steps) {
            console.log("[Pedometer Debug] Loaded initial steps from Firestore:", data.steps);
            setCurrentSteps(data.steps);
            lastSyncedSteps.current = data.steps;
            initialStepsLoaded.current = data.steps;
          }
        }
      } catch (error) {
        console.error("Error fetching initial steps:", error);
      }
    };

    fetchInitialSteps();
  }, []);

  useEffect(() => {
    let subscription: any = null;

    const subscribeToPedometer = async () => {
      let useFallback = false;
      const isAvailable = await Pedometer.isAvailableAsync();
      console.log('isAvailable', isAvailable)
      if (!isAvailable) {
        console.log("[Pedometer Debug] Pedometer not available hardware-wise. Falling back.");
        useFallback = true;
      } else {
        console.log("Permission check")
        const permissions = await Pedometer.getPermissionsAsync();
        console.log('permissions', permissions)
        const { status } = await Pedometer.requestPermissionsAsync();
        console.log('status', status)
        if (status !== 'granted') {
          console.log("[Pedometer Debug] Permission denied. Falling back to Accelerometer.");
          useFallback = true;
        }
      }

      if (useFallback) {
        console.log("Starting Accelerometer fallback for step counting...");
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
                console.log(`[Mock Pedometer] Steps: ${nextSteps}`);

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
        console.log("Pedometer is available and permission granted. Starting to watch step count...");
        subscription = Pedometer.watchStepCount((result) => {
          const totalSteps = initialStepsLoaded.current + result.steps;
          console.log(`[Pedometer Debug] Native steps: ${result.steps}, Total: ${totalSteps}`);
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
  }, []);

  const syncStepsToFirestore = async (steps: number) => {
    const userId = auth.currentUser?.uid || 'test_user_123';
    if (userId) {
      try {
        const calories = parseFloat((steps * CALORIES_PER_STEP).toFixed(2));
        const docRef = doc(db, 'users', userId, 'weeklySummary', 'currentWeek');
        await setDoc(docRef, { steps, calories }, { merge: true });
        console.log("Steps and calories synced to Firestore:", steps, calories);
      } catch (error) {
        console.error("Error syncing steps: ", error);
      }
    }
  };

  return (
    <StepContext.Provider value={{ currentSteps, currentCalories }}>
      {children}
    </StepContext.Provider>
  );
}

export function useStepContext() {
  return useContext(StepContext);
}

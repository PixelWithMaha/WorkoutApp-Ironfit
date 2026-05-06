import { useState, useEffect, useMemo } from 'react';
import { db, auth } from '../config/firebase';
import { collection, query, onSnapshot, addDoc, Timestamp, doc, deleteDoc } from 'firebase/firestore';

export interface WorkoutPlan {
  id: string;
  title: string;
  type: string;
  duration: string;
  date: string; 
  completed: boolean;
}

import { onAuthStateChanged } from 'firebase/auth';

export function useWorkoutPlans() {
  const [plans, setPlans] = useState<WorkoutPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [localPlans, setLocalPlans] = useState<WorkoutPlan[]>([]);
  const userId = auth.currentUser?.uid || 'test_user_123';

  useEffect(() => {
    const q = query(collection(db, 'users', userId, 'workoutPlans'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const plansList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as WorkoutPlan[];
      setPlans(plansList);
      setLoading(false);
    }, (error) => {
      console.error("[useWorkoutPlans] Snapshot error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);

  const addPlan = async (plan: Omit<WorkoutPlan, 'id'>) => {
    const tempId = Math.random().toString(36).substring(7);
    const newLocalPlan = { ...plan, id: tempId };
    
    
    setLocalPlans(prev => [...prev, newLocalPlan]);

    if (userId) {
      try {
        await addDoc(collection(db, 'users', userId, 'workoutPlans'), {
          ...plan,
          createdAt: Timestamp.now()
        });
      } catch (error) {
        console.error("[useWorkoutPlans] Add Error:", error);
      }
    }
  };

  const deletePlan = async (planId: string) => {
    setLocalPlans(prev => prev.filter(p => p.id !== planId));
    if (userId) {
      try {
        await deleteDoc(doc(db, 'users', userId, 'workoutPlans', planId));
      } catch (error) {
        console.error("[useWorkoutPlans] Delete Error:", error);
      }
    }
  };

  
  const combinedPlans = useMemo(() => {
    const firestoreIds = new Set(plans.map(p => `${p.date}-${p.title}`));
    const uniqueLocal = localPlans.filter(lp => !firestoreIds.has(`${lp.date}-${lp.title}`));
    return [...plans, ...uniqueLocal];
  }, [plans, localPlans]);

  return { plans: combinedPlans, loading, addPlan, deletePlan };
}

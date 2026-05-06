import { useState, useEffect } from 'react';
import { db, auth } from '../config/firebase';
import { doc, getDoc, setDoc, collection, getDocs, query, limit } from 'firebase/firestore';

export interface WeeklyStats {
  steps: number;
  calories: number;
  distance: number;
  weekLabel: string;
}

export function useHistory() {
  const [weeklyData, setWeeklyData] = useState<WeeklyStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [increase, setIncrease] = useState(0);
  const userId = auth.currentUser?.uid || 'test_user_123';

  const seedDummyData = async () => {
    const batchData = [
      { id: 'month_3', steps: 65000, calories: 2900, distance: 49.5, weekLabel: '3 Months Ago' },
      { id: 'month_2', steps: 72000, calories: 3200, distance: 54.8, weekLabel: '2 Months Ago' },
      { id: 'month_1', steps: 85000, calories: 3800, distance: 64.7, weekLabel: '1 Month Ago' },
      { id: 'week_3', steps: 18000, calories: 810, distance: 13.7, weekLabel: '3 Weeks Ago' },
      { id: 'week_2', steps: 16000, calories: 720, distance: 12.2, weekLabel: '2 Weeks Ago' },
      { id: 'week_1', steps: 22000, calories: 990, distance: 16.8, weekLabel: 'Last Week' },
    ];

    try {
      for (const data of batchData) {
        const docRef = doc(db, 'users', userId, 'weeklySummary', data.id);
        await setDoc(docRef, {
          steps: data.steps,
          calories: data.calories,
          distance: data.distance,
          weekLabel: data.weekLabel
        }, { merge: true });
      }
      console.log("Dummy history data seeded successfully!");
      fetchHistory();
    } catch (error) {
      console.error("Error seeding data:", error);
    }
  };

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'users', userId, 'weeklySummary'));
      const querySnapshot = await getDocs(q);
      const data: WeeklyStats[] = [];
      querySnapshot.forEach((doc) => {
        if (doc.id !== 'currentWeek') {
          data.push(doc.data() as WeeklyStats);
        }
      });
      
      
      setWeeklyData(data);

      
      
      const currentWeekRef = doc(db, 'users', userId, 'weeklySummary', 'currentWeek');
      const currentSnap = await getDoc(currentWeekRef);
      
      if (currentSnap.exists()) {
        const current = currentSnap.data().distance || 0;
        const lastWeek = data.find(d => d.weekLabel === 'Last Week')?.distance || 1; 
        const inc = ((current - lastWeek) / lastWeek) * 100;
        setIncrease(parseFloat(inc.toFixed(1)));
      }

    } catch (error) {
      console.error("Error fetching history:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [userId]);

  return { weeklyData, increase, loading, seedDummyData, fetchHistory };
}

import { useState, useEffect } from 'react';
import { db, auth } from '../config/firebase';
import { collection, addDoc, query, orderBy, onSnapshot, Timestamp } from 'firebase/firestore';

export interface Trip {
  id: string;
  title: string;
  distance: number;
  timeRange: string;
  avgBpm: number;
  createdAt: any;
}

export function useTrips() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const userId = auth.currentUser?.uid || 'test_user_123';

  useEffect(() => {
    const q = query(
      collection(db, 'users', userId, 'trips'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const tripsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Trip[];
      setTrips(tripsData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching trips:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);

  const addTrip = async (tripData: Omit<Trip, 'id' | 'createdAt'>) => {
    const { title, distance, timeRange, avgBpm } = tripData;
    try {
      await addDoc(collection(db, 'users', userId, 'trips'), {
        title,
        distance,
        timeRange,
        avgBpm,
        createdAt: Timestamp.now()
      });
      console.log("✅ Trip added to Firebase");
    } catch (error) {
      console.error("Error adding trip:", error);
      throw error; // Throw so the UI can catch it and show an alert
    }
  };

  return { trips, loading, addTrip };
}

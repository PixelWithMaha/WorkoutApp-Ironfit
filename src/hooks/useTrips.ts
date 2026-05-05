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

  // Update the addTrip function inside useTrips.ts
  const addTrip = async (tripData: { title: string; distance: number; timeRange: string; avgBpm: number }) => {
    try {
      await addDoc(collection(db, 'users', userId, 'trips'), {
        ...tripData, // This spreads the title, distance, etc.
        createdAt: Timestamp.now()
      });
      console.log("Trip added successfully");
    } catch (error) {
      console.error("Error adding trip:", error);
    }
  };

  return { trips, loading, addTrip };
}

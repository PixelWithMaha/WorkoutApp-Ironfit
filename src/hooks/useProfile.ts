import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { db, auth } from '../config/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useStepContext } from '../context/StepContext';

export function useProfile() {
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const { currentSteps, syncStepsToFirestore } = useStepContext();

  const [profileData, setProfileData] = useState({
    name: 'Sarah IronFit',
    email: 'sarah@ironfit.com',
    weight: '65',
    height: '170',
    age: '24',
    bio: 'Fitness enthusiast & marathon runner',
    goal: '10000'
  });

  const userId = auth.currentUser?.uid || 'test_user_123';

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const docRef = doc(db, 'users', userId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setProfileData(prev => ({
            ...prev,
            name: data.name || prev.name,
            weight: data.weight?.toString() || prev.weight,
            height: data.height?.toString() || prev.height,
            age: data.age?.toString() || prev.age,
            bio: data.bio || prev.bio,
            goal: data.goal?.toString() || prev.goal,
          }));
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const docRef = doc(db, 'users', userId);
      await setDoc(docRef, {
        name: profileData.name,
        weight: parseInt(profileData.weight),
        height: parseInt(profileData.height),
        age: parseInt(profileData.age),
        bio: profileData.bio,
        goal: parseInt(profileData.goal),
      }, { merge: true });
      setIsEditing(false);
      Alert.alert("Success", "Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      Alert.alert("Error", "Could not update profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {

      await syncStepsToFirestore(currentSteps);
      await auth.signOut();
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return {
    profileData,
    setProfileData,
    loading,
    saving,
    isEditing,
    setIsEditing,
    handleSave,
    handleLogout
  };
}

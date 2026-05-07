import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Switch,
  Platform,
  StatusBar,
  Alert
} from 'react-native';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { auth, db } from '../config/firebase';
import { deleteUser } from 'firebase/auth';
import { doc, deleteDoc } from 'firebase/firestore';
import { useTheme } from '../context/ThemeContext';

export default function SettingsScreen() {
  const navigation = useNavigation<any>();
  const [notifications, setNotifications] = useState(true);
  const [useMetric, setUseMetric] = useState(true);
  const { darkMode, setDarkMode, theme } = useTheme();

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete your account? This action is permanent and your data will be lost forever.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const user = auth.currentUser;
            if (user) {
              try {
                await deleteDoc(doc(db, "users", user.uid));
                await deleteUser(user);
                navigation.replace("Login");
              } catch (error: any) {
                if (error.code === 'auth/requires-recent-login') {
                  Alert.alert(
                    "Action Required",
                    "For security, please log in again before deleting your account.",
                    [{
                      text: "OK", onPress: () => {
                        auth.signOut();
                        navigation.replace("Login");
                      }
                    }]
                  );
                } else {
                  Alert.alert("Error", "Could not delete account. Please try again later.");
                }
              }
            }
          }
        }
      ]
    );
  };

  const SettingRow = ({ icon, label, value, onValueChange, type = 'switch', onPress }: any) => (
    <TouchableOpacity
      style={[styles.row, { borderBottomColor: theme.border }]}
      onPress={onPress}
      disabled={type === 'switch'}
      activeOpacity={0.7}
    >
      <View style={styles.rowLeft}>
        <View style={[styles.iconContainer, { backgroundColor: theme.iconBg }]}>
          {icon}
        </View>
        <Text style={[styles.rowLabel, { color: theme.text }]}>{label}</Text>
      </View>
      {type === 'switch' ? (
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: '#CBD5E1', true: theme.primary }}
          thumbColor={Platform.OS === 'ios' ? '#FFFFFF' : value ? theme.primary : '#F4F3F4'}
        />
      ) : (
        <Feather name="chevron-right" size={20} color="#94A3B8" />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={darkMode ? 'light-content' : 'dark-content'} />

      <View style={[styles.header, { backgroundColor: theme.card, borderBottomColor: theme.border, borderBottomWidth: 1 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

        <Text style={styles.sectionTitle}>Preferences</Text>
        <View style={[styles.sectionCard, { backgroundColor: theme.card }]}>
          <SettingRow
            icon={<Feather name="bell" size={20} color={theme.primary} />}
            label="Push Notifications"
            value={notifications}
            onValueChange={setNotifications}
          />
          <SettingRow
            icon={<Feather name={darkMode ? "sun" : "moon"} size={20} color={theme.primary} />}
            label="Dark Mode"
            value={darkMode}
            onValueChange={setDarkMode}
          />
          <SettingRow
            icon={<MaterialIcons name="straighten" size={20} color={theme.primary} />}
            label="Use Metric Units (kg/km)"
            value={useMetric}
            onValueChange={setUseMetric}
          />
        </View>

        <Text style={styles.sectionTitle}>Account & Security</Text>
        <View style={[styles.sectionCard, { backgroundColor: theme.card }]}>

          <SettingRow
            icon={<Feather name="lock" size={20} color={theme.primary} />}
            label="Change Password"
            type="link"
            onPress={() => {
              navigation.navigate("ChangePassword");
            }}
          />

        </View>

        <TouchableOpacity
          style={[styles.deleteButton, { backgroundColor: darkMode ? '#451a1a' : '#FEF2F2' }]}
          onPress={handleDeleteAccount}
        >
          <Text style={styles.deleteButtonText}>Delete Account</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>Version 1.0.4 (Production)</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
    marginTop: 24,
    marginLeft: 4,
  },
  sectionCard: {
    borderRadius: 16,
    paddingVertical: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rowLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  deleteButton: {
    marginTop: 40,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: '600',
  },
  versionText: {
    textAlign: 'center',
    marginTop: 24,
    marginBottom: 40,
    color: '#94A3B8',
    fontSize: 12,
  }
});
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  TouchableOpacity, 
  Switch,
  Platform
} from 'react-native';
import { Feather, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useNavigation } from '@react-navigation/native';

export default function SettingsScreen() {
  const navigation = useNavigation();
  
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [useMetric, setUseMetric] = useState(true);

  const SettingRow = ({ icon, label, value, onValueChange, type = 'switch', onPress }: any) => (
    <TouchableOpacity 
      style={styles.row} 
      onPress={onPress} 
      disabled={type === 'switch'}
      activeOpacity={0.7}
    >
      <View style={styles.rowLeft}>
        <View style={styles.iconContainer}>
          {icon}
        </View>
        <Text style={styles.rowLabel}>{label}</Text>
      </View>
      {type === 'switch' ? (
        <Switch 
          value={value} 
          onValueChange={onValueChange}
          trackColor={{ false: '#CBD5E1', true: colors.primary }}
          thumbColor={Platform.OS === 'ios' ? '#FFFFFF' : value ? colors.primary : '#F4F3F4'}
        />
      ) : (
        <Feather name="chevron-right" size={20} color="#94A3B8" />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        
        <Text style={styles.sectionTitle}>Preferences</Text>
        <View style={styles.sectionCard}>
          <SettingRow 
            icon={<Feather name="bell" size={20} color="#3B82F6" />} 
            label="Push Notifications" 
            value={notifications} 
            onValueChange={setNotifications} 
          />
          <SettingRow 
            icon={<Feather name="moon" size={20} color="#8B5CF6" />} 
            label="Dark Mode" 
            value={darkMode} 
            onValueChange={setDarkMode} 
          />
          <SettingRow 
            icon={<MaterialIcons name="straighten" size={20} color="#F59E0B" />} 
            label="Use Metric Units (kg/km)" 
            value={useMetric} 
            onValueChange={setUseMetric} 
          />
        </View>

        <Text style={styles.sectionTitle}>Account & Security</Text>
        <View style={styles.sectionCard}>
          <SettingRow 
            icon={<Feather name="user" size={20} color="#10B981" />} 
            label="Personal Information" 
            type="link"
            onPress={() => {}}
          />
          <SettingRow 
            icon={<Feather name="lock" size={20} color="#6366F1" />} 
            label="Change Password" 
            type="link"
            onPress={() => {}}
          />
          <SettingRow 
            icon={<Feather name="shield" size={20} color="#EC4899" />} 
            label="Privacy Settings" 
            type="link"
            onPress={() => {}}
          />
        </View>

        <Text style={styles.sectionTitle}>Support</Text>
        <View style={styles.sectionCard}>
          <SettingRow 
            icon={<Feather name="help-circle" size={20} color="#64748B" />} 
            label="Help Center" 
            type="link"
            onPress={() => {}}
          />
          <SettingRow 
            icon={<Feather name="info" size={20} color="#64748B" />} 
            label="About IronFit" 
            type="link"
            onPress={() => {}}
          />
        </View>

        <TouchableOpacity style={styles.deleteButton}>
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
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
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
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
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
    borderBottomColor: '#F1F5F9',
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rowLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1E293B',
  },
  deleteButton: {
    marginTop: 40,
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: '#FEF2F2',
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

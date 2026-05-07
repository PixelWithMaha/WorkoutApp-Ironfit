import React from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  Image,
  ScrollView,
  TextInput,
  ActivityIndicator
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { styles } from '../styles/profileStyles';
import { useProfile } from '../hooks/useProfile';
import { useTheme } from '../context/ThemeContext';
import { StatusBar } from 'react-native';

export default function ProfileScreen() {
  const navigation = useNavigation<any>();
  const { theme, darkMode } = useTheme();
  const {
    profileData,
    setProfileData,
    loading,
    saving,
    isEditing,
    setIsEditing,
    handleSave,
    handleLogout
  } = useProfile();

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={darkMode ? 'light-content' : 'dark-content'} />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={[styles.header, { backgroundColor: theme.card, borderBottomColor: theme.border, borderBottomWidth: 1 }]}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Profile</Text>
          <TouchableOpacity onPress={() => setIsEditing(!isEditing)}>
            <Text style={[styles.editButtonText, { color: theme.primary }]}>{isEditing ? 'Cancel' : 'Edit'}</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.profileCard, { backgroundColor: theme.card }]}>
          <View style={styles.avatarContainer}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200' }}
              style={styles.avatar}
            />
            <TouchableOpacity style={styles.cameraIcon}>
              <Feather name="camera" size={16} color="white" />
            </TouchableOpacity>
          </View>

          {isEditing ? (
            <TextInput
              style={[styles.nameInput, { color: theme.text, backgroundColor: theme.background }]}
              value={profileData.name}
              onChangeText={(text) => setProfileData({ ...profileData, name: text })}
              placeholder="Your Name"
              placeholderTextColor={theme.subtext}
            />
          ) : (
            <Text style={[styles.userName, { color: theme.text }]}>{profileData.name}</Text>
          )}
          <Text style={[styles.userEmail, { color: theme.subtext }]}>{profileData.email}</Text>
        </View>

        <View style={[styles.detailsContainer, { backgroundColor: theme.card }]}>
          <TouchableOpacity
            style={[styles.detailRow, { borderBottomColor: theme.border }]}
            onPress={() => !isEditing && setIsEditing(true)}
            activeOpacity={isEditing ? 1 : 0.7}
          >
            <View style={[styles.detailIconContainer, { backgroundColor: theme.background }]}>
              <MaterialCommunityIcons name="weight" size={20} color={theme.primary} />
            </View>
            <View style={styles.detailContent}>
              <Text style={[styles.detailLabel, { color: theme.subtext }]}>Weight</Text>
              {isEditing ? (
                <TextInput
                  style={[styles.detailInput, { color: theme.text }]}
                  value={profileData.weight}
                  onChangeText={(text) => setProfileData({ ...profileData, weight: text })}
                  keyboardType="numeric"
                  autoFocus={isEditing}
                />
              ) : (
                <Text style={[styles.detailValue, { color: theme.text }]}>{profileData.weight} kg</Text>
              )}
            </View>
            {!isEditing && <Feather name="edit-2" size={16} color={theme.subtext} style={styles.editIcon} />}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.detailRow, { borderBottomColor: theme.border }]}
            onPress={() => !isEditing && setIsEditing(true)}
            activeOpacity={isEditing ? 1 : 0.7}
          >
            <View style={[styles.detailIconContainer, { backgroundColor: theme.background }]}>
              <MaterialCommunityIcons name="human-male-height" size={20} color={theme.primary} />
            </View>
            <View style={styles.detailContent}>
              <Text style={[styles.detailLabel, { color: theme.subtext }]}>Height</Text>
              {isEditing ? (
                <TextInput
                  style={[styles.detailInput, { color: theme.text }]}
                  value={profileData.height}
                  onChangeText={(text) => setProfileData({ ...profileData, height: text })}
                  keyboardType="numeric"
                />
              ) : (
                <Text style={[styles.detailValue, { color: theme.text }]}>{profileData.height} cm</Text>
              )}
            </View>
            {!isEditing && <Feather name="edit-2" size={16} color={theme.subtext} style={styles.editIcon} />}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.detailRow, { borderBottomColor: theme.border }]}
            onPress={() => !isEditing && setIsEditing(true)}
            activeOpacity={isEditing ? 1 : 0.7}
          >
            <View style={[styles.detailIconContainer, { backgroundColor: theme.background }]}>
              <Feather name="user" size={20} color={theme.primary} />
            </View>
            <View style={styles.detailContent}>
              <Text style={[styles.detailLabel, { color: theme.subtext }]}>Age</Text>
              {isEditing ? (
                <TextInput
                  style={[styles.detailInput, { color: theme.text }]}
                  value={profileData.age}
                  onChangeText={(text) => setProfileData({ ...profileData, age: text })}
                  keyboardType="numeric"
                />
              ) : (
                <Text style={[styles.detailValue, { color: theme.text }]}>{profileData.age} years</Text>
              )}
            </View>
            {!isEditing && <Feather name="edit-2" size={16} color={theme.subtext} style={styles.editIcon} />}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.detailRow, { borderBottomWidth: 0 }]}
            onPress={() => !isEditing && setIsEditing(true)}
            activeOpacity={isEditing ? 1 : 0.7}
          >
            <View style={[styles.detailIconContainer, { backgroundColor: theme.background }]}>
              <MaterialCommunityIcons name="target" size={20} color={theme.primary} />
            </View>
            <View style={styles.detailContent}>
              <Text style={[styles.detailLabel, { color: theme.subtext }]}>Daily Step Goal</Text>
              {isEditing ? (
                <TextInput
                  style={[styles.detailInput, { color: theme.text }]}
                  value={profileData.goal}
                  onChangeText={(text) => setProfileData({ ...profileData, goal: text })}
                  keyboardType="numeric"
                />
              ) : (
                <Text style={[styles.detailValue, { color: theme.text }]}>{profileData.goal} steps</Text>
              )}
            </View>
            {!isEditing && <Feather name="edit-2" size={16} color={theme.subtext} style={styles.editIcon} />}
          </TouchableOpacity>
        </View>

        <View style={[styles.section, { backgroundColor: theme.card, marginTop: 24, padding: 20, borderRadius: 20 }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>About Me</Text>
          {isEditing ? (
            <TextInput
              style={[styles.bioInput, { color: theme.text, backgroundColor: theme.background }]}
              value={profileData.bio}
              onChangeText={(text) => setProfileData({ ...profileData, bio: text })}
              multiline
            />
          ) : (
            <Text style={[styles.bioText, { color: theme.subtext }]}>{profileData.bio}</Text>
          )}
        </View>

        {isEditing && (
          <TouchableOpacity
            style={[styles.saveButton, { backgroundColor: theme.primary }]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={[styles.saveButtonText, { color: 'white' }]}>Save Changes</Text>
            )}
          </TouchableOpacity>
        )}

        <View style={[styles.menuContainer, { backgroundColor: theme.card, marginTop: 24, borderRadius: 20, paddingVertical: 8 }]}>
          <TouchableOpacity style={[styles.menuItem, { borderBottomColor: theme.border }]} onPress={() => navigation.navigate('Settings')}>
            <View style={[styles.menuIcon, { backgroundColor: theme.background }]}>
              <Feather name="settings" size={20} color={theme.primary} />
            </View>
            <Text style={[styles.menuText, { color: theme.text }]}>Settings</Text>
            <Feather name="chevron-right" size={20} color={theme.subtext} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.menuItem, { borderBottomColor: theme.border }]}>
            <View style={[styles.menuIcon, { backgroundColor: theme.background }]}>
              <Feather name="shield" size={20} color={theme.primary} />
            </View>
            <Text style={[styles.menuText, { color: theme.text }]}>Privacy Policy</Text>
            <Feather name="chevron-right" size={20} color={theme.subtext} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.menuItem, styles.logoutItem, { borderBottomWidth: 0 }]} onPress={handleLogout}>
            <View style={[styles.menuIcon, { backgroundColor: darkMode ? '#451a1a' : '#FEF2F2' }]}>
              <Feather name="log-out" size={20} color="#EF4444" />
            </View>
            <Text style={[styles.menuText, { color: '#EF4444' }]}>Logout</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

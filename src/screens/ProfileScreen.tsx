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

export default function ProfileScreen() {
  const navigation = useNavigation<any>();
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
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
          <TouchableOpacity onPress={() => setIsEditing(!isEditing)}>
            <Text style={styles.editButtonText}>{isEditing ? 'Cancel' : 'Edit'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.profileCard}>
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
              style={styles.nameInput}
              value={profileData.name}
              onChangeText={(text) => setProfileData({...profileData, name: text})}
              placeholder="Your Name"
            />
          ) : (
            <Text style={styles.userName}>{profileData.name}</Text>
          )}
          <Text style={styles.userEmail}>{profileData.email}</Text>
        </View>

        <View style={styles.detailsContainer}>
          {}
          <TouchableOpacity 
            style={styles.detailRow} 
            onPress={() => !isEditing && setIsEditing(true)}
            activeOpacity={isEditing ? 1 : 0.7}
          >
            <View style={styles.detailIconContainer}>
              <MaterialCommunityIcons name="weight" size={20} color={colors.primary} />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Weight</Text>
              {isEditing ? (
                <TextInput 
                  style={styles.detailInput}
                  value={profileData.weight}
                  onChangeText={(text) => setProfileData({...profileData, weight: text})}
                  keyboardType="numeric"
                  autoFocus={isEditing}
                />
              ) : (
                <Text style={styles.detailValue}>{profileData.weight} kg</Text>
              )}
            </View>
            {!isEditing && <Feather name="edit-2" size={16} color={colors.textSecondary} style={styles.editIcon} />}
          </TouchableOpacity>

          {}
          <TouchableOpacity 
            style={styles.detailRow}
            onPress={() => !isEditing && setIsEditing(true)}
            activeOpacity={isEditing ? 1 : 0.7}
          >
            <View style={styles.detailIconContainer}>
              <MaterialCommunityIcons name="human-male-height" size={20} color={colors.primary} />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Height</Text>
              {isEditing ? (
                <TextInput 
                  style={styles.detailInput}
                  value={profileData.height}
                  onChangeText={(text) => setProfileData({...profileData, height: text})}
                  keyboardType="numeric"
                />
              ) : (
                <Text style={styles.detailValue}>{profileData.height} cm</Text>
              )}
            </View>
            {!isEditing && <Feather name="edit-2" size={16} color={colors.textSecondary} style={styles.editIcon} />}
          </TouchableOpacity>

          {}
          <TouchableOpacity 
            style={styles.detailRow}
            onPress={() => !isEditing && setIsEditing(true)}
            activeOpacity={isEditing ? 1 : 0.7}
          >
            <View style={styles.detailIconContainer}>
              <Feather name="user" size={20} color={colors.primary} />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Age</Text>
              {isEditing ? (
                <TextInput 
                  style={styles.detailInput}
                  value={profileData.age}
                  onChangeText={(text) => setProfileData({...profileData, age: text})}
                  keyboardType="numeric"
                />
              ) : (
                <Text style={styles.detailValue}>{profileData.age} years</Text>
              )}
            </View>
            {!isEditing && <Feather name="edit-2" size={16} color={colors.textSecondary} style={styles.editIcon} />}
          </TouchableOpacity>

          {}
          <TouchableOpacity 
            style={[styles.detailRow, { borderBottomWidth: 0 }]}
            onPress={() => !isEditing && setIsEditing(true)}
            activeOpacity={isEditing ? 1 : 0.7}
          >
            <View style={styles.detailIconContainer}>
              <MaterialCommunityIcons name="target" size={20} color={colors.primary} />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Daily Step Goal</Text>
              {isEditing ? (
                <TextInput 
                  style={styles.detailInput}
                  value={profileData.goal}
                  onChangeText={(text) => setProfileData({...profileData, goal: text})}
                  keyboardType="numeric"
                />
              ) : (
                <Text style={styles.detailValue}>{profileData.goal} steps</Text>
              )}
            </View>
            {!isEditing && <Feather name="edit-2" size={16} color={colors.textSecondary} style={styles.editIcon} />}
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About Me</Text>
          {isEditing ? (
            <TextInput 
              style={styles.bioInput}
              value={profileData.bio}
              onChangeText={(text) => setProfileData({...profileData, bio: text})}
              multiline
            />
          ) : (
            <Text style={styles.bioText}>{profileData.bio}</Text>
          )}
        </View>

        {isEditing && (
          <TouchableOpacity 
            style={styles.saveButton} 
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.saveButtonText}>Save Changes</Text>
            )}
          </TouchableOpacity>
        )}

        <View style={styles.menuContainer}>
          <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Settings')}>
            <View style={[styles.menuIcon, {backgroundColor: '#EBF5FF'}]}>
              <Feather name="settings" size={20} color="#3B82F6" />
            </View>
            <Text style={styles.menuText}>Settings</Text>
            <Feather name="chevron-right" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem}>
            <View style={[styles.menuIcon, {backgroundColor: '#F0FDF4'}]}>
              <Feather name="shield" size={20} color="#22C55E" />
            </View>
            <Text style={styles.menuText}>Privacy Policy</Text>
            <Feather name="chevron-right" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.menuItem, styles.logoutItem]} onPress={handleLogout}>
            <View style={[styles.menuIcon, {backgroundColor: '#FEF2F2'}]}>
              <Feather name="log-out" size={20} color="#EF4444" />
            </View>
            <Text style={[styles.menuText, {color: '#EF4444'}]}>Logout</Text>
          </TouchableOpacity>
        </View>
        
        <View style={{height: 100}} />
      </ScrollView>
    </SafeAreaView>
  );
}

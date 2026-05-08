import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { auth, db } from '../config/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

const ADMIN_EMAIL = 'admin@ironfit.com';

export default function AdminLoginScreen() {
  const navigation = useNavigation<any>();
  const { theme, darkMode } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleAdminLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
      
      // Check if user is admin via Firestore
      const adminDoc = await getDoc(doc(db, 'admins', userCredential.user.uid));
      
      if (adminDoc.exists() || email.trim().toLowerCase() === ADMIN_EMAIL) {
        navigation.replace('AdminPanel');
      } else {
        await auth.signOut();
        Alert.alert('Access Denied', 'This account does not have admin privileges.');
      }
    } catch (error: any) {
      let errorMessage = 'Login failed. Please check your credentials.';
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        errorMessage = 'Invalid email or password.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      }
      Alert.alert('Admin Login Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={darkMode ? 'light-content' : 'dark-content'} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.content}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Feather name="arrow-left" size={24} color={theme.text} />
            </TouchableOpacity>

            <View style={styles.headerSection}>
              <View style={[styles.adminBadge, { backgroundColor: theme.primary + '20' }]}>
                <Feather name="shield" size={32} color={theme.primary} />
              </View>
              <Text style={[styles.title, { color: theme.primary }]}>Admin Panel</Text>
              <Text style={[styles.subtitle, { color: theme.subtext }]}>Sign in with your admin credentials</Text>
            </View>

            <View style={styles.form}>
              <View style={styles.inputWrapper}>
                <Text style={[styles.label, { color: theme.primary }]}>Admin Email</Text>
                <View style={[styles.inputContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
                  <Feather name="mail" size={20} color={theme.subtext} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { color: theme.text }]}
                    placeholder="admin@ironfit.com"
                    placeholderTextColor={theme.subtext}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
              </View>

              <View style={styles.inputWrapper}>
                <Text style={[styles.label, { color: theme.primary }]}>Password</Text>
                <View style={[styles.inputContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
                  <Feather name="lock" size={20} color={theme.subtext} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { color: theme.text }]}
                    placeholder="Enter password"
                    placeholderTextColor={theme.subtext}
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={setPassword}
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                    <Feather name={showPassword ? 'eye' : 'eye-off'} size={20} color={theme.subtext} />
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity
                style={[styles.button, { backgroundColor: theme.primary }, loading && { opacity: 0.7 }]}
                onPress={handleAdminLogin}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.buttonText}>Access Admin Panel</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backLink}>
                <Feather name="arrow-left" size={16} color={theme.subtext} />
                <Text style={[styles.backLinkText, { color: theme.subtext }]}> Back to User Login</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  backButton: {
    marginBottom: 20,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  adminBadge: {
    width: 80,
    height: 80,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
  },
  form: {
    gap: 20,
  },
  inputWrapper: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
    height: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  button: {
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backLink: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  backLinkText: {
    fontSize: 14,
  },
});

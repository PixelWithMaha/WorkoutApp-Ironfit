import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    SafeAreaView,
    Alert,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StatusBar,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { auth } from '../config/firebase';
import { colors } from '../theme/colors';
import { useTheme } from '../context/ThemeContext';

export default function ChangePasswordScreen() {
    const navigation = useNavigation();
    const { theme, darkMode } = useTheme();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleChangePassword = async () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            Alert.alert('Missing Information', 'Please fill in all fields to continue.');
            return;
        }

        if (newPassword !== confirmPassword) {
            Alert.alert('Mismatch', 'New passwords do not match. Please check and try again.');
            return;
        }

        if (newPassword.length < 6) {
            Alert.alert('Weak Password', 'For your security, passwords must be at least 6 characters long.');
            return;
        }

        setLoading(true);
        const user = auth.currentUser;

        if (user && user.email) {
            try {
                const credential = EmailAuthProvider.credential(user.email, currentPassword);
                await reauthenticateWithCredential(user, credential);
                await updatePassword(user, newPassword);

                Alert.alert(
                    'Success',
                    'Your password has been updated successfully.',
                    [{ text: 'Great', onPress: () => navigation.goBack() }]
                );
            } catch (error: any) {
                let errorMessage = 'Failed to update password. Please check your current password and try again.';
                if (error.code === 'auth/wrong-password') {
                    errorMessage = 'The current password you entered is incorrect.';
                } else if (error.code === 'auth/too-many-requests') {
                    errorMessage = 'Too many attempts. Please try again later.';
                }
                Alert.alert('Update Failed', errorMessage);
            } finally {
                setLoading(false);
            }
        } else {
            Alert.alert('Session Expired', 'Please log in again to change your password.');
            setLoading(false);
        }
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <StatusBar barStyle={darkMode ? 'light-content' : 'dark-content'} />
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <View style={[styles.header, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
                    <TouchableOpacity 
                        style={styles.backButton} 
                        onPress={() => navigation.goBack()}
                    >
                        <Feather name="chevron-left" size={28} color={colors.primary} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: colors.primary }]}>Security</Text>
                    <View style={{ width: 44 }} />
                </View>

                <ScrollView 
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.infoSection}>
                        <Text style={[styles.title, { color: colors.primary }]}>Change Password</Text>
                        <Text style={[styles.subtitle, { color: theme.subtext }]}>
                            Update your password to keep your account secure and accessible.
                        </Text>
                    </View>

                    <View style={[styles.form, { backgroundColor: theme.card }]}>
                        <Text style={[styles.label, { color: colors.primary }]}>Current Password</Text>
                        <View style={[styles.inputContainer, { backgroundColor: theme.background, borderColor: theme.border }]}>
                            <Feather name="lock" size={20} color={theme.subtext} style={styles.inputIcon} />
                            <TextInput
                                style={[styles.input, { color: theme.text }]}
                                placeholder="Enter current password"
                                placeholderTextColor={theme.subtext}
                                secureTextEntry={!showCurrent}
                                value={currentPassword}
                                onChangeText={setCurrentPassword}
                            />
                            <TouchableOpacity onPress={() => setShowCurrent(!showCurrent)}>
                                <Feather name={showCurrent ? "eye" : "eye-off"} size={20} color={theme.subtext} />
                            </TouchableOpacity>
                        </View>

                        <Text style={[styles.label, { color: colors.primary }]}>New Password</Text>
                        <View style={[styles.inputContainer, { backgroundColor: theme.background, borderColor: theme.border }]}>
                            <Feather name="shield" size={20} color={theme.subtext} style={styles.inputIcon} />
                            <TextInput
                                style={[styles.input, { color: theme.text }]}
                                placeholder="At least 6 characters"
                                placeholderTextColor={theme.subtext}
                                secureTextEntry={!showNew}
                                value={newPassword}
                                onChangeText={setNewPassword}
                            />
                            <TouchableOpacity onPress={() => setShowNew(!showNew)}>
                                <Feather name={showNew ? "eye" : "eye-off"} size={20} color={theme.subtext} />
                            </TouchableOpacity>
                        </View>

                        <Text style={[styles.label, { color: colors.primary }]}>Confirm New Password</Text>
                        <View style={[styles.inputContainer, { backgroundColor: theme.background, borderColor: theme.border }]}>
                            <Feather name="check-circle" size={20} color={theme.subtext} style={styles.inputIcon} />
                            <TextInput
                                style={[styles.input, { color: theme.text }]}
                                placeholder="Repeat new password"
                                placeholderTextColor={theme.subtext}
                                secureTextEntry={!showConfirm}
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                            />
                            <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)}>
                                <Feather name={showConfirm ? "eye" : "eye-off"} size={20} color={theme.subtext} />
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity
                            onPress={handleChangePassword}
                            disabled={loading}
                            activeOpacity={0.8}
                            style={[styles.button, { backgroundColor: colors.primary }]}
                        >
                            {loading ? (
                                <ActivityIndicator color={colors.white} />
                            ) : (
                                <View style={styles.buttonInner}>
                                    <Text style={styles.buttonText}>Update Password</Text>
                                    <Feather name="arrow-right" size={20} color={colors.white} style={{ marginLeft: 8 }} />
                                </View>
                            )}
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        backgroundColor: colors.background 
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: colors.white,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    backButton: {
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 22,
    },
    headerTitle: { 
        fontSize: 18, 
        fontWeight: '700', 
        color: colors.primary,
        letterSpacing: -0.5,
    },
    scrollContent: { 
        padding: 24 
    },
    infoSection: {
        marginBottom: 32,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        color: colors.primary,
        marginBottom: 8,
        letterSpacing: -1,
    },
    subtitle: {
        fontSize: 16,
        color: colors.textSecondary,
        lineHeight: 24,
    },
    form: {
        backgroundColor: colors.white,
        borderRadius: 24,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 2,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.primary,
        marginBottom: 8,
        marginTop: 20,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.background,
        borderRadius: 16,
        paddingHorizontal: 16,
        height: 56,
        borderWidth: 1,
        borderColor: colors.border,
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: colors.text,
        fontWeight: '500',
    },
    button: {
        borderRadius: 16,
        height: 56,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 32,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    buttonInner: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    buttonText: { 
        color: colors.white, 
        fontSize: 17, 
        fontWeight: '700',
    },
});
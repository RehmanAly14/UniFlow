import { useState } from 'react';
import {
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet,
  Alert, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BACKEND_URL } from '../../utils/config';

export default function SignupScreen() {
  const router = useRouter();
  const [role, setRole] = useState<'STUDENT' | 'TEACHER'>('STUDENT');
  const [loading, setLoading] = useState(false);

  // Common Fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Student Fields
  const [agNumber, setAgNumber] = useState('');
  const [degree, setDegree] = useState('');
  const [semester, setSemester] = useState('');
  const [section, setSection] = useState('');

  // Teacher Fields
  const [teacherId, setTeacherId] = useState('');

  const handleSignup = async () => {
    // Basic Common Field Validation
    if (!fullName.trim() || !email.trim() || !password) {
      Alert.alert('Validation Error', 'Please fill in all common identity fields.');
      return;
    }

    // Role-Specific Validation Guards
    if (role === 'STUDENT' && (!agNumber.trim() || !degree.trim() || !semester.trim() || !section.trim())) {
      Alert.alert('Validation Error', 'Please complete all student demographic fields.');
      return;
    }
    if (role === 'TEACHER' && !teacherId.trim()) {
      Alert.alert('Validation Error', 'Please supply your official Teacher identification code.');
      return;
    }

    try {
      setLoading(true);

      // Clean payload structure conditionally based on current active registration path
      const payload = {
        email: email.trim().toLowerCase(),
        password,
        fullName: fullName.trim(),
        role,
        ...(role === 'STUDENT' 
          ? {
              agNumber: agNumber.trim().toUpperCase(),
              degree: degree.trim().toUpperCase(),
              semester: parseInt(semester.trim(), 10),
              section: section.trim().toUpperCase(),
              teacherId: undefined
            } 
          : {
              teacherId: teacherId.trim().toUpperCase(),
              agNumber: undefined,
              degree: undefined,
              semester: undefined,
              section: undefined
            }
        )
      };

      const response = await fetch(`${BACKEND_URL}/api/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        Alert.alert("Signup Failed", data.error || "An error occurred while creating your account.");
        return;
      }

      Alert.alert(
        "Success",
        "Account created successfully! Please sign in.",
        [{ text: "OK", onPress: () => router.replace("/(auth)/login") }]
      );

    } catch (error: any) {
      Alert.alert(
        "Error",
        error.message || "Something went wrong during data transmission."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton} activeOpacity={0.7}>
              <Ionicons name="arrow-back" size={24} color="#4F46E5" />
            </TouchableOpacity>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join UniFlow today</Text>
          </View>

          {/* Role Toggle Switcher */}
          <View style={styles.roleToggleContainer}>
            <TouchableOpacity
              style={[styles.roleButton, role === 'STUDENT' && styles.roleButtonActive]}
              onPress={() => setRole('STUDENT')}
              activeOpacity={0.9}
            >
              <Text style={[styles.roleButtonText, role === 'STUDENT' && styles.roleButtonTextActive]}>
                🎓 Student
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.roleButton, role === 'TEACHER' && styles.roleButtonActive]}
              onPress={() => setRole('TEACHER')}
              activeOpacity={0.9}
            >
              <Text style={[styles.roleButtonText, role === 'TEACHER' && styles.roleButtonTextActive]}>
                🧑‍🏫 Teacher
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.form}>
            {/* Common Entry Points */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={styles.input}
                placeholder="John Doe"
                placeholderTextColor="#9CA3AF"
                value={fullName}
                onChangeText={setFullName}
                textContentType="name"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>University Email</Text>
              <TextInput
                style={styles.input}
                placeholder="john@uni.edu"
                placeholderTextColor="#9CA3AF"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                textContentType="emailAddress"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Create a strong password"
                placeholderTextColor="#9CA3AF"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                textContentType="newPassword"
              />
            </View>

            {/* Student Specific Structural Block */}
            {role === 'STUDENT' && (
              <View style={styles.dynamicSection}>
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>AG Number</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. 2021-AG-1234"
                    placeholderTextColor="#9CA3AF"
                    value={agNumber}
                    onChangeText={setAgNumber}
                    autoCapitalize="characters"
                    autoCorrect={false}
                  />
                </View>
                <View style={styles.row}>
                  <View style={[styles.inputContainer, { flex: 1.2 }]}>
                    <Text style={styles.label}>Degree</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="BSCS"
                      placeholderTextColor="#9CA3AF"
                      value={degree}
                      onChangeText={setDegree}
                      autoCapitalize="characters"
                      autoCorrect={false}
                    />
                  </View>
                  <View style={[styles.inputContainer, { flex: 0.9 }]}>
                    <Text style={styles.label}>Semester</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="5"
                      placeholderTextColor="#9CA3AF"
                      value={semester}
                      onChangeText={setSemester}
                      keyboardType="numeric"
                      maxLength={2}
                    />
                  </View>
                  <View style={[styles.inputContainer, { flex: 0.9 }]}>
                    <Text style={styles.label}>Section</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="A"
                      placeholderTextColor="#9CA3AF"
                      value={section}
                      onChangeText={setSection}
                      autoCapitalize="characters"
                      maxLength={3}
                      autoCorrect={false}
                    />
                  </View>
                </View>
              </View>
            )}

            {/* Teacher Specific Structural Block */}
            {role === 'TEACHER' && (
              <View style={styles.dynamicSection}>
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Teacher ID</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. TCH-456"
                    placeholderTextColor="#9CA3AF"
                    value={teacherId}
                    onChangeText={setTeacherId}
                    autoCapitalize="characters"
                    autoCorrect={false}
                  />
                </View>
              </View>
            )}

            <TouchableOpacity
              style={[styles.primaryButton, loading && styles.buttonDisabled]}
              onPress={handleSignup}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text style={styles.primaryButtonText}>Sign Up</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/login')} activeOpacity={0.7}>
              <Text style={styles.footerLink}>Sign in</Text>
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
    backgroundColor: '#ffffff' 
  },
  keyboardView: { 
    flex: 1 
  },
  scrollContent: { 
    flexGrow: 1, 
    paddingHorizontal: 24, 
    paddingTop: 8,
    paddingBottom: 32 
  },
  header: { 
    marginBottom: 24 
  },
  backButton: { 
    marginBottom: 16,
    marginLeft: -4,
    alignSelf: 'flex-start',
    padding: 4
  },
  title: { 
    fontSize: 30, 
    fontWeight: 'bold', 
    color: '#111827', 
    marginBottom: 6 
  },
  subtitle: { 
    fontSize: 16, 
    color: '#6B7280' 
  },
  roleToggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 14,
    padding: 4,
    marginBottom: 24,
  },
  roleButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 10,
  },
  roleButtonActive: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  roleButtonText: { 
    fontSize: 14, 
    fontWeight: '500', 
    color: '#6B7280' 
  },
  roleButtonTextActive: { 
    color: '#111827', 
    fontWeight: '600' 
  },
  form: { 
    gap: 18 
  },
  dynamicSection: {
    gap: 18
  },
  inputContainer: { 
    gap: 8 
  },
  row: { 
    flexDirection: 'row', 
    gap: 12 
  },
  label: { 
    fontSize: 14, 
    fontWeight: '500', 
    color: '#374151' 
  },
  input: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    fontSize: 15,
    color: '#111827',
  },
  primaryButton: {
    backgroundColor: '#4F46E5',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    minHeight: 52
  },
  buttonDisabled: { 
    opacity: 0.6 
  },
  primaryButtonText: { 
    color: '#ffffff', 
    fontSize: 16, 
    fontWeight: '600' 
  },
  footer: { 
    flexDirection: 'row', 
    justifyContent: 'center', 
    alignItems: 'center',
    marginTop: 32 
  },
  footerText: { 
    color: '#6B7280', 
    fontSize: 14 
  },
  footerLink: { 
    color: '#4F46E5', 
    fontSize: 14, 
    fontWeight: '600',
    paddingVertical: 4
  },
});
import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, KeyboardAvoidingView, Platform, ScrollView
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
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
  try {
    setLoading(true);

    const response = await fetch(
      `${BACKEND_URL}/api/auth/signup`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          email,
          password,
          fullName,
          role,

          agNumber,
          degree,
          semester,
          section,

          teacherId,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      Alert.alert("Signup Failed", data.error);
      return;
    }

    Alert.alert(
      "Success",
      "Account created successfully"
    );

    router.replace("/(auth)/login");

  } catch (error: any) {
    Alert.alert(
      "Error",
      error.message || "Something went wrong"
    );
  } finally {
    setLoading(false);
  }
};

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Text style={styles.backText}>← Back</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join UniFlow today</Text>
          </View>

          {/* Role Toggle */}
          <View style={styles.roleToggleContainer}>
            <TouchableOpacity
              style={[styles.roleButton, role === 'STUDENT' && styles.roleButtonActive]}
              onPress={() => setRole('STUDENT')}
            >
              <Text style={[styles.roleButtonText, role === 'STUDENT' && styles.roleButtonTextActive]}>
                🎓 Student
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.roleButton, role === 'TEACHER' && styles.roleButtonActive]}
              onPress={() => setRole('TEACHER')}
            >
              <Text style={[styles.roleButtonText, role === 'TEACHER' && styles.roleButtonTextActive]}>
                🧑‍🏫 Teacher
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.form}>
            {/* Common Fields */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={styles.input}
                placeholder="John Doe"
                value={fullName}
                onChangeText={setFullName}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>University Email</Text>
              <TextInput
                style={styles.input}
                placeholder="john@uni.edu"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Create a strong password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            {/* Student Specific Fields */}
            {role === 'STUDENT' && (
              <>
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>AG Number</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. 2021-AG-1234"
                    value={agNumber}
                    onChangeText={setAgNumber}
                    autoCapitalize="characters"
                  />
                </View>
                <View style={styles.row}>
                  <View style={[styles.inputContainer, { flex: 1 }]}>
                    <Text style={styles.label}>Degree</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="BSCS"
                      value={degree}
                      onChangeText={setDegree}
                      autoCapitalize="characters"
                    />
                  </View>
                  <View style={[styles.inputContainer, { flex: 1 }]}>
                    <Text style={styles.label}>Semester</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="5"
                      value={semester}
                      onChangeText={setSemester}
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={[styles.inputContainer, { flex: 1 }]}>
                    <Text style={styles.label}>Section</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="A"
                      value={section}
                      onChangeText={setSection}
                      autoCapitalize="characters"
                    />
                  </View>
                </View>
              </>
            )}

            {/* Teacher Specific Fields */}
            {role === 'TEACHER' && (
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Teacher ID</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. TCH-456"
                  value={teacherId}
                  onChangeText={setTeacherId}
                  autoCapitalize="characters"
                />
              </View>
            )}

            <TouchableOpacity
              style={[styles.primaryButton, loading && styles.buttonDisabled]}
              onPress={handleSignup}
              disabled={loading}
            >
              <Text style={styles.primaryButtonText}>
                {loading ? 'Creating account...' : 'Sign Up'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
              <Text style={styles.footerLink}>Sign in</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  scrollContent: { flexGrow: 1, padding: 24, paddingBottom: 40 },
  header: { marginBottom: 28 },
  backButton: { marginBottom: 24 },
  backText: { color: '#4F46E5', fontSize: 16, fontWeight: '500' },
  title: { fontSize: 32, fontWeight: 'bold', color: '#111827', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#6B7280' },
  roleToggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  roleButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  roleButtonActive: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  roleButtonText: { fontSize: 14, fontWeight: '500', color: '#6B7280' },
  roleButtonTextActive: { color: '#111827', fontWeight: '600' },
  form: { gap: 18 },
  inputContainer: { gap: 8 },
  row: { flexDirection: 'row', gap: 10 },
  label: { fontSize: 14, fontWeight: '500', color: '#374151' },
  input: {
    backgroundColor: '#F3F4F6',
    padding: 14,
    borderRadius: 12,
    fontSize: 15,
    color: '#111827',
  },
  primaryButton: {
    backgroundColor: '#4F46E5',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: { opacity: 0.6 },
  primaryButtonText: { color: '#ffffff', fontSize: 16, fontWeight: '600' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 36 },
  footerText: { color: '#6B7280', fontSize: 14 },
  footerLink: { color: '#4F46E5', fontSize: 14, fontWeight: '600' },
});

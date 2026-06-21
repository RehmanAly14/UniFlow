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
import { supabase } from '../../utils/supabase';
import { useAuthStore } from '../../store/authStore';
import { BACKEND_URL } from '../../utils/config';

export default function LoginScreen() {
  const router = useRouter();
  const { setSession, setUser } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      const resData = await response.json();

      if (!response.ok) {
        Alert.alert('Login Failed', resData.error || 'Something went wrong');
        return;
      }
      
      const session = resData.session;
      const user = resData.user;

      if (!session || !user) {
        Alert.alert('Login Failed', 'Invalid user session details returned from server.');
        return;
      }

      // Sync Supabase client session in frontend
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: session.access_token,
        refresh_token: session.refresh_token,
      });

      if (sessionError) {
        Alert.alert('Session Sync Failed', sessionError.message);
        return;
      }

      // Update Zustand store with complete user profile from backend
      setSession(session);
      setUser({
        id: user.id,
        email: user.email,
        role: user.role,
        fullName: user.fullName,
        agNumber: user.agNumber ?? undefined,
        teacherId: user.teacherId ?? undefined,
        degree: user.degree ?? undefined,
        semester: user.semester ? String(user.semester) : undefined,
        section: user.section ?? undefined,
      });

      // Role-based navigation redirect routing
      if (user.role === 'ADMIN') {
        router.replace('/(app)/admin');
      } else if (user.role === 'TEACHER') {
        router.replace('/(app)/teacher');
      } else {
        router.replace('/(app)/student');
      }

    } catch (error: any) {
      Alert.alert('Error', `Unexpected error: ${error.message || 'Unknown'}`);
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
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to continue to UniFlow</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your university email"
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
                placeholder="Enter your password"
                placeholderTextColor="#9CA3AF"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                textContentType="password"
              />
            </View>

            <TouchableOpacity style={styles.forgotPassword} activeOpacity={0.7}>
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.primaryButton, loading && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text style={styles.primaryButtonText}>Sign In</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/signup')} activeOpacity={0.7}>
              <Text style={styles.footerLink}>Sign up</Text>
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
    paddingBottom: 24,
    justifyContent: 'center' 
  },
  header: { 
    marginBottom: 36 
  },
  backButton: { 
    marginBottom: 20,
    marginLeft: -4,
    alignSelf: 'flex-start',
    padding: 4
  },
  title: { 
    fontSize: 30, 
    fontWeight: 'bold', 
    color: '#111827', 
    marginBottom: 8 
  },
  subtitle: { 
    fontSize: 16, 
    color: '#6B7280' 
  },
  form: { 
    gap: 20 
  },
  inputContainer: { 
    gap: 8 
  },
  label: { 
    fontSize: 14, 
    fontWeight: '500', 
    color: '#374151' 
  },
  input: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    fontSize: 16,
    color: '#111827',
  },
  forgotPassword: { 
    alignSelf: 'flex-end',
    paddingVertical: 2
  },
  forgotPasswordText: { 
    color: '#4F46E5', 
    fontSize: 14, 
    fontWeight: '500' 
  },
  primaryButton: {
    backgroundColor: '#4F46E5',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
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
    marginTop: 36 
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
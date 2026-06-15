import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../../store/authStore';
import { useRouter } from 'expo-router';

export default function AdminSettings() {
  const { signOut } = useAuthStore();
  const router = useRouter();
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}><Text style={styles.title}>System Settings</Text></View>
      <ScrollView contentContainerStyle={styles.content}>

        <Text style={styles.sectionLabel}>NOTIFICATIONS</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <Ionicons name="mail-outline" size={20} color="#4F46E5" />
            <Text style={styles.rowLabel}>Email Notifications</Text>
            <Switch value={emailNotifs} onValueChange={setEmailNotifs} trackColor={{ true: '#4F46E5' }} />
          </View>
        </View>

        <Text style={styles.sectionLabel}>SYSTEM</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <Ionicons name="construct-outline" size={20} color="#D97706" />
            <Text style={styles.rowLabel}>Maintenance Mode</Text>
            <Switch value={maintenanceMode} onValueChange={setMaintenanceMode} trackColor={{ true: '#D97706' }} />
          </View>
        </View>

        <Text style={styles.sectionLabel}>ACCOUNT</Text>
        <View style={styles.card}>
          <TouchableOpacity style={[styles.row, styles.danger]} onPress={() => {
  signOut();
  router.replace("/(auth)");
}}>
            <Ionicons name="log-out-outline" size={20} color="#EF4444" />
            <Text style={[styles.rowLabel, { color: '#EF4444' }]}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.version}>UniFlow v1.0.0 — Admin Panel</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { padding: 24, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#111827' },
  content: { padding: 20, gap: 8 },
  sectionLabel: { fontSize: 11, fontWeight: '700', color: '#9CA3AF', letterSpacing: 1, marginTop: 16, marginBottom: 6 },
  card: { backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  row: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  rowLabel: { flex: 1, fontSize: 15, color: '#111827', fontWeight: '500' },
  danger: { borderRadius: 16 },
  version: { textAlign: 'center', fontSize: 12, color: '#9CA3AF', marginTop: 32 },
});

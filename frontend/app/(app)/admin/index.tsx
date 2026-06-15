import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../../store/authStore';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function AdminDashboard() {
  const { user, signOut } = useAuthStore();
  const router = useRouter();

  const stats = [
    { icon: 'people', label: 'Total Users', value: '—', color: '#4F46E5', bg: '#EEF2FF' },
    { icon: 'calendar', label: 'Timetables', value: '—', color: '#0891B2', bg: '#ECFEFF' },
    { icon: 'folder', label: 'Resources', value: '—', color: '#16A34A', bg: '#F0FDF4' },
    { icon: 'school', label: 'Departments', value: '—', color: '#D97706', bg: '#FFFBEB' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.badge}>ADMIN</Text>
          <Text style={styles.name}>{user?.fullName || 'Administrator'}</Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={() => {
  signOut();
  router.replace("/(auth)");
}}>
          <Ionicons name="log-out-outline" size={22} color="#EF4444" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>System Overview</Text>
        <View style={styles.statsGrid}>
          {stats.map((s) => (
            <View key={s.label} style={[styles.statCard, { backgroundColor: s.bg }]}>
              <Ionicons name={s.icon as any} size={26} color={s.color} />
              <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          {[
            { icon: 'cloud-upload', label: 'Upload Timetable', color: '#4F46E5' },
            { icon: 'person-add', label: 'Manage Users', color: '#0891B2' },
            { icon: 'settings', label: 'System Settings', color: '#7C3AED' },
            { icon: 'stats-chart', label: 'Analytics', color: '#D97706' },
          ].map((a) => (
            <TouchableOpacity key={a.label} style={styles.actionCard}>
              <Ionicons name={a.icon as any} size={28} color={a.color} />
              <Text style={styles.actionLabel}>{a.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 24, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  badge: { fontSize: 10, fontWeight: '700', color: '#7C3AED', backgroundColor: '#EDE9FE', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, alignSelf: 'flex-start', marginBottom: 4 },
  name: { fontSize: 22, fontWeight: 'bold', color: '#111827' },
  logoutBtn: { padding: 8, backgroundColor: '#FEF2F2', borderRadius: 8 },
  content: { padding: 20, gap: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#374151' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  statCard: { width: '47%', padding: 16, borderRadius: 16, alignItems: 'center', gap: 6 },
  statValue: { fontSize: 28, fontWeight: 'bold' },
  statLabel: { fontSize: 12, color: '#6B7280', textAlign: 'center' },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  actionCard: { width: '47%', backgroundColor: '#fff', padding: 20, borderRadius: 16, alignItems: 'center', gap: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  actionLabel: { fontSize: 13, fontWeight: '500', color: '#374151', textAlign: 'center' },
});

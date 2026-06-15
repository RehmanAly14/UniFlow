import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const MOCK_USERS = [
  { id: '1', name: 'Ali Hassan', role: 'STUDENT', email: 'ali@uni.edu', detail: 'BSCS • Sem 5 • A' },
  { id: '2', name: 'Sara Khan', role: 'STUDENT', email: 'sara@uni.edu', detail: 'BSIT • Sem 3 • B' },
  { id: '3', name: 'Dr. Ahmed', role: 'TEACHER', email: 'ahmed@uni.edu', detail: 'Teacher ID: TCH-001' },
  { id: '4', name: 'Ms. Fatima', role: 'TEACHER', email: 'fatima@uni.edu', detail: 'Teacher ID: TCH-002' },
];

const roleColors: Record<string, string> = {
  STUDENT: '#4F46E5',
  TEACHER: '#16A34A',
  ADMIN: '#DC2626',
};

export default function AdminUsers() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Manage Users</Text>
        <Text style={styles.subtitle}>{MOCK_USERS.length} users registered</Text>
      </View>

      <FlatList
        data={MOCK_USERS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={[styles.avatar, { backgroundColor: roleColors[item.role] + '20' }]}>
              <Ionicons
                name={item.role === 'TEACHER' ? 'person-circle' : 'school'}
                size={28}
                color={roleColors[item.role]}
              />
            </View>
            <View style={styles.info}>
              <Text style={styles.userName}>{item.name}</Text>
              <Text style={styles.userEmail}>{item.email}</Text>
              <Text style={styles.userDetail}>{item.detail}</Text>
            </View>
            <View style={[styles.roleBadge, { backgroundColor: roleColors[item.role] + '15' }]}>
              <Text style={[styles.roleText, { color: roleColors[item.role] }]}>{item.role}</Text>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { padding: 24, paddingBottom: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#111827' },
  subtitle: { fontSize: 14, color: '#6B7280', marginTop: 4 },
  list: { padding: 16, gap: 12 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 16, borderRadius: 16, gap: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  avatar: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  info: { flex: 1 },
  userName: { fontSize: 15, fontWeight: '600', color: '#111827' },
  userEmail: { fontSize: 13, color: '#6B7280' },
  userDetail: { fontSize: 12, color: '#9CA3AF', marginTop: 2 },
  roleBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  roleText: { fontSize: 11, fontWeight: '700' },
});

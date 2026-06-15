import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../../store/authStore';
import { BACKEND_URL } from '../../../utils/config';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
const SUBJECT_COLORS = ['#4F46E5', '#0891B2', '#16A34A', '#D97706', '#DC2626', '#7C3AED'];

export default function TeacherSchedule() {
  const { user } = useAuthStore();
  const [activeDay, setActiveDay] = useState('Mon');
  const [timetableData, setTimetableData] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTimetable();
  }, []);

  const fetchTimetable = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${BACKEND_URL}/api/timetable/teacher?teacherName=${user?.fullName || ''}`);
      const data = await res.json();
      
      const grouped: Record<string, any[]> = { Mon: [], Tue: [], Wed: [], Thu: [], Fri: [] };
      if (Array.isArray(data)) {
        data.forEach((item) => {
          const dayPrefix = item.day.substring(0, 3);
          if (grouped[dayPrefix]) {
            grouped[dayPrefix].push({
              time: `${item.startTime}-${item.endTime}`,
              subject: item.subjectCode,
              room: item.room,
              classInfo: `${item.degree} - Sem ${item.semester} - Sec ${item.section}`
            });
          }
        });
      }
      setTimetableData(grouped);
    } catch (error) {
      console.error("Error fetching timetable:", error);
    } finally {
      setLoading(false);
    }
  };

  const classes = timetableData[activeDay] || [];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Schedule</Text>
        <Text style={styles.subtitle}>{user?.fullName || 'Teacher'}</Text>
      </View>

      {/* Day Tabs */}
      <View style={styles.dayTabs}>
        {DAYS.map((day) => (
          <TouchableOpacity
            key={day}
            style={[styles.dayTab, activeDay === day && styles.dayTabActive]}
            onPress={() => setActiveDay(day)}
          >
            <Text style={[styles.dayText, activeDay === day && styles.dayTextActive]}>{day}</Text>
            {timetableData[day]?.length > 0 && (
              <View style={[styles.dot, activeDay === day && styles.dotActive]} />
            )}
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {loading ? (
          <View style={styles.emptyState}>
            <ActivityIndicator size="large" color="#4F46E5" />
            <Text style={styles.emptyText}>Loading schedule...</Text>
          </View>
        ) : classes.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="sunny-outline" size={40} color="#9CA3AF" />
            <Text style={styles.emptyText}>No classes today! 🎉</Text>
          </View>
        ) : (
          classes.map((cls, idx) => (
            <View key={idx} style={[styles.classCard, { borderLeftColor: SUBJECT_COLORS[idx % SUBJECT_COLORS.length] }]}>
              <View style={styles.classTime}>
                <Ionicons name="time-outline" size={14} color="#6B7280" />
                <Text style={styles.timeText}>{cls.time}</Text>
              </View>
              <Text style={styles.subjectName}>{cls.subject}</Text>
              <View style={styles.classMeta}>
                <View style={styles.metaItem}>
                  <Ionicons name="location-outline" size={13} color="#9CA3AF" />
                  <Text style={styles.metaText}>{cls.room}</Text>
                </View>
                <View style={styles.metaItem}>
                  <Ionicons name="people-outline" size={13} color="#9CA3AF" />
                  <Text style={styles.metaText}>{cls.classInfo}</Text>
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { padding: 24, paddingBottom: 16, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#111827' },
  subtitle: { fontSize: 13, color: '#6B7280', marginTop: 4 },
  dayTabs: { flexDirection: 'row', backgroundColor: '#fff', paddingHorizontal: 16, paddingBottom: 16, gap: 8, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  dayTab: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 12, backgroundColor: '#F3F4F6', gap: 4 },
  dayTabActive: { backgroundColor: '#4F46E5' },
  dayText: { fontSize: 13, fontWeight: '600', color: '#6B7280' },
  dayTextActive: { color: '#fff' },
  dot: { width: 5, height: 5, borderRadius: 3, backgroundColor: '#9CA3AF' },
  dotActive: { backgroundColor: '#A5B4FC' },
  content: { padding: 16, gap: 12 },
  classCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, borderLeftWidth: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  classTime: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 6 },
  timeText: { fontSize: 13, color: '#6B7280', fontWeight: '500' },
  subjectName: { fontSize: 17, fontWeight: '700', color: '#111827', marginBottom: 10 },
  classMeta: { flexDirection: 'row', gap: 16 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 13, color: '#6B7280' },
  emptyState: { alignItems: 'center', paddingTop: 80, gap: 12 },
  emptyText: { fontSize: 16, color: '#6B7280' },
});

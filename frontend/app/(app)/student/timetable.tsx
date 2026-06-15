import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect, useCallback } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../../store/authStore';
import { supabase } from '../../../utils/supabase';
import { BACKEND_URL } from '../../../utils/config';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
const SUBJECT_COLORS = ['#4F46E5', '#0891B2', '#16A34A', '#D97706', '#DC2626', '#7C3AED'];

export default function StudentTimetable() {
  const { user } = useAuthStore();
  const [activeDay, setActiveDay] = useState('Mon');
  const [timetableData, setTimetableData] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTimetable = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Read user profile from Supabase user_metadata if Zustand store fields are missing
      let degree = user?.degree;
      let semester = user?.semester;
      let section = user?.section;

      if (!degree || !semester || !section) {
        const { data: { user: supaUser } } = await supabase.auth.getUser();
        const meta = supaUser?.user_metadata;
        degree = degree || meta?.degree;
        semester = semester || (meta?.semester ? String(meta.semester) : undefined);
        section = section || meta?.section;
      }

      if (!degree || !semester || !section) {
        setError('Your profile is incomplete (degree / semester / section missing). Please contact admin.');
        setLoading(false);
        return;
      }

      // Fetch from backend timetable endpoint
      const url = `${BACKEND_URL}/api/timetable/student?degree=${encodeURIComponent(degree)}&semester=${encodeURIComponent(semester)}&section=${encodeURIComponent(section)}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }
      const data = await response.json();

      // Group entries by day abbreviation
      const grouped: Record<string, any[]> = { Mon: [], Tue: [], Wed: [], Thu: [], Fri: [] };
      if (Array.isArray(data)) {
        data.forEach((item: any) => {
          const dayRaw = item.day || '';
          const normalizedDay = dayRaw.charAt(0).toUpperCase() + dayRaw.slice(1).toLowerCase();
          const dayPrefix = normalizedDay.substring(0, 3);
          
          if (grouped[dayPrefix]) {
            grouped[dayPrefix].push({
              time: `${item.startTime || ''}–${item.endTime || ''}`,
              subject: item.subjectCode || 'Unknown',
              room: item.room || '—',
              teacher: item.teacherName || '—',
            });
          }
        });
      }

      setTimetableData(grouped);
    } catch (err: any) {
      setError(`Failed to load timetable: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchTimetable();
  }, [fetchTimetable]);

  const classes = timetableData[activeDay] || [];

  // Derive display labels from Supabase metadata (live, not stale store)
  const displayDegree = user?.degree || '—';
  const displaySemester = user?.semester || '—';
  const displaySection = user?.section || '—';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Timetable</Text>
        <Text style={styles.subtitle}>
          {displayDegree} • Semester {displaySemester} • Section {displaySection}
        </Text>
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
            {(timetableData[day]?.length ?? 0) > 0 && (
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
        ) : error ? (
          <View style={styles.emptyState}>
            <Ionicons name="warning-outline" size={40} color="#F59E0B" />
            <Text style={[styles.emptyText, { color: '#92400E', textAlign: 'center', paddingHorizontal: 20 }]}>
              {error}
            </Text>
            <TouchableOpacity style={styles.retryBtn} onPress={fetchTimetable}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : classes.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="sunny-outline" size={40} color="#9CA3AF" />
            <Text style={styles.emptyText}>No classes today! 🎉</Text>
            <Text style={styles.emptyHint}>
              Admin hasn't uploaded the timetable yet, or no classes are scheduled for {activeDay}.
            </Text>
          </View>
        ) : (
          classes.map((cls, idx) => (
            <View
              key={idx}
              style={[styles.classCard, { borderLeftColor: SUBJECT_COLORS[idx % SUBJECT_COLORS.length] }]}
            >
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
                  <Ionicons name="person-outline" size={13} color="#9CA3AF" />
                  <Text style={styles.metaText}>{cls.teacher}</Text>
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
  dayTabs: {
    flexDirection: 'row', backgroundColor: '#fff',
    paddingHorizontal: 16, paddingBottom: 16, gap: 8,
    borderBottomWidth: 1, borderBottomColor: '#F3F4F6',
  },
  dayTab: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 12, backgroundColor: '#F3F4F6', gap: 4 },
  dayTabActive: { backgroundColor: '#4F46E5' },
  dayText: { fontSize: 13, fontWeight: '600', color: '#6B7280' },
  dayTextActive: { color: '#fff' },
  dot: { width: 5, height: 5, borderRadius: 3, backgroundColor: '#9CA3AF' },
  dotActive: { backgroundColor: '#A5B4FC' },
  content: { padding: 16, gap: 12, flexGrow: 1 },
  classCard: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16,
    borderLeftWidth: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  classTime: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 6 },
  timeText: { fontSize: 13, color: '#6B7280', fontWeight: '500' },
  subjectName: { fontSize: 17, fontWeight: '700', color: '#111827', marginBottom: 10 },
  classMeta: { flexDirection: 'row', gap: 16 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 13, color: '#6B7280' },
  emptyState: { alignItems: 'center', paddingTop: 80, gap: 12, flex: 1 },
  emptyText: { fontSize: 16, color: '#6B7280' },
  emptyHint: { fontSize: 13, color: '#9CA3AF', textAlign: 'center', paddingHorizontal: 32 },
  retryBtn: { marginTop: 8, backgroundColor: '#EEF2FF', paddingHorizontal: 24, paddingVertical: 10, borderRadius: 8 },
  retryText: { color: '#4F46E5', fontWeight: '600' },
});

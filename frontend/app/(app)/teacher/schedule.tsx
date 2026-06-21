import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../../store/authStore';
import { BACKEND_URL } from '../../../utils/config';
import { useRouter } from 'expo-router';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
const SUBJECT_COLORS = ['#6366F1', '#06B6D4', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

export default function TeacherSchedule() {
  const { user, session } = useAuthStore();
  const router = useRouter();
  
  // Dynamic initialization to current weekday
  const [activeDay, setActiveDay] = useState(() => {
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const currentName = dayNames[new Date().getDay()];
    return DAYS.includes(currentName) ? currentName : 'Mon';
  });
  
  const [timetableData, setTimetableData] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTimetable();
  }, []);

  const fetchTimetable = async () => {
    try {
      const token = session?.access_token;
      setLoading(true);
      const res = await fetch(`${BACKEND_URL}/api/timetable/teacher?teacherName=${encodeURIComponent(user?.fullName || '')}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await res.json();
      
      const grouped: Record<string, any[]> = { Mon: [], Tue: [], Wed: [], Thu: [], Fri: [] };
      if (Array.isArray(data)) {
        data.forEach((item) => {
          const dayPrefix = item.day.substring(0, 3);
          if (grouped[dayPrefix]) {
            grouped[dayPrefix].push({
              time: `${item.startTime} - ${item.endTime}`,
              subject: item.subjectCode,
              room: item.room,
              classInfo: `${item.degree} • Sem ${item.semester} • Sec ${item.section}`
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
      {/* Header Profile Layout */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backBtn} 
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={20} color="#334155" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.title}>My Schedule</Text>
          <Text style={styles.subtitle}>{user?.fullName || 'Faculty Instructor'}</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {/* Day Navigation Tabs */}
      <View style={styles.tabsContainer}>
        <View style={styles.dayTabs}>
          {DAYS.map((day) => {
            const isActive = activeDay === day;
            const hasClasses = timetableData[day]?.length > 0;
            return (
              <TouchableOpacity
                key={day}
                style={[styles.dayTab, isActive && styles.dayTabActive]}
                onPress={() => setActiveDay(day)}
                activeOpacity={0.7}
              >
                <Text style={[styles.dayText, isActive && styles.dayTextActive]}>{day}</Text>
                {hasClasses && (
                  <View style={[styles.dot, isActive && styles.dotActive]} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Main Content Area */}
      <ScrollView 
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.loadingState}>
            <ActivityIndicator size="large" color="#6366F1" />
            <Text style={styles.stateText}>Assembling your schedule...</Text>
          </View>
        ) : classes.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="sparkles" size={32} color="#6366F1" />
            </View>
            <Text style={styles.emptyTitle}>No Classes Scheduled</Text>
            <Text style={styles.stateText}>Enjoy your free day or catch up on resource uploads!</Text>
          </View>
        ) : (
          classes.map((cls, idx) => {
            const accentColor = SUBJECT_COLORS[idx % SUBJECT_COLORS.length];
            return (
              <View key={idx} style={styles.classCard}>
                {/* Visual Identity Strip */}
                <View style={[styles.cardAccentStrip, { backgroundColor: accentColor }]} />
                
                <View style={styles.cardMain}>
                  <View style={styles.cardTopRow}>
                    <View style={styles.classTime}>
                      <Ionicons name="time" size={15} color="#64748B" />
                      <Text style={styles.timeText}>{cls.time}</Text>
                    </View>
                    <View style={[styles.subjectBadge, { backgroundColor: `${accentColor}12` }]}>
                      <Text style={[styles.subjectBadgeText, { color: accentColor }]}>{cls.subject}</Text>
                    </View>
                  </View>
                  
                  <Text style={styles.classMetaInfo}>{cls.classInfo}</Text>
                  
                  <View style={styles.classDivider} />
                  
                  <View style={styles.metaItem}>
                    <Ionicons name="location" size={15} color="#94A3B8" />
                    <Text style={styles.metaText}>Room {cls.room}</Text>
                  </View>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F8FAFC' 
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleContainer: {
    alignItems: 'center',
  },
  title: { 
    fontSize: 18, 
    fontWeight: '700', 
    color: '#0F172A' 
  },
  subtitle: { 
    fontSize: 13, 
    color: '#64748B', 
    marginTop: 2 
  },
  tabsContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  dayTabs: { 
    flexDirection: 'row', 
    backgroundColor: '#F1F5F9', 
    padding: 4, 
    borderRadius: 14,
    gap: 4
  },
  dayTab: { 
    flex: 1, 
    alignItems: 'center', 
    paddingVertical: 10, 
    borderRadius: 10, 
    backgroundColor: 'transparent',
    position: 'relative',
    justifyContent: 'center'
  },
  dayTabActive: { 
    backgroundColor: '#FFFFFF',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2
  },
  dayText: { 
    fontSize: 13, 
    fontWeight: '600', 
    color: '#64748B' 
  },
  dayTextActive: { 
    color: '#0F172A',
    fontWeight: '700'
  },
  dot: { 
    width: 4, 
    height: 4, 
    borderRadius: 2, 
    backgroundColor: '#94A3B8',
    position: 'absolute',
    bottom: 4
  },
  dotActive: { 
    backgroundColor: '#6366F1' 
  },
  content: { 
    padding: 20, 
    gap: 16 
  },
  classCard: { 
    backgroundColor: '#FFFFFF', 
    borderRadius: 20, 
    flexDirection: 'row',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 2 
  },
  cardAccentStrip: {
    width: 6,
    height: '100%',
  },
  cardMain: {
    flex: 1,
    padding: 18,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  classTime: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 6 
  },
  timeText: { 
    fontSize: 14, 
    color: '#475569', 
    fontWeight: '600',
    letterSpacing: -0.2
  },
  subjectBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  subjectBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  classMetaInfo: { 
    fontSize: 15, 
    fontWeight: '600', 
    color: '#0F172A', 
    marginBottom: 12 
  },
  classDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginBottom: 12,
  },
  metaItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 6 
  },
  metaText: { 
    fontSize: 13, 
    color: '#64748B',
    fontWeight: '500'
  },
  loadingState: { 
    alignItems: 'center', 
    paddingTop: 100, 
    gap: 14 
  },
  emptyState: { 
    alignItems: 'center', 
    paddingTop: 60, 
    paddingHorizontal: 40,
    gap: 12 
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
  },
  stateText: { 
    fontSize: 14, 
    color: '#64748B', 
    textAlign: 'center',
    lineHeight: 20
  },
});
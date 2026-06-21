import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect, useCallback } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../../store/authStore';
import { supabase } from '../../../utils/supabase';
import { BACKEND_URL } from '../../../utils/config';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
const SUBJECT_COLORS = ['#4F46E5', '#0891B2', '#16A34A', '#D97706', '#DC2626', '#7C3AED'];
const GRADIENT_COLORS = [
  ['#4F46E5', '#7C3AED'],
  ['#0891B2', '#0D9488'],
  ['#16A34A', '#059669'],
  ['#D97706', '#F59E0B'],
  ['#DC2626', '#EF4444'],
  ['#7C3AED', '#8B5CF6'],
];

export default function StudentTimetable() {
  const { user,session } = useAuthStore();
  const [activeDay, setActiveDay] = useState('Mon');
  const [timetableData, setTimetableData] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTimetable = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const token = session?.access_token;
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

      const url = `${BACKEND_URL}/api/timetable/student?degree=${encodeURIComponent(degree)}&semester=${encodeURIComponent(semester)}&section=${encodeURIComponent(section)}`
      const response = await fetch(url,{
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }
      const data = await response.json();

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
  const displayDegree = user?.degree || '—';
  const displaySemester = user?.semester || '—';
  const displaySection = user?.section || '—';

  const getClassCount = (day: string) => {
    return timetableData[day]?.length || 0;
  };

  const getGradient = (index: number) => {
    return GRADIENT_COLORS[index % GRADIENT_COLORS.length];
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with Gradient */}
      <LinearGradient
        colors={['#4F46E5', '#7C3AED']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.title}> Timetable</Text>
            <Text style={styles.subtitle}>
              {displayDegree} • Semester {displaySemester} • Section {displaySection}
            </Text>
          </View>
          <View style={styles.headerBadge}>
            <Text style={styles.headerBadgeText}>
              {getClassCount(activeDay)} classes
            </Text>
          </View>
        </View>
      </LinearGradient>

      {/* Day Tabs */}
      <View style={styles.dayTabsWrapper}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.dayTabs}
        >
          {DAYS.map((day) => {
            const count = getClassCount(day);
            const isActive = activeDay === day;
            return (
              <TouchableOpacity
                key={day}
                style={[styles.dayTab, isActive && styles.dayTabActive]}
                onPress={() => setActiveDay(day)}
                activeOpacity={0.7}
              >
                <Text style={[styles.dayText, isActive && styles.dayTextActive]}>
                  {day}
                </Text>
                {count > 0 && (
                  <View style={[styles.countBadge, isActive && styles.countBadgeActive]}>
                    <Text style={[styles.countText, isActive && styles.countTextActive]}>
                      {count}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView 
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.stateContainer}>
            <ActivityIndicator size="large" color="#4F46E5" />
            <Text style={styles.stateTitle}>Loading schedule...</Text>
            <Text style={styles.stateSubtitle}>Please wait while we fetch your classes</Text>
          </View>
        ) : error ? (
          <View style={styles.stateContainer}>
            <View style={styles.errorIconContainer}>
              <Ionicons name="alert-circle" size={56} color="#F59E0B" />
            </View>
            <Text style={[styles.stateTitle, { color: '#92400E' }]}>Oops!</Text>
            <Text style={[styles.stateSubtitle, { color: '#92400E', textAlign: 'center', paddingHorizontal: 20 }]}>
              {error}
            </Text>
            <TouchableOpacity style={styles.retryBtn} onPress={fetchTimetable}>
              <Ionicons name="refresh-outline" size={20} color="#FFFFFF" />
              <Text style={styles.retryText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        ) : classes.length === 0 ? (
          <View style={styles.stateContainer}>
            <View style={styles.emptyIconContainer}>
              <Ionicons name="calendar-clear-outline" size={64} color="#D1D5DB" />
            </View>
            <Text style={styles.stateTitle}>No Classes Today! 🎉</Text>
            <Text style={styles.stateSubtitle}>
              Enjoy your free day! No classes scheduled for {activeDay}.
            </Text>
          </View>
        ) : (
          classes.map((cls, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.classCard}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={getGradient(idx)}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.cardGradientBar}
              />
              <View style={styles.cardContent}>
                <View style={styles.classHeader}>
                  <View style={styles.timeContainer}>
                    <Ionicons name="time-outline" size={16} color="#4F46E5" />
                    <Text style={styles.timeText}>{cls.time}</Text>
                  </View>
                  <View style={styles.badgeContainer}>
                    <Text style={styles.badgeText}>#{idx + 1}</Text>
                  </View>
                </View>

                <Text style={styles.subjectName}>{cls.subject}</Text>
                
                <View style={styles.classMeta}>
                  <View style={styles.metaItem}>
                    <View style={styles.metaIconBg}>
                      <Ionicons name="location-outline" size={14} color="#4F46E5" />
                    </View>
                    <Text style={styles.metaText}>{cls.room}</Text>
                  </View>
                  <View style={styles.metaDivider} />
                  <View style={styles.metaItem}>
                    <View style={styles.metaIconBg}>
                      <Ionicons name="person-outline" size={14} color="#4F46E5" />
                    </View>
                    <Text style={styles.metaText}>{cls.teacher}</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F3F4F6' 
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 28,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: { 
    fontSize: 24, 
    fontWeight: '700', 
    color: '#FFFFFF' 
  },
  subtitle: { 
    fontSize: 13, 
    color: 'rgba(255,255,255,0.8)', 
    marginTop: 4,
    fontWeight: '400',
  },
  headerBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  headerBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  dayTabsWrapper: {
    backgroundColor: '#FFFFFF',
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  dayTabs: {
    paddingHorizontal: 20,
    gap: 10,
  },
  dayTab: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    backgroundColor: '#F3F4F6',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minWidth: 70,
    justifyContent: 'center',
  },
  dayTabActive: { 
    backgroundColor: '#4F46E5',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  dayText: { 
    fontSize: 14, 
    fontWeight: '600', 
    color: '#6B7280' 
  },
  dayTextActive: { 
    color: '#FFFFFF' 
  },
  countBadge: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 12,
    minWidth: 20,
    alignItems: 'center',
  },
  countBadgeActive: {
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  countText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#6B7280',
  },
  countTextActive: {
    color: '#FFFFFF',
  },
  content: { 
    padding: 16, 
    gap: 12, 
    flexGrow: 1,
    paddingBottom: 40,
  },
  classCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cardGradientBar: {
    height: 4,
    width: '100%',
  },
  cardContent: {
    padding: 16,
  },
  classHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timeText: { 
    fontSize: 13, 
    color: '#4F46E5', 
    fontWeight: '600' 
  },
  badgeContainer: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#4F46E5',
  },
  subjectName: { 
    fontSize: 18, 
    fontWeight: '700', 
    color: '#111827',
    marginBottom: 12,
  },
  classMeta: { 
    flexDirection: 'row', 
    alignItems: 'center',
    gap: 12,
  },
  metaItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 6,
  },
  metaIconBg: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  metaText: { 
    fontSize: 13, 
    color: '#6B7280',
    fontWeight: '500',
  },
  metaDivider: {
    width: 1,
    height: 20,
    backgroundColor: '#E5E7EB',
  },
  stateContainer: { 
    alignItems: 'center', 
    justifyContent: 'center',
    paddingTop: 80,
    flex: 1,
  },
  stateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginTop: 16,
  },
  stateSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 32,
    lineHeight: 20,
  },
  errorIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  retryBtn: {
    marginTop: 20,
    backgroundColor: '#4F46E5',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  retryText: { 
    color: '#FFFFFF', 
    fontWeight: '600',
    fontSize: 14,
  },
});
import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

import { useAuthStore } from '../../../store/authStore';
import { supabase } from '../../../utils/supabase';
import { BACKEND_URL } from '../../../utils/config';
import { useFocusEffect } from "@react-navigation/native";
import { Linking } from "react-native";

const { width } = Dimensions.get('window');

export default function StudentDashboard() {
  const { user, signOut,session } = useAuthStore();
  const router = useRouter();

  const [todayClasses, setTodayClasses] = useState<any[]>([]);
  const [recentResources, setRecentResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const getTodayDay = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[new Date().getDay()];
  };

  const fetchTodaySchedule = useCallback(async () => {
    try {
      setLoading(true);
      const token = session?.access_token;

      let degree = user?.degree;
      let semester = user?.semester;
      let section = user?.section;

      if (!degree || !semester || !section) {
        const {
          data: { user: supaUser },
        } = await supabase.auth.getUser();

        degree = supaUser?.user_metadata?.degree;
        semester = supaUser?.user_metadata?.semester;
        section = supaUser?.user_metadata?.section;
      }

      if (!degree || !semester || !section) {
        setLoading(false);
        return;
      }

      const response = await fetch(
        `${BACKEND_URL}/api/timetable/student?degree=${encodeURIComponent(
          degree
        )}&semester=${encodeURIComponent(
          semester
        )}&section=${encodeURIComponent(section)}`,{
          headers:{
            Authorization: `Bearer ${token}`,
          }
        }
      );

      const data = await response.json();

      const today = "Mon";

      const filtered = Array.isArray(data)
        ? data.filter(
            (item: any) =>
              item.day?.substring(0, 3).toLowerCase() ===
              today.toLowerCase()
          )
        : [];

      setTodayClasses(filtered);
    } catch (error) {
      console.log('Dashboard timetable error:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const fetchRecentResources = async () => {
  try {
    let degree = user?.degree;
    let semester = user?.semester;
    let section = user?.section;

    if (!degree || !semester || !section) {
      const {
        data: { user: supaUser },
      } = await supabase.auth.getUser();

      degree = supaUser?.user_metadata?.degree;
      semester = supaUser?.user_metadata?.semester;
      section = supaUser?.user_metadata?.section;
    }

    const {
      data: { session },
    } = await supabase.auth.getSession();

    const response = await fetch(
      `${BACKEND_URL}/api/resources/student?degree=${degree}&semester=${semester}&section=${section}`,
      {
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      }
    );

    const data = await response.json();

    setRecentResources(
      Array.isArray(data) ? data.slice(0, 5) : []
    );
  } catch (error) {
    console.log("Resources error:", error);
  }
};

 useFocusEffect(
  useCallback(() => {
    fetchTodaySchedule();
    fetchRecentResources();
  }, [fetchTodaySchedule])
);

  const handleLogout = async () => {
    await signOut();
    router.replace('/(auth)');
  };

  const getInitials = (name: string) => {
    return name
      ?.split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'S';
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header with Gradient */}
        <LinearGradient
          colors={['#4F46E5', '#7C3AED']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradientHeader}
        >
          <View style={styles.headerContent}>
            <View style={styles.userInfo}>
              <View style={styles.avatarContainer}>
                <Text style={styles.avatarText}>
                  {getInitials(user?.fullName || 'Student')}
                </Text>
              </View>
              <View>
                <Text style={styles.greeting}>Welcome back,</Text>
                <Text style={styles.name}>
                  {user?.fullName || 'Student'}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
            >
              <Ionicons
                name="log-out-outline"
                size={22}
                color="#FFFFFF"
              />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        <View style={styles.content}>
          {/* Quick Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Ionicons name="book-outline" size={24} color="#4F46E5" />
              <Text style={styles.statNumber}>{todayClasses.length}</Text>
              <Text style={styles.statLabel}>Today's Classes</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="document-text-outline" size={24} color="#7C3AED" />
              <Text style={styles.statNumber}>{recentResources.length}</Text>
              <Text style={styles.statLabel}>Resources</Text>
            </View>
          </View>

          {/* Schedule Section */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Today's Schedule</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loadingCard}>
              <ActivityIndicator size="large" color="#4F46E5" />
            </View>
          ) : todayClasses.length === 0 ? (
            <View style={styles.emptyCard}>
              <Ionicons name="calendar-outline" size={48} color="#D1D5DB" />
              <Text style={styles.emptyText}>No classes scheduled for today 🎉</Text>
            </View>
          ) : (
            todayClasses.map((cls, index) => (
              <View key={index} style={styles.classCard}>
                <View style={styles.classHeader}>
                  <View style={styles.timeBadge}>
                    <Ionicons name="time-outline" size={14} color="#4F46E5" />
                    <Text style={styles.timeText}>
                      {cls.startTime} - {cls.endTime}
                    </Text>
                  </View>
                  <View style={styles.roomBadge}>
                    <Ionicons name="location-outline" size={14} color="#6B7280" />
                    <Text style={styles.roomText}>{cls.room}</Text>
                  </View>
                </View>

                <Text style={styles.subject}>{cls.subjectCode}</Text>
                
                <View style={styles.teacherContainer}>
                  <View style={styles.teacherAvatar}>
                    <Text style={styles.teacherInitial}>
                      {cls.teacherName?.charAt(0) || 'T'}
                    </Text>
                  </View>
                  <Text style={styles.teacherName}>{cls.teacherName}</Text>
                </View>
              </View>
            ))
          )}

          {/* Resources Section */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Resources</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          {recentResources.length === 0 ? (
            <View style={styles.emptyCard}>
              <Ionicons name="folder-open-outline" size={48} color="#D1D5DB" />
              <Text style={styles.emptyText}>No resources available</Text>
            </View>
          ) : (
            recentResources.map((resource) => (
              <TouchableOpacity
                key={resource.id}
                style={styles.resourceCard}
                onPress={() => Linking.openURL(resource.fileUrl)}
                activeOpacity={0.7}
              >
                <View style={styles.resourceIcon}>
                  <Ionicons name="document-text" size={22} color="#4F46E5" />
                </View>

                <View style={styles.resourceInfo}>
                  <Text style={styles.resourceTitle} numberOfLines={1}>
                    {resource.title}
                  </Text>
                  <Text style={styles.resourceMeta}>
                    {resource.subjectCode}
                  </Text>
                </View>

                <View style={styles.resourceArrow}>
                  <Ionicons name="arrow-forward" size={18} color="#9CA3AF" />
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  gradientHeader: {
    paddingTop: 20,
    paddingBottom: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  greeting: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '400',
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  logoutButton: {
    padding: 10,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
    marginTop: -10,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginHorizontal: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 6,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  seeAllText: {
    fontSize: 14,
    color: '#4F46E5',
    fontWeight: '600',
  },
  loadingCard: {
    backgroundColor: '#FFFFFF',
    padding: 40,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    padding: 40,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  emptyText: {
    color: '#9CA3AF',
    marginTop: 12,
    fontSize: 16,
  },
  classCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  classHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  timeText: {
    marginLeft: 4,
    color: '#4F46E5',
    fontSize: 12,
    fontWeight: '600',
  },
  roomBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  roomText: {
    marginLeft: 4,
    color: '#6B7280',
    fontSize: 12,
    fontWeight: '500',
  },
  subject: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 10,
  },
  teacherContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  teacherAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  teacherInitial: {
    color: '#4F46E5',
    fontSize: 12,
    fontWeight: 'bold',
  },
  teacherName: {
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '500',
  },
  resourceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  resourceIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  resourceInfo: {
    flex: 1,
  },
  resourceTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  resourceMeta: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  resourceArrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
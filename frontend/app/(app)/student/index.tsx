import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { useAuthStore } from '../../../store/authStore';
import { supabase } from '../../../utils/supabase';
import { BACKEND_URL } from '../../../utils/config';
import { useFocusEffect } from "@react-navigation/native";
import { Linking } from "react-native";

export default function StudentDashboard() {
  const { user, signOut } = useAuthStore();
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
        )}&section=${encodeURIComponent(section)}`
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

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.name}>
              {user?.fullName || 'Student'}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <Ionicons
              name="log-out-outline"
              size={24}
              color="#EF4444"
            />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <Text style={styles.sectionTitle}>
            Today's Schedule
          </Text>

          {loading ? (
            <View style={styles.card}>
              <ActivityIndicator
                size="large"
                color="#4F46E5"
              />
            </View>
          ) : todayClasses.length === 0 ? (
            <View style={styles.card}>
              <Text style={styles.cardText}>
                No classes scheduled for today 🎉
              </Text>
            </View>
          ) : (
            todayClasses.map((cls, index) => (
              <View key={index} style={styles.classCard}>
                <View style={styles.timeRow}>
                  <Ionicons
                    name="time-outline"
                    size={16}
                    color="#6B7280"
                  />
                  <Text style={styles.timeText}>
                    {cls.startTime} - {cls.endTime}
                  </Text>
                </View>

                <Text style={styles.subject}>
                  {cls.subjectCode}
                </Text>

                <Text style={styles.meta}>
                  📍 {cls.room}
                </Text>

                <Text style={styles.meta}>
                  👨‍🏫 {cls.teacherName}
                </Text>
              </View>
            ))
          )}

         <Text style={styles.sectionTitle}>
  Recent Resources
</Text>

{recentResources.length === 0 ? (
  <View style={styles.card}>
    <Text style={styles.cardText}>
      No recent resources available.
    </Text>
  </View>
) : (
  recentResources.map((resource) => (
    <TouchableOpacity
      key={resource.id}
      style={styles.resourceCard}
      onPress={() =>
        Linking.openURL(resource.fileUrl)
      }
    >
      <View style={styles.resourceIcon}>
        <Ionicons
          name="document-text"
          size={22}
          color="#4F46E5"
        />
      </View>

      <View style={{ flex: 1 }}>
        <Text
          style={styles.resourceTitle}
          numberOfLines={1}
        >
          {resource.title}
        </Text>

        <Text style={styles.resourceMeta}>
          {resource.subjectCode}
        </Text>
      </View>

      <Ionicons
        name="chevron-forward"
        size={18}
        color="#9CA3AF"
      />
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
    backgroundColor: '#F9FAFB',
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },

  greeting: {
    fontSize: 16,
    color: '#6B7280',
  },

  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },

  logoutButton: {
    padding: 8,
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
  },

  content: {
    padding: 24,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
    marginTop: 8,
  },

  card: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },

  classCard: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#4F46E5',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },

  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },

  timeText: {
    marginLeft: 6,
    color: '#6B7280',
    fontSize: 13,
  },

  subject: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },

  meta: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },

  cardText: {
    color: '#6B7280',
    textAlign: 'center',
  },
  resourceCard: {
  flexDirection: "row",
  alignItems: "center",
  backgroundColor: "#fff",
  padding: 14,
  borderRadius: 12,
  marginBottom: 10,
  shadowColor: "#000",
  shadowOffset: {
    width: 0,
    height: 1,
  },
  shadowOpacity: 0.05,
  shadowRadius: 2,
  elevation: 2,
},

resourceIcon: {
  width: 42,
  height: 42,
  borderRadius: 10,
  backgroundColor: "#EEF2FF",
  justifyContent: "center",
  alignItems: "center",
  marginRight: 12,
},

resourceTitle: {
  fontSize: 14,
  fontWeight: "600",
  color: "#111827",
},

resourceMeta: {
  fontSize: 12,
  color: "#6B7280",
  marginTop: 2,
},
});
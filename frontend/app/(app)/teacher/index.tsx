import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore } from "../../../store/authStore";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { BACKEND_URL } from "@/utils/config";
import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";

export default function TeacherDashboard() {
  const { user, signOut, session } = useAuthStore();
  const router = useRouter();

  const [resourceCount, setResourceCount] = useState(0);
  const [todayClasses, setTodayClasses] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const actions = [
    {
      icon: "cloud-upload-outline",
      label: "Upload Resource",
      color: "#6366F1",
      bg: "#EEF2FF",
      route: "/teacher/upload",
    },
    {
      icon: "folder-open-outline",
      label: "My Resources",
      color: "#06B6D4",
      bg: "#ECFEFF",
      route: "/teacher/files",
    },
    {
      icon: "calendar-outline",
      label: "View Schedule",
      color: "#8B5CF6",
      bg: "#F5F3FF",
      route: "/teacher/schedule",
    },
  ];

  const fetchDashboardData = async () => {
    try {
      const token = session?.access_token;
      if (!token) return;

      const [resourcesRes, classesRes] = await Promise.all([
        fetch(`${BACKEND_URL}/api/resources/teacher/count`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${BACKEND_URL}/api/timetable/teacher/today`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const resourcesData = await resourcesRes.json();
      const classesData = await classesRes.json();

      setResourceCount(resourcesData.count || 0);
      setTodayClasses(classesData.count || 0);
    } catch (error) {
      console.log("Dashboard Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchDashboardData();
    }, [])
  );

  const getInitials = (name: string) => {
    return name
      ?.split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'T';
  };

  const handleLogout = async () => {
    await signOut();
    router.replace("/(auth)");
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with Gradient - Same as Student Dashboard */}
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
                {getInitials(user?.fullName || 'Teacher')}
              </Text>
            </View>
            <View>
              <Text style={styles.greeting}>Welcome back,</Text>
              <Text style={styles.name}>
                {user?.fullName || 'Teacher'}
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

      <ScrollView 
        contentContainerStyle={styles.content} 
        showsVerticalScrollIndicator={false}
      >
        {/* Stats Row */}
        <View style={styles.statsRow}>
          {/* Classes Stat Card */}
          <View style={[styles.statCard, styles.statCardBlue]}>
            <View style={styles.statIconBadge}>
              <Ionicons name="calendar" size={20} color="#4F46E5" />
            </View>
            {isLoading ? (
              <ActivityIndicator size="small" color="#4F46E5" style={styles.loader} />
            ) : (
              <Text style={styles.statValue}>{todayClasses}</Text>
            )}
            <Text style={styles.statLabel}>Classes Today</Text>
          </View>

          {/* Resources Stat Card */}
          <View style={[styles.statCard, styles.statCardGreen]}>
            <View style={styles.statIconBadge}>
              <Ionicons name="document-text" size={20} color="#10B981" />
            </View>
            {isLoading ? (
              <ActivityIndicator size="small" color="#10B981" style={styles.loader} />
            ) : (
              <Text style={styles.statValue}>{resourceCount}</Text>
            )}
            <Text style={styles.statLabel}>Total Resources</Text>
          </View>
        </View>

        {/* Section Title */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>

        {/* Actions Layout Grid */}
        <View style={styles.actionsGrid}>
          {actions.map((action) => (
            <TouchableOpacity
              key={action.label}
              style={styles.actionCard}
              activeOpacity={0.6}
              onPress={() => router.push(action.route as any)}
            >
              <View style={[styles.actionIconWrapper, { backgroundColor: action.bg }]}>
                <Ionicons name={action.icon as any} size={24} color={action.color} />
              </View>
              <Text style={styles.actionLabel}>{action.label}</Text>
              <Ionicons name="chevron-forward" size={16} color="#9CA3AF" style={styles.arrowIcon} />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
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
    padding: 24,
    paddingTop: 20,
  },
  statsRow: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  statCardBlue: {
    borderLeftWidth: 4,
    borderLeftColor: "#4F46E5",
  },
  statCardGreen: {
    borderLeftWidth: 4,
    borderLeftColor: "#10B981",
  },
  statIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#EEF2FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  statValue: {
    fontSize: 32,
    fontWeight: "800",
    color: "#111827",
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6B7280",
    marginTop: 2,
  },
  loader: {
    alignSelf: "flex-start",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 12,
    marginTop: 8,
  },
  actionsGrid: {
    gap: 12,
  },
  actionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: "#4F46E5",
  },
  actionIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  actionLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    flex: 1,
  },
  arrowIcon: {
    marginLeft: "auto",
  },
});
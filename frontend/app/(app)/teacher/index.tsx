import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore } from "../../../store/authStore";
import { Ionicons } from "@expo/vector-icons";
import {  useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { BACKEND_URL } from "@/utils/config";
import { useFocusEffect } from "@react-navigation/native";

export default function TeacherDashboard() {
  const { user, signOut, session } = useAuthStore();
  const router = useRouter();

  const [resourceCount, setResourceCount] = useState(0);
  const [todayClasses, setTodayClasses] = useState(0);

  const actions = [
    {
      icon: "cloud-upload",
      label: "Upload Resource",
      color: "#4F46E5",
      route: "/teacher/upload",
    },
    {
      icon: "folder-open",
      label: "My Resources",
      color: "#0891B2",
      route: "/teacher/files",
    },
    {
      icon: "calendar",
      label: "View Schedule",
      color: "#7C3AED",
      route: "/teacher/schedule",
    },
  ];

  const fetchDashboardData = async () => {
    try {
      const token = session?.access_token;

      const [resourcesRes, classesRes] = await Promise.all([
        fetch(`${BACKEND_URL}/api/resources/teacher/count`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
        fetch(`${BACKEND_URL}/api/timetable/teacher/today`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      ]);

      const resourcesData = await resourcesRes.json();
      const classesData = await classesRes.json();

      setResourceCount(resourcesData.count || 0);
      setTodayClasses(classesData.count || 0);
    } catch (error) {
      console.log("Dashboard Error:", error);
    }
  };

useFocusEffect(
  useCallback(() => {
    fetchDashboardData();
  }, [])
);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome,</Text>
          <Text style={styles.name}>
            {user?.fullName || "Teacher"}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={() => {
            signOut();
            router.replace("/(auth)");
          }}
        >
          <Ionicons
            name="log-out-outline"
            size={22}
            color="#EF4444"
          />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.statsRow}>
          <View
            style={[
              styles.statCard,
              { backgroundColor: "#EEF2FF" },
            ]}
          >
            <Ionicons
              name="calendar"
              size={24}
              color="#4F46E5"
            />
            <Text style={styles.statValue}>
              {todayClasses}
            </Text>
            <Text style={styles.statLabel}>
              Classes Today
            </Text>
          </View>

          <View
            style={[
              styles.statCard,
              { backgroundColor: "#F0FDF4" },
            ]}
          >
            <Ionicons
              name="document-text"
              size={24}
              color="#16A34A"
            />
            <Text style={styles.statValue}>
              {resourceCount}
            </Text>
            <Text style={styles.statLabel}>
              Resources
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>
          Quick Actions
        </Text>

        <View style={styles.actionsGrid}>
          {actions.map((action) => (
            <TouchableOpacity
              key={action.label}
              style={styles.actionCard}
              onPress={() =>
                router.push(action.route as any)
              }
            >
              <Ionicons
                name={action.icon as any}
                size={28}
                color={action.color}
              />
              <Text style={styles.actionLabel}>
                {action.label}
              </Text>
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

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 24,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },

  greeting: {
    fontSize: 14,
    color: "#6B7280",
  },

  name: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#111827",
  },

  logoutBtn: {
    padding: 8,
    backgroundColor: "#FEF2F2",
    borderRadius: 8,
  },

  content: {
    padding: 20,
    gap: 16,
  },

  statsRow: {
    flexDirection: "row",
    gap: 12,
  },

  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    gap: 6,
  },

  statValue: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#111827",
  },

  statLabel: {
    fontSize: 12,
    color: "#6B7280",
    textAlign: "center",
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
    marginTop: 8,
  },

  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },

  actionCard: {
    width: "47%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
    gap: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },

  actionLabel: {
    fontSize: 13,
    fontWeight: "500",
    color: "#374151",
    textAlign: "center",
  },
});
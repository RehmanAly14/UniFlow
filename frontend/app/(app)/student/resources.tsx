import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "../../../store/authStore";
import { BACKEND_URL } from "../../../utils/config";

const TYPE_ICONS = {
  PDF: {
    icon: "document-text",
    color: "#EF4444",
    bg: "#FEE2E2",
  },
  FILE: {
    icon: "document",
    color: "#4F46E5",
    bg: "#EEF2FF",
  },
};

export default function StudentResources() {
  const { session } = useAuthStore();

  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSubject, setActiveSubject] =
    useState("All");

  const fetchResources = async () => {
    try {
      const response = await fetch(
        `${BACKEND_URL}/api/resources/student`,
        {
          headers: {
            Authorization: `Bearer ${session?.access_token}`,
          },
        }
      );

      const data = await response.json();

      setResources(Array.isArray(data) ? data : []);
    } catch (error) {
      console.log("Resources Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  const SUBJECTS = [
    "All",
    ...new Set(
      resources.map(
        (item) => item.subjectCode || "General"
      )
    ),
  ];

  const filtered =
    activeSubject === "All"
      ? resources
      : resources.filter(
          (item) =>
            item.subjectCode === activeSubject
        );

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator
          size="large"
          color="#4F46E5"
        />
        <Text style={styles.loadingText}>
          Loading resources...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          Resources
        </Text>
        <Text style={styles.subtitle}>
          Notes, slides & study material
        </Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filters}
        contentContainerStyle={
          styles.filtersContent
        }
      >
        {SUBJECTS.map((subject) => (
          <TouchableOpacity
            key={subject}
            style={[
              styles.filterChip,
              activeSubject === subject &&
                styles.filterChipActive,
            ]}
            onPress={() =>
              setActiveSubject(subject)
            }
          >
            <Text
              style={[
                styles.filterText,
                activeSubject === subject &&
                  styles.filterTextActive,
              ]}
            >
              {subject}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons
              name="folder-open-outline"
              size={50}
              color="#9CA3AF"
            />
            <Text style={styles.emptyText}>
              No resources available
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const meta = TYPE_ICONS.FILE;

          return (
            <TouchableOpacity
              style={styles.card}
              onPress={() =>
                Linking.openURL(item.fileUrl)
              }
            >
              <View
                style={[
                  styles.iconBox,
                  {
                    backgroundColor: meta.bg,
                  },
                ]}
              >
                <Ionicons
                  name={meta.icon as any}
                  size={26}
                  color={meta.color}
                />
              </View>

              <View style={styles.cardInfo}>
                <Text
                  style={styles.cardTitle}
                  numberOfLines={2}
                >
                  {item.title}
                </Text>

                <Text style={styles.subject}>
                  {item.subjectCode}
                </Text>

                {item.description ? (
                  <Text
                    style={styles.description}
                    numberOfLines={2}
                  >
                    {item.description}
                  </Text>
                ) : null}

                <Text style={styles.cardSub}>
                  {new Date(
                    item.createdAt
                  ).toLocaleDateString()}
                </Text>
              </View>

              <Ionicons
                name="download-outline"
                size={22}
                color="#6B7280"
              />
            </TouchableOpacity>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
  },

  loadingText: {
    marginTop: 12,
    color: "#6B7280",
  },

  header: {
    padding: 24,
    paddingBottom: 12,
    backgroundColor: "#fff",
  },

  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
  },

  subtitle: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 4,
  },

  filters: {
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },

  filtersContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },

  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
  },

  filterChipActive: {
    backgroundColor: "#4F46E5",
  },

  filterText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#6B7280",
  },

  filterTextActive: {
    color: "#fff",
  },

  list: {
    padding: 16,
    gap: 12,
  },

  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 14,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },

  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },

  cardInfo: {
    flex: 1,
  },

  cardTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
  },

  subject: {
    fontSize: 12,
    color: "#4F46E5",
    fontWeight: "600",
    marginTop: 4,
  },

  description: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 4,
  },

  cardSub: {
    fontSize: 11,
    color: "#9CA3AF",
    marginTop: 6,
  },

  emptyState: {
    alignItems: "center",
    marginTop: 80,
  },

  emptyText: {
    marginTop: 10,
    color: "#6B7280",
    fontSize: 15,
  },
});
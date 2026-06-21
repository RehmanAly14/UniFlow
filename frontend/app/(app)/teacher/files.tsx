import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { BACKEND_URL } from "../../../utils/config";
import { useAuthStore } from "../../../store/authStore";

export default function TeacherFiles() {
  const { session } = useAuthStore();
  const router = useRouter();

  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchResources = async () => {
    try {
      const response = await fetch(
        `${BACKEND_URL}/api/resources/teacher`,
        {
          headers: {
            Authorization: `Bearer ${session?.access_token}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        setResources(data);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  const openFile = async (url: string) => {
    try {
      if (!url) return;
      await Linking.openURL(url);
    } catch (err) {
      console.error("Couldn't open URL", err);
    }
  };

  const renderItem = ({ item }: any) => (
    <TouchableOpacity 
      style={styles.card}
      activeOpacity={0.7}
      onPress={() => openFile(item.fileUrl)}
    >
      <View style={styles.cardBody}>
        {/* Document Vector Identity */}
        <View style={styles.iconContainer}>
          <Ionicons
            name="document-text-outline"
            size={22}
            color="#4F46E5"
          />
        </View>

        {/* Informational Context */}
        <View style={styles.textDetails}>
          <Text style={styles.titleText} numberOfLines={1}>
            {item.title}
          </Text>
          {item.description ? (
            <Text style={styles.descText} numberOfLines={2}>
              {item.description}
            </Text>
          ) : null}

          {/* Metadata Parameters Pills */}
          <View style={styles.metaRow}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{item.degree}</Text>
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Sem {item.semester}</Text>
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Sec {item.section}</Text>
            </View>
          </View>
        </View>

        {/* Trailing Interactive Accent */}
        <View style={styles.actionArrowWrapper}>
          <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Structural Header Module */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backBtn} 
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={20} color="#334155" />
        </TouchableOpacity>
        <Text style={styles.screenTitle}>My Resources</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Conditional Interface State Controller */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#4F46E5" />
          <Text style={styles.stateMessage}>Retrieving catalog items...</Text>
        </View>
      ) : resources.length === 0 ? (
        <View style={styles.center}>
          <View style={styles.emptyIconCircle}>
            <Ionicons name="folder-open-outline" size={32} color="#4F46E5" />
          </View>
          <Text style={styles.emptyHeading}>No Shared Material</Text>
          <Text style={styles.stateMessage}>Resources published via the dashboard will populate here.</Text>
        </View>
      ) : (
        <FlatList
          data={resources}
          keyExtractor={(item) => item.id || item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.listPadding}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
  },
  screenTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
  },
  listPadding: {
    padding: 20,
    gap: 12,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#EEF2FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  emptyHeading: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 4,
  },
  stateMessage: {
    color: "#64748B",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    marginTop: 4,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 2,
    overflow: "hidden",
  },
  cardBody: {
    flexDirection: "row",
    padding: 16,
    alignItems: "center",
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#EEF2FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  textDetails: {
    flex: 1,
    justifyContent: "center",
  },
  titleText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
  },
  descText: {
    marginTop: 3,
    fontSize: 13,
    color: "#64748B",
    lineHeight: 18,
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 10,
  },
  badge: {
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  badgeText: {
    color: "#475569",
    fontSize: 11,
    fontWeight: "600",
  },
  actionArrowWrapper: {
    marginLeft: 8,
    justifyContent: "center",
    alignItems: "center",
  },
});
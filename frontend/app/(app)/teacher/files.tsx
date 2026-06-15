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

import { BACKEND_URL } from "../../../utils/config";
import { useAuthStore } from "../../../store/authStore";

export default function TeacherFiles() {
  const { session } = useAuthStore();

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
    await Linking.openURL(url);
  };

  const renderItem = ({ item }: any) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Ionicons
          name="document-text-outline"
          size={24}
          color="#4F46E5"
        />

        <View style={{ flex: 1 }}>
          <Text style={styles.titleText}>
            {item.title}
          </Text>

          <Text style={styles.desc}>
            {item.description}
          </Text>
        </View>
      </View>

      <View style={styles.metaRow}>
        <Text style={styles.meta}>
          {item.degree}
        </Text>

        <Text style={styles.meta}>
          Sem {item.semester}
        </Text>

        <Text style={styles.meta}>
          {item.section}
        </Text>
      </View>

      <TouchableOpacity
        style={styles.openButton}
        onPress={() => openFile(item.fileUrl)}
      >
        <Ionicons
          name="cloud-download-outline"
          size={18}
          color="#fff"
        />

        <Text style={styles.buttonText}>
          Open Resource
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.screenTitle}>
          My Resources
        </Text>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator
            size="large"
            color="#4F46E5"
          />
        </View>
      ) : resources.length === 0 ? (
        <View style={styles.center}>
          <Ionicons
            name="folder-open-outline"
            size={50}
            color="#9CA3AF"
          />

          <Text style={styles.emptyText}>
            No resources uploaded yet
          </Text>
        </View>
      ) : (
        <FlatList
          data={resources}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{
            padding: 16,
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },

  header: {
    padding: 24,
    backgroundColor: "#fff",
  },

  screenTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },

  emptyText: {
    color: "#6B7280",
    fontSize: 16,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
  },

  cardHeader: {
    flexDirection: "row",
    gap: 12,
  },

  titleText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },

  desc: {
    marginTop: 4,
    color: "#6B7280",
  },

  metaRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
  },

  meta: {
    backgroundColor: "#EEF2FF",
    color: "#4F46E5",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    fontSize: 12,
  },

  openButton: {
    marginTop: 14,
    backgroundColor: "#4F46E5",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },

  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },
});
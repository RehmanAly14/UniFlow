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
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "../../../store/authStore";
import { BACKEND_URL } from "../../../utils/config";
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const TYPE_ICONS = {
  PDF: {
    icon: "document-text",
    color: "#EF4444",
    bg: "#FEE2E2",
    gradient: ['#EF4444', '#DC2626'],
  },
  FILE: {
    icon: "document",
    color: "#4F46E5",
    bg: "#EEF2FF",
    gradient: ['#4F46E5', '#7C3AED'],
  },
  VIDEO: {
    icon: "videocam",
    color: "#0891B2",
    bg: "#E0F2FE",
    gradient: ['#0891B2', '#0D9488'],
  },
  LINK: {
    icon: "link",
    color: "#D97706",
    bg: "#FEF3C7",
    gradient: ['#D97706', '#F59E0B'],
  },
};

export default function StudentResources() {
  const { session } = useAuthStore();

  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSubject, setActiveSubject] = useState("All");

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

  const getResourceIcon = (item: any) => {
    if (item.fileUrl?.includes('.pdf')) return TYPE_ICONS.PDF;
    if (item.fileUrl?.includes('youtube') || item.fileUrl?.includes('video')) return TYPE_ICONS.VIDEO;
    if (item.fileUrl?.includes('http')) return TYPE_ICONS.LINK;
    return TYPE_ICONS.FILE;
  };

  const getFileType = (url: string) => {
    if (!url) return 'FILE';
    if (url.includes('.pdf')) return 'PDF';
    if (url.includes('youtube') || url.includes('video')) return 'VIDEO';
    if (url.includes('http')) return 'LINK';
    return 'FILE';
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color="#4F46E5" />
          <Text style={styles.loadingText}>Loading resources...</Text>
          <Text style={styles.loadingSubtext}>Please wait while we fetch your materials</Text>
        </View>
      </SafeAreaView>
    );
  }

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
            <Text style={styles.title}> Resources</Text>
            <Text style={styles.subtitle}>
              {filtered.length} {filtered.length === 1 ? 'resource' : 'resources'} available
            </Text>
          </View>
          <TouchableOpacity style={styles.headerButton} onPress={fetchResources}>
            <Ionicons name="refresh-outline" size={22} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Subject Filters */}
      <View style={styles.filtersWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContent}
        >
          {SUBJECTS.map((subject) => {
            const isActive = activeSubject === subject;
            const count = subject === 'All' 
              ? resources.length 
              : resources.filter(r => r.subjectCode === subject).length;
            
            return (
              <TouchableOpacity
                key={subject}
                style={[
                  styles.filterChip,
                  isActive && styles.filterChipActive,
                ]}
                onPress={() => setActiveSubject(subject)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.filterText,
                    isActive && styles.filterTextActive,
                  ]}
                >
                  {subject}
                </Text>
                {count > 0 && (
                  <View style={[styles.filterCount, isActive && styles.filterCountActive]}>
                    <Text style={[styles.filterCountText, isActive && styles.filterCountTextActive]}>
                      {count}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <Ionicons name="folder-open-outline" size={64} color="#D1D5DB" />
            </View>
            <Text style={styles.emptyTitle}>No Resources Found</Text>
            <Text style={styles.emptySubtext}>
              {activeSubject === 'All' 
                ? 'No resources are currently available.' 
                : `No resources available for ${activeSubject}`}
            </Text>
            {activeSubject !== 'All' && (
              <TouchableOpacity 
                style={styles.clearFilterBtn}
                onPress={() => setActiveSubject('All')}
              >
                <Text style={styles.clearFilterText}>View All Resources</Text>
              </TouchableOpacity>
            )}
          </View>
        }
        renderItem={({ item, index }) => {
          const meta = getResourceIcon(item);
          const fileType = getFileType(item.fileUrl);

          return (
            <TouchableOpacity
              style={styles.card}
              onPress={() => Linking.openURL(item.fileUrl)}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={meta.gradient || ['#4F46E5', '#7C3AED']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.cardGradient}
              />
              
              <View style={styles.cardContent}>
                <View style={styles.cardHeader}>
                  <View style={[styles.iconBox, { backgroundColor: meta.bg }]}>
                    <Ionicons
                      name={meta.icon as any}
                      size={26}
                      color={meta.color}
                    />
                  </View>
                  <View style={styles.fileTypeBadge}>
                    <Text style={styles.fileTypeText}>{fileType}</Text>
                  </View>
                </View>

                <View style={styles.cardInfo}>
                  <Text style={styles.cardTitle} numberOfLines={2}>
                    {item.title}
                  </Text>

                  <View style={styles.metaRow}>
                    <View style={styles.subjectBadge}>
                      <Ionicons name="bookmark-outline" size={12} color="#4F46E5" />
                      <Text style={styles.subjectText}>{item.subjectCode || 'General'}</Text>
                    </View>
                    <View style={styles.dateBadge}>
                      <Ionicons name="calendar-outline" size={12} color="#6B7280" />
                      <Text style={styles.dateText}>
                        {new Date(item.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </Text>
                    </View>
                  </View>

                  {item.description && (
                    <Text style={styles.description} numberOfLines={2}>
                      {item.description}
                    </Text>
                  )}
                </View>

                <View style={styles.cardFooter}>
                  <View style={styles.downloadBadge}>
                    <Ionicons name="download-outline" size={14} color="#4F46E5" />
                    <Text style={styles.downloadText}>Open</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
                </View>
              </View>
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
    backgroundColor: "#F3F4F6",
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
  },

  loadingContent: {
    alignItems: "center",
  },

  loadingText: {
    marginTop: 16,
    color: "#111827",
    fontSize: 16,
    fontWeight: "600",
  },

  loadingSubtext: {
    marginTop: 4,
    color: "#6B7280",
    fontSize: 13,
  },

  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 28,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },

  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },

  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#FFFFFF",
  },

  subtitle: {
    fontSize: 13,
    color: "rgba(255,255,255,0.8)",
    marginTop: 4,
  },

  filtersWrapper: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },

  filtersContent: {
    paddingHorizontal: 20,
    gap: 10,
  },

  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 25,
    backgroundColor: "#F3F4F6",
    gap: 8,
  },

  filterChipActive: {
    backgroundColor: "#4F46E5",
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },

  filterText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6B7280",
  },

  filterTextActive: {
    color: "#FFFFFF",
  },

  filterCount: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 12,
    minWidth: 20,
    alignItems: 'center',
  },

  filterCountActive: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },

  filterCountText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#6B7280",
  },

  filterCountTextActive: {
    color: "#FFFFFF",
  },

  list: {
    padding: 16,
    gap: 12,
    paddingBottom: 40,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },

  cardGradient: {
    height: 4,
    width: '100%',
  },

  cardContent: {
    padding: 16,
  },

  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },

  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },

  fileTypeBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },

  fileTypeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#6B7280",
  },

  cardInfo: {
    flex: 1,
    gap: 8,
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    lineHeight: 22,
  },

  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },

  subjectBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },

  subjectText: {
    fontSize: 11,
    color: "#4F46E5",
    fontWeight: "600",
  },

  dateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },

  dateText: {
    fontSize: 11,
    color: "#6B7280",
    fontWeight: "500",
  },

  description: {
    fontSize: 13,
    color: "#6B7280",
    lineHeight: 18,
    marginTop: 4,
  },

  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },

  downloadBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },

  downloadText: {
    fontSize: 12,
    color: "#4F46E5",
    fontWeight: "600",
  },

  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
    flex: 1,
  },

  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },

  emptyTitle: {
    marginTop: 20,
    color: "#111827",
    fontSize: 18,
    fontWeight: "600",
  },

  emptySubtext: {
    marginTop: 8,
    color: "#6B7280",
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 32,
    lineHeight: 20,
  },

  clearFilterBtn: {
    marginTop: 16,
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },

  clearFilterText: {
    color: "#4F46E5",
    fontWeight: "600",
    fontSize: 14,
  },
});
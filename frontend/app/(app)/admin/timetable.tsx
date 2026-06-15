import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import { BACKEND_URL } from '../../../utils/config';

export default function AdminTimetable() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<{name: string, count: number}[]>([]);

  useEffect(() => {
    fetchTimetables();
  }, []);

  const fetchTimetables = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${BACKEND_URL}/api/timetable/all`);
      const data = await res.json();
      
      if (Array.isArray(data)) {
        const counts: Record<string, number> = {};
        data.forEach(item => {
          const key = `${item.degree || 'Unknown'} - Sem ${item.semester || '?'} - Sec ${item.section || '?'}`;
          counts[key] = (counts[key] || 0) + 1;
        });
        
        const summaryData = Object.keys(counts).map(key => ({
          name: key,
          count: counts[key]
        }));
        
        setSummary(summaryData);
      }
    } catch (error) {
      console.error("Error fetching all timetables:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Timetable Management</Text>
      </View>
      
      <ScrollView contentContainerStyle={styles.content}>
        <TouchableOpacity
          style={styles.uploadBox}
          onPress={() => Alert.alert('Coming Soon', 'Excel timetable upload — Phase 2')}
        >
          <Ionicons name="document-attach-outline" size={52} color="#4F46E5" />
          <Text style={styles.uploadTitle}>Upload Excel File</Text>
          <Text style={styles.uploadHint}>Format: Degree | Semester | Section | Day | Time | Subject | Teacher | Room</Text>
        </TouchableOpacity>

        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={20} color="#0891B2" />
          <Text style={styles.infoText}>The file will be parsed and automatically inserted into the database for all students and teachers.</Text>
        </View>

        <View style={styles.summarySection}>
          <Text style={styles.sectionTitle}>Active Timetables Summary</Text>
          {loading ? (
            <ActivityIndicator size="small" color="#4F46E5" style={{ marginTop: 20 }} />
          ) : summary.length === 0 ? (
            <Text style={styles.noDataText}>No timetables found in the database.</Text>
          ) : (
            summary.map((item, idx) => (
              <View key={idx} style={styles.summaryCard}>
                <View style={styles.summaryIconBox}>
                  <Ionicons name="calendar-outline" size={20} color="#4F46E5" />
                </View>
                <View style={styles.summaryInfo}>
                  <Text style={styles.summaryName}>{item.name}</Text>
                  <Text style={styles.summaryCount}>{item.count} classes scheduled</Text>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { padding: 24, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#111827' },
  content: { padding: 24, gap: 20 },
  uploadBox: { borderWidth: 2, borderColor: '#C7D2FE', borderStyle: 'dashed', borderRadius: 20, padding: 40, alignItems: 'center', gap: 12, backgroundColor: '#EEF2FF' },
  uploadTitle: { fontSize: 18, fontWeight: '600', color: '#4F46E5' },
  uploadHint: { fontSize: 13, color: '#6B7280', textAlign: 'center', lineHeight: 20 },
  infoCard: { flexDirection: 'row', gap: 10, backgroundColor: '#ECFEFF', padding: 16, borderRadius: 12, alignItems: 'flex-start' },
  infoText: { flex: 1, fontSize: 13, color: '#0E7490', lineHeight: 20 },
  summarySection: { marginTop: 10, gap: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#111827', marginBottom: 4 },
  noDataText: { fontSize: 14, color: '#6B7280', fontStyle: 'italic' },
  summaryCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 16, borderRadius: 12, gap: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 },
  summaryIconBox: { width: 40, height: 40, borderRadius: 10, backgroundColor: '#EEF2FF', justifyContent: 'center', alignItems: 'center' },
  summaryInfo: { flex: 1 },
  summaryName: { fontSize: 16, fontWeight: '600', color: '#111827' },
  summaryCount: { fontSize: 13, color: '#6B7280', marginTop: 2 },
});

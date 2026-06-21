import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "../../../store/authStore";
import { BACKEND_URL } from '../../../utils/config';
import { supabase } from "../../../utils/supabase";
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

interface Course {
  name: string;
  credit: number;
  grade: string;
}

interface LMSCourse {
  sr: string;
  semester: string;
  course_code: string;
  course_title: string;
  credit_hours: string;
  grade: string;
}

const GRADE_POINTS: Record<string, number> = {
  A: 4.0,
  "A-": 3.7,
  "B+": 3.3,
  B: 3.0,
  "B-": 2.7,
  "C+": 2.3,
  C: 2.0,
  "C-": 1.7,
  D: 1.0,
  F: 0.0,
};

const GRADE_COLORS: Record<string, string> = {
  A: '#16A34A',
  "A-": '#22C55E',
  "B+": '#F59E0B',
  B: '#F59E0B',
  "B-": '#F97316',
  "C+": '#F97316',
  C: '#EF4444',
  "C-": '#EF4444',
  D: '#DC2626',
  F: '#DC2626',
};

function calculateCGPA(rows: LMSCourse[]) {
  let totalPoints = 0;
  let totalCredits = 0;

  rows.forEach((course) => {
    const grade = course.grade?.trim();
    if (!(grade in GRADE_POINTS)) return;
    const credit = parseFloat(course.credit_hours.split("(")[0]) || 0;
    totalPoints += credit * GRADE_POINTS[grade];
    totalCredits += credit;
  });

  if (totalCredits === 0) return "0.00";
  return (totalPoints / totalCredits).toFixed(2);
}

function calcGPA(courses: Course[]) {
  const valid = courses.filter(
    (c) => GRADE_POINTS[c.grade] !== undefined && c.credit > 0
  );

  if (!valid.length) return "0.00";

  const total = valid.reduce(
    (acc, c) => acc + GRADE_POINTS[c.grade] * c.credit,
    0
  );

  const credits = valid.reduce((acc, c) => acc + c.credit, 0);
  return (total / credits).toFixed(2);
}

export default function StudentGPA() {
  const [tab, setTab] = useState<"scraped" | "calculator">("scraped");
  const [loading, setLoading] = useState(true);
  const [studentName, setStudentName] = useState("");
  const [cgpa, setCgpa] = useState("0.00");
  const [coursesData, setCoursesData] = useState<LMSCourse[]>([]);
  const [courses, setCourses] = useState<Course[]>([
    { name: "Data Structures", credit: 3, grade: "A" },
  ]);

  const fetchResult = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();

      const response = await fetch(
        `${BACKEND_URL}/api/results/student`,
        { headers: { Authorization: `Bearer ${session?.access_token}` } }
      );

      const result = await response.json();

      if (result.success && result.data?.result_table?.rows) {
        const rows = result.data.result_table.rows;
        setCoursesData(rows);
        setStudentName(result.data.student_info?.student_full_name || "");
        setCgpa(calculateCGPA(rows));
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResult();
  }, []);

  const addCourse = () =>
    setCourses([...courses, { name: "", credit: 3, grade: "B" }]);

  const removeCourse = (i: number) =>
    setCourses(courses.filter((_, idx) => idx !== i));

  const updateCourse = (i: number, field: keyof Course, val: string | number) => {
    const updated = [...courses];
    (updated[i] as any)[field] = val;
    setCourses(updated);
  };

  const getGradeColor = (grade: string) => {
    return GRADE_COLORS[grade] || '#6B7280';
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
            <Text style={styles.title}> GPA Tracker</Text>
            <Text style={styles.subtitle}>
              {tab === 'scraped' ? 'Your academic performance' : 'Calculate your GPA'}
            </Text>
          </View>
          <TouchableOpacity style={styles.refreshButton} onPress={fetchResult}>
            <Ionicons name="refresh-outline" size={22} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Tab Toggle */}
      <View style={styles.toggleWrapper}>
        <View style={styles.toggle}>
          <TouchableOpacity
            style={[styles.toggleBtn, tab === "scraped" && styles.toggleActive]}
            onPress={() => setTab("scraped")}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={tab === 'scraped' ? ['#4F46E5', '#7C3AED'] : ['transparent', 'transparent']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.toggleGradient}
            >
              <Ionicons name="school-outline" size={18} color={tab === 'scraped' ? '#FFFFFF' : '#6B7280'} />
              <Text style={[styles.toggleText, tab === "scraped" && styles.toggleTextActive]}>
                Current GPA
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.toggleBtn, tab === "calculator" && styles.toggleActive]}
            onPress={() => setTab("calculator")}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={tab === 'calculator' ? ['#4F46E5', '#7C3AED'] : ['transparent', 'transparent']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.toggleGradient}
            >
              <Ionicons name="calculator-outline" size={18} color={tab === 'calculator' ? '#FFFFFF' : '#6B7280'} />
              <Text style={[styles.toggleText, tab === "calculator" && styles.toggleTextActive]}>
                Calculator
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {tab === "scraped" ? (
          <>
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#4F46E5" />
                <Text style={styles.loadingText}>Fetching your results...</Text>
                <Text style={styles.loadingSubtext}>Please wait while we load your academic data</Text>
              </View>
            ) : (
              <>
                {/* GPA Card */}
                <View style={styles.gpaCardWrapper}>
                  <LinearGradient
                    colors={['#4F46E5', '#7C3AED']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.gpaCard}
                  >
                    <View style={styles.gpaHeader}>
                      <Text style={styles.gpaLabel}>Cumulative GPA</Text>
                      <View style={styles.gpaBadge}>
                        <Text style={styles.gpaBadgeText}>4.0 Scale</Text>
                      </View>
                    </View>

                    <Text style={styles.gpaValue}>{cgpa}</Text>
                    
                    <View style={styles.gpaFooter}>
                      <Text style={styles.studentName}>{studentName}</Text>
                      <View style={styles.courseCountBadge}>
                        <Ionicons name="book-outline" size={14} color="#C7D2FE" />
                        <Text style={styles.courseCountText}>
                          {coursesData.length} Courses
                        </Text>
                      </View>
                    </View>
                  </LinearGradient>
                </View>

                {/* Courses List */}
                <View style={styles.coursesSection}>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>📚 Course Results</Text>
                    <Text style={styles.sectionCount}>{coursesData.length} subjects</Text>
                  </View>

                  {coursesData.map((course, index) => (
                    <View key={index} style={styles.courseCard}>
                      <View style={styles.courseHeader}>
                        <View style={styles.courseCodeContainer}>
                          <Text style={styles.courseCode}>{course.course_code}</Text>
                        </View>
                        <View style={[styles.gradeBadge, { backgroundColor: getGradeColor(course.grade) + '20' }]}>
                          <Text style={[styles.gradeText, { color: getGradeColor(course.grade) }]}>
                            {course.grade}
                          </Text>
                        </View>
                      </View>

                      <Text style={styles.courseTitle}>{course.course_title}</Text>

                      <View style={styles.courseMeta}>
                        <View style={styles.metaItem}>
                          <Ionicons name="time-outline" size={14} color="#6B7280" />
                          <Text style={styles.metaText}>Credits: {course.credit_hours}</Text>
                        </View>
                        <View style={styles.metaItem}>
                          <Ionicons name="calendar-outline" size={14} color="#6B7280" />
                          <Text style={styles.metaText}>Semester: {course.semester}</Text>
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              </>
            )}
          </>
        ) : (
          <>
            {/* Calculator GPA Card */}
            <View style={styles.calcResultWrapper}>
              <LinearGradient
                colors={['#1F2937', '#374151']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.calcResultCard}
              >
                <Text style={styles.calcLabel}>Calculated GPA</Text>
                <Text style={styles.calcValue}>{calcGPA(courses)}</Text>
                <Text style={styles.calcScale}>out of 4.00</Text>
              </LinearGradient>
            </View>

            {/* Course Inputs */}
            <View style={styles.calculatorSection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>✏️ Enter Courses</Text>
                <TouchableOpacity style={styles.addBtn} onPress={addCourse}>
                  <Ionicons name="add-circle-outline" size={20} color="#4F46E5" />
                  <Text style={styles.addText}>Add</Text>
                </TouchableOpacity>
              </View>

              {courses.map((c, i) => (
                <View key={i} style={styles.courseRow}>
                  <TextInput
                    style={[styles.input, styles.courseNameInput]}
                    placeholder="Course Name"
                    placeholderTextColor="#9CA3AF"
                    value={c.name}
                    onChangeText={(v) => updateCourse(i, "name", v)}
                  />

                  <TextInput
                    style={[styles.input, styles.creditInput]}
                    placeholder="Credit"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="numeric"
                    value={String(c.credit)}
                    onChangeText={(v) => updateCourse(i, "credit", parseInt(v) || 0)}
                  />

                  <TextInput
                    style={[styles.input, styles.gradeInput]}
                    placeholder="Grade"
                    placeholderTextColor="#9CA3AF"
                    value={c.grade}
                    onChangeText={(v) => updateCourse(i, "grade", v.toUpperCase())}
                  />

                  <TouchableOpacity style={styles.removeBtn} onPress={() => removeCourse(i)}>
                    <Ionicons name="trash-outline" size={20} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              ))}

              {courses.length === 0 && (
                <View style={styles.emptyCalculator}>
                  <Ionicons name="add-circle-outline" size={48} color="#D1D5DB" />
                  <Text style={styles.emptyCalculatorText}>No courses added yet</Text>
                  <Text style={styles.emptyCalculatorSubtext}>Tap "Add" to start calculating your GPA</Text>
                </View>
              )}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
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
    fontWeight: "700",
    color: "#FFFFFF",
  },
  subtitle: {
    fontSize: 13,
    color: "rgba(255,255,255,0.8)",
    marginTop: 4,
  },
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  toggleWrapper: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  toggle: {
    flexDirection: "row",
    backgroundColor: "#F3F4F6",
    borderRadius: 14,
    padding: 4,
  },
  toggleBtn: {
    flex: 1,
    borderRadius: 10,
    overflow: 'hidden',
  },
  toggleGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    gap: 8,
  },
  toggleActive: {
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  toggleText: {
    color: "#6B7280",
    fontWeight: "500",
    fontSize: 14,
  },
  toggleTextActive: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  content: {
    padding: 16,
    paddingBottom: 40,
    gap: 16,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingTop: 60,
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
  gpaCardWrapper: {
    marginBottom: 4,
  },
  gpaCard: {
    borderRadius: 20,
    padding: 24,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  gpaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  gpaLabel: {
    color: "#C7D2FE",
    fontSize: 14,
    fontWeight: "500",
  },
  gpaBadge: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  gpaBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  gpaValue: {
    color: "#FFFFFF",
    fontSize: 56,
    fontWeight: "bold",
    marginVertical: 8,
  },
  gpaFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  studentName: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 15,
  },
  courseCountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  courseCountText: {
    color: '#C7D2FE',
    fontSize: 12,
    fontWeight: '500',
  },
  coursesSection: {
    marginTop: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  sectionCount: {
    fontSize: 13,
    color: "#6B7280",
  },
  courseCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  courseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  courseCodeContainer: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  courseCode: {
    fontSize: 12,
    fontWeight: "600",
    color: "#4F46E5",
  },
  gradeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    minWidth: 40,
    alignItems: 'center',
  },
  gradeText: {
    fontSize: 16,
    fontWeight: "700",
  },
  courseTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 8,
  },
  courseMeta: {
    flexDirection: 'row',
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 13,
    color: "#6B7280",
  },
  calcResultWrapper: {
    marginBottom: 4,
  },
  calcResultCard: {
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  calcLabel: {
    color: "#9CA3AF",
    fontSize: 14,
    fontWeight: "500",
  },
  calcValue: {
    color: "#FFFFFF",
    fontSize: 52,
    fontWeight: "bold",
    marginVertical: 4,
  },
  calcScale: {
    color: "#9CA3AF",
    fontSize: 13,
  },
  calculatorSection: {
    marginTop: 8,
  },
  courseRow: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    marginBottom: 10,
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  input: {
    backgroundColor: "#F9FAFB",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    fontSize: 13,
    color: '#111827',
  },
  courseNameInput: {
    flex: 2,
  },
  creditInput: {
    flex: 0.8,
    minWidth: 60,
  },
  gradeInput: {
    flex: 0.8,
    minWidth: 60,
  },
  removeBtn: {
    padding: 8,
    backgroundColor: '#FEE2E2',
    borderRadius: 10,
  },
  emptyCalculator: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
  },
  emptyCalculatorText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 12,
  },
  emptyCalculatorSubtext: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 4,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  addText: {
    color: "#4F46E5",
    fontWeight: "600",
    fontSize: 13,
  },
});
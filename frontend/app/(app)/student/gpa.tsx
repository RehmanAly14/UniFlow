import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "../../../store/authStore";
import { BACKEND_URL } from '../../../utils/config';
import { supabase } from "../../../utils/supabase";


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

function calculateCGPA(rows: LMSCourse[]) {
  let totalPoints = 0;
  let totalCredits = 0;

  rows.forEach((course) => {
    const grade = course.grade?.trim();

    if (!(grade in GRADE_POINTS)) return;

    const credit =
      parseFloat(course.credit_hours.split("(")[0]) || 0;

    totalPoints += credit * GRADE_POINTS[grade];
    totalCredits += credit;
  });

  if (totalCredits === 0) return "0.00";

  return (totalPoints / totalCredits).toFixed(2);
}

function calcGPA(courses: Course[]) {
  const valid = courses.filter(
    (c) =>
      GRADE_POINTS[c.grade] !== undefined &&
      c.credit > 0
  );

  if (!valid.length) return "0.00";

  const total = valid.reduce(
    (acc, c) =>
      acc + GRADE_POINTS[c.grade] * c.credit,
    0
  );

  const credits = valid.reduce(
    (acc, c) => acc + c.credit,
    0
  );

  return (total / credits).toFixed(2);
}

export default function StudentGPA() {
 

  const [tab, setTab] = useState<
    "scraped" | "calculator"
  >("scraped");

  const [loading, setLoading] = useState(true);

  const [studentName, setStudentName] =
    useState("");

  const [cgpa, setCgpa] = useState("0.00");

  const [coursesData, setCoursesData] = useState<
    LMSCourse[]
  >([]);

  const [courses, setCourses] = useState<Course[]>([
    {
      name: "Data Structures",
      credit: 3,
      grade: "A",
    },
  ]);

 const fetchResult = async () => {
  try {
    setLoading(true);

    const {
      data: { session },
    } = await supabase.auth.getSession();

    const response = await fetch(
      `${BACKEND_URL}/api/results/student`,
      {
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      }
    );

    const result = await response.json();

    console.log(result);

    if (
      result.success &&
      result.data?.result_table?.rows
    ) {
      const rows = result.data.result_table.rows;

      setCoursesData(rows);

      setStudentName(
        result.data.student_info
          ?.student_full_name || ""
      );

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
    setCourses([
      ...courses,
      {
        name: "",
        credit: 3,
        grade: "B",
      },
    ]);

  const removeCourse = (i: number) =>
    setCourses(
      courses.filter((_, idx) => idx !== i)
    );

  const updateCourse = (
    i: number,
    field: keyof Course,
    val: string | number
  ) => {
    const updated = [...courses];
    (updated[i] as any)[field] = val;
    setCourses(updated);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          GPA Tracker
        </Text>
      </View>

      <View style={styles.toggle}>
        <TouchableOpacity
          style={[
            styles.toggleBtn,
            tab === "scraped" &&
              styles.toggleActive,
          ]}
          onPress={() =>
            setTab("scraped")
          }
        >
          <Text
            style={[
              styles.toggleText,
              tab === "scraped" &&
                styles.toggleTextActive,
            ]}
          >
            Current GPA
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.toggleBtn,
            tab === "calculator" &&
              styles.toggleActive,
          ]}
          onPress={() =>
            setTab("calculator")
          }
        >
          <Text
            style={[
              styles.toggleText,
              tab === "calculator" &&
                styles.toggleTextActive,
            ]}
          >
            Calculator
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
      >
        {tab === "scraped" ? (
          <>
            {loading ? (
              <ActivityIndicator
                size="large"
                color="#4F46E5"
              />
            ) : (
              <>
                <View style={styles.gpaCard}>
                  <Text style={styles.gpaLabel}>
                    Cumulative GPA
                  </Text>

                  <Text style={styles.gpaValue}>
                    {cgpa}
                  </Text>

                  <Text style={styles.gpaScale}>
                    out of 4.00
                  </Text>

                  <Text
                    style={styles.studentName}
                  >
                    {studentName}
                  </Text>
                </View>

                {coursesData.map(
                  (course, index) => (
                    <View
                      key={index}
                      style={styles.courseCard}
                    >
                      <Text
                        style={
                          styles.courseTitle
                        }
                      >
                        {
                          course.course_title
                        }
                      </Text>

                      <Text
                        style={
                          styles.courseCode
                        }
                      >
                        {
                          course.course_code
                        }
                      </Text>

                      <View
                        style={
                          styles.rowBetween
                        }
                      >
                        <Text>
                          Credit:{" "}
                          {
                            course.credit_hours
                          }
                        </Text>

                        <Text
                          style={
                            styles.grade
                          }
                        >
                          {
                            course.grade
                          }
                        </Text>
                      </View>
                    </View>
                  )
                )}
              </>
            )}
          </>
        ) : (
          <>
            <View
              style={
                styles.calcResultCard
              }
            >
              <Text
                style={styles.calcLabel}
              >
                Calculated GPA
              </Text>

              <Text
                style={styles.calcValue}
              >
                {calcGPA(courses)}
              </Text>
            </View>

            {courses.map((c, i) => (
              <View
                key={i}
                style={styles.courseRow}
              >
                <TextInput
                  style={[
                    styles.input,
                    { flex: 2 },
                  ]}
                  placeholder="Subject"
                  value={c.name}
                  onChangeText={(v) =>
                    updateCourse(
                      i,
                      "name",
                      v
                    )
                  }
                />

                <TextInput
                  style={[
                    styles.input,
                    { flex: 0.8 },
                  ]}
                  keyboardType="numeric"
                  value={String(
                    c.credit
                  )}
                  onChangeText={(v) =>
                    updateCourse(
                      i,
                      "credit",
                      parseInt(v) || 0
                    )
                  }
                />

                <TextInput
                  style={[
                    styles.input,
                    { flex: 0.8 },
                  ]}
                  value={c.grade}
                  onChangeText={(v) =>
                    updateCourse(
                      i,
                      "grade",
                      v.toUpperCase()
                    )
                  }
                />

                <TouchableOpacity
                  onPress={() =>
                    removeCourse(i)
                  }
                >
                  <Ionicons
                    name="trash-outline"
                    size={20}
                    color="#EF4444"
                  />
                </TouchableOpacity>
              </View>
            ))}

            <TouchableOpacity
              style={styles.addBtn}
              onPress={addCourse}
            >
              <Text
                style={styles.addText}
              >
                Add Course
              </Text>
            </TouchableOpacity>
          </>
        )}
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
    padding: 24,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  toggle: {
    flexDirection: "row",
    margin: 16,
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    padding: 4,
  },
  toggleBtn: {
    flex: 1,
    padding: 10,
    alignItems: "center",
  },
  toggleActive: {
    backgroundColor: "#fff",
    borderRadius: 8,
  },
  toggleText: {
    color: "#6B7280",
  },
  toggleTextActive: {
    color: "#111827",
    fontWeight: "600",
  },
  content: {
    padding: 16,
    gap: 12,
  },
  gpaCard: {
    backgroundColor: "#4F46E5",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
  },
  gpaLabel: {
    color: "#C7D2FE",
  },
  gpaValue: {
    color: "#fff",
    fontSize: 50,
    fontWeight: "bold",
  },
  gpaScale: {
    color: "#C7D2FE",
  },
  studentName: {
    color: "#fff",
    marginTop: 8,
    fontWeight: "600",
  },
  courseCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
  },
  courseTitle: {
    fontWeight: "600",
    fontSize: 15,
  },
  courseCode: {
    color: "#6B7280",
    marginTop: 4,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  grade: {
    fontWeight: "bold",
    color: "#16A34A",
  },
  calcResultCard: {
    backgroundColor: "#111827",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
  },
  calcLabel: {
    color: "#9CA3AF",
  },
  calcValue: {
    color: "#fff",
    fontSize: 48,
    fontWeight: "bold",
  },
  courseRow: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  input: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  addBtn: {
    borderWidth: 1,
    borderColor: "#4F46E5",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  addText: {
    color: "#4F46E5",
    fontWeight: "600",
  },
});
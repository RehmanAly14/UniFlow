import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as DocumentPicker from "expo-document-picker";
import { Ionicons } from "@expo/vector-icons";
import { BACKEND_URL } from "../../../utils/config";
import { useAuthStore } from "../../../store/authStore";

export default function TeacherUpload() {
  const { session } = useAuthStore();

  const [file, setFile] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [degree, setDegree] = useState("");
  const [semester, setSemester] = useState("");
  const [section, setSection] = useState("");
  const [subjectCode, setSubjectCode] = useState("");

  const pickFile = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: "*/*",
    });

    if (!result.canceled) {
      setFile(result.assets[0]);
    }
  };

  const uploadResource = async () => {
    try {
      if (!file) {
        Alert.alert("Error", "Please select a file");
        return;
      }

      setLoading(true);

      const formData = new FormData();

      formData.append("title", title);
      formData.append("description", description);
      formData.append("subjectCode", subjectCode);
      formData.append("degree", degree);
      formData.append("semester", semester);
      formData.append("section", section);

      formData.append("file", {
        uri: file.uri,
        name: file.name,
        type: file.mimeType || "application/pdf",
      } as any);

      const response = await fetch(
        `${BACKEND_URL}/api/resources/upload`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session?.access_token}`,
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      Alert.alert("Success", "Resource uploaded successfully");

      setTitle("");
      setDescription("");
      setDegree("");
      setSemester("");
      setSection("");
      setFile(null);
    } catch (error: any) {
      Alert.alert("Upload Failed", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Upload Resource</Text>
      </View>

      <View style={styles.content}>
        <TextInput
          placeholder="Title"
          value={title}
          onChangeText={setTitle}
          style={styles.input}
        />

        <TextInput
          placeholder="Description"
          value={description}
          onChangeText={setDescription}
          style={styles.input}
        />

        <TextInput
          placeholder="Degree (BSIT)"
          value={degree}
          onChangeText={setDegree}
          style={styles.input}
        />

        <TextInput
          placeholder="Subject Code (CS-506)"
          value={subjectCode}
          onChangeText={setSubjectCode}
          style={styles.input}
        />

        <TextInput
          placeholder="Semester"
          value={semester}
          onChangeText={setSemester}
          style={styles.input}
        />

        <TextInput
          placeholder="Section"
          value={section}
          onChangeText={setSection}
          style={styles.input}
        />

        <TouchableOpacity
          style={styles.fileButton}
          onPress={pickFile}
        >
          <Ionicons
            name="document-outline"
            size={22}
            color="#4F46E5"
          />
          <Text style={styles.fileText}>
            {file ? file.name : "Choose File"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.uploadButton}
          onPress={uploadResource}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.uploadText}>
              Upload Resource
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },

  header: {
    padding: 24,
    backgroundColor: "#fff",
  },

  title: {
    fontSize: 24,
    fontWeight: "bold",
  },

  content: {
    padding: 20,
    gap: 12,
  },

  input: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  fileButton: {
    backgroundColor: "#EEF2FF",
    padding: 16,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  fileText: {
    color: "#4F46E5",
    fontWeight: "600",
  },

  uploadButton: {
    backgroundColor: "#4F46E5",
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
  },

  uploadText: {
    color: "#fff",
    fontWeight: "700",
  },
});
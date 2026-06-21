import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as DocumentPicker from "expo-document-picker";
import { Ionicons } from "@expo/vector-icons";
import { BACKEND_URL } from "../../../utils/config";
import { useAuthStore } from "../../../store/authStore";
import { useRouter } from "expo-router";

export default function TeacherUpload() {
  const { session } = useAuthStore();
  const router = useRouter();

  const [file, setFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [degree, setDegree] = useState<string>("");
  const [semester, setSemester] = useState<string>("");
  const [section, setSection] = useState<string>("");
  const [subjectCode, setSubjectCode] = useState<string>("");

  const pickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        copyToCacheDirectory: true
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setFile(result.assets[0]);
      }
    } catch (error) {
      console.error("Error choosing material file:", error);
      Alert.alert("Selection Failed", "An error occurred while picking the document.");
    }
  };

  const uploadResource = async () => {
    if (!title.trim()) return Alert.alert("Required", "Please add a title");
    if (!file) return Alert.alert("Required", "Please select a file to upload");

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("description", description.trim());
      formData.append("subjectCode", subjectCode.trim().toUpperCase());
      formData.append("degree", degree.trim().toUpperCase());
      formData.append("semester", semester.trim());
      formData.append("section", section.trim().toUpperCase());

      // Explicit construction formatting of the binary file upload asset payload
      const filePayload = {
        uri: file.uri,
        name: file.name,
        type: file.mimeType || "application/pdf",
      };
      
      formData.append("file", filePayload as any);

      const response = await fetch(`${BACKEND_URL}/api/resources/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong during file processing");
      }

      Alert.alert("Success 🎉", "Resource shared successfully");

      // Reset Form State Elements
      setTitle("");
      setDescription("");
      setDegree("");
      setSemester("");
      setSection("");
      setSubjectCode("");
      setFile(null);
    } catch (error: any) {
      Alert.alert("Upload Failed", error.message || "Could not connect to the document server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header Content Section View */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backBtn} 
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={20} color="#334155" />
        </TouchableOpacity>
        <Text style={styles.title}>Upload Resource</Text>
        <View style={styles.headerBalancer} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardContainer}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.sectionLabel}>Resource Details</Text>
          
          <TextInput
            placeholder="Document Title (e.g., Lab Handout 3)"
            placeholderTextColor="#94A3B8"
            value={title}
            onChangeText={setTitle}
            style={styles.input}
          />

          <TextInput
            placeholder="Description / Instructions (Optional)"
            placeholderTextColor="#94A3B8"
            value={description}
            onChangeText={setDescription}
            style={[styles.input, styles.textArea]}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />

          <Text style={styles.sectionLabel}>Target Audience</Text>

          {/* Form Meta Metadata Grid Rows */}
          <View style={styles.row}>
            <TextInput
              placeholder="Degree (e.g., BSIT)"
              placeholderTextColor="#94A3B8"
              value={degree}
              onChangeText={setDegree}
              style={[styles.input, styles.halfInput]}
              autoCapitalize="characters"
            />
            <TextInput
              placeholder="Code (e.g., CS-506)"
              placeholderTextColor="#94A3B8"
              value={subjectCode}
              onChangeText={setSubjectCode}
              style={[styles.input, styles.halfInput]}
              autoCapitalize="characters"
            />
          </View>

          <View style={styles.row}>
            <TextInput
              placeholder="Semester (e.g., 6)"
              placeholderTextColor="#94A3B8"
              value={semester}
              onChangeText={setSemester}
              style={[styles.input, styles.halfInput]}
              keyboardType="numeric"
            />
            <TextInput
              placeholder="Section (e.g., A)"
              placeholderTextColor="#94A3B8"
              value={section}
              onChangeText={setSection}
              style={[styles.input, styles.halfInput]}
              autoCapitalize="characters" 
            />
          </View>

          {/* Dynamic Drop Zone Component Grid Area */}
          {!file ? (
            <TouchableOpacity
              style={styles.fileDropZone}
              onPress={pickFile}
              activeOpacity={0.6}
            >
              <View style={styles.uploadIconCircle}>
                <Ionicons name="cloud-upload-outline" size={24} color="#4F46E5" />
              </View>
              <Text style={styles.dropZoneTitle}>Choose study material</Text>
              <Text style={styles.dropZoneSubtitle}>PDF, DOCX, PPTX up to 25MB</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.fileSelectedBox}>
              <View style={styles.fileInfo}>
                <Ionicons name="document-text-outline" size={24} color="#10B981" />
                <Text style={styles.fileText} numberOfLines={1}>
                  {file.name}
                </Text>
              </View>
              <TouchableOpacity 
                onPress={() => setFile(null)}
                style={styles.removeFileBtn}
                activeOpacity={0.7}
              >
                <Ionicons name="trash-outline" size={18} color="#EF4444" />
              </TouchableOpacity>
            </View>
          )}

          {/* Publishing Operation Call Action Button */}
          <TouchableOpacity
            style={[styles.uploadButton, loading && styles.disabledButton]}
            onPress={uploadResource}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <View style={styles.buttonContent}>
                <Text style={styles.uploadText}>Publish Resource</Text>
                <Ionicons name="paper-plane-outline" size={16} color="#FFFFFF" style={styles.buttonIcon} />
              </View>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#F8FAFC" 
  },
  keyboardContainer: {
    flex: 1
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
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
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
  },
  headerBalancer: { 
    width: 40 
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#64748B",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 12,
    marginTop: 8,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    fontSize: 15,
    color: "#334155",
    marginBottom: 16,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.01,
    shadowRadius: 4,
    elevation: 1,
  },
  textArea: {
    minHeight: 90,
    paddingTop: 14,
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  fileDropZone: {
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "#CBD5E1",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    marginBottom: 28,
  },
  uploadIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#EEF2FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  dropZoneTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#4F46E5",
  },
  dropZoneSubtitle: {
    fontSize: 12,
    color: "#94A3B8",
    marginTop: 4,
  },
  fileSelectedBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#ECFEFF",
    borderWidth: 1,
    borderColor: "#A5F3FC",
    borderRadius: 16,
    padding: 16,
    marginTop: 8,
    marginBottom: 28,
  },
  fileInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
    marginRight: 8,
  },
  fileText: {
    color: "#0891B2",
    fontWeight: "600",
    fontSize: 14,
    flex: 1,
  },
  removeFileBtn: {
    padding: 6,
    backgroundColor: "#FEE2E2",
    borderRadius: 8,
  },
  uploadButton: {
    backgroundColor: "#4F46E5",
    padding: 16,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#4F46E5",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  disabledButton: {
    backgroundColor: "#94A3B8",
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center"
  },
  uploadText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 16,
  },
  buttonIcon: { 
    marginLeft: 8 
  },
});
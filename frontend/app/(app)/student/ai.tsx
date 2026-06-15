import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { BACKEND_URL } from "@/utils/config";
import { useAuthStore } from "@/store/authStore";

interface Message {
  role: "user" | "ai";
  text: string;
}

const QUICK_PROMPTS = [
  "Suggest a study plan for exams 📚",
  "What are my free time slots? ⏰",
  "Give me a weekly summary 📊",
  "How to improve my GPA? 🎯",
];

export default function AIAssistant() {
  const { session } = useAuthStore();

  const scrollRef = useRef<ScrollView>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollToEnd({
      animated: true,
    });
  }, [messages]);

  const fetchHistory = async () => {
    try {
      const response = await fetch(
        `${BACKEND_URL}/api/ai/chat-history`,
        {
          headers: {
            Authorization: `Bearer ${session?.access_token}`,
          },
        }
      );

      const data = await response.json();

      if (Array.isArray(data) && data.length > 0) {
        setMessages(
          data.map((msg: any) => ({
            role:
              msg.role === "assistant"
                ? "ai"
                : "user",
            text: msg.content,
          }))
        );
      }
    } catch (error) {
      console.log(error);
    } finally {
      setHistoryLoading(false);
    }
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;

    const userMessage: Message = {
      role: "user",
      text,
    };

    setMessages((prev) => [
      ...prev,
      userMessage,
    ]);

    setInput("");
    setLoading(true);

    try {
      const response = await fetch(
        `${BACKEND_URL}/api/ai/chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({
            message: text,
          }),
        }
      );

      const data = await response.json();

      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text:
            data.reply ||
            "Sorry, I couldn't generate a response.",
        },
      ]);
    } catch (error) {
      console.log(error);

      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text:
            "Something went wrong. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.aiAvatar}>
          <Ionicons
            name="planet"
            size={22}
            color="#fff"
          />
        </View>

        <View>
          <Text style={styles.title}>
            UniFlow AI
          </Text>
          <Text style={styles.subtitle}>
            Academic Assistant
          </Text>
        </View>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={
          Platform.OS === "ios"
            ? "padding"
            : "height"
        }
      >
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={
            styles.messages
          }
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() =>
            scrollRef.current?.scrollToEnd({
              animated: true,
            })
          }
        >
          {historyLoading ? (
            <ActivityIndicator
              size="large"
              color="#4F46E5"
            />
          ) : (
            <>
              {messages.length === 0 && (
                <View
                  style={styles.welcomeCard}
                >
                  <Ionicons
                    name="sparkles"
                    size={48}
                    color="#4F46E5"
                  />

                  <Text
                    style={styles.welcomeTitle}
                  >
                    Welcome to UniFlow AI
                  </Text>

                  <Text
                    style={styles.welcomeText}
                  >
                    Ask me about exams,
                    assignments, GPA
                    improvement, study plans,
                    or your timetable.
                  </Text>
                </View>
              )}

              {messages.map((msg, index) => (
                <View
                  key={index}
                  style={[
                    styles.bubble,
                    msg.role === "user"
                      ? styles.userBubble
                      : styles.aiBubble,
                  ]}
                >
                  <Text
                    style={[
                      styles.bubbleText,
                      msg.role === "user" &&
                        styles.userText,
                    ]}
                  >
                    {msg.text}
                  </Text>
                </View>
              ))}

              {loading && (
                <View
                  style={[
                    styles.bubble,
                    styles.aiBubble,
                  ]}
                >
                  <Text
                    style={
                      styles.typingText
                    }
                  >
                    UniFlow AI is thinking...
                  </Text>
                </View>
              )}
            </>
          )}
        </ScrollView>

        {/* Quick Prompts */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={
            false
          }
          style={styles.quickPrompts}
          contentContainerStyle={
            styles.quickPromptsContent
          }
        >
          {QUICK_PROMPTS.map((prompt) => (
            <TouchableOpacity
              key={prompt}
              style={styles.quickChip}
              onPress={() =>
                sendMessage(prompt)
              }
            >
              <Text
                style={
                  styles.quickChipText
                }
              >
                {prompt}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Input */}
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Ask me anything academic..."
            placeholderTextColor="#9CA3AF"
            value={input}
            onChangeText={setInput}
            multiline
            returnKeyType="send"
            onSubmitEditing={() =>
              sendMessage(input)
            }
          />

          <TouchableOpacity
            style={[
              styles.sendBtn,
              (!input.trim() ||
                loading) &&
                styles.sendBtnDisabled,
            ]}
            disabled={
              !input.trim() || loading
            }
            onPress={() =>
              sendMessage(input)
            }
          >
            <Ionicons
              name="send"
              size={18}
              color="#fff"
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
    alignItems: "center",
    gap: 12,
    padding: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },

  aiAvatar: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#4F46E5",
    justifyContent: "center",
    alignItems: "center",
  },

  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },

  subtitle: {
    fontSize: 12,
    color: "#6B7280",
  },

  messages: {
    flexGrow: 1,
    padding: 16,
    gap: 12,
  },

  welcomeCard: {
    marginTop: 60,
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  welcomeTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginTop: 12,
    color: "#111827",
  },

  welcomeText: {
    marginTop: 8,
    textAlign: "center",
    color: "#6B7280",
    lineHeight: 22,
  },

  bubble: {
    maxWidth: "85%",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 22,
  },

  aiBubble: {
    backgroundColor: "#FFFFFF",
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  userBubble: {
    backgroundColor: "#4F46E5",
    alignSelf: "flex-end",
  },

  bubbleText: {
    fontSize: 15,
    lineHeight: 22,
    color: "#111827",
  },

  userText: {
    color: "#fff",
  },

  typingText: {
    color: "#6B7280",
    fontStyle: "italic",
  },

  quickPrompts: {
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },

  quickPromptsContent: {
    padding: 12,
    gap: 8,
  },

  quickChip: {
    backgroundColor: "#EEF2FF",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },

  quickChipText: {
    color: "#4F46E5",
    fontWeight: "500",
    fontSize: 13,
  },

  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
    padding: 12,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },

  input: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    borderRadius: 22,
    paddingHorizontal: 18,
    paddingVertical: 12,
    fontSize: 15,
    color: "#111827",
    maxHeight: 100,
  },

  sendBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#4F46E5",
    justifyContent: "center",
    alignItems: "center",
  },

  sendBtnDisabled: {
    opacity: 0.5,
  },
});
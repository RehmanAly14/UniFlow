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
import { LinearGradient } from 'expo-linear-gradient';

import { BACKEND_URL } from "@/utils/config";
import { useAuthStore } from "@/store/authStore";

interface Message {
  role: "user" | "ai";
  text: string;
}

const QUICK_PROMPTS = [
  { icon: "book-outline", label: "Study Plan 📚", prompt: "Suggest a study plan for exams 📚" },
  { icon: "time-outline", label: "Free Time ⏰", prompt: "What are my free time slots? ⏰" },
  { icon: "stats-chart-outline", label: "Weekly Summary 📊", prompt: "Give me a weekly summary 📊" },
  { icon: "trending-up-outline", label: "GPA Tips 🎯", prompt: "How to improve my GPA? 🎯" },
];

export default function AIAssistant() {
  const { session } = useAuthStore();

  const scrollRef = useRef<ScrollView>(null);
  const inputRef = useRef<TextInput>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    // Small timeout ensures layout calculations are complete before scrolling
    const timer = setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 100);
    return () => clearTimeout(timer);
  }, [messages, loading]);

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
            role: msg.role === "assistant" ? "ai" : "user",
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

    const userMessage: Message = { role: "user", text };
    setMessages((prev) => [...prev, userMessage]);
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
          body: JSON.stringify({ message: text }),
        }
      );

      const data = await response.json();

      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: data.reply || "Sorry, I couldn't generate a response.",
        },
      ]);
    } catch (error) {
      console.log(error);
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: "Something went wrong. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const formatTimestamp = () => {
    const now = new Date();
    return now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
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
          <View style={styles.headerLeft}>
            <View style={styles.aiAvatar}>
              <LinearGradient
                colors={['#FFFFFF', '#E5E7EB']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.aiAvatarGradient}
              >
                <Ionicons name="sparkles" size={24} color="#4F46E5" />
              </LinearGradient>
            </View>
            <View>
              <Text style={styles.title}>UniFlow AI</Text>
              <View style={styles.statusContainer}>
                <View style={styles.statusDot} />
                <Text style={styles.statusText}>Online • Ready to help</Text>
              </View>
            </View>
          </View>
          <TouchableOpacity style={styles.clearBtn} onPress={() => setMessages([])}>
            <Ionicons name="trash-outline" size={20} color="rgba(255,255,255,0.8)" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.messages}
          showsVerticalScrollIndicator={false}
        >
          {historyLoading ? (
            <View style={styles.loadingContainer}>
              <View style={styles.loadingCard}>
                <ActivityIndicator size="large" color="#4F46E5" />
                <Text style={styles.loadingText}>Loading conversation...</Text>
                <Text style={styles.loadingSubtext}>Please wait while we fetch your history</Text>
              </View>
            </View>
          ) : (
            <>
              {messages.length === 0 && (
                <View style={styles.welcomeCard}>
                  <LinearGradient
                    colors={['#EEF2FF', '#E0E7FF']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.welcomeIconContainer}
                  >
                    <Ionicons name="rocket" size={56} color="#4F46E5" />
                  </LinearGradient>

                  <Text style={styles.welcomeTitle}>Welcome to UniFlow AI</Text>
                  <Text style={styles.welcomeText}>
                    Your intelligent academic assistant. Ask me about exams, assignments, 
                    GPA improvement, study plans, or your timetable.
                  </Text>
                  
                  <View style={styles.featureGrid}>
                    {[
                      { icon: "school-outline", label: "Exams" },
                      { icon: "book-outline", label: "Studies" },
                      { icon: "trending-up-outline", label: "GPA" },
                      { icon: "calendar-outline", label: "Timetable" },
                    ].map((feature, index) => (
                      <View key={index} style={styles.featureItem}>
                        <View style={styles.featureIconBg}>
                          <Ionicons name={feature.icon as any} size={18} color="#4F46E5" />
                        </View>
                        <Text style={styles.featureLabel}>{feature.label}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {messages.map((msg, index) => (
                <View key={index} style={styles.messageWrapper}>
                  {msg.role === "ai" && (
                    <View style={styles.aiIconContainer}>
                      <LinearGradient
                        colors={['#4F46E5', '#7C3AED']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.aiIconSmall}
                      >
                        <Ionicons name="sparkles" size={14} color="#FFFFFF" />
                      </LinearGradient>
                    </View>
                  )}
                  <View
                    style={[
                      styles.bubble,
                      msg.role === "user" ? styles.userBubble : styles.aiBubble,
                    ]}
                  >
                    <Text
                      style={[
                        styles.bubbleText,
                        msg.role === "user" && styles.userText,
                      ]}
                    >
                      {msg.text}
                    </Text>
                    {msg.role === "ai" && (
                      <View style={styles.timestampContainer}>
                        <Text style={styles.timestampText}>{formatTimestamp()}</Text>
                      </View>
                    )}
                  </View>
                </View>
              ))}

              {loading && (
                <View style={styles.messageWrapper}>
                  <View style={styles.aiIconContainer}>
                    <LinearGradient
                      colors={['#4F46E5', '#7C3AED']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.aiIconSmall}
                    >
                      <Ionicons name="sparkles" size={14} color="#FFFFFF" />
                    </LinearGradient>
                  </View>
                  <View style={[styles.bubble, styles.aiBubble, styles.typingBubble]}>
                    <View style={styles.typingDots}>
                      <View style={styles.dot} />
                      <View style={[styles.dot, { opacity: 0.6 }]} />
                      <View style={[styles.dot, { opacity: 0.3 }]} />
                    </View>
                  </View>
                </View>
              )}
            </>
          )}
        </ScrollView>

        {/* Quick Prompts Container */}
        <View style={styles.quickPromptsWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.quickPromptsContent}
          >
            {QUICK_PROMPTS.map((item) => (
              <TouchableOpacity
                key={item.prompt}
                style={styles.quickChip}
                onPress={() => sendMessage(item.prompt)}
                activeOpacity={0.7}
              >
                <Ionicons name={item.icon as any} size={16} color="#4F46E5" />
                <Text style={styles.quickChipText}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Action Input Bar */}
        <View style={styles.inputRow}>
          <View style={styles.inputContainer}>
            <TextInput
              ref={inputRef}
              style={styles.input}
              placeholder="Ask me anything academic..."
              placeholderTextColor="#9CA3AF"
              value={input}
              onChangeText={setInput}
              multiline
              maxLength={500}
            />
            {input.length > 0 && (
              <Text style={styles.charCount}>{input.length}/500</Text>
            )}
          </View>

          <TouchableOpacity
            style={[
              styles.sendBtn,
              (!input.trim() || loading) && styles.sendBtnDisabled,
            ]}
            disabled={!input.trim() || loading}
            onPress={() => sendMessage(input)}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#4F46E5', '#7C3AED']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.sendGradient}
            >
              <Ionicons name="send" size={18} color="#FFFFFF" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  aiAvatar: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  aiAvatarGradient: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#34D399',
  },
  statusText: {
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
  },
  clearBtn: {
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 40,
  },
  loadingCard: {
    backgroundColor: '#FFFFFF',
    padding: 32,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
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
  messages: {
    flexGrow: 1,
    padding: 16,
    gap: 16,
    paddingBottom: 24,
  },
  welcomeCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
  },
  welcomeIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  welcomeTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111827",
  },
  welcomeText: {
    marginTop: 8,
    textAlign: "center",
    color: "#6B7280",
    lineHeight: 22,
    paddingHorizontal: 8,
  },
  featureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
    marginTop: 20,
  },
  featureItem: {
    alignItems: 'center',
    gap: 6,
    width: 65,
  },
  featureIconBg: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureLabel: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '500',
    textAlign: 'center',
  },
  messageWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    width: '100%',
  },
  aiIconContainer: {
    marginTop: 4,
  },
  aiIconSmall: {
    width: 28,
    height: 28,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bubble: {
    maxWidth: "80%",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  aiBubble: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  userBubble: {
    backgroundColor: "#4F46E5",
    alignSelf: "flex-end",
    marginLeft: 'auto',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  bubbleText: {
    fontSize: 15,
    lineHeight: 22,
    color: "#111827",
  },
  userText: {
    color: "#FFFFFF",
  },
  timestampContainer: {
    marginTop: 6,
    alignItems: 'flex-end',
  },
  timestampText: {
    fontSize: 10,
    color: "#9CA3AF",
    fontWeight: '400',
  },
  typingBubble: {
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  typingDots: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
    height: 12,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#9CA3AF',
  },
  quickPromptsWrapper: {
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  quickPromptsContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  quickChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
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
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
  },
  inputContainer: {
    flex: 1,
    position: 'relative',
  },
  input: {
    backgroundColor: "#F3F4F6",
    borderRadius: 22,
    paddingHorizontal: 18,
    paddingVertical: 10,
    paddingRight: 64,
    fontSize: 15,
    color: "#111827",
    maxHeight: 100,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  charCount: {
    position: 'absolute',
    right: 14,
    bottom: 12,
    fontSize: 10,
    color: "#9CA3AF",
  },
  sendBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    overflow: 'hidden',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  sendGradient: {
    width: 46,
    height: 46,
    justifyContent: "center",
    alignItems: "center",
  },
  sendBtnDisabled: {
    opacity: 0.5,
    shadowOpacity: 0,
    elevation: 0,
  },
});
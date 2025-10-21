import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import AuthGuard from "../components/AuthGuard";
import { getHistory, HistoryEntry } from "../utils/storage";

export default function Feedback() {
  const router = useRouter();
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [totalWords, setTotalWords] = useState(0);
  const [correctWords, setCorrectWords] = useState(0);
  const [practiceCount, setPracticeCount] = useState(0);

  useEffect(() => {
    loadHistory();
  }, []);

  async function loadHistory() {
    try {
      const entries = await getHistory();
      setHistory(entries);
      setTotalWords(entries.length);

      const correct = entries.filter(
        (entry) => entry.score && entry.score > 0
      ).length;
      setCorrectWords(correct);

      const practice = entries.filter((entry) => entry.audioUri).length;
      setPracticeCount(practice);
    } catch (error) {
      console.error("Failed to load history:", error);
    }
  }

  const successRate =
    totalWords > 0 ? Math.round((correctWords / totalWords) * 100) : 0;
  const starRating = Math.min(5, Math.max(1, Math.ceil(successRate / 20)));

  const getEncouragementMessage = () => {
    if (successRate >= 80) return "You&apos;re a superstar! 🌟";
    if (successRate >= 60) return "Great job! Keep it up! 💪";
    if (successRate >= 40) return "Good work! Practice makes perfect! 📚";
    if (successRate >= 20) return "Keep trying! You&apos;re getting better! 🎯";
    return "Every expert was once a beginner! 🌱";
  };

  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Text key={i} style={styles.star}>
          {i <= starRating ? "⭐" : "⚪"}
        </Text>
      );
    }
    return stars;
  };

  return (
    <AuthGuard>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.headerSection}>
            <Text style={styles.title}>🎉 Your Progress! 🎉</Text>
            <Text style={styles.subtitle}>
              Look how much you&apos;ve learned!
            </Text>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{totalWords}</Text>
              <Text style={styles.statLabel}>Words Tried</Text>
              <Text style={styles.statEmoji}>📝</Text>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{correctWords}</Text>
              <Text style={styles.statLabel}>Correct Answers</Text>
              <Text style={styles.statEmoji}>✅</Text>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{practiceCount}</Text>
              <Text style={styles.statLabel}>Voice Practice</Text>
              <Text style={styles.statEmoji}>🎤</Text>
            </View>
          </View>

          <View style={styles.achievementCard}>
            <Text style={styles.achievementTitle}>Your Achievement</Text>
            <View style={styles.starContainer}>{renderStars()}</View>
            <Text style={styles.successRate}>{successRate}% Success Rate!</Text>
            <Text style={styles.encouragement}>
              {getEncouragementMessage()}
            </Text>
          </View>

          {totalWords === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>🚀</Text>
              <Text style={styles.emptyTitle}>
                Start Your Learning Journey!
              </Text>
              <Text style={styles.emptyText}>
                Practice some words and play games to see your progress here!
              </Text>
            </View>
          ) : (
            <View style={styles.recentActivity}>
              <Text style={styles.recentTitle}>Recent Activity</Text>
              {history.slice(0, 5).map((entry, index) => (
                <View key={entry.id} style={styles.activityItem}>
                  <Text style={styles.activityWord}>{entry.word}</Text>
                  <Text style={styles.activityScore}>
                    {entry.score && entry.score > 0
                      ? "✅"
                      : entry.audioUri
                      ? "🎤"
                      : "❌"}
                  </Text>
                  <Text style={styles.activityTime}>
                    {new Date(entry.timestamp).toLocaleDateString()}
                  </Text>
                </View>
              ))}
            </View>
          )}

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => router.push("/home")}
            >
              <Text style={styles.buttonText}>Practice More Words! 📚</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => router.push("/game")}
            >
              <Text style={styles.buttonText}>Play Games! 🎮</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </AuthGuard>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F0F8FF",
  },
  container: {
    padding: 20,
    alignItems: "center",
  },
  headerSection: {
    alignItems: "center",
    marginBottom: 30,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    padding: 20,
    borderRadius: 25,
    width: "100%",
    borderWidth: 3,
    borderColor: "#FF6B9D",
  },
  title: {
    fontSize: 28,
    fontWeight: "900",
    color: "#FF6B9D",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#4B5563",
    textAlign: "center",
    fontWeight: "600",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 25,
  },
  statCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 20,
    alignItems: "center",
    width: "30%",
    borderWidth: 2,
    borderColor: "#4ECDC4",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "900",
    color: "#1F2937",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#6B7280",
    textAlign: "center",
    fontWeight: "600",
    marginBottom: 8,
  },
  statEmoji: {
    fontSize: 20,
  },
  achievementCard: {
    backgroundColor: "#FFE66D",
    padding: 25,
    borderRadius: 25,
    alignItems: "center",
    width: "100%",
    marginBottom: 25,
    borderWidth: 3,
    borderColor: "#F59E0B",
  },
  achievementTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#92400E",
    marginBottom: 15,
  },
  starContainer: {
    flexDirection: "row",
    marginBottom: 15,
  },
  star: {
    fontSize: 30,
    marginHorizontal: 2,
  },
  successRate: {
    fontSize: 24,
    fontWeight: "900",
    color: "#92400E",
    marginBottom: 10,
  },
  encouragement: {
    fontSize: 16,
    fontWeight: "700",
    color: "#78350F",
    textAlign: "center",
  },
  emptyState: {
    backgroundColor: "#E0F2FE",
    padding: 25,
    borderRadius: 25,
    alignItems: "center",
    width: "100%",
    marginBottom: 25,
    borderWidth: 3,
    borderColor: "#0284C7",
  },
  emptyEmoji: {
    fontSize: 50,
    marginBottom: 15,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0C4A6E",
    marginBottom: 10,
    textAlign: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#075985",
    textAlign: "center",
    fontWeight: "600",
  },
  recentActivity: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 20,
    width: "100%",
    marginBottom: 25,
    borderWidth: 2,
    borderColor: "#10B981",
  },
  recentTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#065F46",
    marginBottom: 15,
    textAlign: "center",
  },
  activityItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  activityWord: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
    flex: 1,
  },
  activityScore: {
    fontSize: 20,
    marginHorizontal: 10,
  },
  activityTime: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "600",
  },
  buttonContainer: {
    width: "100%",
    gap: 15,
  },
  primaryButton: {
    backgroundColor: "#FF6B9D",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 25,
    width: "100%",
    alignItems: "center",
    shadowColor: "#FF6B9D",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  secondaryButton: {
    backgroundColor: "#4ECDC4",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 25,
    width: "100%",
    alignItems: "center",
    shadowColor: "#4ECDC4",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 18,
    textAlign: "center",
  },
});

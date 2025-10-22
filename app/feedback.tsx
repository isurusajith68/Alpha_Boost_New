import { useRouter } from "expo-router";
import { collection, getDocs, orderBy, query, where } from "firebase/firestore";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import AuthGuard from "../components/AuthGuard";
import { db } from "../config/firebase";
import { useAuth } from "../contexts/AuthContext";

interface PronunciationScore {
  id: string;
  userId: string;
  score: number;
  totalWords: number;
  percentage: number;
  gameType: string;
  timestamp: Date;
  answers: {
    word: string;
    userTyped: string;
    isCorrect: boolean;
  }[];
}

export default function Feedback() {
  const router = useRouter();
  const { user } = useAuth();
  const [pronunciationScores, setPronunciationScores] = useState<
    PronunciationScore[]
  >([]);
  const [loading, setLoading] = useState(true);

  const loadPronunciationScores = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const scoresQuery = query(
        collection(db, "pronunciationScores"),
        where("userId", "==", user.uid),
        orderBy("timestamp", "desc")
      );

      const querySnapshot = await getDocs(scoresQuery);
      const scores: PronunciationScore[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        scores.push({
          id: doc.id,
          userId: data.userId,
          score: data.score,
          totalWords: data.totalWords,
          percentage: data.percentage,
          gameType: data.gameType,
          timestamp: data.timestamp.toDate(),
          answers: data.answers || [],
        });
      });

      setPronunciationScores(scores);
    } catch (error) {
      console.error("Failed to load pronunciation scores:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadPronunciationScores();
  }, [loadPronunciationScores]);

  // Calculate statistics from pronunciation scores
  const calculateStats = () => {
    let totalWordsAttempted = 0;
    let totalCorrectWords = 0;
    let totalGamesPlayed = pronunciationScores.length;

    pronunciationScores.forEach((score) => {
      totalWordsAttempted += score.totalWords;
      totalCorrectWords += score.score;
    });

    return {
      totalWords: totalWordsAttempted,
      correctWords: totalCorrectWords,
      gamesPlayed: totalGamesPlayed,
    };
  };

  const stats = calculateStats();
  const totalWords = stats.totalWords;
  const correctWords = stats.correctWords;
  const practiceCount = stats.gamesPlayed;

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

  if (loading) {
    return (
      <AuthGuard>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text style={styles.loadingText}>Loading your progress...</Text>
          </View>
        </SafeAreaView>
      </AuthGuard>
    );
  }

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
              <Text style={styles.statLabel}>Total Words</Text>
              <Text style={styles.statEmoji}>📝</Text>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{correctWords}</Text>
              <Text style={styles.statLabel}>Words Correct</Text>
              <Text style={styles.statEmoji}>✅</Text>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{practiceCount}</Text>
              <Text style={styles.statLabel}>Games Played</Text>
              <Text style={styles.statEmoji}>�</Text>
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

          {pronunciationScores.length > 0 && (
            <View style={styles.pronunciationScoresSection}>
              <Text style={styles.pronunciationTitle}>
                🎤 Pronunciation Games History
              </Text>
              {pronunciationScores.slice(0, 10).map((score) => (
                <View key={score.id} style={styles.scoreCard}>
                  <View style={styles.scoreHeader}>
                    <View style={styles.scoreHeaderLeft}>
                      <Text style={styles.scoreDate}>
                        {score.timestamp.toLocaleDateString()}
                      </Text>
                      <View
                        style={[
                          styles.gameTypeBadge,
                          score.gameType === "pronunciation-practice"
                            ? styles.gameTypePractice
                            : styles.gameTypeGame,
                        ]}
                      >
                        <Text style={styles.gameTypeText}>
                          {score.gameType === "pronunciation-practice"
                            ? "✍️ Typing"
                            : "🎮 Game"}
                        </Text>
                      </View>
                    </View>
                    <View
                      style={[
                        styles.percentageBadge,
                        score.percentage >= 80
                          ? styles.percentageHigh
                          : score.percentage >= 60
                          ? styles.percentageMedium
                          : styles.percentageLow,
                      ]}
                    >
                      <Text style={styles.percentageText}>
                        {score.percentage}%
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.scoreDetails}>
                    Score: {score.score} / {score.totalWords} words correct
                  </Text>
                  <View style={styles.scoreAnswers}>
                    {score.answers.map((answer, idx) => (
                      <Text key={idx} style={styles.answerEmoji}>
                        {answer.isCorrect ? "✅" : "❌"}
                      </Text>
                    ))}
                  </View>
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
              onPress={() => router.push("/pronunciation-practice")}
            >
              <Text style={styles.buttonText}>Pronunciation Practice! 🎤</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6B7280",
    marginTop: 15,
  },
  pronunciationScoresSection: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    marginBottom: 25,
    borderWidth: 2,
    borderColor: "#3B82F6",
  },
  pronunciationTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1E40AF",
    marginBottom: 15,
    textAlign: "center",
  },
  scoreCard: {
    backgroundColor: "#F0F9FF",
    borderRadius: 15,
    padding: 15,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#3B82F6",
  },
  scoreHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  scoreHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  scoreDate: {
    fontSize: 14,
    fontWeight: "700",
    color: "#374151",
  },
  gameTypeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  gameTypePractice: {
    backgroundColor: "#DBEAFE",
  },
  gameTypeGame: {
    backgroundColor: "#FCE7F3",
  },
  gameTypeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#1F2937",
  },
  percentageBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  percentageHigh: {
    backgroundColor: "#D1FAE5",
  },
  percentageMedium: {
    backgroundColor: "#FEF3C7",
  },
  percentageLow: {
    backgroundColor: "#FEE2E2",
  },
  percentageText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#1F2937",
  },
  scoreDetails: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
    marginBottom: 10,
  },
  scoreAnswers: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  answerEmoji: {
    fontSize: 18,
  },
});

import { useAudioPlayer } from "expo-audio";
import { addDoc, collection } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AuthGuard from "../components/AuthGuard";
import { db } from "../config/firebase";
import { useAuth } from "../contexts/AuthContext";

const PRACTICE_WORDS = [
  {
    id: 1,
    word: "ball",
    display: "Ball",
    referenceAudio: require("../data_directory/correct/ball_correct.mp3"),
    difficulty: "easy",
    phonetic: "/bɔːl/",
    hint: "A round object used in sports",
  },
  {
    id: 2,
    word: "banana",
    display: "Banana",
    referenceAudio: require("../data_directory/correct/banana_correct.mp3"),
    difficulty: "easy",
    phonetic: "/bəˈnɑːnə/",
    hint: "A yellow tropical fruit",
  },
  {
    id: 3,
    word: "blue",
    display: "Blue",
    referenceAudio: require("../data_directory/correct/blue_correct.mp3"),
    difficulty: "easy",
    phonetic: "/bluː/",
    hint: "The color of the sky",
  },
  {
    id: 4,
    word: "boat",
    display: "Boat",
    referenceAudio: require("../data_directory/correct/boat_correct.mp3"),
    difficulty: "easy",
    phonetic: "/boʊt/",
    hint: "A vehicle for traveling on water",
  },
  {
    id: 5,
    word: "chair",
    display: "Chair",
    referenceAudio: require("../data_directory/correct/chair_correct.mp3"),
    difficulty: "easy",
    phonetic: "/tʃeər/",
    hint: "Furniture you sit on",
  },
];

type UserAnswer = {
  word: string;
  userTyped: string;
  isCorrect: boolean;
};

const PronunciationPractice = () => {
  const { user } = useAuth();
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [practiceFinished, setPracticeFinished] = useState(false);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [userInput, setUserInput] = useState("");
  const [showHint, setShowHint] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const currentWord = PRACTICE_WORDS[currentWordIndex];
  const referencePlayer = useAudioPlayer(currentWord.referenceAudio);

  useEffect(() => {
    setUserInput("");
    setShowHint(false);
    setShowFeedback(false);
  }, [currentWordIndex]);

  const playReference = () => {
    if (referencePlayer.playing) {
      referencePlayer.pause();
    } else {
      referencePlayer.play();
    }
  };

  const handleSubmit = () => {
    if (userInput.trim() === "") {
      return;
    }

    const correct =
      userInput.trim().toLowerCase() === currentWord.word.toLowerCase();
    setIsCorrect(correct);
    setShowFeedback(true);

    const answer: UserAnswer = {
      word: currentWord.word,
      userTyped: userInput.trim(),
      isCorrect: correct,
    };

    const updatedAnswers = [...userAnswers, answer];
    setUserAnswers(updatedAnswers);
  };

  const savePracticeScore = async () => {
    if (!user) {
      Alert.alert("Error", "You must be logged in to save your score");
      return;
    }

    setIsSaving(true);
    try {
      const score = calculateScore();
      const totalWords = PRACTICE_WORDS.length;
      const percentage = Math.round((score / totalWords) * 100);

      await addDoc(collection(db, "pronunciationScores"), {
        userId: user.uid,
        score: score,
        totalWords: totalWords,
        percentage: percentage,
        answers: userAnswers,
        gameType: "pronunciation-practice",
        timestamp: new Date(),
      });

      console.log("Score saved successfully!");
    } catch (error) {
      console.error("Error saving score:", error);
      Alert.alert(
        "Save Failed",
        "Could not save your score. Please try again."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleNext = async () => {
    if (currentWordIndex < PRACTICE_WORDS.length - 1) {
      setCurrentWordIndex(currentWordIndex + 1);
    } else {
      setPracticeFinished(true);
      await savePracticeScore();
    }
  };

  const handleRestart = () => {
    setCurrentWordIndex(0);
    setPracticeFinished(false);
    setUserAnswers([]);
    setUserInput("");
    setShowHint(false);
    setShowFeedback(false);
  };

  const calculateScore = () => {
    return userAnswers.filter((answer) => answer.isCorrect).length;
  };

  if (practiceFinished) {
    const score = calculateScore();
    const totalWords = PRACTICE_WORDS.length;
    const percentage = Math.round((score / totalWords) * 100);

    return (
      <AuthGuard>
        <SafeAreaView style={styles.safeArea} edges={["top", "right", "left"]}>
          <ScrollView style={styles.container}>
            <View style={styles.resultContainer}>
              <Text style={styles.resultTitle}>🎉 Practice Complete! 🎉</Text>

              {isSaving && (
                <View style={styles.savingContainer}>
                  <ActivityIndicator size="small" color="#3B82F6" />
                  <Text style={styles.savingText}>Saving your score...</Text>
                </View>
              )}

              <View style={styles.summaryCard}>
                <Text style={styles.summaryScore}>
                  {score} / {totalWords}
                </Text>
                <Text style={styles.summaryText}>Correct Words</Text>
                <Text style={styles.summaryPercentage}>
                  {percentage}% Accuracy
                </Text>
              </View>

              <View style={styles.resultsSection}>
                <Text style={styles.resultsSectionTitle}>Your Results</Text>
                {userAnswers.map((answer, index) => (
                  <View key={index} style={styles.resultItem}>
                    <View style={styles.resultHeader}>
                      <Text style={styles.resultWord}>
                        {index + 1}. {PRACTICE_WORDS[index].display}
                      </Text>
                      <View
                        style={[
                          styles.resultBadge,
                          answer.isCorrect
                            ? styles.resultBadgeCorrect
                            : styles.resultBadgeIncorrect,
                        ]}
                      >
                        <Text style={styles.resultBadgeText}>
                          {answer.isCorrect ? "✓ Correct" : "✗ Incorrect"}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.resultDetails}>
                      <Text style={styles.resultMetric}>
                        You typed: {answer.userTyped}
                      </Text>
                      {!answer.isCorrect && (
                        <Text style={styles.resultMetricCorrect}>
                          Correct: {answer.word}
                        </Text>
                      )}
                    </View>
                  </View>
                ))}
              </View>

              <TouchableOpacity
                style={styles.restartButton}
                onPress={handleRestart}
              >
                <Text style={styles.restartButtonText}>Practice Again</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <SafeAreaView style={styles.safeArea} edges={["top", "right", "left"]}>
        <ScrollView style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.progressText}>
              Word {currentWordIndex + 1} of {PRACTICE_WORDS.length}
            </Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {currentWord.difficulty.toUpperCase()}
              </Text>
            </View>
          </View>

          <View style={styles.wordCard}>
            <Text style={styles.instruction}>
              Listen and type the word you hear:
            </Text>
            <TouchableOpacity
              style={styles.audioIconButton}
              onPress={playReference}
            >
              <Text style={styles.audioIcon}>
                {referencePlayer.playing ? "🔊" : "🔈"}
              </Text>
              <Text style={styles.audioText}>
                {referencePlayer.playing ? "Playing..." : "Tap to Listen"}
              </Text>
            </TouchableOpacity>

            <View style={styles.phoneticContainer}>
              <Text style={styles.phoneticText}>{currentWord.phonetic}</Text>
            </View>
          </View>

          <View style={styles.inputSection}>
            <Text style={styles.sectionTitle}>✍️ Type the word:</Text>
            <TextInput
              style={styles.textInput}
              value={userInput}
              onChangeText={setUserInput}
              placeholder="Type here..."
              placeholderTextColor="#9CA3AF"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!showFeedback}
            />

            {showHint && (
              <View style={styles.hintContainer}>
                <Text style={styles.hintText}>💡 Hint: {currentWord.hint}</Text>
              </View>
            )}

            {!showFeedback && (
              <TouchableOpacity
                style={styles.hintButton}
                onPress={() => setShowHint(!showHint)}
              >
                <Text style={styles.hintButtonText}>
                  {showHint ? "Hide Hint" : "Show Hint"}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {showFeedback ? (
            <View style={styles.feedbackSection}>
              <View
                style={[
                  styles.feedbackCard,
                  isCorrect ? styles.feedbackCorrect : styles.feedbackIncorrect,
                ]}
              >
                <Text style={styles.feedbackEmoji}>
                  {isCorrect ? "🎉" : "😅"}
                </Text>
                <Text style={styles.feedbackTitle}>
                  {isCorrect ? "Perfect!" : "Not quite!"}
                </Text>
                <Text style={styles.feedbackText}>
                  {isCorrect
                    ? "You got it right!"
                    : `The correct word is: ${currentWord.display}`}
                </Text>
              </View>

              <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
                <Text style={styles.nextButtonText}>
                  {currentWordIndex < PRACTICE_WORDS.length - 1
                    ? "Next Word →"
                    : "See Results"}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={[
                styles.submitButton,
                userInput.trim() === "" && styles.submitButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={userInput.trim() === ""}
            >
              <Text style={styles.submitButtonText}>Check Answer</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </SafeAreaView>
    </AuthGuard>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F0F9FF",
  },
  container: {
    flex: 1,
    backgroundColor: "#F0F9FF",
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 25,
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 15,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  progressText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#374151",
  },
  badge: {
    backgroundColor: "#FF6B6B",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  badgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
  wordCard: {
    backgroundColor: "#fff",
    padding: 35,
    borderRadius: 20,
    alignItems: "center",
    marginBottom: 25,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  instruction: {
    fontSize: 18,
    color: "#374151",
    marginBottom: 20,
    fontWeight: "700",
    textAlign: "center",
  },
  audioIconButton: {
    alignItems: "center",
    marginBottom: 15,
  },
  audioIcon: {
    fontSize: 64,
    marginBottom: 10,
  },
  audioText: {
    fontSize: 16,
    color: "#3B82F6",
    fontWeight: "600",
  },
  phoneticContainer: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    marginTop: 10,
  },
  phoneticText: {
    fontSize: 20,
    color: "#6B7280",
    fontWeight: "600",
    fontStyle: "italic",
  },
  inputSection: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#374151",
    marginBottom: 15,
  },
  textInput: {
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#3B82F6",
    borderRadius: 15,
    padding: 18,
    fontSize: 20,
    fontWeight: "600",
    color: "#1F2937",
    elevation: 2,
  },
  hintContainer: {
    backgroundColor: "#FEF3C7",
    padding: 15,
    borderRadius: 12,
    marginTop: 15,
    borderLeftWidth: 4,
    borderLeftColor: "#F59E0B",
  },
  hintText: {
    fontSize: 15,
    color: "#92400E",
    fontWeight: "600",
  },
  hintButton: {
    backgroundColor: "#F59E0B",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignSelf: "center",
    marginTop: 15,
  },
  hintButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
  feedbackSection: {
    marginBottom: 20,
  },
  feedbackCard: {
    padding: 25,
    borderRadius: 20,
    alignItems: "center",
    marginBottom: 20,
    elevation: 3,
  },
  feedbackCorrect: {
    backgroundColor: "#D1FAE5",
    borderWidth: 2,
    borderColor: "#10B981",
  },
  feedbackIncorrect: {
    backgroundColor: "#FEE2E2",
    borderWidth: 2,
    borderColor: "#EF4444",
  },
  feedbackEmoji: {
    fontSize: 48,
    marginBottom: 10,
  },
  feedbackTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1F2937",
    marginBottom: 8,
  },
  feedbackText: {
    fontSize: 16,
    color: "#374151",
    fontWeight: "600",
    textAlign: "center",
  },
  nextButton: {
    backgroundColor: "#3B82F6",
    paddingVertical: 18,
    borderRadius: 15,
    alignItems: "center",
    elevation: 4,
  },
  nextButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
  },
  submitButton: {
    backgroundColor: "#3B82F6",
    paddingVertical: 18,
    borderRadius: 15,
    alignItems: "center",
    elevation: 4,
    marginVertical: 20,
  },
  submitButtonDisabled: {
    backgroundColor: "#9CA3AF",
    elevation: 1,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
  },
  resultContainer: {
    flex: 1,
    padding: 10,
  },
  resultTitle: {
    fontSize: 32,
    fontWeight: "800",
    color: "#1F2937",
    marginBottom: 30,
    textAlign: "center",
  },
  resultsSection: {
    width: "100%",
    marginBottom: 30,
  },
  resultsSectionTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#374151",
    marginBottom: 20,
    textAlign: "center",
  },
  summaryCard: {
    backgroundColor: "#3B82F6",
    padding: 30,
    borderRadius: 20,
    alignItems: "center",
    marginBottom: 25,
    elevation: 4,
  },
  summaryScore: {
    fontSize: 48,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 10,
  },
  summaryText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 10,
  },
  summaryPercentage: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
  },
  resultItem: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  resultHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  resultWord: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1F2937",
  },
  resultBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  resultBadgeCorrect: {
    backgroundColor: "#D1FAE5",
  },
  resultBadgeIncorrect: {
    backgroundColor: "#FEE2E2",
  },
  resultBadgeText: {
    fontSize: 14,
    fontWeight: "700",
  },
  resultDetails: {
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    paddingTop: 15,
  },
  resultMetric: {
    fontSize: 15,
    fontWeight: "600",
    color: "#6B7280",
    marginBottom: 6,
  },
  resultMetricCorrect: {
    fontSize: 15,
    fontWeight: "700",
    color: "#10B981",
    marginTop: 4,
  },
  restartButton: {
    backgroundColor: "#3B82F6",
    paddingVertical: 18,
    paddingHorizontal: 50,
    borderRadius: 15,
    elevation: 4,
    alignSelf: "center",
    marginTop: 10,
  },
  restartButtonText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "800",
  },
  savingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EFF6FF",
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
    gap: 10,
  },
  savingText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#3B82F6",
  },
});

export default PronunciationPractice;

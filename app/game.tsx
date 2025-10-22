import { Asset } from "expo-asset";
import { useAudioPlayer } from "expo-audio";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import AuthGuard from "../components/AuthGuard";

const WORDS = [
  {
    id: 1,
    word: "ball",
    display: "Ball",
    correctAudio: require("../data_directory/correct/ball_correct.mp3"),
    incorrectAudio: require("../data_directory/incorrect/ball_incorrect.mp3"),
  },
  {
    id: 2,
    word: "banana",
    display: "Banana",
    correctAudio: require("../data_directory/correct/banana_correct.mp3"),
    incorrectAudio: require("../data_directory/incorrect/banana_incorrect.mp3"),
  },
  {
    id: 3,
    word: "blue",
    display: "Blue",
    correctAudio: require("../data_directory/correct/blue_correct.mp3"),
    incorrectAudio: require("../data_directory/incorrect/blue_incorrect.mp3"),
  },
  {
    id: 4,
    word: "boat",
    display: "Boat",
    correctAudio: require("../data_directory/correct/boat_correct.mp3"),
    incorrectAudio: require("../data_directory/incorrect/boat_incorrect.mp3"),
  },
  {
    id: 5,
    word: "chair",
    display: "Chair",
    correctAudio: require("../data_directory/correct/chair_correct.mp3"),
    incorrectAudio: require("../data_directory/incorrect/chair_incorrect.mp3"),
  },
];

type AudioOption = {
  id: string;
  label: string;
  audioPath: any;
  isCorrect: boolean;
};

type PredictionResult = {
  filename: string;
  prediction: "correct" | "incorrect";
  confidence: number;
  probability_correct: number;
  error?: string;
};

type ApiResponse = {
  total_files: number;
  successful_predictions: number;
  success_rate: string;
  results: PredictionResult[];
};

type UserAnswer = {
  word: string;
  selectedAudioPath: any;
  isCorrect: boolean;
  audioFileName: string;
};

const Game = () => {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [gameFinished, setGameFinished] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [apiResults, setApiResults] = useState<PredictionResult[]>([]);

  const currentWord = WORDS[currentWordIndex];

  const [shuffledOptions, setShuffledOptions] = useState<AudioOption[]>([]);

  useEffect(() => {
    const audioOptions: AudioOption[] = [
      {
        id: "option1",
        label: "Pronunciation A",
        audioPath: currentWord.correctAudio,
        isCorrect: true,
      },
      {
        id: "option2",
        label: "Pronunciation B",
        audioPath: currentWord.incorrectAudio,
        isCorrect: false,
      },
    ];

    const shuffled = [...audioOptions].sort(() => Math.random() - 0.5);
    setShuffledOptions(shuffled);
    setSelectedOption(null);
  }, [currentWordIndex, currentWord.correctAudio, currentWord.incorrectAudio]);

  const handleSelectOption = (optionId: string) => {
    setSelectedOption(optionId);
  };

  const handleSubmit = () => {
    if (!selectedOption) {
      Alert.alert(
        "Please select an option",
        "Choose a pronunciation before submitting!"
      );
      return;
    }

    const selected = shuffledOptions.find((opt) => opt.id === selectedOption);
    if (!selected) return;

    const answer: UserAnswer = {
      word: currentWord.word,
      selectedAudioPath: selected.audioPath,
      isCorrect: selected.isCorrect,
      audioFileName: `${currentWord.word}_${
        selected.isCorrect ? "correct" : "incorrect"
      }.mp3`,
    };

    const updatedAnswers = [...userAnswers, answer];
    setUserAnswers(updatedAnswers);

    if (selected.isCorrect) {
      setScore(score + 1);
    }

    if (currentWordIndex < WORDS.length - 1) {
      setCurrentWordIndex(currentWordIndex + 1);
    } else {
      sendAllAnswersToAPI(updatedAnswers);
    }
  };

  const sendAllAnswersToAPI = async (answersToSend: UserAnswer[]) => {
    setIsAnalyzing(true);
    setGameFinished(true);

    try {
      const testResponse = await fetch(
        "https://gzrznv7g-5000.asse.devtunnels.ms/api/predict",
        { method: "OPTIONS" }
      ).catch(() => null);

      if (!testResponse || (!testResponse.ok && testResponse.status !== 405)) {
        throw new Error("Server is not reachable");
      }

      const formData = new FormData();

      for (let index = 0; index < answersToSend.length; index++) {
        const answer = answersToSend[index];

        try {
          const asset = Asset.fromModule(answer.selectedAudioPath);
          await asset.downloadAsync();

          const localUri = asset.localUri || asset.uri;

          if (!localUri) {
            throw new Error(`Could not resolve URI for ${answer.word}`);
          }

          formData.append("files", {
            uri: localUri,
            name: answer.audioFileName,
            type: "audio/mp3",
          } as any);
        } catch {
          throw new Error(`Failed to process audio file for ${answer.word}`);
        }
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const response = await fetch(
        "https://gzrznv7g-5000.asse.devtunnels.ms/api/predict",
        {
          method: "POST",
          body: formData,
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(
          `Server responded with status: ${response.status} ${response.statusText}`
        );
      }

      const result: ApiResponse = await response.json();

      if (result.successful_predictions > 0) {
        setApiResults(result.results);

        let resultsMessage = `Analysis Complete!\n\nSuccess Rate: ${result.success_rate}\nTotal Files: ${result.total_files}\nSuccessful Predictions: ${result.successful_predictions}\n\nDetailed Results:\n`;

        result.results.forEach((item: PredictionResult, index: number) => {
          const status = item.prediction === "correct" ? "✓" : "✗";
          const confidencePercent = Math.round(item.confidence * 100);
          const probabilityPercent = Math.round(item.probability_correct * 100);

          resultsMessage += `\n${index + 1}. ${item.filename}\n`;
          resultsMessage += `   ${status} Prediction: ${item.prediction}\n`;
          resultsMessage += `   Confidence: ${confidencePercent}%\n`;
          resultsMessage += `   Probability Correct: ${probabilityPercent}%\n`;
        });

        Alert.alert("🤖 AI Pronunciation Analysis", resultsMessage);
      } else {
        const errorMsg = result.results[0]?.error || "Unknown error";
        Alert.alert(
          "Analysis Complete",
          `Could not analyze all recordings: ${errorMsg}`
        );
      }
    } catch (error) {
      let errorMessage = "Failed to upload recordings.";

      if (error instanceof Error) {
        if (error.message.includes("aborted")) {
          errorMessage =
            "Upload timed out. The server may be busy or files are too large.";
        } else if (error.message.includes("Network request failed")) {
          errorMessage =
            "Network error. Please check your internet connection and server status.";
        } else if (error.message.includes("Server is not reachable")) {
          errorMessage = error.message;
        } else if (error.message.includes("Server responded with status")) {
          errorMessage = error.message;
        } else {
          errorMessage = `Upload failed: ${error.message}`;
        }
      }

      Alert.alert("Analysis Unavailable", errorMessage);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleRestart = () => {
    setCurrentWordIndex(0);
    setScore(0);
    setGameFinished(false);
    setSelectedOption(null);
    setUserAnswers([]);
    setApiResults([]);
  };

  if (gameFinished) {
    return (
      <AuthGuard>
        <ScrollView style={styles.container}>
          <View style={styles.resultContainer}>
            {isAnalyzing ? (
              <View style={styles.analyzingFullScreen}>
                <ActivityIndicator size="large" color="#4ECDC4" />
                <Text style={styles.analyzingText}>
                  Analyzing your pronunciations...
                </Text>
                <Text style={styles.analyzingSubtext}>
                  Please wait while AI processes your answers
                </Text>
              </View>
            ) : (
              <>
                <Text style={styles.resultTitle}>🎉 Game Complete! 🎉</Text>
                <Text style={styles.resultScore}>
                  Your Score: {score} / {WORDS.length}
                </Text>
                <Text style={styles.resultPercentage}>
                  {Math.round((score / WORDS.length) * 100)}%
                </Text>
                {score === WORDS.length && (
                  <Text style={styles.perfectScore}>Perfect Score! 🌟</Text>
                )}

                {apiResults.length > 0 && (
                  <View style={styles.aiAnalysisSection}>
                    <Text style={styles.aiAnalysisTitle}>
                      Pronunciation Analysis
                    </Text>
                    {apiResults.map((result, index) => (
                      <View key={index} style={styles.aiAnalysisItem}>
                        <Text style={styles.aiAnalysisWord}>
                          {index + 1}. {userAnswers[index]?.word.toUpperCase()}
                        </Text>
                        <View style={styles.aiAnalysisDetails}>
                          <Text
                            style={[
                              styles.aiAnalysisPrediction,
                              result.prediction === "correct"
                                ? styles.predictionCorrect
                                : styles.predictionIncorrect,
                            ]}
                          >
                            {result.prediction === "correct"
                              ? "Correct"
                              : "Incorrect"}
                          </Text>
                          <Text style={styles.aiAnalysisMetric}>
                            Confidence: {Math.round(result.confidence * 100)}%
                          </Text>
                          <Text style={styles.aiAnalysisMetric}>
                            Probability:{" "}
                            {Math.round(result.probability_correct * 100)}%
                          </Text>
                        </View>
                      </View>
                    ))}
                  </View>
                )}

                <TouchableOpacity
                  style={styles.restartButton}
                  onPress={handleRestart}
                >
                  <Text style={styles.restartButtonText}>Play Again</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </ScrollView>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.progressText}>
            Question {currentWordIndex + 1} of {WORDS.length}
          </Text>
          <Text style={styles.scoreText}>Score: {score}</Text>
        </View>

        <View style={styles.wordContainer}>
          <Text style={styles.wordLabel}>Which pronunciation is correct?</Text>
          <Text style={styles.wordDisplay}>{currentWord.display}</Text>
        </View>

        <View style={styles.optionsContainer}>
          <Text style={styles.instructionText}>
            Listen to both pronunciations and choose the correct one:
          </Text>
          {shuffledOptions.map((option) => (
            <AudioOptionButton
              key={option.id}
              option={option}
              isSelected={selectedOption === option.id}
              onSelect={() => handleSelectOption(option.id)}
            />
          ))}
        </View>

        <TouchableOpacity
          style={[
            styles.submitButton,
            (!selectedOption || isAnalyzing) && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={!selectedOption || isAnalyzing}
        >
          {isAnalyzing ? (
            <View style={styles.analyzingContainer}>
              <ActivityIndicator size="small" color="#fff" />
              <Text style={styles.submitButtonText}>Analyzing...</Text>
            </View>
          ) : (
            <Text style={styles.submitButtonText}>
              {currentWordIndex < WORDS.length - 1
                ? "Submit & Next"
                : "Submit & Finish"}
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </AuthGuard>
  );
};

const AudioOptionButton = ({
  option,
  isSelected,
  onSelect,
}: {
  option: AudioOption;
  isSelected: boolean;
  onSelect: () => void;
}) => {
  const player = useAudioPlayer(option.audioPath);

  const handlePlay = () => {
    if (player.playing) {
      player.pause();
    } else {
      player.play();
    }
  };

  const getButtonStyle = () => {
    return isSelected ? styles.optionButtonSelected : styles.optionButton;
  };

  return (
    <View style={styles.optionWrapper}>
      <TouchableOpacity style={getButtonStyle()} onPress={onSelect}>
        <Text style={styles.optionLabel}>{option.label}</Text>
        <TouchableOpacity style={styles.playButton} onPress={handlePlay}>
          <Text style={styles.playButtonText}>
            {player.playing ? "⏸️" : "▶️"} Play
          </Text>
        </TouchableOpacity>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0F4F8",
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
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
  scoreText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#4ECDC4",
  },
  wordContainer: {
    backgroundColor: "#fff",
    padding: 30,
    borderRadius: 20,
    alignItems: "center",
    marginBottom: 30,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  wordLabel: {
    fontSize: 16,
    color: "#6B7280",
    marginBottom: 10,
    fontWeight: "600",
  },
  wordDisplay: {
    fontSize: 48,
    fontWeight: "800",
    color: "#1F2937",
    textTransform: "capitalize",
  },
  optionsContainer: {
    marginBottom: 20,
  },
  instructionText: {
    fontSize: 16,
    color: "#374151",
    marginBottom: 20,
    fontWeight: "600",
    textAlign: "center",
  },
  optionWrapper: {
    marginBottom: 15,
  },
  optionButton: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 15,
    borderWidth: 3,
    borderColor: "#E5E7EB",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  optionButtonSelected: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 15,
    borderWidth: 3,
    borderColor: "#4ECDC4",
    elevation: 3,
    shadowColor: "#4ECDC4",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  optionButtonCorrect: {
    backgroundColor: "#D1FAE5",
    padding: 20,
    borderRadius: 15,
    borderWidth: 3,
    borderColor: "#10B981",
    elevation: 3,
  },
  optionButtonIncorrect: {
    backgroundColor: "#FEE2E2",
    padding: 20,
    borderRadius: 15,
    borderWidth: 3,
    borderColor: "#EF4444",
    elevation: 3,
  },
  optionLabel: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 10,
  },
  playButton: {
    backgroundColor: "#8B5CF6",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  playButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  submitButton: {
    backgroundColor: "#4ECDC4",
    paddingVertical: 18,
    borderRadius: 15,
    alignItems: "center",
    elevation: 4,
    shadowColor: "#4ECDC4",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
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
  resultFeedback: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 15,
    alignItems: "center",
    marginVertical: 20,
    elevation: 3,
  },
  correctFeedback: {
    fontSize: 20,
    fontWeight: "700",
    color: "#10B981",
    marginBottom: 20,
    textAlign: "center",
  },
  incorrectFeedback: {
    fontSize: 20,
    fontWeight: "700",
    color: "#EF4444",
    marginBottom: 20,
    textAlign: "center",
  },
  nextButton: {
    backgroundColor: "#3B82F6",
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 12,
    elevation: 3,
  },
  nextButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  resultContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
  },
  resultTitle: {
    fontSize: 32,
    fontWeight: "800",
    color: "#1F2937",
    marginBottom: 30,
    textAlign: "center",
  },
  resultScore: {
    fontSize: 24,
    fontWeight: "700",
    color: "#374151",
    marginBottom: 10,
  },
  resultPercentage: {
    fontSize: 64,
    fontWeight: "800",
    color: "#4ECDC4",
    marginBottom: 20,
  },
  perfectScore: {
    fontSize: 20,
    fontWeight: "700",
    color: "#10B981",
    marginBottom: 30,
  },
  restartButton: {
    backgroundColor: "#4ECDC4",
    paddingVertical: 18,
    paddingHorizontal: 50,
    borderRadius: 15,
    elevation: 4,
    shadowColor: "#4ECDC4",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  restartButtonText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "800",
  },
  analyzingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  apiResultContainer: {
    backgroundColor: "#F3F4F6",
    padding: 15,
    borderRadius: 12,
    marginTop: 15,
    borderLeftWidth: 4,
    borderLeftColor: "#8B5CF6",
  },
  apiResultTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#374151",
    marginBottom: 10,
  },
  apiResultText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
    marginBottom: 5,
  },
  analyzingFullScreen: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 100,
  },
  analyzingText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#374151",
    marginTop: 20,
  },
  analyzingSubtext: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
    marginTop: 8,
    textAlign: "center",
  },
  aiAnalysisSection: {
    width: "100%",
    backgroundColor: "#F9FAFB",
    borderRadius: 20,
    padding: 20,
    marginVertical: 20,
    borderWidth: 2,
    borderColor: "#8B5CF6",
  },
  aiAnalysisTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#374151",
    marginBottom: 15,
    textAlign: "center",
  },
  aiAnalysisItem: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 15,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#8B5CF6",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  aiAnalysisWord: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1F2937",
    marginBottom: 10,
  },
  aiAnalysisDetails: {
    paddingLeft: 10,
  },
  aiAnalysisPrediction: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 6,
  },
  predictionCorrect: {
    color: "#10B981",
  },
  predictionIncorrect: {
    color: "#EF4444",
  },
  aiAnalysisMetric: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
    marginBottom: 4,
  },
});

export default Game;

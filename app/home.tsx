import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AuthGuard from "../components/AuthGuard";
import Recorder from "../components/Recorder";
import WordCard from "../components/WordCard";
import { addHistoryEntry, HistoryEntry } from "../utils/storage";

const WORDS = [
  { word: "Apple", image: require("../assets/apple.png") },
  { word: "Ball", image: require("../assets/ball.png") },
  { word: "Cat", image: require("../assets/cat.png") },
  { word: "Dog", image: require("../assets/dog.png") },
  { word: "Fish", image: require("../assets/fish.png") },
];

export default function Home() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [recordingCount, setRecordingCount] = useState<{
    [key: number]: number;
  }>({});

  const [sessionComplete, setSessionComplete] = useState(false);
  const [allRecordings, setAllRecordings] = useState<
    { word: string; uri: string; durationMs: number }[]
  >([]);
  const [isUploading, setIsUploading] = useState(false);

  const current = WORDS[currentIndex];
  const requiredRecordings = 1;
  const currentRecordingCount = recordingCount[currentIndex] || 0;

  function nextWord() {
    if (currentIndex < WORDS.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      uploadAllRecordings();
    }
  }

  async function uploadAllRecordings() {
    if (allRecordings.length === 0) {
      setSessionComplete(true);
      Alert.alert("Session Complete", "You've completed all words!");
      return;
    }

    setIsUploading(true);
    Alert.alert("Uploading", "Uploading all recordings to server...");

    try {
      console.log("Checking server connectivity...");
      const testResponse = await fetch(
        "https://gzrznv7g-5000.asse.devtunnels.ms/api/predict",
        {
          method: "OPTIONS",
        }
      ).catch(() => null);

      if (!testResponse || (!testResponse.ok && testResponse.status !== 405)) {
        throw new Error(
          "Server is not reachable. Please ensure the server is running on localhost:5000"
        );
      }

      const formData = new FormData();

      allRecordings.forEach((recording, index) => {
        console.log(`Adding recording ${index + 1}: ${recording.word}`);
        formData.append("files", {
          uri: recording.uri,
          name: `${recording.word}_recording_${index + 1}.wav`,
          type: "audio/wav",
        } as any);
      });

      console.log(`FormData created with ${allRecordings.length} files`);

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

      console.log(`Response status: ${response.status}`);

      if (!response.ok) {
        throw new Error(
          `Server responded with status: ${response.status} ${response.statusText}`
        );
      }

      const result = await response.json();
      console.log("API Response:", result);

      if (result.successful_predictions > 0) {
        let resultsMessage = `Session Complete!\n\nSuccess Rate: ${result.success_rate}\nTotal Files: ${result.total_files}\nSuccessful Predictions: ${result.successful_predictions}\n\nDetailed Results:\n`;

        result.results.forEach((item: any, index: number) => {
          const status = item.prediction === "correct" ? "✓" : "✗";
          const confidencePercent = Math.round(item.confidence * 100);
          const probabilityPercent = Math.round(item.probability_correct * 100);

          resultsMessage += `\n${index + 1}. ${item.filename}\n`;
          resultsMessage += `   ${status} Prediction: ${item.prediction}\n`;
          resultsMessage += `   Confidence: ${confidencePercent}%\n`;
          resultsMessage += `   Probability Correct: ${probabilityPercent}%\n`;
        });

        setSessionComplete(true);
        Alert.alert("Pronunciation Analysis Complete!", resultsMessage);
      } else {
        setSessionComplete(true);
        const errorMsg = result.results[0]?.error || "Unknown error";

        let userFriendlyMessage = "All recordings saved locally.";

        if (errorMsg === "No predictions could be made") {
          userFriendlyMessage +=
            "\n\nThe server could not analyze your recordings. This might be due to:\n• Audio quality issues\n• Unsupported file format\n• Server processing error\n\nPlease try recording again with better audio quality.";
        } else if (
          errorMsg.includes("timeout") ||
          errorMsg.includes("timed out")
        ) {
          userFriendlyMessage +=
            "\n\nThe server took too long to process your recordings. Please try again.";
        } else if (errorMsg.includes("format") || errorMsg.includes("codec")) {
          userFriendlyMessage +=
            "\n\nThere was an issue with the audio format. Please ensure you're using a supported format (WAV recommended).";
        } else {
          userFriendlyMessage += `\n\nServer prediction failed: ${errorMsg}`;
        }

        Alert.alert("Session Complete", userFriendlyMessage);
      }
    } catch (error) {
      console.error("Bulk upload error:", error);

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

      setSessionComplete(true);
      Alert.alert(
        "Session Complete",
        `All recordings saved locally.\n${errorMessage}`
      );
    } finally {
      setIsUploading(false);
    }
  }

  async function onSubmitRecording({
    uri,
    durationMs,
  }: {
    uri: string;
    durationMs: number;
  }) {
    const newRecording = {
      word: current.word,
      uri,
      durationMs,
    };

    setAllRecordings((prev) => [...prev, newRecording]);

    const entry: HistoryEntry = {
      id: String(Date.now()),
      word: current.word,
      timestamp: Date.now(),
      score: 0,
      audioUri: uri,
    };

    await addHistoryEntry(entry);

    const newCount = (recordingCount[currentIndex] || 0) + 1;
    setRecordingCount({
      ...recordingCount,
      [currentIndex]: newCount,
    });

    if (newCount >= requiredRecordings) {
      Alert.alert(
        "Word Complete",
        `Completed ${requiredRecordings} recording for "${current.word}"`
      );
      setTimeout(() => {
        nextWord();
      }, 1500);
    } else {
      Alert.alert("Recording Saved", `Recording saved for "${current.word}"`);
    }
  }

  return (
    <AuthGuard>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.headerSection}>
            <Text style={styles.header}>🎯 Word Practice Time! 🎯</Text>
            <Text style={styles.subHeader}>
              Say the word clearly and I&apos;ll listen!
            </Text>
            <Text style={styles.progressIndicator}>
              Word {currentIndex + 1} of {WORDS.length}
            </Text>
          </View>

          <View style={styles.card}>
            <WordCard word={current.word} image={current.image} />
            <Text style={styles.recordingProgress}>
              Recording {currentRecordingCount + 1} of {requiredRecordings}
            </Text>
            <Recorder
              label={`Say "${current.word}"`}
              onRecorded={onSubmitRecording}
            />
          </View>

          {isUploading && (
            <View style={styles.uploadingBox}>
              <Text style={styles.uploadingText}>
                📤 Uploading Recordings...
              </Text>
              <Text style={styles.uploadingSubtext}>
                Sending {allRecordings.length} recordings to server
              </Text>
            </View>
          )}

          {sessionComplete ? (
            <View style={styles.completionBox}>
              <Text style={styles.completionText}>🎉 Session Complete!</Text>
            </View>
          ) : (
            <>
              <TouchableOpacity
                style={[
                  styles.btnPrimary,
                  currentRecordingCount < requiredRecordings &&
                    styles.btnDisabled,
                ]}
                onPress={
                  currentRecordingCount >= requiredRecordings
                    ? nextWord
                    : undefined
                }
              >
                <Text style={styles.btnPrimaryText}>
                  {currentIndex === WORDS.length - 1
                    ? "Finish Session"
                    : "Next Word"}
                </Text>
              </TouchableOpacity>
            </>
          )}

          <View style={{ height: 20 }} />
        </ScrollView>
      </SafeAreaView>
    </AuthGuard>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F0F8FF", // Alice blue - softer background
  },
  container: {
    padding: 20,
    alignItems: "center",
  },
  headerSection: {
    alignItems: "center",
    marginBottom: 20,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    padding: 20,
    borderRadius: 20,
    width: "100%",
  },
  header: {
    fontSize: 28,
    fontWeight: "900",
    marginBottom: 8,
    color: "#FF6B9D", // Pink color for playfulness
    textAlign: "center",
  },
  subHeader: {
    fontSize: 16,
    color: "#4B5563",
    marginBottom: 8,
    textAlign: "center",
    fontWeight: "600",
  },
  progressIndicator: {
    fontSize: 14,
    color: "#10B981", // Green for progress
    fontWeight: "700",
    backgroundColor: "#D1FAE5",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    overflow: "hidden",
  },
  card: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
    marginBottom: 25,
    width: "100%",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#FFE66D", // Yellow border for fun
  },
  btnPrimary: {
    backgroundColor: "#FF6B9D", // Pink for primary action
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 25,
    marginTop: 15,
    width: "100%",
    alignItems: "center",
    shadowColor: "#FF6B9D",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  btnPrimaryAlt: {
    backgroundColor: "#4ECDC4", // Teal for game button
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 25,
    marginTop: 15,
    width: "100%",
    alignItems: "center",
    shadowColor: "#4ECDC4",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  btnSecondary: {
    backgroundColor: "#F3F4F6",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginTop: 12,
    width: "100%",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#D1D5DB",
  },
  btnPrimaryText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 18,
  },
  btnSecondaryText: {
    color: "#374151",
    fontWeight: "700",
    fontSize: 16,
  },
  scoreBox: {
    backgroundColor: "#E0E7FF",
    padding: 12,
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
  },
  scoreText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e3a8a",
  },
  recordingProgress: {
    fontSize: 14,
    color: "#666",
    marginBottom: 10,
    fontWeight: "500",
  },
  completionBox: {
    backgroundColor: "#D1FAE5",
    padding: 25,
    borderRadius: 25,
    width: "100%",
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 3,
    borderColor: "#10B981",
  },
  completionText: {
    fontSize: 28,
    fontWeight: "900",
    color: "#065F46",
    marginBottom: 8,
    textAlign: "center",
  },
  completionSubtext: {
    fontSize: 18,
    color: "#047857",
    textAlign: "center",
    marginBottom: 20,
    fontWeight: "600",
  },
  btnDisabled: {
    backgroundColor: "#D1D5DB",
    opacity: 0.6,
  },
  uploadingBox: {
    backgroundColor: "#FEF3C7",
    padding: 25,
    borderRadius: 25,
    width: "100%",
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 3,
    borderColor: "#F59E0B",
  },
  uploadingText: {
    fontSize: 22,
    fontWeight: "800",
    color: "#92400E",
    marginBottom: 8,
    textAlign: "center",
  },
  uploadingSubtext: {
    fontSize: 16,
    color: "#78350F",
    textAlign: "center",
    fontWeight: "600",
  },
});

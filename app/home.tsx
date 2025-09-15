import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
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
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [recordingCount, setRecordingCount] = useState<{
    [key: number]: number;
  }>({});
  const [lastScore, setLastScore] = useState<number | null>(null);
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
      setLastScore(null);
    } else {
      uploadAllRecordings();
    }
  }

  async function testServerConnection() {
    try {
      console.log("Testing server connection...");
      const response = await fetch(
        "https://gzrznv7g-5000.asse.devtunnels.ms/api/predict",
        {
          method: "POST", // Use POST instead of HEAD since server doesn't allow HEAD
        }
      );

      if (response.ok || response.status === 405) {
        // 405 is expected since OPTIONS might not be fully implemented, but it means server is responding
        Alert.alert("✅ Server Connected", "Server is running and reachable!");
      } else {
        Alert.alert(
          "❌ Server Error",
          `Server responded with status: ${response.status}`
        );
      }
    } catch (error) {
      console.error("Server test error:", error);
      Alert.alert(
        "❌ Connection Failed",
        "Cannot connect to server. Please ensure it's running on localhost:5000"
      );
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
        Alert.alert(
          "Session Complete",
          `All recordings saved locally. Server prediction failed: ${
            result.results[0]?.error || "Unknown error"
          }`
        );
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
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.header}> Pronounce & Play</Text>
        <Text style={styles.subHeader}>
          Practice words, record your voice & improve pronunciation
        </Text>

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
            <Text style={styles.uploadingText}>📤 Uploading Recordings...</Text>
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

            <TouchableOpacity
              style={styles.btnPrimaryAlt}
              onPress={() => router.push("/game")}
            >
              <Text style={styles.btnPrimaryText}>Play Game</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.btnSecondary}
              onPress={testServerConnection}
            >
              <Text style={styles.btnSecondaryText}>
                Test Server Connection
              </Text>
            </TouchableOpacity>
          </>
        )}

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F2F6FF",
  },
  container: {
    padding: 20,
    alignItems: "center",
  },
  header: {
    fontSize: 30,
    fontWeight: "800",
    marginBottom: 6,
    color: "#1E3A8A",
  },
  subHeader: {
    fontSize: 14,
    color: "#555",
    marginBottom: 18,
    textAlign: "center",
  },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    marginBottom: 20,
    width: "100%",
    alignItems: "center",
  },
  btnPrimary: {
    backgroundColor: "#4f46e5",
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 12,
    marginTop: 10,
    width: "100%",
    alignItems: "center",
  },
  btnPrimaryAlt: {
    backgroundColor: "#10b981",
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 12,
    marginTop: 10,
    width: "100%",
    alignItems: "center",
  },
  btnSecondary: {
    backgroundColor: "#e5e7eb",
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 12,
    marginTop: 10,
    width: "100%",
    alignItems: "center",
  },
  btnPrimaryText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  btnSecondaryText: {
    color: "#333",
    fontWeight: "600",
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
    padding: 20,
    borderRadius: 16,
    width: "100%",
    alignItems: "center",
    marginBottom: 20,
  },
  completionText: {
    fontSize: 24,
    fontWeight: "800",
    color: "#065F46",
    marginBottom: 8,
  },
  completionSubtext: {
    fontSize: 16,
    color: "#047857",
    textAlign: "center",
    marginBottom: 20,
  },
  btnDisabled: {
    backgroundColor: "#9CA3AF",
    opacity: 0.6,
  },
  uploadingBox: {
    backgroundColor: "#FEF3C7",
    padding: 20,
    borderRadius: 16,
    width: "100%",
    alignItems: "center",
    marginBottom: 20,
  },
  uploadingText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#92400E",
    marginBottom: 8,
  },
  uploadingSubtext: {
    fontSize: 16,
    color: "#78350F",
    textAlign: "center",
  },
});

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import WordCard from "../components/WordCard";
import Recorder from "../components/Recorder";
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
  const [current, setCurrent] = useState(
    () => WORDS[Math.floor(Math.random() * WORDS.length)]
  );
  const [lastScore, setLastScore] = useState<number | null>(null);

  function nextWord() {
    const pick = WORDS[Math.floor(Math.random() * WORDS.length)];
    setCurrent(pick);
    setLastScore(null);
  }

  async function onSubmitRecording({
    uri,
    durationMs,
  }: {
    uri: string;
    durationMs: number;
  }) {
    Alert.prompt(
      "Type what you said",
      `Type your pronunciation of "${current.word}" for a simple check.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Submit",
          onPress: async (text: string | undefined) => {
            const score = scoreText(text ?? "", current.word);
            setLastScore(score);

            const entry: HistoryEntry = {
              id: String(Date.now()),
              word: current.word,
              timestamp: Date.now(),
              score,
              audioUri: uri,
            };

            await addHistoryEntry(entry);
            Alert.alert("Saved", `Score: ${Math.round(score * 100)}%`);
          },
        },
      ],
      "plain-text"
    );
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
          <Recorder label={`Say "${current.word}"`} onRecorded={onSubmitRecording} />
        </View>

        <TouchableOpacity style={styles.btnPrimary} onPress={nextWord}>
          <Text style={styles.btnPrimaryText}>Next</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.btnSecondary}
          onPress={() => router.push("/feedback")}
        >
          <Text style={styles.btnSecondaryText}> View Feedback / History</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.btnPrimaryAlt}
          onPress={() => router.push("/game")}
        >
          <Text style={styles.btnPrimaryText}> Play Game</Text>
        </TouchableOpacity>

        <View style={{ height: 20 }} />
        <View style={styles.scoreBox}>
          <Text style={styles.scoreText}>
            ⭐ Last Score:{" "}
            {lastScore === null ? "—" : `${Math.round(lastScore * 100)}%`}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function scoreText(recognized: string, target: string) {
  const normalize = (s: string) => s.trim().toLowerCase();
  const a = normalize(recognized);
  const b = normalize(target);
  if (!a) return 0;
  if (a === b) return 1;
  const common = longestCommonSubsequence(a, b).length;
  return Math.max(0, Math.min(1, (2 * common) / (a.length + b.length)));
}

function longestCommonSubsequence(a: string, b: string) {
  const m = a.length,
    n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () =>
    Array(n + 1).fill(0)
  );
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) dp[i][j] = dp[i - 1][j - 1] + 1;
      else dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
    }
  }
  let i = m,
    j = n;
  let out = "";
  while (i > 0 && j > 0) {
    if (a[i - 1] === b[j - 1]) {
      out = a[i - 1] + out;
      i--;
      j--;
    } else if (dp[i - 1][j] > dp[i][j - 1]) i--;
    else j--;
  }
  return out;
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
});

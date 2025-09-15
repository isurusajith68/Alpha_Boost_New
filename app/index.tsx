// app/index.tsx
import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
} from "react-native";
import { useRouter } from "expo-router";

export default function HomeScreen() {
  const router = useRouter();

  return (
    <ImageBackground
      source={require("../assets/green.png")}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay} />

      <View style={styles.container}>
        <Text style={styles.title}>English Fun Learning</Text>
        <Text style={styles.subtitle}>Improve Your Spoken English</Text>

        <View style={styles.grid}>
          {/* home */}
          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push("/home")}
          >
            <Text style={styles.cardEmoji}>📖</Text>
            <Text style={styles.cardText}>Learn Activity</Text>
          </TouchableOpacity>

          {/* Record */}
          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push("/game")}
          >
            <Text style={styles.cardEmoji}>🎤</Text>
            <Text style={styles.cardText}>Record Voice</Text>
          </TouchableOpacity>

          {/* Feedback */}
          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push("/feedback")}
          >
            <Text style={styles.cardEmoji}>📊</Text>
            <Text style={styles.cardText}>Feedback</Text>
          </TouchableOpacity>

          {/* Game */}
          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push("/game")}
          >
            <Text style={styles.cardEmoji}>🎮</Text>
            <Text style={styles.cardText}>Play Game</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)", // dark overlay for readability
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 6,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#f9fafb",
    marginBottom: 20,
    textAlign: "center",
  },
  grid: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
  },
  card: {
    width: "40%",
    aspectRatio: 1,
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 10,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 6,
  },
  cardEmoji: {
    fontSize: 40,
    marginBottom: 10,
  },
  cardText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
});

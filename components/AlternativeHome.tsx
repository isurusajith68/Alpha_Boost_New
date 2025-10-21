// app/index-alternative.tsx (Example using reusable components)
import { useRouter } from "expo-router";
import React from "react";
import {
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import FunActivityCard from "../components/FunActivityCard";

export default function AlternativeHomeScreen() {
  const router = useRouter();

  const activities = [
    {
      emoji: "📖",
      title: "Learn Words",
      route: "/home" as const,
      backgroundColor: "#FF6B9D",
      shadowColor: "#FF6B9D",
    },
    {
      emoji: "🎤",
      title: "Record Voice",
      route: "/game" as const,
      backgroundColor: "#4ECDC4",
      shadowColor: "#4ECDC4",
    },
    {
      emoji: "📊",
      title: "See Progress",
      route: "/feedback" as const,
      backgroundColor: "#FFE66D",
      shadowColor: "#FFE66D",
    },
    {
      emoji: "🎮",
      title: "Play Game",
      route: "/game" as const,
      backgroundColor: "#A78BFA",
      shadowColor: "#A78BFA",
    },
  ];

  return (
    <ImageBackground
      source={require("../assets/green.png")}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>🌈 Fun English Learning 🌈</Text>
          <Text style={styles.subtitle}>Choose your adventure!</Text>
          <View style={styles.rainbow} />
        </View>

        {/* Activity Cards */}
        <View style={styles.cardsContainer}>
          {activities.map((activity, index) => (
            <FunActivityCard
              key={index}
              emoji={activity.emoji}
              title={activity.title}
              backgroundColor={activity.backgroundColor}
              shadowColor={activity.shadowColor}
              onPress={() => router.push(activity.route)}
              size="medium"
            />
          ))}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.encouragement}>
            🎉 Ready to learn and have fun? 🎉
          </Text>
        </View>
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.15)",
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "900",
    color: "#fff",
    textAlign: "center",
    marginBottom: 10,
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
    textAlign: "center",
    marginBottom: 20,
    textShadowColor: "rgba(0,0,0,0.2)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  rainbow: {
    width: 120,
    height: 6,
    borderRadius: 3,
    backgroundColor:
      "linear-gradient(90deg, #FF6B9D, #FFE66D, #4ECDC4, #A78BFA)",
  },
  cardsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  footer: {
    alignItems: "center",
  },
  encouragement: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});

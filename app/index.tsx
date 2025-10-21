// app/index.tsx
import { useRouter } from "expo-router";
import React from "react";
import {
  Alert,
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import AuthGuard from "../components/AuthGuard";
import { useAuth } from "../contexts/AuthContext";

export default function HomeScreen() {
  const router = useRouter();
  const { userProfile, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      { text: "Logout", onPress: () => logout() },
    ]);
  };

  const cardData = [
    {
      emoji: "📖",
      text: "Learn Activity",
      route: "/home" as const,
      colors: ["#FF6B9D", "#FF8FB3"],
      shadowColor: "#FF6B9D",
    },
    {
      emoji: "👤",
      text: "Profile",
      route: "/profile" as const,
      colors: ["#4ECDC4", "#7DDDD9"],
      shadowColor: "#4ECDC4",
    },
    {
      emoji: "📊",
      text: "Progress",
      route: "/feedback" as const,
      colors: ["#FFE66D", "#FFED8A"],
      shadowColor: "#FFE66D",
    },
    {
      emoji: "🎮",
      text: "Play Game",
      route: "/game" as const,
      colors: ["#A78BFA", "#C4B5FD"],
      shadowColor: "#A78BFA",
    },
  ];
  async function testServerConnection() {
    try {
      console.log("Testing server connection...");
      const response = await fetch(
        "https://gzrznv7g-5000.asse.devtunnels.ms/api/health",
        {
          method: "POST",
        }
      );

      if (response.ok || response.status === 405) {
        Alert.alert("Server Connected", "Server is running and reachable!");
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
  return (
    <AuthGuard>
      <ImageBackground
        source={require("../assets/green.png")}
        style={styles.background}
        resizeMode="cover"
      >
        <View style={styles.overlay} />

        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>🌟 English Fun Learning 🌟</Text>
            {userProfile && (
              <Text style={styles.userGreeting}>
                Welcome back, {userProfile.firstName}! 👋
              </Text>
            )}
            <Text style={styles.subtitle}>
              Let&apos;s Learn & Play Together!
            </Text>
            <View style={styles.decorativeLine} />
          </View>

          <View style={styles.grid}>
            {cardData.map((card, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.card,
                  {
                    backgroundColor: card.colors[0],
                    shadowColor: card.shadowColor,
                  },
                ]}
                onPress={() => router.push(card.route)}
                activeOpacity={0.8}
              >
                <View style={styles.cardContent}>
                  <View style={styles.emojiContainer}>
                    <Text style={styles.cardEmoji}>{card.emoji}</Text>
                  </View>
                  <Text style={styles.cardText}>{card.text}</Text>
                </View>

                <Text style={styles.sparkle1}>✨</Text>
                <Text style={styles.sparkle2}>⭐</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Ready to have fun? Pick an activity! 🎉
            </Text>
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
            >
              <Text style={styles.logoutButtonText}>Logout 🚪</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={styles.btnSecondary}
            onPress={testServerConnection}
          >
            <Text style={styles.btnSecondaryText}>Server Connection</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </AuthGuard>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(87, 69, 69, 0.2)",
  },
  container: {
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 50,
  },
  header: {
    alignItems: "center",
    marginTop: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "900",
    color: "#fff",
    marginBottom: 12,
    textAlign: "center",
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 15,
    textAlign: "center",
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  userGreeting: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFE66D",
    textAlign: "center",
    marginBottom: 8,
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  decorativeLine: {
    width: 100,
    height: 4,
    backgroundColor: "#FFE66D",
    borderRadius: 2,
    marginTop: 10,
  },
  grid: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 10,
  },
  card: {
    width: "45%",
    aspectRatio: 0.9,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 12,
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 12,
    elevation: 8,
    position: "relative",
    overflow: "hidden",
  },
  cardContent: {
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  emojiContainer: {
    width: 80,
    height: 80,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  cardEmoji: {
    fontSize: 45,
  },
  cardText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#fff",
    textAlign: "center",
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    letterSpacing: 0.5,
  },
  sparkle1: {
    position: "absolute",
    top: 15,
    right: 15,
    fontSize: 20,
    zIndex: 1,
  },
  sparkle2: {
    position: "absolute",
    bottom: 15,
    left: 15,
    fontSize: 16,
    zIndex: 1,
  },
  footer: {
    alignItems: "center",
    marginBottom: 20,
  },
  footerText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    textAlign: "center",
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  logoutButton: {
    marginTop: 15,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  logoutButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  btnSecondary: {
    marginTop: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  btnSecondaryText: {
    color: "#fff",
    fontWeight: "600",
  },
});

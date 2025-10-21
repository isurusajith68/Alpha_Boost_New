import { useRouter } from "expo-router";
import React from "react";
import {
  Image,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import AuthGuard from "../components/AuthGuard";
import ChildFriendlyButton from "../components/ChildFriendlyButton";
import { useAuth } from "../contexts/AuthContext";

export default function ProfileScreen() {
  const { userProfile, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  if (!userProfile) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <AuthGuard>
      <ImageBackground
        source={require("../assets/green.png")}
        style={styles.background}
        resizeMode="cover"
      >
        <View style={styles.overlay} />

        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>👤 My Profile</Text>
            <Text style={styles.subtitle}>Your learning journey! 🌟</Text>
          </View>

          {/* Profile Card */}
          <View style={styles.profileCard}>
            {/* Avatar */}
            <View style={styles.avatarSection}>
              <Image
                source={{ uri: userProfile.profileImage }}
                style={styles.avatar}
              />
              <Text style={styles.avatarName}>
                {userProfile.firstName} {userProfile.lastName}
              </Text>
            </View>

            {/* Profile Info */}
            <View style={styles.infoSection}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>📧 Email:</Text>
                <Text style={styles.infoValue}>{userProfile.email}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>📱 Phone:</Text>
                <Text style={styles.infoValue}>{userProfile.phoneNumber}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>📅 Member since:</Text>
                <Text style={styles.infoValue}>
                  {userProfile.createdAt.toLocaleDateString()}
                </Text>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.buttonSection}>
              <ChildFriendlyButton
                title="Edit Profile"
                onPress={() => {
                  /* TODO: Implement edit profile */
                }}
                backgroundColor="#4ECDC4"
                size="medium"
                style={styles.button}
              />

              <ChildFriendlyButton
                title="Logout"
                onPress={handleLogout}
                backgroundColor="#FF5757"
                size="medium"
                style={styles.button}
              />
            </View>
          </View>

          {/* Stats Section */}
          <View style={styles.statsCard}>
            <Text style={styles.statsTitle}>📊 Your Learning Stats</Text>

            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>0</Text>
                <Text style={styles.statLabel}>Words Learned</Text>
              </View>

              <View style={styles.statItem}>
                <Text style={styles.statNumber}>0</Text>
                <Text style={styles.statLabel}>Games Played</Text>
              </View>

              <View style={styles.statItem}>
                <Text style={styles.statNumber}>0</Text>
                <Text style={styles.statLabel}>Minutes Learned</Text>
              </View>

              <View style={styles.statItem}>
                <Text style={styles.statNumber}>0</Text>
                <Text style={styles.statLabel}>Achievements</Text>
              </View>
            </View>
          </View>

          {/* Back Button */}
          <ChildFriendlyButton
            title="Back to Home"
            onPress={() => router.push("/")}
            backgroundColor="#A78BFA"
            size="large"
            style={styles.backButton}
          />
        </ScrollView>
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
    backgroundColor: "rgba(0,0,0,0.2)",
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F0F8FF",
  },
  loadingText: {
    fontSize: 18,
    color: "#374151",
  },
  header: {
    alignItems: "center",
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: "900",
    color: "#fff",
    textAlign: "center",
    marginBottom: 8,
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
    textAlign: "center",
    textShadowColor: "rgba(0,0,0,0.2)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  profileCard: {
    backgroundColor: "rgba(255,255,255,0.95)",
    borderRadius: 25,
    padding: 25,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 12,
    elevation: 8,
  },
  avatarSection: {
    alignItems: "center",
    marginBottom: 25,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: "#FF6B9D",
    marginBottom: 15,
  },
  avatarName: {
    fontSize: 24,
    fontWeight: "800",
    color: "#374151",
    textAlign: "center",
  },
  infoSection: {
    marginBottom: 25,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 15,
    backgroundColor: "#F9FAFB",
    borderRadius: 15,
    marginBottom: 10,
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#374151",
  },
  infoValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6B7280",
    flex: 1,
    textAlign: "right",
    marginLeft: 10,
  },
  buttonSection: {
    gap: 15,
  },
  button: {
    marginVertical: 0,
  },
  statsCard: {
    backgroundColor: "rgba(255,255,255,0.95)",
    borderRadius: 25,
    padding: 25,
    marginBottom: 30,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 12,
    elevation: 8,
  },
  statsTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#374151",
    textAlign: "center",
    marginBottom: 20,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  statItem: {
    width: "45%",
    alignItems: "center",
    backgroundColor: "#F0F8FF",
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: "900",
    color: "#FF6B9D",
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
    textAlign: "center",
  },
  backButton: {
    marginBottom: 20,
  },
});

// app/login.tsx
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import ChildFriendlyButton from "../components/ChildFriendlyButton";
import { useAuth } from "../contexts/AuthContext";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Oops!", "Please fill in all fields! 📝");
      return;
    }

    setLoading(true);
    try {
      await signIn(email, password);
      router.replace("/"); // Navigate to home screen
    } catch (error: any) {
      let errorMessage = "Something went wrong! 😅";
      if (error.code === "auth/user-not-found") {
        errorMessage = "No account found with this email! 📧";
      } else if (error.code === "auth/wrong-password") {
        errorMessage = "Wrong password! Try again! 🔒";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Please enter a valid email! ✉️";
      }
      Alert.alert("Login Failed", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground
      source={require("../assets/green.png")}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay} />

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>🌟 Welcome Back! 🌟</Text>
            <Text style={styles.subtitle}>
              Let&apos;s continue learning! 📚
            </Text>
          </View>

          {/* Login Form */}
          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>📧 Email</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>🔒 Password</Text>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <ChildFriendlyButton
              title={loading ? "Logging in..." : "Login"}
              onPress={handleLogin}
              backgroundColor="#FF6B9D"
              size="large"
              style={styles.loginButton}
              disabled={loading}
            />

            <TouchableOpacity
              style={styles.registerLink}
              onPress={() => router.push("/register")}
            >
              <Text style={styles.registerText}>
                Don&apos;t have an account?{" "}
                <Text style={styles.registerLinkText}>Sign up here! 🎨</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
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
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: "900",
    color: "#fff",
    textAlign: "center",
    marginBottom: 12,
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
  form: {
    backgroundColor: "rgba(255,255,255,0.95)",
    borderRadius: 25,
    padding: 25,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 12,
    elevation: 8,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#374151",
    marginBottom: 8,
  },
  input: {
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderRadius: 15,
    padding: 15,
    fontSize: 16,
    backgroundColor: "#F9FAFB",
    color: "#111827",
  },
  loginButton: {
    marginTop: 10,
    marginBottom: 20,
  },
  registerLink: {
    alignItems: "center",
  },
  registerText: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
  },
  registerLinkText: {
    color: "#FF6B9D",
    fontWeight: "700",
  },
});

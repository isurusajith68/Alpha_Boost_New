// app/register.tsx
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import ChildFriendlyButton from "../components/ChildFriendlyButton";
import { CARTOON_IMAGES } from "../constants/cartoonImages";
import { useAuth } from "../contexts/AuthContext";

export default function RegisterScreen() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [selectedImage, setSelectedImage] = useState(CARTOON_IMAGES[0]);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const router = useRouter();

  const validateForm = () => {
    if (
      !firstName ||
      !lastName ||
      !email ||
      !phoneNumber ||
      !password ||
      !confirmPassword
    ) {
      Alert.alert("Oops!", "Please fill in all fields! 📝");
      return false;
    }

    if (password !== confirmPassword) {
      Alert.alert("Password Mismatch", "Passwords don&apos;t match! 🔒");
      return false;
    }

    if (password.length < 6) {
      Alert.alert(
        "Weak Password",
        "Password should be at least 6 characters! 💪"
      );
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert("Invalid Email", "Please enter a valid email address! ✉️");
      return false;
    }

    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      await signUp(
        email,
        password,
        firstName,
        lastName,
        phoneNumber,
        selectedImage.uri
      );
      Alert.alert(
        "Welcome!",
        "Your account has been created successfully! 🎉",
        [{ text: "OK", onPress: () => router.replace("/") }]
      );
    } catch (error: any) {
      let errorMessage = "Something went wrong! 😅";
      if (error.code === "auth/email-already-in-use") {
        errorMessage = "This email is already registered! 📧";
      } else if (error.code === "auth/weak-password") {
        errorMessage = "Password is too weak! Try a stronger one! 💪";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Please enter a valid email! ✉️";
      }
      Alert.alert("Registration Failed", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const renderCartoonImage = ({
    item,
  }: {
    item: (typeof CARTOON_IMAGES)[0];
  }) => (
    <TouchableOpacity
      style={[
        styles.imageOption,
        selectedImage.id === item.id && styles.selectedImageOption,
      ]}
      onPress={() => {
        setSelectedImage(item);
        setShowImagePicker(false);
      }}
    >
      <Image source={{ uri: item.uri }} style={styles.cartoonImage} />
      <Text style={styles.imageName}>{item.name}</Text>
    </TouchableOpacity>
  );

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
            <Text style={styles.title}>🎨 Join Our Learning Adventure! 🎨</Text>
            <Text style={styles.subtitle}>
              Create your account and start learning! 🌟
            </Text>
          </View>

          {/* Registration Form */}
          <View style={styles.form}>
            {/* Profile Image Selection */}
            <View style={styles.imageSection}>
              <Text style={styles.sectionTitle}>Choose Your Avatar 🐾</Text>
              <TouchableOpacity
                style={styles.selectedImageContainer}
                onPress={() => setShowImagePicker(true)}
              >
                <Image
                  source={{ uri: selectedImage.uri }}
                  style={styles.selectedImage}
                />
                <Text style={styles.changeImageText}>Tap to change</Text>
              </TouchableOpacity>
            </View>

            {/* Name Fields */}
            <View style={styles.row}>
              <View style={[styles.inputContainer, styles.halfWidth]}>
                <Text style={styles.inputLabel}>👤 First Name</Text>
                <TextInput
                  style={styles.input}
                  value={firstName}
                  onChangeText={setFirstName}
                  placeholder="Enter first name"
                  autoCapitalize="words"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
              <View style={[styles.inputContainer, styles.halfWidth]}>
                <Text style={styles.inputLabel}>👤 Last Name</Text>
                <TextInput
                  style={styles.input}
                  value={lastName}
                  onChangeText={setLastName}
                  placeholder="Enter last name"
                  autoCapitalize="words"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>

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
              <Text style={styles.inputLabel}>📱 Phone Number</Text>
              <TextInput
                style={styles.input}
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                placeholder="Enter phone number"
                keyboardType="phone-pad"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>🔒 Password</Text>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="Create a password"
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>🔒 Confirm Password</Text>
              <TextInput
                style={styles.input}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirm your password"
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <ChildFriendlyButton
              title={loading ? "Creating Account..." : "Create Account"}
              onPress={handleRegister}
              backgroundColor="#4ECDC4"
              size="large"
              style={styles.registerButton}
              disabled={loading}
            />

            <TouchableOpacity
              style={styles.loginLink}
              onPress={() => router.push("/login")}
            >
              <Text style={styles.loginText}>
                Already have an account?{" "}
                <Text style={styles.loginLinkText}>Login here! 🚀</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Image Picker Modal */}
      <Modal
        visible={showImagePicker}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowImagePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Choose Your Avatar 🎭</Text>
            <FlatList
              data={CARTOON_IMAGES}
              renderItem={renderCartoonImage}
              keyExtractor={(item) => item.id}
              numColumns={3}
              contentContainerStyle={styles.imageGrid}
              showsVerticalScrollIndicator={false}
            />
            <ChildFriendlyButton
              title="Cancel"
              onPress={() => setShowImagePicker(false)}
              backgroundColor="#6B7280"
              style={styles.cancelButton}
            />
          </View>
        </View>
      </Modal>
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
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "900",
    color: "#fff",
    textAlign: "center",
    marginBottom: 8,
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 16,
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
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 12,
    elevation: 8,
  },
  imageSection: {
    alignItems: "center",
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#374151",
    marginBottom: 15,
  },
  selectedImageContainer: {
    alignItems: "center",
  },
  selectedImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: "#FF6B9D",
  },
  changeImageText: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 8,
    fontWeight: "600",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  halfWidth: {
    width: "48%",
  },
  inputContainer: {
    marginBottom: 15,
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
  registerButton: {
    marginTop: 10,
    marginBottom: 20,
  },
  loginLink: {
    alignItems: "center",
  },
  loginText: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
  },
  loginLinkText: {
    color: "#4ECDC4",
    fontWeight: "700",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 25,
    padding: 20,
    width: "90%",
    maxHeight: "70%",
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: "#374151",
    textAlign: "center",
    marginBottom: 20,
  },
  imageGrid: {
    paddingBottom: 20,
  },
  imageOption: {
    flex: 1,
    alignItems: "center",
    margin: 8,
    padding: 10,
    borderRadius: 15,
    backgroundColor: "#F9FAFB",
    borderWidth: 2,
    borderColor: "transparent",
  },
  selectedImageOption: {
    borderColor: "#FF6B9D",
    backgroundColor: "#FFF5F7",
  },
  cartoonImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 8,
  },
  imageName: {
    fontSize: 12,
    fontWeight: "600",
    color: "#374151",
    textAlign: "center",
  },
  cancelButton: {
    marginTop: 10,
  },
});

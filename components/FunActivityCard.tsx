// components/FunActivityCard.tsx
import React from "react";
import {
  GestureResponderEvent,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";

interface FunActivityCardProps {
  emoji: string;
  title: string;
  onPress: (event: GestureResponderEvent) => void;
  backgroundColor?: string;
  shadowColor?: string;
  style?: ViewStyle;
  size?: "small" | "medium" | "large";
}

export default function FunActivityCard({
  emoji,
  title,
  onPress,
  backgroundColor = "#FF6B9D",
  shadowColor = "#FF6B9D",
  style,
  size = "medium",
}: FunActivityCardProps) {
  const getSizeStyles = () => {
    switch (size) {
      case "small":
        return {
          width: "40%" as const,
          aspectRatio: 1,
          emojiSize: 35,
          titleSize: 14,
          containerSize: 60,
        };
      case "large":
        return {
          width: "90%" as const,
          aspectRatio: 1.5,
          emojiSize: 60,
          titleSize: 20,
          containerSize: 100,
        };
      default: // medium
        return {
          width: "45%" as const,
          aspectRatio: 0.9,
          emojiSize: 45,
          titleSize: 16,
          containerSize: 80,
        };
    }
  };

  const sizeStyles = getSizeStyles();

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor,
          shadowColor,
          width: sizeStyles.width,
          aspectRatio: sizeStyles.aspectRatio,
        },
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.cardContent}>
        <View
          style={[
            styles.emojiContainer,
            {
              width: sizeStyles.containerSize,
              height: sizeStyles.containerSize,
              borderRadius: sizeStyles.containerSize / 2,
            },
          ]}
        >
          <Text style={[styles.cardEmoji, { fontSize: sizeStyles.emojiSize }]}>
            {emoji}
          </Text>
        </View>
        <Text style={[styles.cardText, { fontSize: sizeStyles.titleSize }]}>
          {title}
        </Text>
      </View>

      {/* Decorative elements */}
      <Text style={styles.sparkle1}>✨</Text>
      <Text style={styles.sparkle2}>⭐</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
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
    backgroundColor: "rgba(255,255,255,0.3)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  cardEmoji: {
    // fontSize will be set dynamically
  },
  cardText: {
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
});

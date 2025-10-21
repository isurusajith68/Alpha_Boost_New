// components/ChildFriendlyButton.tsx
import React from "react";
import {
  GestureResponderEvent,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  ViewStyle,
} from "react-native";

interface ChildFriendlyButtonProps {
  title: string;
  onPress: (event: GestureResponderEvent) => void;
  emoji?: string;
  backgroundColor?: string;
  textColor?: string;
  size?: "small" | "medium" | "large";
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
}

export default function ChildFriendlyButton({
  title,
  onPress,
  emoji,
  backgroundColor = "#FF6B9D",
  textColor = "#fff",
  size = "medium",
  style,
  textStyle,
  disabled = false,
}: ChildFriendlyButtonProps) {
  const getSizeStyles = () => {
    switch (size) {
      case "small":
        return {
          paddingVertical: 12,
          paddingHorizontal: 20,
          fontSize: 14,
        };
      case "large":
        return {
          paddingVertical: 20,
          paddingHorizontal: 32,
          fontSize: 20,
        };
      default: // medium
        return {
          paddingVertical: 16,
          paddingHorizontal: 24,
          fontSize: 16,
        };
    }
  };

  const sizeStyles = getSizeStyles();

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor: disabled ? "#D1D5DB" : backgroundColor,
          paddingVertical: sizeStyles.paddingVertical,
          paddingHorizontal: sizeStyles.paddingHorizontal,
        },
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <Text
        style={[
          styles.buttonText,
          {
            color: disabled ? "#9CA3AF" : textColor,
            fontSize: sizeStyles.fontSize,
          },
          textStyle,
        ]}
      >
        {emoji && `${emoji} `}
        {title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 10,
    elevation: 6,
    minWidth: 120,
  },
  buttonText: {
    fontWeight: "700",
    textAlign: "center",
    letterSpacing: 0.5,
  },
});

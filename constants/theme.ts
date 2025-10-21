/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * These are child-friendly, vibrant colors that make learning fun and engaging.
 */

import { Platform } from "react-native";

const tintColorLight = "#FF6B9D"; // Playful pink
const tintColorDark = "#fff";

export const Colors = {
  light: {
    text: "#1F2937", // Dark gray for better readability
    background: "#F0F8FF", // Alice blue - soft and calming
    tint: tintColorLight,
    icon: "#6B7280",
    tabIconDefault: "#9CA3AF",
    tabIconSelected: tintColorLight,
    // Child-friendly color palette - More vibrant and fun
    primary: "#FF6B9D", // Bright Pink
    secondary: "#4ECDC4", // Ocean Teal
    accent: "#FFE66D", // Sunny Yellow
    success: "#10B981", // Fresh Green
    warning: "#FF8C42", // Warm Orange
    danger: "#FF5757", // Soft Red
    purple: "#A78BFA", // Lavender Purple
    blue: "#60A5FA", // Sky Blue
    cardBorder: "#E5E7EB",
    cardBackground: "#FFFFFF",
    gradients: {
      sunset: ["#FF6B9D", "#FFE66D"],
      ocean: ["#4ECDC4", "#60A5FA"],
      forest: ["#10B981", "#34D399"],
      lavender: ["#A78BFA", "#C4B5FD"],
    },
  },
  dark: {
    text: "#F9FAFB", // Light text for dark mode
    background: "#1F2937", // Dark background
    tint: tintColorDark,
    icon: "#D1D5DB",
    tabIconDefault: "#9CA3AF",
    tabIconSelected: tintColorDark,
    // Dark mode friendly colors
    primary: "#F472B6", // Lighter pink for dark mode
    secondary: "#5EEAD4", // Lighter teal
    accent: "#FCD34D", // Lighter yellow
    success: "#34D399", // Lighter green
    warning: "#FBBF24", // Lighter orange
    danger: "#F87171", // Lighter red
    cardBorder: "#374151",
    cardBackground: "#374151",
  },
};

// Child-friendly theme configuration
export const ChildTheme = {
  borderRadius: {
    small: 12,
    medium: 20,
    large: 25,
    extraLarge: 30,
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  fontSize: {
    small: 14,
    medium: 16,
    large: 20,
    extraLarge: 24,
    title: 28,
    hero: 32,
  },
  fontWeight: {
    normal: "400",
    medium: "600",
    bold: "700",
    extraBold: "800",
    black: "900",
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: "system-ui",
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: "ui-serif",
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: "ui-rounded",
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded:
      "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

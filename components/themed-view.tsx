// themed-view.tsx
import React from 'react';
import { View, ViewProps, StyleSheet, useColorScheme } from 'react-native';

interface ThemedViewProps extends ViewProps {
  padding?: number;
  margin?: number;
  borderRadius?: number;
  bgColor?: string; // optional custom background color
}

export const ThemedView: React.FC<ThemedViewProps> = ({
  style,
  padding = 10,
  margin = 0,
  borderRadius = 8,
  bgColor,
  ...rest
}) => {
  const colorScheme = useColorScheme(); // 'light' or 'dark'
  const defaultBg = bgColor ?? (colorScheme === 'dark' ? '#1e1e1e' : '#ffffff');

  return (
    <View
      style={[
        styles.container,
        {
          padding,
          margin,
          borderRadius,
          backgroundColor: defaultBg,
        },
        style, // allow overriding styles
      ]}
      {...rest}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3, // for Android shadow
  },
});

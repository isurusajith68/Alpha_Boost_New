// themed-text.tsx
import React from 'react';
import { Text } from 'react-native';
import { TextProps } from 'react-native/Libraries/Text/Text';

export const ThemedText = (props: React.JSX.IntrinsicAttributes & React.JSX.IntrinsicClassAttributes<Text> & Readonly<TextProps>) => {
  return <Text {...props} />;
};

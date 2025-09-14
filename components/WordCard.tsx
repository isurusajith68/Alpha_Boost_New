import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";

export default function WordCard({ word, image }: { word: string; image: any }) {
  return (
    <View style={styles.card}>
      <Image source={image} style={styles.image} resizeMode="contain" />
      <Text style={styles.word}>{word}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 300,
    height: 300,
    backgroundColor: "#fff",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    marginBottom: 12,
  },
  image: {
    width: 160,
    height: 160,
    marginBottom: 8
  },
  word: {
    fontSize: 22,
    fontWeight: "700"
  }
});

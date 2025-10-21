import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";

export default function WordCard({
  word,
  image,
}: {
  word: string;
  image: any;
}) {
  return (
    <View style={styles.card}>
      <View style={styles.imageContainer}>
        <Image source={image} style={styles.image} resizeMode="contain" />
      </View>
      <View style={styles.wordContainer}>
        <Text style={styles.word}>{word}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 320,
    height: 320,
    backgroundColor: "#fff",
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 12,
    marginBottom: 15,
    borderWidth: 4,
    borderColor: "#4ECDC4", // Teal border
    padding: 20,
  },
  imageContainer: {
    width: 200,
    height: 200,
    backgroundColor: "#F0F8FF", // Light background for image
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
    borderWidth: 2,
    borderColor: "#E5E7EB",
  },
  image: {
    width: 180,
    height: 180,
  },
  wordContainer: {
    backgroundColor: "#FFE66D", // Yellow background for word
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#F59E0B",
  },
  word: {
    fontSize: 28,
    fontWeight: "900",
    color: "#1F2937",
    textAlign: "center",
  },
});

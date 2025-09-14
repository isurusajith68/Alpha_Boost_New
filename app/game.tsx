import React, { useEffect, useState } from "react";
import { SafeAreaView, Text, View, TouchableOpacity, StyleSheet, Image, Alert } from "react-native";
import { addHistoryEntry } from "../utils/storage";

const WORDS = [
  { word: "Apple", image: require("../assets/apple.png") },
  { word: "Ball", image: require("../assets/ball.png") },
  { word: "Cat", image: require("../assets/cat.png") },
  { word: "Dog", image: require("../assets/dog.png") },
  { word: "Fish", image: require("../assets/fish.png") },
];

function shuffle<T>(arr: T[]) {
  return arr.slice().sort(() => Math.random() - 0.5);
}

export default function Game() {
  const [target, setTarget] = useState(() => WORDS[Math.floor(Math.random() * WORDS.length)]);
  const [options, setOptions] = useState(() => shuffle(WORDS).slice(0, 3));

  useEffect(() => {
    spawn();
  }, []);

  function spawn() {
    const t = WORDS[Math.floor(Math.random() * WORDS.length)];
    let opts = shuffle(WORDS).filter((w) => w.word !== t.word).slice(0, 2);
    opts = shuffle([t, ...opts]);
    setTarget(t);
    setOptions(opts);
  }

  async function choose(opt: typeof WORDS[number]) {
    const correct = opt.word === target.word;
    const score = correct ? 1 : 0;
    await addHistoryEntry({
      id: String(Date.now()),
      word: target.word,
      timestamp: Date.now(),
      score,
      audioUri: null,
    });
    Alert.alert(
      correct ? "Great!" : "Oops",
      correct ? "You got it!" : `The correct answer was ${target.word}`,
      [{ text: "Next", onPress: spawn }]
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, padding: 16, alignItems: "center" }}>
      <Text style={{ fontSize: 22, fontWeight: "800" }}>Find: {target.word}</Text>
      <View style={{ height: 18 }} />
      <View style={styles.grid}>
        {options.map((o, idx) => (
          <TouchableOpacity style={styles.card} key={idx} onPress={() => choose(o)}>
            <Image source={o.image} style={{ width: 100, height: 100 }} resizeMode="contain" />
            <Text style={{ fontWeight: "700", marginTop: 8 }}>{o.word}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  grid: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 10,
  },
  card: {
    width: 120,
    height: 160,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    padding: 8,
    elevation: 2,
  },
});

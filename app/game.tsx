import React from "react";
import { Text, View } from "react-native";
import AuthGuard from "../components/AuthGuard";

const Game = () => {
  return (
    <AuthGuard>
      <View>
        <Text>Game Screen</Text>
      </View>
    </AuthGuard>
  );
};

export default Game;

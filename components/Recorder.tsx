import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system";

type RecorderProps = {
  label?: string;
  onRecorded: (info: { uri: string; durationMs: number }) => void;
};

// ✅ Custom recording options (required by new Expo SDKs)
const RECORDING_OPTIONS_HIGH_QUALITY: Audio.RecordingOptions = {
  android: {
    extension: ".m4a",
    outputFormat: Audio.AndroidOutputFormat.MPEG_4,
    audioEncoder: Audio.AndroidAudioEncoder.AAC,
    sampleRate: 44100,
    numberOfChannels: 2,
    bitRate: 128000,
  },
  ios: {
    extension: ".m4a",
    audioQuality: Audio.IOSAudioQuality.HIGH,
    sampleRate: 44100,
    numberOfChannels: 2,
    bitRate: 128000,
    linearPCMBitDepth: 16,
    linearPCMIsBigEndian: false,
    linearPCMIsFloat: false,
  },
  web: {
    mimeType: "audio/webm",
    bitsPerSecond: 128000,
  },
};

export default function Recorder({ label, onRecorded }: RecorderProps) {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isPlaying, setPlaying] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [lastUri, setLastUri] = useState<string | null>(null);
  const [statusText, setStatusText] = useState<string>("");

  useEffect(() => {
    (async () => {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
    })();

    return () => {
      sound?.unloadAsync();
    };
  }, []);

  async function startRecording() {
    try {
      setStatusText("Preparing...");
      const rec = new Audio.Recording();
      await rec.prepareToRecordAsync(RECORDING_OPTIONS_HIGH_QUALITY);
      await rec.startAsync();
      setRecording(rec);
      setStatusText("Recording...");
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Could not start recording.");
    }
  }

  async function stopRecording() {
    try {
      if (!recording) return;
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();

      if (!uri) return;
      const destDir = `${FileSystem.documentDirectory}recordings/`;
      await FileSystem.makeDirectoryAsync(destDir, { intermediates: true }).catch(() => {});
      const destPath = destDir + `rec_${Date.now()}.m4a`;

      await FileSystem.copyAsync({ from: uri, to: destPath });
      setLastUri(destPath);

      const status = await recording.getStatusAsync();
      const duration = status.durationMillis ?? 0;

      onRecorded({ uri: destPath, durationMs: duration });
      setStatusText("Recording saved");
      setRecording(null);
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Could not stop recording.");
    }
  }

  async function playLast() {
    try {
      if (!lastUri) return;
      if (sound) {
        await sound.unloadAsync();
        setSound(null);
        setPlaying(false);
        return;
      }
      const { sound: s } = await Audio.Sound.createAsync({ uri: lastUri });
      setSound(s);
      setPlaying(true);
      s.setOnPlaybackStatusUpdate((st) => {
        if (!st.isLoaded) return;
        if (st.didJustFinish) {
          setPlaying(false);
          s.unloadAsync().catch(() => {});
          setSound(null);
        }
      });
      await s.playAsync();
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Could not play audio.");
    }
  }

  return (
    <View style={styles.box}>
      <Text style={{ fontSize: 16, marginBottom: 8 }}>
        {label ?? "Recorder"}
      </Text>
      <View style={{ flexDirection: "row", gap: 12 }}>
        <TouchableOpacity
          onPress={recording ? stopRecording : startRecording}
          style={[
            styles.actionBtn,
            { backgroundColor: recording ? "#ef4444" : "#10b981" },
          ]}
        >
          <Text style={styles.actionText}>
            {recording ? "Stop" : "Record"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={playLast}
          style={[
            styles.actionBtn,
            { backgroundColor: lastUri ? "#3b82f6" : "#ccc" },
          ]}
        >
          <Text style={styles.actionText}>
            {isPlaying ? "Stop" : "Play"}
          </Text>
        </TouchableOpacity>
      </View>
      <Text style={{ marginTop: 8 }}>{statusText}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    width: "100%",
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    elevation: 2,
  },
  actionBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  actionText: {
    color: "#fff",
    fontWeight: "700",
  },
});

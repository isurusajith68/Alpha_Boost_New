import { Audio } from "expo-av";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";
import React, { useEffect, useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";

type RecorderProps = {
  label?: string;
  onRecorded: (info: { uri: string; durationMs: number }) => void;
};

// ✅ Custom recording options for WAV format (uncompressed, high quality)
const RECORDING_OPTIONS_HIGH_QUALITY: Audio.RecordingOptions = {
  android: {
    extension: ".wav",
    outputFormat: Audio.AndroidOutputFormat.DEFAULT,
    audioEncoder: Audio.AndroidAudioEncoder.DEFAULT,
    sampleRate: 44100,
    numberOfChannels: 2,
    bitRate: 128000,
  },
  ios: {
    extension: ".wav",
    audioQuality: Audio.IOSAudioQuality.MAX,
    sampleRate: 44100,
    numberOfChannels: 2,
    bitRate: 128000,
    linearPCMBitDepth: 16,
    linearPCMIsBigEndian: false,
    linearPCMIsFloat: false,
  },
  web: {
    mimeType: "audio/wav",
    bitsPerSecond: 1411200, // Higher bitrate for WAV
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
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  async function startRecording() {
    try {
      console.log("Starting recording...");
      setStatusText("Requesting permissions...");
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          "Permission Denied",
          "Microphone permission is required for recording."
        );
        return;
      }

      setStatusText("Preparing...");
      const rec = new Audio.Recording();
      await rec.prepareToRecordAsync(RECORDING_OPTIONS_HIGH_QUALITY);
      await rec.startAsync();
      setRecording(rec);
      setStatusText("Recording...");
      console.log("Recording started successfully");
    } catch (err) {
      console.error("Recording start error:", err);
      setStatusText("Recording failed");
      Alert.alert("Error", "Could not start recording. Please try again.");
    }
  }

  async function stopRecording() {
    try {
      console.log("Stopping recording...");
      if (!recording) {
        console.log("No recording to stop");
        return;
      }
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      console.log("Recording URI:", uri);

      if (!uri) return;
      const destDir = `${FileSystem.documentDirectory}recordings/`;
      await FileSystem.makeDirectoryAsync(destDir, {
        intermediates: true,
      }).catch(() => {});
      const destPath = destDir + `rec_${Date.now()}.wav`;

      await FileSystem.copyAsync({ from: uri, to: destPath });
      setLastUri(destPath);

      const status = await recording.getStatusAsync();
      const duration = status.durationMillis ?? 0;

      onRecorded({ uri: destPath, durationMs: duration });
      setStatusText("Recording saved");
      setRecording(null);
      console.log("Recording stopped and saved");
    } catch (err) {
      console.error("Recording stop error:", err);
      setStatusText("Recording failed");
      Alert.alert("Error", "Could not stop recording.");
    }
  }

  async function pickAudioFile() {
    try {
      setStatusText("Selecting file...");
      const result = await DocumentPicker.getDocumentAsync({
        type: ["audio/*"], // Accept all audio types
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        setStatusText("");
        return;
      }

      const file = result.assets[0];
      if (!file) {
        setStatusText("No file selected");
        return;
      }

      console.log("Selected file:", file.name, file.uri);

      // Copy file to app directory for consistent handling
      const destDir = `${FileSystem.documentDirectory}recordings/`;
      await FileSystem.makeDirectoryAsync(destDir, {
        intermediates: true,
      }).catch(() => {});
      const destPath = destDir + `upload_${Date.now()}_${file.name}`;

      await FileSystem.copyAsync({ from: file.uri, to: destPath });
      setLastUri(destPath);

      // Get file info to estimate duration (rough estimate)
      const fileSize = file.size || 0;
      const estimatedDuration = Math.max(1000, fileSize * 0.1); // Rough estimate: 0.1ms per byte

      onRecorded({ uri: destPath, durationMs: estimatedDuration });
      setStatusText("File uploaded successfully");
      console.log("File uploaded and saved");
    } catch (err) {
      console.error("File pick error:", err);
      setStatusText("Upload failed");
      Alert.alert("Error", "Could not upload file. Please try again.");
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

  const handlePress = () => {
    console.log("Button pressed, recording state:", !!recording);
    if (recording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <View style={styles.box}>
      <Text style={{ fontSize: 16, marginBottom: 8 }}>
        {label ?? "Recorder"}
      </Text>
      <View
        style={{
          flexDirection: "row",
          gap: 12,
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        <TouchableOpacity
          onPress={handlePress}
          style={[
            styles.actionBtn,
            { backgroundColor: recording ? "#ef4444" : "#10b981" },
          ]}
        >
          <Text style={styles.actionText}>{recording ? "Stop" : "Record"}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={pickAudioFile}
          style={[styles.actionBtn, { backgroundColor: "#8b5cf6" }]}
        >
          <Text style={styles.actionText}>Upload</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={playLast}
          style={[
            styles.actionBtn,
            { backgroundColor: lastUri ? "#3b82f6" : "#ccc" },
          ]}
        >
          <Text style={styles.actionText}>{isPlaying ? "Stop" : "Play"}</Text>
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

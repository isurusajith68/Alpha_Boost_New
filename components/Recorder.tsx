import {
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioPlayer,
  useAudioRecorder,
  useAudioRecorderState,
} from "expo-audio";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";
import React, { useEffect, useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";

type RecorderProps = {
  label?: string;
  onRecorded: (info: { uri: string; durationMs: number }) => void;
};

export default function Recorder({ label, onRecorded }: RecorderProps) {
  const [lastUri, setLastUri] = useState<string | null>(null);
  const [statusText, setStatusText] = useState<string>("");

  // Create recorder with high quality preset
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY, (status) => {
    console.log("Recording status:", status);
    if (status.isFinished) {
      setStatusText("Recording saved");
    }
  });

  // Get recorder state
  const recorderState = useAudioRecorderState(recorder);

  // Create player for playback
  const player = useAudioPlayer(lastUri);

  useEffect(() => {
    (async () => {
      await setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
      });
    })();
  }, []);

  async function startRecording() {
    try {
      console.log("Starting recording...");
      setStatusText("Requesting permissions...");
      const permission = await requestRecordingPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          "Permission Denied",
          "Microphone permission is required for recording."
        );
        return;
      }

      setStatusText("Preparing...");
      await recorder.prepareToRecordAsync();
      recorder.record();
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
      if (!recorderState.isRecording) {
        console.log("No recording to stop");
        return;
      }

      recorder.stop();
      const uri = recorder.uri;
      console.log("Recording URI:", uri);

      if (!uri) return;
      const destDir = `${FileSystem.documentDirectory}recordings/`;
      await FileSystem.makeDirectoryAsync(destDir, {
        intermediates: true,
      }).catch(() => {});
      const destPath = destDir + `rec_${Date.now()}.wav`;

      await FileSystem.copyAsync({ from: uri, to: destPath });
      setLastUri(destPath);

      const duration = recorderState.durationMillis;

      onRecorded({ uri: destPath, durationMs: duration });
      setStatusText("Recording saved");
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
      if (player.playing) {
        player.pause();
      } else {
        player.play();
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Could not play audio.");
    }
  }

  const handlePress = () => {
    console.log("Button pressed, recording state:", recorderState.isRecording);
    if (recorderState.isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <View style={styles.box}>
      <Text style={styles.title}>{label ?? "🎤 Voice Recorder"}</Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          onPress={handlePress}
          style={[
            styles.actionBtn,
            styles.recordBtn,
            {
              backgroundColor: recorderState.isRecording
                ? "#FF6B9D"
                : "#4ECDC4",
            },
          ]}
          activeOpacity={0.8}
        >
          <Text style={styles.btnEmoji}>
            {recorderState.isRecording ? "⏹️" : "🎤"}
          </Text>
          <Text style={styles.actionText}>
            {recorderState.isRecording ? "Stop Recording" : "Start Recording"}
          </Text>
        </TouchableOpacity>

        <View style={styles.secondaryButtonsRow}>
          <TouchableOpacity
            onPress={pickAudioFile}
            style={[styles.actionBtn, styles.secondaryBtn, styles.uploadBtn]}
            activeOpacity={0.8}
          >
            <Text style={styles.btnEmoji}>📁</Text>
            <Text style={styles.secondaryText}>Upload File</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={playLast}
            style={[
              styles.actionBtn,
              styles.secondaryBtn,
              styles.playBtn,
              { opacity: lastUri ? 1 : 0.5 },
            ]}
            disabled={!lastUri}
            activeOpacity={0.8}
          >
            <Text style={styles.btnEmoji}>{player.playing ? "⏸️" : "▶️"}</Text>
            <Text style={styles.secondaryText}>
              {player.playing ? "Stop" : "Play Back"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {statusText && (
        <View style={styles.statusContainer}>
          <Text style={styles.statusText}>{statusText}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    width: "100%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 25,
    alignItems: "center",
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    borderWidth: 3,
    borderColor: "#FFE66D",
  },
  title: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1F2937",
    marginBottom: 20,
    textAlign: "center",
  },
  buttonContainer: {
    width: "100%",
    alignItems: "center",
    gap: 15,
  },
  actionBtn: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignItems: "center",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  recordBtn: {
    width: "100%",
    minHeight: 80,
    justifyContent: "center",
  },
  secondaryButtonsRow: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
    gap: 10,
  },
  secondaryBtn: {
    flex: 1,
    minHeight: 70,
    justifyContent: "center",
  },
  uploadBtn: {
    backgroundColor: "#8B5CF6",
    shadowColor: "#8B5CF6",
  },
  playBtn: {
    backgroundColor: "#3B82F6",
    shadowColor: "#3B82F6",
  },
  btnEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  actionText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 16,
    textAlign: "center",
  },
  secondaryText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
    textAlign: "center",
  },
  statusContainer: {
    marginTop: 15,
    backgroundColor: "#F3F4F6",
    padding: 12,
    borderRadius: 15,
    width: "100%",
  },
  statusText: {
    fontSize: 14,
    color: "#374151",
    textAlign: "center",
    fontWeight: "600",
  },
});

import AsyncStorage from "@react-native-async-storage/async-storage";

export type HistoryEntry = {
  id: string;
  word: string;
  timestamp: number;
  score?: number; // 0..1
  audioUri?: string | null;
};

const KEY = "pronounce_history_v1";

export async function getHistory(): Promise<HistoryEntry[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error(err);
    return [];
  }
}

export async function addHistoryEntry(entry: HistoryEntry) {
  try {
    const cur = await getHistory();
    cur.push(entry);
    await AsyncStorage.setItem(KEY, JSON.stringify(cur));
  } catch (err) {
    console.error(err);
  }
}

export async function clearHistory() {
  try {
    await AsyncStorage.removeItem(KEY);
  } catch (err) { console.error(err); }
}

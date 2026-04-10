import AsyncStorage from '@react-native-async-storage/async-storage';
import { FactCheckResult } from './api';

const KEY = 'history_items';

export type HistoryStatus = 'pending' | 'done' | 'error';

export interface HistoryItem {
  id: string;
  url: string;
  status: HistoryStatus;
  result?: FactCheckResult;
  error?: string;
  createdAt: number;
}

export async function getHistory(): Promise<HistoryItem[]> {
  const raw = await AsyncStorage.getItem(KEY);
  return raw ? JSON.parse(raw) : [];
}

export async function addHistoryItem(url: string): Promise<HistoryItem> {
  const item: HistoryItem = {
    id: Date.now().toString(),
    url,
    status: 'pending',
    createdAt: Date.now(),
  };
  const history = await getHistory();
  await AsyncStorage.setItem(KEY, JSON.stringify([item, ...history]));
  return item;
}

export async function updateHistoryItem(id: string, update: Partial<HistoryItem>): Promise<void> {
  const history = await getHistory();
  const updated = history.map((item) => (item.id === id ? { ...item, ...update } : item));
  await AsyncStorage.setItem(KEY, JSON.stringify(updated));
}

export async function deleteHistoryItem(id: string): Promise<void> {
  const history = await getHistory();
  await AsyncStorage.setItem(KEY, JSON.stringify(history.filter((item) => item.id !== id)));
}

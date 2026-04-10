import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { ClaimCard } from '@/components/ClaimCard';
import { deleteHistoryItem, getHistory, HistoryItem } from '@/services/history';

export default function HistoryScreen() {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      getHistory().then(setItems);
    }, [])
  );

  async function handleDelete(id: string) {
    await deleteHistoryItem(id);
    setItems((prev) => prev.filter((item) => item.id !== id));
  }

  if (items.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>No history yet. Share a YouTube video to get started.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {items.map((item) => (
        <View key={item.id} style={styles.card}>
          <TouchableOpacity
            style={styles.cardHeader}
            onPress={() => setExpanded(expanded === item.id ? null : item.id)}
            disabled={item.status === 'pending'}
          >
            <View style={styles.cardHeaderLeft}>
              {item.status === 'pending' && <ActivityIndicator size="small" color="#6b7280" style={styles.spinner} />}
              {item.status === 'done' && <Text style={styles.statusDot}>✓</Text>}
              {item.status === 'error' && <Text style={styles.statusDotError}>✕</Text>}
              <Text style={styles.url} numberOfLines={1}>{item.url}</Text>
            </View>
            <TouchableOpacity onPress={() => handleDelete(item.id)} hitSlop={8}>
              <Text style={styles.deleteBtn}>✕</Text>
            </TouchableOpacity>
          </TouchableOpacity>

          <Text style={styles.date}>{new Date(item.createdAt).toLocaleString()}</Text>

          {item.status === 'error' && (
            <Text style={styles.errorText}>{item.error}</Text>
          )}

          {item.status === 'done' && item.result && expanded === item.id && (
            <View style={styles.claims}>
              {item.result.claims.map((claim, i) => (
                <ClaimCard key={i} claim={claim} />
              ))}
            </View>
          )}

          {item.status === 'done' && item.result && expanded !== item.id && (
            <Text style={styles.tapHint}>
              {item.result.claims.length} claims — tap to expand
            </Text>
          )}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  content: { padding: 16, paddingBottom: 40 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  emptyText: { color: '#6b7280', fontSize: 14, textAlign: 'center' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardHeaderLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 8 },
  spinner: { marginRight: 8 },
  statusDot: { color: '#16a34a', fontWeight: '700', marginRight: 8 },
  statusDotError: { color: '#b91c1c', fontWeight: '700', marginRight: 8 },
  url: { fontSize: 13, color: '#111827', flex: 1 },
  date: { fontSize: 11, color: '#9ca3af', marginTop: 4, marginBottom: 4 },
  deleteBtn: { color: '#9ca3af', fontSize: 14 },
  errorText: { color: '#b91c1c', fontSize: 13, marginTop: 4 },
  claims: { marginTop: 10 },
  tapHint: { fontSize: 12, color: '#6b7280', marginTop: 4 },
});

import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { ClaimCard } from '@/components/ClaimCard';
import { factCheck, FactCheckResult } from '@/services/api';

export default function ResultsScreen() {
  const { url } = useLocalSearchParams<{ url: string }>();
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<FactCheckResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!url) return;
    factCheck(url)
      .then(setResult)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Unknown error'))
      .finally(() => setLoading(false));
  }, [url]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#1a1a2e" />
        <Text style={styles.loadingText}>Fetching transcript and analysing claims…</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </View>
    );
  }

  if (!result) return null;

  const counts = {
    True: result.claims.filter((c) => c.verdict === 'True').length,
    False: result.claims.filter((c) => c.verdict === 'False').length,
    Uncertain: result.claims.filter((c) => c.verdict === 'Uncertain').length,
    Opinion: result.claims.filter((c) => c.verdict === 'Opinion').length,
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.urlText} numberOfLines={1}>{url}</Text>
      <Text style={styles.summary}>
        {result.claims.length} claims · {counts.True} true · {counts.False} false · {counts.Uncertain} uncertain · {counts.Opinion} opinion
      </Text>
      {result.claims.map((claim, i) => (
        <ClaimCard key={i} claim={claim} />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  content: { padding: 16, paddingBottom: 40 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  loadingText: { marginTop: 16, fontSize: 14, color: '#6b7280', textAlign: 'center' },
  errorBox: { backgroundColor: '#fef2f2', borderRadius: 8, padding: 16 },
  errorText: { color: '#b91c1c', fontSize: 14 },
  urlText: { fontSize: 12, color: '#9ca3af', marginBottom: 8 },
  summary: { fontSize: 12, color: '#6b7280', marginBottom: 14 },
});

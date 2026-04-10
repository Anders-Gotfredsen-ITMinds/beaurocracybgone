import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { ClaimCard } from '@/components/ClaimCard';
import { factCheck, FactCheckResult } from '@/services/api';

export default function HomeScreen() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<FactCheckResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleFactCheck() {
    if (!url.trim()) return;
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      setResult(await factCheck(url.trim()));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  const counts = result
    ? {
        True: result.claims.filter((c) => c.verdict === 'True').length,
        False: result.claims.filter((c) => c.verdict === 'False').length,
        Uncertain: result.claims.filter((c) => c.verdict === 'Uncertain').length,
        Opinion: result.claims.filter((c) => c.verdict === 'Opinion').length,
      }
    : null;

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>🎥 Fact Checker</Text>
      <Text style={styles.subtitle}>
        Paste a YouTube URL, or share a video directly from Instagram or YouTube.
      </Text>

      <TextInput
        style={styles.input}
        placeholder="https://youtube.com/watch?v=..."
        placeholderTextColor="#9ca3af"
        value={url}
        onChangeText={setUrl}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="url"
      />

      <TouchableOpacity style={[styles.btn, loading && styles.btnDisabled]} onPress={handleFactCheck} disabled={loading}>
        {loading
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.btnText}>Fact Check</Text>
        }
      </TouchableOpacity>

      {error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {result && counts && (
        <>
          <Text style={styles.summary}>
            {result.claims.length} claims · {counts.True} true · {counts.False} false · {counts.Uncertain} uncertain · {counts.Opinion} opinion
          </Text>
          {result.claims.map((claim, i) => (
            <ClaimCard key={i} claim={claim} />
          ))}
        </>
      )}
    </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  content: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 22, fontWeight: '700', color: '#1a1a2e', marginBottom: 6 },
  subtitle: { fontSize: 14, color: '#6b7280', marginBottom: 20, lineHeight: 20 },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#111827',
    marginBottom: 12,
  },
  btn: {
    backgroundColor: '#1a1a2e',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: '#fff', fontWeight: '600', fontSize: 15 },
  errorBox: { backgroundColor: '#fef2f2', borderRadius: 8, padding: 14, marginBottom: 16 },
  errorText: { color: '#b91c1c', fontSize: 14 },
  summary: { fontSize: 12, color: '#6b7280', marginBottom: 12 },
});

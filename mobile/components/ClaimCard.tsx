import { StyleSheet, Text, View } from 'react-native';
import { Claim } from '@/services/api';

const VERDICT_STYLES: Record<Claim['verdict'], { label: string; color: string; bg: string }> = {
  True:      { label: 'True',      color: '#065f46', bg: '#d1fae5' },
  False:     { label: 'False',     color: '#991b1b', bg: '#fee2e2' },
  Uncertain: { label: 'Uncertain', color: '#92400e', bg: '#fef3c7' },
  Opinion:   { label: 'Opinion',   color: '#1e3a5f', bg: '#dbeafe' },
};

export function ClaimCard({ claim }: { claim: Claim }) {
  const v = VERDICT_STYLES[claim.verdict] ?? VERDICT_STYLES.Uncertain;
  return (
    <View style={styles.card}>
      <View style={styles.top}>
        <View style={[styles.badge, { backgroundColor: v.bg }]}>
          <Text style={[styles.badgeText, { color: v.color }]}>{v.label}</Text>
        </View>
        <Text style={styles.claimText}>{claim.claim}</Text>
      </View>
      <Text style={styles.explanation}>{claim.explanation}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  top: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 6,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    flexShrink: 0,
    marginTop: 2,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  claimText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
    color: '#111827',
  },
  explanation: {
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 19,
  },
});

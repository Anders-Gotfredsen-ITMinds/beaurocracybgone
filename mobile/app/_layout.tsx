import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { ShareIntentProvider, useShareIntent } from 'expo-share-intent';
import { factCheck } from '@/services/api';
import { addHistoryItem, updateHistoryItem } from '@/services/history';

function ShareIntentHandler() {
  const { hasShareIntent, shareIntent, resetShareIntent } = useShareIntent();

  useEffect(() => {
    if (hasShareIntent && shareIntent?.text) {
      const url = shareIntent.text.trim();
      resetShareIntent();
      addHistoryItem(url)
        .then((item) => {
          factCheck(url)
            .then((result) => updateHistoryItem(item.id, { status: 'done', result }))
            .catch((e: unknown) => {
              const msg = e instanceof Error ? e.message : 'Unknown error';
              updateHistoryItem(item.id, { status: 'error', error: msg });
            });
        })
        .catch((e: unknown) => console.error('Failed to save history item', e));
    }
  }, [hasShareIntent, shareIntent, resetShareIntent]);

  return null;
}

export default function RootLayout() {
  return (
    <ShareIntentProvider>
      <ShareIntentHandler />
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="results"
          options={{ title: 'Fact Check Results', headerBackTitle: 'Back' }}
        />
      </Stack>
    </ShareIntentProvider>
  );
}

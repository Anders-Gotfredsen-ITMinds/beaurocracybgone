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
      addHistoryItem(url).then((item) => {
        factCheck(url)
          .then((result) => updateHistoryItem(item.id, { status: 'done', result }))
          .catch((e) => updateHistoryItem(item.id, { status: 'error', error: e.message }));
      });
    }
  }, [hasShareIntent, shareIntent]);

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

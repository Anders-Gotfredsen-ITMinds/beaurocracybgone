import { useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';
import { ShareIntentProvider, useShareIntent } from 'expo-share-intent';

function ShareIntentHandler() {
  const router = useRouter();
  const { hasShareIntent, shareIntent, resetShareIntent } = useShareIntent();

  useEffect(() => {
    if (hasShareIntent && shareIntent?.text) {
      const url = shareIntent.text.trim();
      resetShareIntent();
      router.push({ pathname: '/results', params: { url } });
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

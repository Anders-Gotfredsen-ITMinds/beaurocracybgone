import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Claim {
  claim: string;
  verdict: 'True' | 'False' | 'Uncertain' | 'Opinion';
  explanation: string;
}

export interface FactCheckResult {
  claims: Claim[];
  model: string;
}

export async function getSettings(): Promise<{ apiUrl: string; apiKey: string }> {
  const [apiUrl, apiKey] = await AsyncStorage.multiGet(['apiUrl', 'apiKey']);
  return {
    apiUrl: apiUrl[1] ?? process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8000',
    apiKey: apiKey[1] ?? process.env.EXPO_PUBLIC_API_KEY ?? '',
  };
}

export async function saveSettings(apiUrl: string, apiKey: string): Promise<void> {
  await AsyncStorage.multiSet([['apiUrl', apiUrl], ['apiKey', apiKey]]);
}

export async function factCheck(url: string): Promise<FactCheckResult> {
  const { apiUrl, apiKey } = await getSettings();

  if (!apiKey) {
    throw new Error('No API key set. Go to Settings to configure.');
  }

  const response = await fetch(`${apiUrl}/api/v1/factcheck/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': apiKey,
    },
    body: JSON.stringify({ url }),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.detail ?? `Request failed (${response.status})`);
  }

  return response.json();
}

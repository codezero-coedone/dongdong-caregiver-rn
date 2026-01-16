import * as SecureStore from 'expo-secure-store';

export type AppLocale = 'ko' | 'en';

// Shared (Guardian uses STORAGE_KEYS.LANGUAGE). Keep the raw key stable.
const KEY = 'language';

export async function getAppLocale(): Promise<AppLocale> {
  try {
    const v = await SecureStore.getItemAsync(KEY);
    return v === 'en' ? 'en' : 'ko';
  } catch {
    return 'ko';
  }
}

export async function setAppLocale(locale: AppLocale): Promise<void> {
  try {
    await SecureStore.setItemAsync(KEY, locale);
  } catch {
    // ignore
  }
}


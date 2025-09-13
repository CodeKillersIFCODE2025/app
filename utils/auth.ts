// utils/auth.ts
import * as SecureStore from 'expo-secure-store';

const KEY = 'auth_basic';

export async function saveAuthBasic(basic: string) {
  await SecureStore.setItemAsync(KEY, basic);
}

export async function getAuthBasic(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(KEY);
  } catch {
    return null;
  }
}

export async function clearAuthBasic() {
  try {
    await SecureStore.deleteItemAsync(KEY);
  } catch {}
}

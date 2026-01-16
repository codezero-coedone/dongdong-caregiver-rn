import * as SecureStore from 'expo-secure-store';

const KEY_AUTO_ENROLLED = 'insurance_auto_enrolled_v1';

export async function getInsuranceAutoEnrolled(): Promise<boolean> {
  try {
    return (await SecureStore.getItemAsync(KEY_AUTO_ENROLLED)) === '1';
  } catch {
    return false;
  }
}

export async function setInsuranceAutoEnrolled(enrolled: boolean): Promise<void> {
  try {
    if (enrolled) {
      await SecureStore.setItemAsync(KEY_AUTO_ENROLLED, '1');
    } else {
      await SecureStore.deleteItemAsync(KEY_AUTO_ENROLLED);
    }
  } catch {
    // ignore
  }
}


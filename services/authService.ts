import { apiClient } from './apiClient';
import { saveTokens } from './tokenService';

type Provider = 'KAKAO' | 'APPLE';

function safeJson(value: unknown, maxLen: number = 2000): string {
  try {
    const s = JSON.stringify(value);
    if (!s) return '';
    return s.length > maxLen ? s.slice(0, maxLen) + '…' : s;
  } catch {
    return '';
  }
}

export async function loginWithSocial(params: {
  provider: Provider;
  accessToken: string;
  name?: string;
  email?: string;
}) {
  // Backend contract (SSOT): POST /api/v1/auth/social
  const res = await apiClient.post('/auth/social', params);

  const data = (res as any)?.data?.data;
  const access_token: string | undefined = data?.access_token;
  const refresh_token: string | undefined = data?.refresh_token;

  if (!access_token) {
    throw new Error(
      `[auth] /auth/social response missing data.access_token. payload=${safeJson(
        (res as any)?.data,
      )}`,
    );
  }

  await saveTokens({
    accessToken: access_token,
    refreshToken: refresh_token,
  });

  // Fail-safe: immediately attach token to axios defaults for subsequent calls in this session.
  // Prevents "auth/social 200 -> next call 401" loops caused by timing/cache issues.
  try {
    (apiClient as any).defaults = (apiClient as any).defaults || {};
    (apiClient as any).defaults.headers = (apiClient as any).defaults.headers || {};
    (apiClient as any).defaults.headers.common =
      (apiClient as any).defaults.headers.common || {};
    (apiClient as any).defaults.headers.common.Authorization = `Bearer ${access_token}`;
  } catch {
    // ignore
  }

  return data?.user;
}

/**
 * Request phone verification (SSOT: backend-driven)
 * - POST /api/v1/sms/verification/request
 * - DEV fallback (no SMS provider): backend returns code in message
 */
export const requestPhoneVerification = async (
  phoneNumber: string,
): Promise<{ success: boolean; message: string }> => {
  const digits = String(phoneNumber || '').replace(/\D/g, '');
  const res = await apiClient.post('/sms/verification/request', {
    phoneNumber: digits,
  });
  return {
    success: Boolean(res.data?.success),
    message: String(res.data?.message || '인증번호가 발송되었습니다.'),
  };
};

/**
 * Verify phone code (SSOT: backend-driven)
 * - POST /api/v1/sms/verification/verify
 */
export const verifyPhoneCode = async (
  phoneNumber: string,
  code: string,
): Promise<{ success: boolean; message: string }> => {
  const digits = String(phoneNumber || '').replace(/\D/g, '');
  const c = String(code || '').trim();
  const res = await apiClient.post('/sms/verification/verify', {
    phoneNumber: digits,
    code: c,
  });
  return {
    success: Boolean(res.data?.success),
    message: String(res.data?.message || (res.data?.success ? '인증이 완료되었습니다.' : '인증에 실패했습니다.')),
  };
};

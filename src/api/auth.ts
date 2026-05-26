import { apiRequest } from '../lib/apiClient';
import { getOrCreateDeviceId, saveTokens } from '../lib/tokenStorage';
import type { ApiResponse, BackofficeLoginResponse, BackofficeUser } from '../types/api';

export async function createBackofficeEmailSession(email: string, password: string) {
  const response = await apiRequest<ApiResponse<BackofficeLoginResponse>>(
    '/internal/v1/auth/backoffice/sessions/email',
    {
      method: 'POST',
      body: JSON.stringify({
        email,
        password,
        deviceId: getOrCreateDeviceId(),
      }),
    },
    {
      auth: false,
      retryOnUnauthorized: false,
    },
  );

  if (!response.data?.token?.accessToken || !response.data.token.refreshToken) {
    throw new Error(response.message || '로그인 응답에서 토큰을 찾을 수 없습니다.');
  }

  saveTokens(response.data.token);

  return response.data;
}

export async function fetchCurrentBackofficeUser() {
  const response = await apiRequest<ApiResponse<BackofficeUser>>('/internal/v1/users/backoffice/me');

  if (!response.data) {
    throw new Error(response.message || '사용자 정보를 불러올 수 없습니다.');
  }

  return response.data;
}

import { getApiBaseUrl } from '../config/env';
import { clearTokens, getStoredAccessToken, getStoredRefreshToken, saveTokens } from './tokenStorage';
import type { ApiResponse, TokenDto } from '../types/api';

export const unauthorizedEventName = 'certi-admin:unauthorized';

interface ApiRequestOptions {
  auth?: boolean;
  retryOnUnauthorized?: boolean;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly payload: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

let refreshPromise: Promise<boolean> | null = null;

export async function apiRequest<T>(
  path: string,
  init: RequestInit = {},
  options: ApiRequestOptions = {},
): Promise<T> {
  const auth = options.auth ?? true;
  const retryOnUnauthorized = options.retryOnUnauthorized ?? true;
  const response = await sendRequest(path, init, auth);

  if (response.status === 401 && auth && retryOnUnauthorized) {
    const refreshed = await refreshAccessToken();

    if (refreshed) {
      return apiRequest<T>(path, init, {
        auth,
        retryOnUnauthorized: false,
      });
    }

    clearTokens();
    window.dispatchEvent(new Event(unauthorizedEventName));
  }

  const payload = await parseResponseBody(response);

  if (!response.ok) {
    throw new ApiError(getErrorMessage(payload, response.statusText), response.status, payload);
  }

  return payload as T;
}

async function sendRequest(path: string, init: RequestInit, auth: boolean) {
  const headers = new Headers(init.headers);

  if (init.body && !(init.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json;charset=UTF-8');
  }

  if (auth) {
    const accessToken = getStoredAccessToken();

    if (accessToken) {
      headers.set('Authorization', `Bearer ${accessToken}`);
    }
  }

  return fetch(buildUrl(path), {
    ...init,
    headers,
  });
}

function buildUrl(path: string) {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${getApiBaseUrl()}${normalizedPath}`;
}

async function parseResponseBody(response: Response) {
  if (response.status === 204) {
    return undefined;
  }

  const text = await response.text();

  if (!text) {
    return undefined;
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

function getErrorMessage(payload: unknown, fallback: string) {
  if (payload && typeof payload === 'object' && 'message' in payload) {
    const message = (payload as { message?: unknown }).message;

    if (typeof message === 'string' && message.trim()) {
      return message;
    }
  }

  return fallback || '요청 처리 중 오류가 발생했습니다.';
}

async function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = requestTokenRefresh().finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
}

async function requestTokenRefresh() {
  const refreshToken = getStoredRefreshToken();

  if (!refreshToken) {
    return false;
  }

  try {
    const response = await apiRequest<ApiResponse<TokenDto>>(
      '/internal/v1/auth/refresh',
      {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
      },
      {
        auth: false,
        retryOnUnauthorized: false,
      },
    );

    if (!response.data?.accessToken || !response.data.refreshToken) {
      return false;
    }

    saveTokens(response.data);
    return true;
  } catch {
    return false;
  }
}

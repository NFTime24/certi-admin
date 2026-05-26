import type { TokenDto } from '../types/api';

const accessTokenKey = 'certi.admin.accessToken';
const refreshTokenKey = 'certi.admin.refreshToken';
const deviceIdKey = 'certi.admin.deviceId';

export function getStoredAccessToken() {
  return window.sessionStorage.getItem(accessTokenKey);
}

export function getStoredRefreshToken() {
  return window.sessionStorage.getItem(refreshTokenKey);
}

export function hasStoredTokens() {
  return Boolean(getStoredAccessToken() && getStoredRefreshToken());
}

export function saveTokens(token: TokenDto) {
  window.sessionStorage.setItem(accessTokenKey, token.accessToken);
  window.sessionStorage.setItem(refreshTokenKey, token.refreshToken);
}

export function clearTokens() {
  window.sessionStorage.removeItem(accessTokenKey);
  window.sessionStorage.removeItem(refreshTokenKey);
}

export function getOrCreateDeviceId() {
  const storedDeviceId = window.sessionStorage.getItem(deviceIdKey);

  if (storedDeviceId) {
    return storedDeviceId;
  }

  const deviceId =
    globalThis.crypto?.randomUUID?.() ??
    `device-${Date.now()}-${Math.random().toString(36).slice(2)}`;

  window.sessionStorage.setItem(deviceIdKey, deviceId);

  return deviceId;
}

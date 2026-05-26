export class ConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConfigurationError';
  }
}

const missingApiBaseUrlMessage =
  'VITE_API_BASE_URL 환경변수가 설정되어 있지 않습니다. .env 파일을 만들고 .env.example을 참고해 API 주소를 지정하세요.';

export function getApiBaseUrl() {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();

  if (!apiBaseUrl) {
    throw new ConfigurationError(missingApiBaseUrlMessage);
  }

  return apiBaseUrl.replace(/\/+$/, '');
}

export function getConfigurationError() {
  try {
    getApiBaseUrl();
    return null;
  } catch (error) {
    if (error instanceof Error) {
      return error.message;
    }

    return '환경변수 설정을 확인할 수 없습니다.';
  }
}

const hopByHopHeaders = new Set([
  'accept-encoding',
  'connection',
  'content-encoding',
  'content-length',
  'host',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailer',
  'transfer-encoding',
  'upgrade',
]);

const browserContextHeaders = new Set(['origin', 'referer', 'sec-fetch-dest', 'sec-fetch-mode', 'sec-fetch-site']);

export const config = {
  path: '/api/*',
};

export default async function apiProxy(request) {
  const apiBaseUrl = getApiBaseUrl();

  if (!apiBaseUrl) {
    return jsonResponse(
      {
        success: false,
        message: 'CERTI_API_BASE_URL 환경변수가 설정되어 있지 않습니다.',
      },
      500,
    );
  }

  const upstreamRequest = createUpstreamRequest(request, apiBaseUrl);
  const upstreamResponse = await fetch(upstreamRequest);

  return new Response(upstreamResponse.body, {
    status: upstreamResponse.status,
    statusText: upstreamResponse.statusText,
    headers: createResponseHeaders(upstreamResponse.headers),
  });
}

function getApiBaseUrl() {
  const netlifyEnv = globalThis.Netlify?.env?.get('CERTI_API_BASE_URL');
  const processEnv = globalThis.process?.env?.CERTI_API_BASE_URL;

  return (netlifyEnv || processEnv || '').replace(/\/+$/, '');
}

function createUpstreamRequest(request, apiBaseUrl) {
  const incomingUrl = new URL(request.url);
  const upstreamPath = incomingUrl.pathname.replace(/^\/api\/?/, '/');
  const upstreamUrl = new URL(`${apiBaseUrl}${upstreamPath}${incomingUrl.search}`);
  const headers = createRequestHeaders(request.headers);
  const hasBody = request.method !== 'GET' && request.method !== 'HEAD';

  return new Request(upstreamUrl, {
    method: request.method,
    headers,
    body: hasBody ? request.body : undefined,
    duplex: hasBody ? 'half' : undefined,
  });
}

function createRequestHeaders(headers) {
  const nextHeaders = new Headers();

  headers.forEach((value, key) => {
    const normalizedKey = key.toLowerCase();

    if (!hopByHopHeaders.has(normalizedKey) && !browserContextHeaders.has(normalizedKey)) {
      nextHeaders.set(key, value);
    }
  });

  return nextHeaders;
}

function createResponseHeaders(headers) {
  const nextHeaders = new Headers();

  headers.forEach((value, key) => {
    if (!hopByHopHeaders.has(key.toLowerCase())) {
      nextHeaders.set(key, value);
    }
  });

  nextHeaders.set('Cache-Control', 'no-store');

  return nextHeaders;
}

function jsonResponse(payload, status) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8',
      'Cache-Control': 'no-store',
    },
  });
}

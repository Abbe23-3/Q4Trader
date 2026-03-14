const LOCAL_QUANTLAB_API_BASE_URL = 'http://localhost:8000';

export function getQuantLabApiBaseUrl() {
  const configuredBaseUrl = process.env.NEXT_PUBLIC_QUANTLAB_API_BASE_URL?.trim();

  if (!configuredBaseUrl) {
    return LOCAL_QUANTLAB_API_BASE_URL;
  }

  return configuredBaseUrl.replace(/\/+$/, '');
}

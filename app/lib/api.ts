const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

type APIOptions = RequestInit & {
  params?: Record<string, string>;
};

async function api<T>(endpoint: string, options: APIOptions = {}): Promise<T> {
  const { params, ...customConfig } = options;
  const url = new URL(`${BASE_URL}${endpoint}`);

  if (params) {
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
  }

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...customConfig.headers,
  };

  const config: RequestInit = {
    ...customConfig,
    headers,
  };

  try {
    const response = await fetch(url.toString(), config);

    if (response.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
      throw new Error('Unauthorized');
    }

    if (!response.ok) {
      let message = 'API Error';
      try {
        const errorData = await response.json();
        message = errorData.message || message;
      } catch (e) {
        // If not JSON, try to get text
        const text = await response.text().catch(() => '');
        if (text) message = text;
      }
      throw new Error(message);
    }

    return await response.json() as T;
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
}

export default api;

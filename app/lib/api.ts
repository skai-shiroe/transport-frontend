const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

type APIOptions = RequestInit & {
  params?: Record<string, string>;
};

export class APIError extends Error {
  constructor(public message: string, public status: number) {
    super(message);
    this.name = 'APIError';
  }
}

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
      throw new APIError('Unauthorized', 401);
    }

    if (response.status === 403) {
      let message = 'Accès refusé : permissions insuffisantes';
      try {
        const errorData = await response.json();
        message = errorData.message || message;
      } catch (e) {
        // Fallback message
      }
      
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('permission-denied', { detail: message }));
      }
      throw new APIError(message, 403);
    }

    if (!response.ok) {
      let message = 'API Error';
      let status = response.status;
      try {
        const errorData = await response.json();
        message = errorData.message || message;
      } catch (e) {
        // If not JSON, try to get text
        const text = await response.text().catch(() => '');
        if (text) message = text;
      }
      throw new APIError(message, status);
    }

    return await response.json() as T;
  } catch (error: any) {
    if (error?.status === 403 || error?.status === 404) {
      // Don't log permission or not found errors to console as they are handled by UI/modals
    } else {
      console.error('API call failed:', error);
    }
    throw error;
  }
}

export default api;

// When running in the browser, always use relative '/api' unless a fully qualified remote URL is explicitly configured
export const API_BASE_URL =
  typeof window !== 'undefined'
    ? (process.env.NEXT_PUBLIC_API_URL && !process.env.NEXT_PUBLIC_API_URL.includes('localhost')
        ? process.env.NEXT_PUBLIC_API_URL
        : '/api')
    : (process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3001/api');

export const APP_DOMAIN =
  process.env.NEXT_PUBLIC_APP_DOMAIN ||
  (typeof window !== 'undefined' ? window.location.origin : 'https://dev.dlh.lumajangkab.go.id');


export function getAuthHeaders(): HeadersInit {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}



export async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
  
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options?.headers || {}),
  };

  const response = await fetch(url, { ...options, headers });
  
  if (!response.ok) {
    throw new Error(`API Error ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

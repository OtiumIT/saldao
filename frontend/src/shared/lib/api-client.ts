// URL da API - usa variável de ambiente ou fallback para produção
const API_URL = import.meta.env.VITE_API_URL || 'https://api.partnerfinancecontrol.com';

export interface ApiError {
  message: string;
  status?: number;
  errors?: Record<string, string[]>;
}

export class ApiClientError extends Error {
  status?: number;
  errors?: Record<string, string[]>;

  constructor(message: string, status?: number, errors?: Record<string, string[]>) {
    super(message);
    this.name = 'ApiClientError';
    this.status = status;
    this.errors = errors;
  }
}

async function parseResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get('content-type');
  
  if (!contentType || !contentType.includes('application/json')) {
    if (response.ok) {
      return {} as T;
    }
    throw new ApiClientError(response.statusText || 'Unknown error', response.status);
  }

  const data = await response.json();

  if (!response.ok) {
    // Handle 401/403 by triggering logout
    if (response.status === 401 || response.status === 403) {
      // Clear auth data
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
      
      // Redirect to login if not already there
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    
    const message = data.message || data.error || response.statusText || 'Unknown error';
    throw new ApiClientError(message, response.status, data.errors);
  }

  return data.data || data;
}

export const apiClient = {
  async get<T>(endpoint: string, token?: string): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'GET',
      headers,
    });

    return parseResponse<T>(response);
  },

  async post<T>(endpoint: string, data: unknown, token?: string): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const url = `${API_URL}${endpoint}`;
    const body = JSON.stringify(data);

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body,
    });

    return parseResponse<T>(response);
  },

  async put<T>(endpoint: string, data: unknown, token?: string): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
    });

    return parseResponse<T>(response);
  },

  async patch<T>(endpoint: string, data: unknown, token?: string): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(data),
    });

    return parseResponse<T>(response);
  },

  async delete(endpoint: string, token?: string): Promise<void> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'DELETE',
      headers,
    });

    if (!response.ok) {
      await parseResponse(response);
    }
  },
};

/**
 * Configuration Axios pour les appels API
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

// Fonction pour récupérer le token depuis le localStorage
const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

// Instance axios-like avec fetch
const api = {
  get: async (url: string, config?: RequestInit) => {
    const token = getAuthToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };

    // Merge with config headers if provided
    if (config?.headers) {
      Object.assign(headers, config.headers);
    }

    console.log('[axios.get] Request:', { url: `${API_BASE_URL}${url}`, hasToken: !!token });

    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'GET',
      headers,
      ...config,
    });

    console.log('[axios.get] Response:', { status: response.status, ok: response.ok });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Erreur réseau', message: `HTTP ${response.status}` }));
      console.error('[axios.get] Error response:', error);
      const err: any = new Error(error.error || error.message || `HTTP error! status: ${response.status}`);
      err.response = { data: error, status: response.status };
      throw err;
    }

    const data = await response.json();
    console.log('[axios.get] Success:', { dataKeys: Object.keys(data) });
    // Retourner dans le format { data: ... } pour correspondre à axios
    return { data };
  },

  post: async (url: string, data?: any, config?: RequestInit) => {
    const token = getAuthToken();
    
    // Check if data is FormData (for file uploads)
    const isFormData = data instanceof FormData;
    
    const headers: Record<string, string> = {
      ...(token && { Authorization: `Bearer ${token}` }),
    };
    
    // Only set Content-Type for non-FormData requests
    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }

    // Merge with config headers if provided
    if (config?.headers) {
      Object.assign(headers, config.headers);
    }

    console.log('[axios.post] Request:', { 
      url: `${API_BASE_URL}${url}`, 
      hasToken: !!token,
      isFormData 
    });

    try {
      const response = await fetch(`${API_BASE_URL}${url}`, {
        method: 'POST',
        headers,
        body: isFormData ? data : JSON.stringify(data),
        ...config,
      });

      console.log('[axios.post] Response:', { status: response.status, ok: response.ok });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ 
          error: 'Erreur réseau', 
          message: `HTTP ${response.status}` 
        }));
        console.error('[axios.post] Error response:', error);
        const err: any = new Error(error.error || error.message || `HTTP error! status: ${response.status}`);
        err.response = { data: error, status: response.status };
        throw err;
      }

      const responseData = await response.json();
      console.log('[axios.post] Success:', { dataKeys: Object.keys(responseData) });
      return { data: responseData };
    } catch (error) {
      console.error('[axios.post] Fetch failed:', error);
      
      // Better error message for network failures
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        const err: any = new Error(
          'Impossible de se connecter au serveur. Vérifiez que le backend est démarré sur http://localhost:3000'
        );
        err.response = { 
          data: { 
            error: 'Network Error',
            message: 'Backend server is not running or not accessible'
          }, 
          status: 0 
        };
        throw err;
      }
      
      throw error;
    }
  },

  put: async (url: string, data?: any, config?: RequestInit) => {
    const token = getAuthToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };

    // Merge with config headers if provided
    if (config?.headers) {
      Object.assign(headers, config.headers);
    }

    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
      ...config,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Erreur réseau', message: `HTTP ${response.status}` }));
      const err: any = new Error(error.error || error.message || `HTTP error! status: ${response.status}`);
      err.response = { data: error, status: response.status };
      throw err;
    }

    const responseData = await response.json();
    return { data: responseData };
  },

  delete: async (url: string, config?: RequestInit) => {
    const token = getAuthToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };

    // Merge with config headers if provided
    if (config?.headers) {
      Object.assign(headers, config.headers);
    }

    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'DELETE',
      headers,
      ...config,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Erreur réseau', message: `HTTP ${response.status}` }));
      const err: any = new Error(error.error || error.message || `HTTP error! status: ${response.status}`);
      err.response = { data: error, status: response.status };
      throw err;
    }

    const data = await response.json();
    return { data };
  },
};

export default api;

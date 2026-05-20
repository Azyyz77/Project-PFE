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

    const fullUrl = `${API_BASE_URL}${url}`;
    console.log('[axios.get] Request:', { url: fullUrl, hasToken: !!token });

    try {
      const response = await fetch(fullUrl, {
        method: 'GET',
        headers,
        ...config,
      });

      console.log('[axios.get] Response:', { status: response.status, ok: response.ok });

      if (!response.ok) {
        let errorData: any;
        try {
          errorData = await response.json();
        } catch {
          errorData = { 
            error: 'Réponse non-JSON', 
            message: `Le serveur a renvoyé un status ${response.status} mais le corps n'est pas du JSON valide (possible conflit de port ou page 404 HTML)`
          };
        }
        console.error('[axios.get] Error response:', errorData);
        const err: any = new Error(errorData.error || errorData.message || `HTTP error! status: ${response.status}`);
        err.response = { data: errorData, status: response.status };
        throw err;
      }

      const data = await response.json();
      console.log('[axios.get] Success:', { dataKeys: Object.keys(data) });
      return { data };
    } catch (error) {
      console.error('[axios.get] Fetch failed:', error);
      
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        const err: any = new Error(
          `Impossible de se connecter au serveur à ${API_BASE_URL}. Vérifiez que le backend est démarré.`
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

    const fullUrl = `${API_BASE_URL}${url}`;
    console.log('[axios.post] Request:', { 
      url: fullUrl, 
      hasToken: !!token,
      isFormData 
    });

    try {
      const response = await fetch(fullUrl, {
        method: 'POST',
        headers,
        body: isFormData ? data : JSON.stringify(data),
        ...config,
      });

      console.log('[axios.post] Response:', { status: response.status, ok: response.ok });

      if (!response.ok) {
        let errorData: any;
        try {
          errorData = await response.json();
        } catch {
          errorData = { 
            error: 'Réponse non-JSON', 
            message: `Le serveur a renvoyé un status ${response.status} mais le corps n'est pas du JSON valide (possible conflit de port ou page 404 HTML)`
          };
        }
        console.error('[axios.post] Error response:', errorData);
        const err: any = new Error(errorData.error || errorData.message || `HTTP error! status: ${response.status}`);
        err.response = { data: errorData, status: response.status };
        throw err;
      }

      const responseData = await response.json();
      console.log('[axios.post] Success:', { dataKeys: Object.keys(responseData) });
      return { data: responseData };
    } catch (error) {
      console.error('[axios.post] Fetch failed:', error);
      
      if (error instanceof TypeError && (error.message === 'Failed to fetch' || error.message.includes('fetch'))) {
        const err: any = new Error(
          `Impossible de se connecter au serveur à ${API_BASE_URL}. Vérifiez que le backend est démarré.`
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
    const isFormData = data instanceof FormData;
    const headers: Record<string, string> = {
      ...(token && { Authorization: `Bearer ${token}` }),
    };

    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }

    // Merge with config headers if provided
    if (config?.headers) {
      Object.assign(headers, config.headers);
    }

    const fullUrl = `${API_BASE_URL}${url}`;
    try {
      const response = await fetch(fullUrl, {
        method: 'PUT',
        headers,
        body: isFormData ? data : JSON.stringify(data),
        ...config,
      });

      if (!response.ok) {
        let errorData: any;
        try {
          errorData = await response.json();
        } catch {
          errorData = { 
            error: 'Réponse non-JSON', 
            message: `Le serveur a renvoyé un status ${response.status} mais le corps n'est pas du JSON valide`
          };
        }
        const err: any = new Error(errorData.error || errorData.message || `HTTP error! status: ${response.status}`);
        err.response = { data: errorData, status: response.status };
        throw err;
      }

      const responseData = await response.json();
      return { data: responseData };
    } catch (error) {
      console.error('[axios.put] Fetch failed:', error);
      throw error;
    }
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

    const fullUrl = `${API_BASE_URL}${url}`;
    try {
      const response = await fetch(fullUrl, {
        method: 'DELETE',
        headers,
        ...config,
      });

      if (!response.ok) {
        let errorData: any;
        try {
          errorData = await response.json();
        } catch {
          errorData = { 
            error: 'Réponse non-JSON', 
            message: `Le serveur a renvoyé un status ${response.status} mais le corps n'est pas du JSON valide`
          };
        }
        const err: any = new Error(errorData.error || errorData.message || `HTTP error! status: ${response.status}`);
        err.response = { data: errorData, status: response.status };
        throw err;
      }

      const data = await response.json();
      return { data };
    } catch (error) {
      console.error('[axios.delete] Fetch failed:', error);
      throw error;
    }
  },
};

export default api;

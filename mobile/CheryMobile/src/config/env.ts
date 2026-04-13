// Environment configuration
// Backend server is running on port 3000

export const ENV = {
  API_URL: __DEV__ 
    ? 'http://192.168.1.194:3000/api'  // Your computer's IP with backend port 3000
    : 'https://your-production-api.com/api',
  
  TIMEOUT: 10000,
};

// Helper to get the correct API URL
export const getApiUrl = () => {
  if (__DEV__) {
    return 'http://192.168.1.194:3000/api';  // Backend runs on port 3000
  }
  return ENV.API_URL;
};

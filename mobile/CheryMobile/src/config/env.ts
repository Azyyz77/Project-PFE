import Constants from 'expo-constants';

// Environment configuration
// Backend server is running on port 3000

const getDevApiUrl = () => {
  const hostUri = Constants.expoConfig?.hostUri || (Constants as any).manifest?.debuggerHost;
  const host = hostUri ? hostUri.split(':')[0] : null;
  return host ? `http://${host}:3000/api` : 'http://localhost:3000/api';
};

export const ENV = {
  API_URL: __DEV__ 
    ? getDevApiUrl()
    : 'https://your-production-api.com/api',
  
  TIMEOUT: 10000,
};

// Helper to get the correct API URL
export const getApiUrl = () => {
  if (__DEV__) {
    return ENV.API_URL;
  }
  return ENV.API_URL;
};

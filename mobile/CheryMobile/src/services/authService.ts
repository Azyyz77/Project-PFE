import api from '../config/api';
import * as SecureStore from 'expo-secure-store';
import { User } from '../types';

export const authService = {
  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    const response = await api.post('/users/login', { email, password });
    const { token, user } = response.data;
    
    await SecureStore.setItemAsync('authToken', token);
    await SecureStore.setItemAsync('user', JSON.stringify(user));
    
    return { user, token };
  },

  async register(userData: {
    nom: string;
    prenom: string;
    email: string;
    telephone: string;
    password: string;
  }): Promise<{ user: User; token: string }> {
    const response = await api.post('/users/register', userData);
    const { token, user } = response.data;
    
    await SecureStore.setItemAsync('authToken', token);
    await SecureStore.setItemAsync('user', JSON.stringify(user));
    
    return { user, token };
  },

  async logout(): Promise<void> {
    await SecureStore.deleteItemAsync('authToken');
    await SecureStore.deleteItemAsync('user');
  },

  async getCurrentUser(): Promise<User | null> {
    const userStr = await SecureStore.getItemAsync('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  async isAuthenticated(): Promise<boolean> {
    const token = await SecureStore.getItemAsync('authToken');
    return !!token;
  },
};

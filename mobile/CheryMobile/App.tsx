import React from 'react';
import { StatusBar } from 'react-native';
import { AuthProvider } from './src/context/AuthContext';
import { DataProvider } from './src/context/DataContext';
import { LanguageProvider } from './src/context/LanguageContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <DataProvider>
          <StatusBar barStyle="light-content" />
          <AppNavigator />
        </DataProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}

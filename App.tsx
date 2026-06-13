import React from 'react';
import AppNavigator from './navigation/AppNavigator';
import { ThemeProvider } from './hooks/ThemeContext';

export default function App() {
  return (
    <ThemeProvider>
      <AppNavigator />
    </ThemeProvider>
  );
}



import React from 'react';
import { GluestackUIProvider } from "@gluestack-ui/themed";
import { config } from "@gluestack-ui/config";
import LoginScreen from '@/screens/Auth';

export default function App() {
  return (
    <GluestackUIProvider config={config}>
      <LoginScreen />
    </GluestackUIProvider>
  );
}


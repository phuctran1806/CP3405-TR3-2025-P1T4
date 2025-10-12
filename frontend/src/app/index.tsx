import React from 'react';
import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import LoginScreen from '@/screens/Auth';

export default function App() {
  return (
    <GluestackUIProvider>
      <LoginScreen />
    </GluestackUIProvider>
  );
}


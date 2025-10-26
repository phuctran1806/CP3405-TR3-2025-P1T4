import React from "react";
import { SignupScreen } from "@/screens/Auth";
import { GluestackUIProvider } from "@gluestack-ui/themed";
import { config } from "@gluestack-ui/config";

export default function Index() {
  return (
    <GluestackUIProvider config={config}>
      <SignupScreen />
    </GluestackUIProvider>
  )
}

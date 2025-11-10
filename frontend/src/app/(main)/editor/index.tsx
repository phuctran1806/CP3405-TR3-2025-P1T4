import React from "react";
import EditorScreen from "@/screens/MapEditor";
import { GluestackUIProvider } from "@gluestack-ui/themed";
import { config } from "@gluestack-ui/config";

export default function Index() {
  return (
    <GluestackUIProvider config={config}>
      <EditorScreen />
    </GluestackUIProvider>
  )
}


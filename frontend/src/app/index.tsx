import React from 'react';
import SeatMap from "@/screens/Map";
import { Image } from "react-native";
import { GluestackUIProvider } from '@gluestack-ui/themed';
import { config } from '@gluestack-ui/config';


export default function App() {
  const location = {
    id: "library-3f",
    name: "Library - 3rd Floor",
    //image: <Image source={require("assets/floor3.png")} resizeMode="cover" style={{ width: "100%", height: "100%" }} />,
  };

  return (
    <GluestackUIProvider config={config}>
      <SeatMap location={location} />
    </GluestackUIProvider>
  )
}

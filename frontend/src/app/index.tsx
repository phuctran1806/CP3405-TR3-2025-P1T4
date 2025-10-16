//import React from "react";
//import LoginScreen from "@/screens/Auth";
import FloorMapScreen from "@/screens/Map";

//export default function Index() {
  //return <FloorMapScreen />;
//}

import React from 'react';
import { SafeAreaView, StatusBar } from 'react-native';

export default function App() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar barStyle="dark-content" />
      <FloorMapScreen />
    </SafeAreaView>
  );
}


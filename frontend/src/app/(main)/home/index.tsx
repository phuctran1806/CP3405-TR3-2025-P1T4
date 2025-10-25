import React from "react";
import HomeStudents from "@/screens/HomeStudents";
import HomeLecturers from "@/screens/HomeLecturers";
import { useLocalSearchParams } from "expo-router";
import HomeAdmin from "@/screens/HomeAdmin";

export default function Index() {
  const { role } = useLocalSearchParams();
  return role === 'student' ? <HomeStudents /> : role === 'lecturer' ? <HomeLecturers /> : <HomeAdmin />;
}

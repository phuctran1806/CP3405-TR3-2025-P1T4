import React from "react";
import DashboardStudents from "@/screens/DashboardStudents";
import { useLocalSearchParams } from "expo-router";
import DashboardLecturers from "@/screens/DashboardLecturers";

export default function Index() {
  const { role } = useLocalSearchParams();
  return role === 'student' ? <DashboardStudents /> : <DashboardLecturers />;
}

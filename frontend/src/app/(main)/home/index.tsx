import React, { useState, useEffect } from "react";
import HomeStudents from "@/screens/HomeStudents";
import HomeLecturers from "@/screens/HomeLecturers";
import HomeAdmin from "@/screens/HomeAdmin";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator, View } from "react-native";
import type { UserRole } from "@/api/types";

export default function Index() {
  const [role, setRole] = useState<UserRole>('guest');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRole = async () => {
      const storedRole = await AsyncStorage.getItem('user_role');
      setRole(storedRole as UserRole);
      setLoading(false);
    };

    loadRole();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return role === 'student' || role === 'guest' ? <HomeStudents /> : role === 'lecturer' ? <HomeLecturers /> : <HomeAdmin />;
}
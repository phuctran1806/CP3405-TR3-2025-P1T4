import { apiFetch } from "./fetcher";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { LecturerAssignmentResponse } from "./types/lecturer_assignment_types";

export async function fetchLecturerAssignments(): Promise<LecturerAssignmentResponse[]> {
  const token = await AsyncStorage.getItem("access_token");
  
  const res = await apiFetch(`/lecturer-assignments/my-assignments`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const text = await res.error.message;
    console.log("DEBUG: response error text =", text);
    throw new Error(`Failed to fetch rooms: ${text}`);
  }
  console.log("Fetched lecturer assignments:", res.data);
  return await res.data as LecturerAssignmentResponse[];
}


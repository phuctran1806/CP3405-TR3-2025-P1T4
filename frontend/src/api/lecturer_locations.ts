import { apiFetch } from "./fetcher";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { LecturerLocationResponse } from "./types/lecturer_location_types";

export async function fetchLecturerRooms(): Promise<LecturerLocationResponse[]> {
  const token = await AsyncStorage.getItem("access_token");
  console.log("DEBUG: access_token =", token);

  const res = await apiFetch(`/lecturer-locations/me`, {
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

  return await res.data as LecturerLocationResponse[];
}


import React, { useState, useEffect } from "react";
import {
  ScrollView,
  RefreshControl,
  Alert,
  View,
  ActivityIndicator,
} from "react-native";
import { Box, VStack, Text, Spinner } from "@gluestack-ui/themed";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import LocationCard from "@/components/cards/LocationCard";
import { calculateDistance, formatDistance } from "@/utils/calculateDistance";
import { getLocations } from "@/api/locations";
import type { LocationResponse } from "@/api/types/location_types";
import type { AccessibilityFeature } from "@/utils/accessibilityIcons";

interface LocationWithDistance {
  id: string;
  name: string;
  image_url?: string | null;
  distance: string;
  status: string;
  available_seats: number;
  total_capacity: number;
  accessibility: AccessibilityFeature[];
}

export default function HomeStudents() {
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locations, setLocations] = useState<LocationWithDistance[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => setMounted(true), []);

  const getUserLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "Location permission is required to show distances."
        );
        setLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to get your location.");
    }
  };

  const mapLocations = (backendLocations: LocationResponse[]): LocationWithDistance[] => {
    return backendLocations.map((loc) => {
      // Build accessibility array from backend flags
      const accessibility: AccessibilityFeature[] = [
        ...(loc.has_power_outlet ? ["power"] : []),
        ...(loc.has_ac ? ["cool"] : []),
        ...(loc.has_wifi ? ["wifi"] : []),
      ] as AccessibilityFeature[];

      const distance = userLocation
        ? calculateDistance(userLocation, {
          latitude: loc.latitude ?? 0,
          longitude: loc.longitude ?? 0,
        })
        : 0;

      return {
        id: loc.id,
        name: loc.name,
        image_url: loc.image_url,
        status: loc.status,
        available_seats: loc.available_seats,
        total_capacity: loc.total_capacity,
        distance: userLocation ? formatDistance(distance) : "Unknown",
        accessibility,
      };
    });
  };

  const fetchLocations = async () => {
    const res = await getLocations();
    if (res.ok) {
      setLocations(mapLocations(res.data));
    }
    setLoading(false);
  };

  useEffect(() => {
    (async () => {
      await getUserLocation();
      await fetchLocations();
    })();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await getUserLocation();
    await fetchLocations();
    setRefreshing(false);
  };

  const handleLocationPress = (locationId: string) => {
    router.push(`/dashboard/${locationId}`);
  };

  if (!mounted) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f9fafb" }}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  if (loading) {
    return (
      <Box flex={1} bg="$gray50" justifyContent="center" alignItems="center">
        <Spinner size="large" color="$blue500" />
        <Text mt="$4" color="$gray600">Loading locations...</Text>
      </Box>
    );
  }

  return (
    <Box flex={1} bg="$gray50">
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <Text fontSize="$xl" fontWeight="$bold" color="$black" mb="$4">
          Available Study Spaces
        </Text>

        <VStack space="md">
          {locations.length > 0 ? (
            locations.map((loc) => (
              <LocationCard
                key={loc.id}
                name={loc.name}
                // TODO: replace this with a fallback image
                image={loc.image_url ? { uri: `${loc.image_url}` } : { uri: "None" } }
                distance={loc.distance}
                accessibility={loc.accessibility}
                onPress={() => handleLocationPress(loc.id)}
              />
            ))
          ) : (
            <Text color="$gray600" textAlign="center">
              No locations available.
            </Text>
          )}
        </VStack>
      </ScrollView>
    </Box>
  );
}


import React, { useState, useEffect } from 'react';
import { ScrollView, RefreshControl, Alert, View, ActivityIndicator } from 'react-native';
import { Box, VStack, Text, Spinner } from '@gluestack-ui/themed';
import * as Location from 'expo-location';
import LocationCard from '@/components/LocationCard';
import { calculateDistance, formatDistance } from '@/utils/calculateDistance';
import { useRouter } from 'expo-router';
import { getLocations } from '@/api/locations';
import type { LocationResponse } from '@/api/locations';

interface LocationWithDistance {
  id: string;
  name: string;
  image_url?: string | null;
  distance: string;
  status: string;
  available_seats: number;
  total_capacity: number;
}

export default function HomeStudents() {
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locations, setLocations] = useState<LocationWithDistance[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const getUserLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Denied',
          'Location permission is required to show distances to study locations.'
        );
        setLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Error', 'Failed to get your location. Please try again.');
    }
  };

  const fetchLocations = async () => {
    const res = await getLocations();
    if (!res.ok) {
      Alert.alert('Error', res.error.message);
      return [];
    }
    return res.data;
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [locs] = await Promise.all([fetchLocations(), getUserLocation()]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch locations + user position initially
  useEffect(() => {
    (async () => {
      await getUserLocation();
      const res = await getLocations();
      if (res.ok) {
        const backendLocations = res.data;

        if (userLocation) {
          const withDistances = backendLocations.map((loc: LocationResponse) => {
            // If backend does not have coordinates, fallback gracefully
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
              distance: userLocation ? formatDistance(distance) : 'Unknown',
            };
          });

          setLocations(withDistances);
        } else {
          // No user location, still display data
          setLocations(
            backendLocations.map(loc => ({
              id: loc.id,
              name: loc.name,
              image_url: loc.image_url,
              status: loc.status,
              available_seats: loc.available_seats,
              total_capacity: loc.total_capacity,
              distance: 'Unknown',
            }))
          );
        }
      }
    })();
  }, [userLocation]);

  const onRefresh = async () => {
    setRefreshing(true);
    await getUserLocation();
    const res = await getLocations();
    if (res.ok) {
      const backendLocations = res.data;
      setLocations(
        backendLocations.map(loc => ({
          id: loc.id,
          name: loc.name,
          image_url: loc.image_url,
          status: loc.status,
          available_seats: loc.available_seats,
          total_capacity: loc.total_capacity,
          distance: 'Refreshing...',
        }))
      );
    }
    setRefreshing(false);
  };

  const handleLocationPress = (locationId: string) => {
    router.push(`/dashboard/${locationId}?role=student`);
  };

  if (!mounted) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f9fafb' }}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  if (loading) {
    return (
      <Box flex={1} bg="$gray50" justifyContent="center" alignItems="center">
        <Spinner size="large" color="$blue500" />
        <Text mt="$4" color="$gray600">
          Loading locations...
        </Text>
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
                image={
                  loc.image_url
                    // TODO: Map this to nginx server or add tunnel from backend
                    ? { uri: `http://localhost:8080${loc.image_url}` }
                    : { uri: undefined }
                }
                distance={loc.distance}
                // TODO: implement this later (accessibility feature)
                accessibility={[]}
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


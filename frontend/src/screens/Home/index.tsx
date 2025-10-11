import React, { useState, useEffect } from 'react';
import { ScrollView, RefreshControl, Alert } from 'react-native';
import { Box, VStack, Text, Spinner } from '@gluestack-ui/themed';
import * as Location from 'expo-location';
import Header from './Header';
import LocationCard from '../../components/LocationCard';
import { locations } from '../../utils/locationData';
import { calculateDistance, formatDistance } from '../../utils/calculateDistance';

interface LocationWithDistance {
  id: string;
  name: string;
  image: string;
  accessibility: ('power' | 'cool' | 'wifi' | 'quiet')[];
  distance: string;
}

export default function Home() {
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [locationsWithDistance, setLocationsWithDistance] = useState<LocationWithDistance[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userLocation) {
      const withDistances = locations.map((loc) => {
        const distance = calculateDistance(userLocation, loc.coordinates);
        return {
          id: loc.id,
          name: loc.name,
          image: loc.image,
          accessibility: loc.accessibility,
          distance: formatDistance(distance),
        };
      });
      setLocationsWithDistance(withDistances);
    }
  }, [userLocation]);

  useEffect(() => {
    getUserLocation();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await getUserLocation();
    setRefreshing(false);
  };

  const handleLocationPress = (locationName: string) => {
    Alert.alert('Location Selected', `You selected ${locationName}`);
  };

  if (loading) {
    return (
      <Box flex={1} bg="$gray50" justifyContent="center" alignItems="center">
        <Spinner size="large" color="$blue500" />
        <Text mt="$4" color="$gray600">
          Getting your location...
        </Text>
      </Box>
    );
  }

  return (
    <Box flex={1} bg="$gray50">
      <Header />
      
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Text fontSize="$xl" fontWeight="$bold" color="$black" mb="$4">
          Available Study Spaces
        </Text>

        <VStack space="md">
          {locationsWithDistance.length > 0 ? (
            locationsWithDistance.map((location) => (
              <LocationCard
                key={location.id}
                name={location.name}
                image={location.image}
                distance={location.distance}
                accessibility={location.accessibility}
                onPress={() => handleLocationPress(location.name)}
              />
            ))
          ) : (
            locations.map((location) => (
              <LocationCard
                key={location.id}
                name={location.name}
                image={location.image}
                distance="Location unavailable"
                accessibility={location.accessibility}
                onPress={() => handleLocationPress(location.name)}
              />
            ))
          )}
        </VStack>
      </ScrollView>
    </Box>
  );
}
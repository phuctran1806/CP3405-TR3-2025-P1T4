import React, { useState, useEffect } from 'react';
import { ScrollView, RefreshControl, View, ActivityIndicator, type ImageSourcePropType } from 'react-native';
import { Box, VStack, Text, Spinner } from '@gluestack-ui/themed';
import { locations } from '@/utils/mockData/locationDataLecturers';
import { useRouter } from 'expo-router';
import LocationCard from '@/components/cards/LocationCard';

interface VenueDisplay {
  id: string;
  code: string;
  name: string;
  image: ImageSourcePropType;
  subject: string;
  schedule: string;
  capacity: number;
  liveOccupancy?: number | null;
}

export default function HomeLecturers() {
  const [venues, setVenues] = useState<VenueDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchVenues = async () => {
    try {
      // Simulate fetching updated live occupancy
      setLoading(true);
      const refreshedVenues = locations.map((v) => ({
        ...v,
        // Randomize live occupancy again (simulate data refresh)
        liveOccupancy: v.liveOccupancy
      }));
      setVenues(refreshedVenues);
    } catch (err) {
      console.error('Error loading lecturer venues:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVenues();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchVenues();
    setRefreshing(false);
  };

  const handleVenuePress = (venueId: string) => {
    router.push(`/dashboard/${venueId}?role=lecturer`);
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
          Loading assigned lecture venues...
        </Text>
      </Box>
    );
  }

  return (
    <Box flex={1} bg="$gray50">
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Text fontSize="$xl" fontWeight="$bold" color="$black" mb="$4">
          My Lecture Venues
        </Text>

        <VStack space="md">
          {venues.map((venue) => (
            <LocationCard
              key={venue.id}
              name={venue.name}
              subject={venue.subject}
              image={venue.image}
              schedule={venue.schedule}
              accessibility={null}
              onPress={() => handleVenuePress(venue.id)}
            />
          ))}
        </VStack>
      </ScrollView>
    </Box>
  );
}

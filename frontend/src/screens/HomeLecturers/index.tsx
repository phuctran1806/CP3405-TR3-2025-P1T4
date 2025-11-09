import React, { useState, useEffect } from 'react';
import { ScrollView, RefreshControl, View, ActivityIndicator } from 'react-native';
import { Box, VStack, Text, Spinner } from '@gluestack-ui/themed';
import { useRouter } from 'expo-router';
import LocationCard from '@/components/cards/LocationCard';
import { fetchLecturerAssignments } from '@/api/lecturer_assignment';
import { getLocationById } from '@/api/locations';
import { useSelectedVenue, type VenueDisplay } from '@/contexts/useSelectedVenue';
import type { LecturerAssignmentResponse } from '@/api/types/lecturer_assignment_types';

export default function HomeLecturers() {
  const [venues, setVenues] = useState<VenueDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const { setSelectedVenue } = useSelectedVenue() as { setSelectedVenue: (venue: VenueDisplay) => void };

  useEffect(() => {
    setMounted(true);
    fetchVenues();
  }, []);

  const fetchVenues = async () => {
    try {
      setLoading(true);
      console.log('Fetching lecturer venues...');
      const lecturerAssignments = await fetchLecturerAssignments();
      const formattedVenues = await Promise.all(
        lecturerAssignments.map(async (assignment: LecturerAssignmentResponse) => {
          const res = await getLocationById(assignment.location_id);
          if (!res.ok) {
            console.warn(`Location not found for ID: ${assignment.location_id}`);
            return null;
          }
          const location = res.data;
          return {
            id: assignment.id,
            name: location.name ?? "Unknown Venue",
            image: location.image_url,
            subject: assignment.subject,
            schedule: {
              start_time: assignment.start_time,
              end_time: assignment.end_time,
            },
            capacity: location.total_capacity ?? 0,
            liveOccupancy: location.current_occupancy ?? 0,
          };
        })
      );

      setVenues(formattedVenues);
    } catch (err) {
      console.error('Error loading lecturer venues:', err);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchVenues();
    setRefreshing(false);
  };

  const handleVenuePress = (venue: VenueDisplay) => {
    setSelectedVenue(venue);
    router.push(`/dashboard/${venue.id}`);
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
              onPress={() => handleVenuePress(venue)}
            />
          ))}
        </VStack>
      </ScrollView>
    </Box>
  );
}

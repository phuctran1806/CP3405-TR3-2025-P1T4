import React, { useState, useEffect } from 'react';
import { ScrollView, ActivityIndicator, View } from 'react-native';
import { Box, Text } from '@gluestack-ui/themed';
import { useLocalSearchParams } from 'expo-router';
import { useSelectedVenue, type VenueDisplay } from '@/contexts/useSelectedVenue';
import { getLocationById } from '@/api/locations';
import { fetchLecturerAssignments } from '@/api/lecturer_assignment';
import type { LecturerAssignmentResponse } from '@/api/types/lecturer_assignment_types';
import Header from './components/Header';
import Statistics from './components/Statistics';
import { LectureRoomMap } from './components/LectureRoomMap';
import { resolveAssetUrl } from '@/utils/assetUrl';

export default function DashboardLecturer() {
  const { location: locationId } = useLocalSearchParams();
  const { selectedVenue, setSelectedVenue } = useSelectedVenue() as { 
    selectedVenue: VenueDisplay | null;
    setSelectedVenue: (venue: VenueDisplay) => void;
  };
  
  const [location, setLocation] = useState<VenueDisplay | null>(selectedVenue);
  const [view, setView] = useState<'statistics' | 'schedule'>('statistics');
  const [loading, setLoading] = useState(!selectedVenue);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If we already have the location from Zustand, use it
    if (selectedVenue) {
      setLocation(selectedVenue);
      setLoading(false);
      return;
    }

    // Otherwise, fetch it from the API using the URL parameter
    if (!locationId) {
      setError('No location ID provided');
      setLoading(false);
      return;
    }

    let active = true;

    async function loadLocation() {
      try {
        setLoading(true);
        setError(null);

        // Fetch lecturer assignments to get assignment details
        const assignments = await fetchLecturerAssignments();
        const assignment = assignments.find((a: LecturerAssignmentResponse) => a.id === locationId);

        if (!assignment) {
          throw new Error('Assignment not found');
        }

        // Fetch location details
        const result = await getLocationById(assignment.location_id);
        if (!active) return;

        if (!result.ok) throw result.error;

        const locationData = result.data;
        const venue: VenueDisplay = {
          id: assignment.id,
          name: locationData.name ?? "Unknown Venue",
          image: resolveAssetUrl(locationData.image_url),
          subject: assignment.subject,
          schedule: {
            start_time: assignment.start_time,
            end_time: assignment.end_time,
          },
          capacity: locationData.total_capacity ?? 0,
          liveOccupancy: locationData.current_occupancy ?? 0,
        };

        setLocation(venue);
        setSelectedVenue(venue); // Also update Zustand for navigation
      } catch (err: any) {
        console.error('Failed to fetch location:', err);
        if (active) setError(err.message || 'Failed to load location');
      } finally {
        if (active) setLoading(false);
      }
    }

    loadLocation();
    return () => {
      active = false;
    };
  }, [locationId, selectedVenue]);

  useEffect(() => setView('statistics'), [location]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f9fafb' }}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={{ marginTop: 10, color: '#666' }}>Loading location...</Text>
      </View>
    );
  }

  if (error || !location) {
    return (
      <Box flex={1} justifyContent="center" alignItems="center" bg="$gray50">
        <Text color="$red500" fontSize="$lg" mb="$2">
          {error || 'No location selected'}
        </Text>
        <Text color="$gray600" fontSize="$sm">
          Please go back and select a location
        </Text>
      </Box>
    );
  }

  const getOccupancyStatus = (percentage: number | null) => {
    if (percentage === null) return { label: 'Empty', color: '$gray500', bg: '$gray100' };
    if (percentage >= 80) return { label: 'High', color: '$red500', bg: '$red100' };
    if (percentage >= 50) return { label: 'Medium', color: '$amber500', bg: '$amber100' };
    return { label: 'Low', color: '$green500', bg: '$green100' };
  };

  const occupancyStatus = getOccupancyStatus(location.liveOccupancy ?? null);

  return (
    <Box flex={1} bg="$gray50">
      <Header location={location} occupancyStatus={occupancyStatus} view={view} setView={setView} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 40 }}
      >
        {view === 'statistics' ? (
          <Statistics location={location} />
        ) : (
          <LectureRoomMap
            capacity={location.capacity}
            liveOccupancy={location.liveOccupancy ?? null}
            columns={10}
          />
        )}
      </ScrollView>
    </Box>
  );
}

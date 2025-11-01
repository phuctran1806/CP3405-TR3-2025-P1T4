import React, { useState, useEffect } from 'react';
import { ScrollView, RefreshControl, View, ActivityIndicator, type ImageSourcePropType } from 'react-native';
import { Box, VStack, Text, Spinner } from '@gluestack-ui/themed';
import { useRouter } from 'expo-router';
import LocationCard from '@/components/cards/LocationCard';
import { fetchLecturerRooms } from '@/api/lecturer_locations';
import { useSelectedVenue, type VenueDisplay} from '@/contexts/useSelectedVenue';

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
      const rooms = await fetchLecturerRooms();

      const formattedVenues: VenueDisplay[] = rooms.map((room: any) => ({
        id: room.id,
        code: room.code,
        name: room.name,
        image: { uri: room.image_url || 'https://placehold.co/600x400?text=No+Image' },
        subject: room.subject,
        schedule: room.start_time && room.end_time
          ? `${new Date(room.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${new Date(room.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
          : 'No schedule',
        capacity: room.capacity,
        liveOccupancy: room.live_occupancy ?? null,
      }));

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
    setSelectedVenue(venue); // 👈 save venue in store
    router.push(`/dashboard/${venue.id}?role=lecturer`);
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
<<<<<<< HEAD
              onPress={() => handleVenuePress(venue.id)}
=======
              onPress={() => handleVenuePress(venue)} // 👈 pass the whole venue
>>>>>>> b804b009b4452cef94f424d792dd99d7e798c328
            />
          ))}
        </VStack>
      </ScrollView>
    </Box>
  );
}

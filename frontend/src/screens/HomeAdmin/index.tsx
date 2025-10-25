// HomeAdmin.tsx
import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  RefreshControl,
  View,
  ActivityIndicator,
} from 'react-native';
import {
  Box,
  VStack,
  HStack,
  Text,
  Spinner,
} from '@gluestack-ui/themed';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';

import { locations as studentLocations } from '@/utils/mockData/locationDataStudents';
import { locations as lecturerLocations } from '@/utils/mockData/locationDataLecturers';
import { calculateDistance, formatDistance } from '@/utils/calculateDistance';

import SummaryCard from './components/SummaryCard';
import LocationCardAdmin from '@/components/cards/LocationCardAdmin';
import DropDownMenu, {type TabType} from '@/components/DropDownMenu';

interface CombinedLocation {
  id: string;
  name: string;
  image: any;
  type: 'Student Space' | 'Lecture Room';
  distance: string;
  occupancy: string;
}

export default function HomeAdmin() {
  const [mounted, setMounted] = useState(false);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(
    null
  );
  const [combinedLocations, setCombinedLocations] = useState<CombinedLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('All Venues');

  const router = useRouter();

  useEffect(() => setMounted(true), []);

  const getUserLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getUserLocation();
  }, []);

  useEffect(() => {
    if (userLocation) {
      const studentData = studentLocations.map((loc) => ({
        id: loc.id,
        name: loc.name,
        image: loc.image,
        type: 'Student Space' as const,
        distance: formatDistance(calculateDistance(userLocation, loc.coordinates)),
        occupancy: `${loc.occupancyPercentage}`,
      }));

      const lecturerData = lecturerLocations.map((loc) => ({
        id: loc.id,
        name: loc.name,
        image: loc.image,
        type: 'Lecture Room' as const,
        distance: '-',
        occupancy: loc.liveOccupancy ? `${loc.liveOccupancy}` : '0',
      }));

      setCombinedLocations([...studentData, ...lecturerData]);
    }
  }, [userLocation]);

  const onRefresh = async () => {
    setRefreshing(true);
    await getUserLocation();
    setRefreshing(false);
  };

  const totalVenues = combinedLocations.length;
  const totalCapacity = lecturerLocations.reduce((sum, l) => sum + l.capacity, 0);
  const avgOccupancy =
    Math.round(
      studentLocations.reduce((sum, s) => sum + s.occupancyPercentage, 0) / studentLocations.length
    ) || 0;

  const pendingRequests = 3;

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
          Loading admin data...
        </Text>
      </Box>
    );
  }

  return (
    <Box flex={1} bg="$gray50">
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >

        {/* Dashboard summary cards */}
        <HStack space="md" flexWrap="wrap" justifyContent="space-between" mb="$4">
          <SummaryCard title="Total Venues" value={totalVenues.toString()} subtitle="Across campus" />
          <SummaryCard title="Total Capacity" value={totalCapacity.toString()} subtitle="Available seats" />
          <SummaryCard title="Current Occupancy" value={`${avgOccupancy}%`} subtitle="Avg. across venues" />
          <SummaryCard title="Pending Requests" value={pendingRequests.toString()} subtitle="Awaiting approval" />
        </HStack>

        <DropDownMenu activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Conditional rendering based on dropdown */}
        {activeTab === 'All Venues' && (
          <VStack mt="$4" space="md">
            {combinedLocations.map((loc) => (
              <LocationCardAdmin
                key={loc.id}
                name={loc.name}
                block={loc.type === 'Student Space' ? 'Student Study Area' : 'Academic Building'}
                status={Math.random() > 0.9 ? 'maintenance' : 'active'}
                current={parseInt(loc.occupancy) || 0}
                capacity={loc.type === 'Student Space' ? 120 : 80}
                onAnalytics={() => router.push(`/analytics/${loc.id}`)}
                onEdit={() => router.push(`/edit/${loc.id}`)}
              />
            ))}
          </VStack>
        )}

        {activeTab === 'Requests' && (
          <Box mt="$6" p="$4" borderRadius="$lg" bg="$white">
            <Text fontWeight="$bold" mb="$2">
              Booking Requests
            </Text>
            <Text color="$gray600">3 pending approval requests...</Text>
          </Box>
        )}

        {activeTab === 'Lecturers' && (
          <Box mt="$6" p="$4" borderRadius="$lg" bg="$white">
            <Text fontWeight="$bold" mb="$2">
              Lecturer Assignment
            </Text>
            <Text color="$gray600">Manage lecturer–venue allocations here.</Text>
          </Box>
        )}
      </ScrollView>
    </Box>
  );
}

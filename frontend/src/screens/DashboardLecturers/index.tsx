import React, { useState, useEffect } from 'react';
import { ScrollView } from 'react-native';
import { Box, Text } from '@gluestack-ui/themed';
import { useSelectedVenue, type VenueDisplay } from '@/contexts/useSelectedVenue';
import Header from './components/Header';
import Statistics from './components/Statistics';
import { LectureRoomMap } from './components/LectureRoomMap';

export default function DashboardLecturer() {
  const { selectedVenue: location } = useSelectedVenue() as { selectedVenue: VenueDisplay };
  const [view, setView] = useState<'statistics' | 'schedule'>('statistics');

  useEffect(() => setView('statistics'), [location]);

  if (!location) {
    return (
      <Box flex={1} justifyContent="center" alignItems="center" bg="$gray50">
        <Text color="$gray600">No location selected</Text>
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

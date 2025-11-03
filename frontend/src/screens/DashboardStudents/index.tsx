import React, { useState, useEffect } from 'react';
import { ScrollView } from 'react-native';
import { Box, Text } from '@gluestack-ui/themed';
import { useLocalSearchParams } from 'expo-router';
import { locations } from '@/utils/mockData/locationDataStudents';
import Header from './components/Header';
import SeatMap from '../../components/dashboard/SeatMap';
import Statistics from './components/Statistics';
import InteractiveMap from '@/components/map/InteractiveMap';

export default function LocationDashboard() {
  const { location: locationId } = useLocalSearchParams();
  const location = locations.find((loc) => loc.id === locationId);
  const [view, setView] = useState<'seatmap' | 'statistics'>('seatmap');
  useEffect(() => setView('seatmap'), [locationId]);

  if (!location) {
    return (
      <Box flex={1} justifyContent="center" alignItems="center" bg="$gray50">
        <Text color="$gray600">Location not found</Text>
      </Box>
    );
  }

  const getOccupancyStatus = (percentage: number) => {
    if (percentage >= 80) return { label: 'High', color: '$red500', bg: '$red100' };
    if (percentage >= 50) return { label: 'Medium', color: '$amber500', bg: '$amber100' };
    return { label: 'Low', color: '$green500', bg: '$green100' };
  };

  const occupancyPercentage = (location.occupancy / location.capacity) * 100;
  const occupancyStatus = getOccupancyStatus(occupancyPercentage);

  const chartConfig = {
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.7,
    propsForLabels: { fontSize: 11 },
    propsForBackgroundLines: {
      strokeWidth: 1,
      stroke: '#f3f4f6',
      strokeDasharray: '0',
    },
  };

  const pieData = [
    {
      name: 'Occupied',
      population: occupancyPercentage,
      color: '#ef4444',
      legendFontColor: '#374151',
      legendFontSize: 13,
    },
    {
      name: 'Available',
      population: 100 - occupancyPercentage,
      color: '#10b981',
      legendFontColor: '#374151',
      legendFontSize: 13,
    },
  ];

  const weeklyData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    datasets: [{ data: Object.values(location.averageOccupancy) }],
  };

  const lineData = {
    labels: location.lineChartData?.map((d) => d.time) || [],
    datasets: [
      {
        data: location.lineChartData?.map((d) => d.value) || [0],
        color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
        strokeWidth: 3,
      },
    ],
  };

  return (
    <Box flex={1} bg="$gray50">
      <Header location={location} occupancyStatus={occupancyStatus} view={view} setView={setView} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 40 }}
      >
        {view === 'seatmap' ? (
          <SeatMap location={location} map={<InteractiveMap />} />
        ) : (
          <Statistics
            location={location}
            pieData={pieData}
            weeklyData={weeklyData}
            lineData={lineData}
            chartConfig={chartConfig}
          />
        )}
      </ScrollView>
    </Box>
  );
}

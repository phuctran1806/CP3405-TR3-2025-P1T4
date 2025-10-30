import React, { useState, useEffect, useMemo } from 'react';
import { ScrollView } from 'react-native';
import { Box, Text } from '@gluestack-ui/themed';
import { useLocalSearchParams } from 'expo-router';

import Header from './components/Header';
import SeatMap from '@/components/dashboard/SeatMap';
import Statistics from './components/Statistics';
import InteractiveMap from '@/components/map/InteractiveMap';

import { getOccupancyHistory, type OccupancyHistory } from '@/api/history';
import { getLocationById, type LocationResponse } from '@/api/locations';

export default function LocationDashboard() {
  const { location: locationId } = useLocalSearchParams();

  const [view, setView] = useState<'seatmap' | 'statistics'>('seatmap');
  const [history, setHistory] = useState<OccupancyHistory[]>([]);
  const [location, setLocation] = useState<LocationResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --------------------------
  // Load location
  // --------------------------
  useEffect(() => {
    if (!locationId) return;

    let active = true;

    async function loadLocation() {
      try {
        setError(null);
        const result = await getLocationById(locationId as string);
        if (!active) return;

        if (!result.ok) throw result.error;
        setLocation(result.data);
      } catch (err: any) {
        console.error('Failed to fetch location:', err);
        if (active) setError('Failed to load location');
        setLocation(null);
      }
    }

    loadLocation();
    return () => {
      active = false;
    };
  }, [locationId]);

  // --------------------------
  // Load occupancy history
  // --------------------------
  useEffect(() => {
    if (!locationId) return;

    let active = true;

    async function loadOccupancy() {
      try {
        setLoading(true);
        setError(null);
        const result = await getOccupancyHistory(locationId as string);
        if (!active) return;

        if (result.ok) {
          setHistory(Array.isArray(result.data) ? result.data : []);
        } else {
          throw new Error(result.error.message || 'Failed to load occupancy data');
        }
      } catch (err) {
        if (!active) return;
        console.error('Failed to fetch occupancy history:', err);
        setError('Failed to load occupancy data');
        setHistory([]);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadOccupancy();
    return () => {
      active = false;
    };
  }, [locationId]);

  useEffect(() => setView('seatmap'), [locationId]);

  // --------------------------
  // Derived data
  // --------------------------

  const latest = useMemo(() => {
    if (!history.length) return null;
    return history.reduce(
      (a, b) =>
        new Date(a.timestamp).getTime() > new Date(b.timestamp).getTime() ? a : b,
      history[0]
    );
  }, [history]);

  const currentPercentage = latest?.occupancy_percentage ?? 0;

  const getOccupancyStatus = (percentage: number) => {
    if (percentage >= 80) return { label: 'High', color: '$red500', bg: '$red100' };
    if (percentage >= 50) return { label: 'Medium', color: '$amber500', bg: '$amber100' };
    return { label: 'Low', color: '$green500', bg: '$green100' };
  };

  const occupancyStatus = getOccupancyStatus(currentPercentage);

  // Weekly average occupancy
  const weeklyAverages = useMemo(() => {
    if (!history.length) return Array(7).fill(0);
    const totals = Array(7).fill(0);
    const counts = Array(7).fill(0);

    for (const rec of history) {
      totals[rec.day_of_week] += rec.occupancy_percentage;
      counts[rec.day_of_week] += 1;
    }

    return totals.map((t, i) => (counts[i] ? t / counts[i] : 0));
  }, [history]);

  const weeklyData = {
    labels: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    datasets: [{ data: weeklyAverages }],
  };

  // Hourly trend (line chart)
  const lineData = useMemo(() => {
    if (!history.length) return { labels: [], datasets: [{ data: [0] }] };
    const sorted = [...history].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
    const labels = sorted.map((d) => `${d.hour_of_day}:00`);
    const data = sorted.map((d) => d.occupancy_percentage);
    return {
      labels,
      datasets: [
        {
          data,
          color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
          strokeWidth: 3,
        },
      ],
    };
  }, [history]);

  // Pie chart data
  const pieData = useMemo(
    () => [
      {
        name: 'Occupied',
        population: currentPercentage,
        color: '#ef4444',
        legendFontColor: '#374151',
        legendFontSize: 13,
      },
      {
        name: 'Available',
        population: 100 - currentPercentage,
        color: '#10b981',
        legendFontColor: '#374151',
        legendFontSize: 13,
      },
    ],
    [currentPercentage]
  );

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

  // --------------------------
  // Conditional returns
  // --------------------------

  if (!locationId) {
    return (
      <Box flex={1} justifyContent="center" alignItems="center" bg="$gray50">
        <Text color="$gray600">No location selected</Text>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box flex={1} justifyContent="center" alignItems="center" bg="$gray50">
        <Text color="$gray600">Loading occupancy data...</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Box flex={1} justifyContent="center" alignItems="center" bg="$gray50">
        <Text color="$gray600">{error}</Text>
      </Box>
    );
  }

  if (!location) {
    return (
      <Box flex={1} justifyContent="center" alignItems="center" bg="$gray50">
        <Text color="$gray600">Location data unavailable</Text>
      </Box>
    );
  }

  if (!history.length) {
    return (
      <Box flex={1} justifyContent="center" alignItems="center" bg="$gray50">
        <Text color="$gray600">No occupancy data available</Text>
      </Box>
    );
  }

  // --------------------------
  // Main render
  // --------------------------

  return (
    <Box flex={1} bg="$gray50">
      <Header
        location={{
          id: locationId as string,
          name: location.name,
          occupancyPercentage: currentPercentage,
        }}
        occupancyStatus={occupancyStatus}
        view={view}
        setView={setView}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 40 }}
      >
        {view === 'seatmap' ? (
          <SeatMap
            location={{
              id: locationId as string,
              name: location.name,
              occupancyPercentage: currentPercentage,
              image: location.image_url,
            }}
            map={<InteractiveMap />}
          />
        ) : (
          <Statistics
            location={{
              id: locationId as string,
              name: location.name,
              occupancyPercentage: currentPercentage,
            }}
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

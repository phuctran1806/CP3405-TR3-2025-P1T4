import React, { useState, useEffect, useMemo } from 'react';
import { ScrollView } from 'react-native';
import { Box, Text, Button, HStack, Spinner } from '@gluestack-ui/themed';
import { useLocalSearchParams } from 'expo-router';

import Header from './components/Header';
import SeatMap from '@/components/dashboard/SeatMap';
import Statistics from './components/Statistics';
import InteractiveMap from '@/components/map/InteractiveMap';

import { getOccupancyHistory, type OccupancyHistory } from '@/api/history';
import { getLocationById } from '@/api/locations';
import type { LocationResponse } from '@/api/types/location_types';
import { getFloors, type FloorResponse } from '@/api/floors';
import { getDailyForecast, getWeeklyForecast } from '@/api/forecast';
import type { DailyForecastResponse, WeeklyForecastResponse } from '@/api/types/forecast_types';

export default function LocationDashboard() {
  const { location: locationId } = useLocalSearchParams();

  const [view, setView] = useState<'seatmap' | 'statistics'>('seatmap');
  const [history, setHistory] = useState<OccupancyHistory[]>([]);
  const [location, setLocation] = useState<LocationResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [floors, setFloors] = useState<FloorResponse[]>([]);
  const [selectedFloor, setSelectedFloor] = useState<FloorResponse | null>(null);
  const [loadingFloors, setLoadingFloors] = useState(true);

  // Forecast states
  const [dailyForecast, setDailyForecast] = useState<DailyForecastResponse | null>(null);
  const [weeklyForecast, setWeeklyForecast] = useState<WeeklyForecastResponse | null>(null);
  const [loadingForecast, setLoadingForecast] = useState(false);


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

  // Load floors whenever locationId changes
  useEffect(() => {
    if (!locationId) return;
    let active = true;

    async function loadFloors() {
      try {
        setLoadingFloors(true);
        const result = await getFloors({ location_id: locationId as string });
        if (!active) return;

        if (!result.ok) throw result.error;
        setFloors(result.data);
        if (result.data.length > 0)
          setSelectedFloor(result.data[0]); // default first floor
      } catch (err) {
        console.error('Failed to fetch floors:', err);
        if (active) setFloors([]);
      } finally {
        if (active) setLoadingFloors(false);
      }
    }

    loadFloors();
    return () => {
      active = false;
    };
  }, [locationId]);


  // --------------------------
  // Load forecast data
  // --------------------------
  useEffect(() => {
    if (!locationId) return;

    let active = true;

    async function loadForecast() {
      try {
        setLoadingForecast(true);

        const [dailyResult, weeklyResult] = await Promise.all([
          getDailyForecast({ location_id: locationId as string }),
          getWeeklyForecast({ location_id: locationId as string })
        ]);

        if (!active) return;

        if (dailyResult.ok) {
          setDailyForecast(dailyResult.data);
        } else {
          console.error('Failed to load daily forecast:', dailyResult.error);
        }

        if (weeklyResult.ok) {
          setWeeklyForecast(weeklyResult.data);
        } else {
          console.error('Failed to load weekly forecast:', weeklyResult.error);
        }

      } catch (err) {
        if (!active) return;
        console.error('Failed to fetch forecast data:', err);
      } finally {
        if (active) setLoadingForecast(false);
      }
    }

    loadForecast();
    return () => {
      active = false;
    };
  }, [locationId]);

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

  // Weekly line chart data (from forecast)
  const weeklyData = useMemo(() => {
    if (!weeklyForecast?.forecasts || weeklyForecast.forecasts.length === 0) {
      return {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [{ data: [0, 0, 0, 0, 0, 0, 0] }],
      };
    }

    const labels = weeklyForecast.forecasts.map(f => f.day_of_week.substring(0, 3));
    const data = weeklyForecast.forecasts.map(f => f.average_predicted_occupancy);

    return {
      labels,
      datasets: [{ data }],
    };
  }, [weeklyForecast]);

  const dailyData = useMemo(() => {
    if (!dailyForecast?.forecasts || dailyForecast.forecasts.length === 0) {
      return {
        labels: [''],
        datasets: [{ data: [0] }],
        meta: [],
      };
    }

    const now = new Date();
    const todayStr = now.toDateString();

    const timeLabels: string[] = [];
    const dateLabels: string[] = [];
    const data: number[] = [];

    dailyForecast.forecasts.forEach(f => {
      const dateObj = new Date(f.datetime);

      const hour = f.hour;
      const period = hour >= 12 ? "PM" : "AM";
      const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
      timeLabels.push(`${displayHour} ${period}`);

      let dateLabel = "";
      if (dateObj.toDateString() === todayStr) {
        dateLabel = "Today";
      } else {
        const day = dateObj.getDate().toString().padStart(2, "0");
        const month = (dateObj.getMonth() + 1).toString().padStart(2, "0");
        dateLabel = `${day}/${month}`;
      }
      dateLabels.push(dateLabel);

      data.push(f.predicted_occupancy);
    });

    return {
      labels: timeLabels, // chart-kit will display only time (top)
      datasets: [{ data }],
      meta: dateLabels,   // custom date labels (bottom)
    };
  }, [dailyForecast]);

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
          occupancyPercentage: currentPercentage,  // ← Use the same source as pie chart
          accessibility: [
            ...(location.has_power_outlet ? ['power'] : []),
            ...(location.has_ac ? ['cool'] : []),
            ...(location.is_quiet ? ['quiet'] : []),
          ] as AccessibilityFeature[],
        }}
        occupancyStatus={occupancyStatus}
        view={view}
        setView={setView}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 40 }}
      >
        {/* TODO: refactor this to be its own component */}
        {loadingFloors ? (
          <HStack justifyContent="center" alignItems="center" mb={4}>
            <Spinner size="small" mr={2} />
            <Text color="$gray600">Loading floors...</Text>
          </HStack>
        ) : floors.length > 0 ? (
          <HStack space="md" justifyContent="center" mb={4}>
            {floors.map((floor) => (
              <Button
                key={floor.id}
                size="sm"
                variant="solid"
                bg={selectedFloor?.id === floor.id ? '$blue500' : 'transparent'}
                onPress={() => setSelectedFloor(floor)}
              >
                <Text
                  color={selectedFloor?.id === floor.id ? '$white' : '$blue500'}
                  fontWeight={selectedFloor?.id === floor.id ? '600' : '500'}
                >
                  {floor.floor_name || `Floor ${floor.floor_number}`}
                </Text>
              </Button>
            ))}
          </HStack>
        ) : (
          <Text textAlign="center" color="$gray500" mb={4}>
            No floors available
          </Text>
        )}

        {view === 'seatmap' ? (
          <SeatMap
            location={{
              id: locationId as string,
              name: location.name,
              occupancyPercentage: currentPercentage,
              image: `/${location.image_url}`,
            }}
            map={
              selectedFloor ? (
                <InteractiveMap floor={selectedFloor} />
              ) : (
                <Text color="$gray500" textAlign="center" mt={4}>
                  Select a floor to view seat map
                </Text>
              )
            }
          />
        ) : (
          <Statistics
            pieData={pieData}
            weeklyData={weeklyData}
            dailyData={dailyData}
            loadingForecast={loadingForecast}
          />
        )}
      </ScrollView>
    </Box>
  );
}
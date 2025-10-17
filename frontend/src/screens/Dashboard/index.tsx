import React, { useState, useEffect } from 'react';
import { ScrollView, Image, Dimensions } from 'react-native';
import { Box, VStack, Text, HStack, Button, Badge, Icon } from '@gluestack-ui/themed';
import { useLocalSearchParams } from 'expo-router';
import { locations } from '@/utils/locationData';
import { accessibilityMapping } from '@/utils/accessibilityIcons';
import type { AccessibilityFeature } from '@/utils/accessibilityIcons';
import { PieChart, BarChart, LineChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

export default function LocationDashboard() {
  const { location: locationId } = useLocalSearchParams();
  const location = locations.find((loc) => loc.id === locationId);
  const [view, setView] = useState<'seatmap' | 'statistics'>('seatmap');

  useEffect(() => {
    setView('seatmap');
  }, [locationId]);

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

  const occupancyStatus = getOccupancyStatus(location.occupancyPercentage);

  const chartConfig = {
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.7,
    useShadowColorFromDataset: false,
    propsForLabels: { fontSize: 11 },
    propsForBackgroundLines: { strokeWidth: 1, stroke: '#f3f4f6', strokeDasharray: '0' },
  };

  const pieData = [
    { name: 'Occupied', population: location.occupancyPercentage, color: '#ef4444', legendFontColor: '#374151', legendFontSize: 13 },
    { name: 'Available', population: 100 - location.occupancyPercentage, color: '#10b981', legendFontColor: '#374151', legendFontSize: 13 },
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
      {/* Header */}
      <Header location={location} occupancyStatus={occupancyStatus} view={view} setView={setView} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 40 }}
      >
        {view === 'seatmap' ? <SeatMap location={location} /> : <Statistics location={location} pieData={pieData} weeklyData={weeklyData} lineData={lineData} chartConfig={chartConfig} />}
      </ScrollView>
    </Box>
  );
}

const Header = ({ location, occupancyStatus, view, setView }: any) => (
  <Box
    bg="$white"
    borderBottomLeftRadius="$2xl"
    borderBottomRightRadius="$2xl"
    shadowColor="#000"
    shadowOffset={{ width: 0, height: 2 }}
    shadowOpacity={0.1}
    shadowRadius={8}
    pb="$4"
  >
    <VStack px="$5" pt="$4" space="md">
      <HStack alignItems="flex-start" justifyContent="space-between">
        <VStack flex={1} mr="$3">
          <Text fontSize="$xl" fontWeight="$bold" color="$black" mb="$2">{location.name}</Text>
        </VStack>
        <VStack alignItems="flex-end">
          <Text fontSize="$xl" fontWeight="$bold" color="$blue600">{location.occupancyPercentage}% Occupied</Text>
          <Badge action="error" variant="solid" bg={occupancyStatus.bg} borderRadius="$full" px="$2.5" py="$0" mt="$1">
            <Text fontSize="$xs" fontWeight="$bold" color={occupancyStatus.color}>{occupancyStatus.label} Traffic</Text>
          </Badge>
        </VStack>
      </HStack>

      {/* Accessibility */}
      {location.accessibility.length > 0 && (
        <HStack space="xs" flexWrap="wrap">
          {location.accessibility.map((feature: string) => {
            const accessInfo = accessibilityMapping[feature as AccessibilityFeature];
            return (
              <HStack key={feature} space="xs" alignItems="center" bg="$gray100" px="$2.5" py="$0" borderRadius="$full" mb="$1">
                <Icon as={accessInfo.icon} size="xs" color={accessInfo.color} />
                <Text fontSize="$xs" color="$gray700" fontWeight="$medium">{accessInfo.label}</Text>
              </HStack>
            );
          })}
        </HStack>
      )}

      <SegmentedControl view={view} setView={setView} />
    </VStack>
  </Box>
);

const SegmentedControl = ({ view, setView }: any) => (
  <HStack bg="$gray100" borderRadius="$full" p="$1">
    {['seatmap', 'statistics'].map((v) => (
      <Button
        key={v}
        flex={1}
        variant="solid"
        bg={view === v ? '$blue500' : 'transparent'}
        onPress={() => setView(v as any)}
        borderRadius="$full"
        h={25}
        shadowColor={view === v ? '$blue500' : 'transparent'}
        shadowOffset={{ width: 0, height: 2 }}
        shadowOpacity={view === v ? 0.3 : 0}
        shadowRadius={4}
        py="$0"
      >
        <Text color={view === v ? '$white' : '$gray600'} fontWeight="$semibold" fontSize="$sm">{v === 'seatmap' ? 'Seat Map' : 'Statistics'}</Text>
      </Button>
    ))}
  </HStack>
);

const SeatMap = ({ location }: any) => (
  <VStack space="md">
    <Box bg="$white" borderRadius="$2xl" overflow="hidden" shadowColor="#000" shadowOffset={{ width: 0, height: 2 }} shadowOpacity={0.08} shadowRadius={8}>
      <Image source={location.image} style={{ width: '100%', height: 220 }} />
    </Box>

    <Box bg="$white" borderRadius="$2xl" shadowColor="#000" shadowOffset={{ width: 0, height: 2 }} shadowOpacity={0.08} shadowRadius={8} p="$5">
      <VStack space="md">
        <Text fontSize="$lg" fontWeight="$bold" color="$black">Interactive Seat Map</Text>
        <Box w="100%" h={320} bg="$gray100" borderRadius="$xl" borderWidth={2} borderColor="$gray200" borderStyle="dashed" justifyContent="center" alignItems="center">
          <VStack space="sm" alignItems="center">
            <Text fontSize="$4xl">🪑</Text>
            <Text color="$gray500" fontSize="$md" fontWeight="$medium">Seat Map Coming Soon</Text>
            <Text color="$gray400" fontSize="$sm" textAlign="center" px="$4">Tap individual seats to view availability and reserve</Text>
          </VStack>
        </Box>
      </VStack>
    </Box>
  </VStack>
);

const Statistics = ({ location, pieData, weeklyData, lineData, chartConfig }: any) => (
  <VStack space="md">
    {/* Pie Chart */}
    <Box bg="$white" borderRadius="$2xl" shadowColor="#000" shadowOffset={{ width: 0, height: 2 }} shadowOpacity={0.08} shadowRadius={8} p="$5">
      <VStack space="md">
        <Text fontSize="$lg" fontWeight="$bold" color="$black">Current Occupancy</Text>
        <Box alignItems="center">
          <PieChart
            data={pieData}
            width={screenWidth - 72}
            height={220}
            chartConfig={chartConfig}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
            hasLegend
          />
        </Box>
      </VStack>
    </Box>

    {/* Bar Chart */}
    <Box bg="$white" borderRadius="$2xl" shadowColor="#000" shadowOffset={{ width: 0, height: 2 }} shadowOpacity={0.08} shadowRadius={8} p="$5">
      <VStack space="md">
        <HStack alignItems="center" justifyContent="space-between">
          <Text fontSize="$lg" fontWeight="$bold" color="$black">Weekly Trends</Text>
          <Text fontSize="$sm" color="$gray500">Average</Text>
        </HStack>
        <BarChart data={weeklyData} width={screenWidth - 72} height={240} yAxisSuffix="%" yAxisLabel='' chartConfig={chartConfig} fromZero style={{ borderRadius: 16 }} />
      </VStack>
    </Box>

    {/* Line Chart */}
    {location.lineChartData?.length > 0 && (
      <Box bg="$white" borderRadius="$2xl" shadowColor="#000" shadowOffset={{ width: 0, height: 2 }} shadowOpacity={0.08} shadowRadius={8} p="$5">
        <VStack space="md">
          <HStack alignItems="center" justifyContent="space-between">
            <Text fontSize="$lg" fontWeight="$bold" color="$black">Occupancy Forecasting</Text>
            <Text fontSize="$sm" color="$gray500">Hourly</Text>
          </HStack>
          <LineChart
            data={lineData}
            width={screenWidth - 72}
            height={240}
            yAxisSuffix="%"
            chartConfig={{ ...chartConfig, fillShadowGradient: '#3b82f6', fillShadowGradientOpacity: 0.1 }}
            bezier
            style={{ borderRadius: 16 }}
          />
        </VStack>
      </Box>
    )}

    {/* Quick Stats */}
    <HStack space="sm">
      <StatBox label="PEAK TIME" value="2-4 PM" bg="$blue50" borderColor="$blue200" textColor="$blue700" />
      <StatBox label="BEST TIME" value="8-10 AM" bg="$green50" borderColor="$green200" textColor="$green700" />
    </HStack>
  </VStack>
);

const StatBox = ({ label, value, bg, borderColor, textColor }: any) => (
  <Box flex={1} bg={bg} borderRadius="$xl" p="$4" borderWidth={1} borderColor={borderColor}>
    <VStack space="xs">
      <Text fontSize="$xs" color={textColor} fontWeight="$semibold">{label}</Text>
      <Text fontSize="$xl" fontWeight="$bold" color={textColor}>{value}</Text>
    </VStack>
  </Box>
);

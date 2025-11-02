import React from 'react';
import { Box, VStack, Text } from '@gluestack-ui/themed';
import { PieChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';

const screenWidth = Dimensions.get('window').width;

const Statistics = ({ location }: any) => {
  const raw = location?.liveOccupancy;

  // Coerce to number and clamp to [0, 100]
  const parsed = typeof raw === 'string' ? Number(raw) : raw;
  const isNumber = typeof parsed === 'number' && Number.isFinite(parsed);
  const occupancy = isNumber ? Math.min(100, Math.max(0, parsed)) : null;

  console.log('Live Occupancy:', occupancy);

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

  const pieData =
    occupancy !== null
      ? [
          {
            name: 'Occupied',
            population: occupancy,
            color: '#ef4444',
            legendFontColor: '#374151',
            legendFontSize: 13,
          },
          {
            name: 'Available',
            population: 100 - occupancy,
            color: '#10b981',
            legendFontColor: '#374151',
            legendFontSize: 13,
          },
        ]
      : [];

  return (
    <VStack space="md">
      <Box
        bg="$white"
        borderRadius="$2xl"
        shadowColor="#000"
        shadowOffset={{ width: 0, height: 2 }}
        shadowOpacity={0.08}
        shadowRadius={8}
        p="$5"
      >
        <VStack space="lg">
          <Text fontSize="$lg" fontWeight="$bold" color="$black" mb="$2">
            Current Occupancy
          </Text>

          <Box alignItems="center">
            {occupancy !== null ? (
              <PieChart
                data={pieData}
                width={screenWidth - 64}
                height={220}
                chartConfig={chartConfig}
                accessor="population"
                backgroundColor="transparent"
                paddingLeft="20"
                center={[0, 0]}
                hasLegend={true}
                absolute={false}
              />
            ) : (
              <Text fontSize="$md" color="$gray600">
                No lecture scheduled at this time.
              </Text>
            )}
          </Box>
        </VStack>
      </Box>
    </VStack>
  );
};

export default Statistics;

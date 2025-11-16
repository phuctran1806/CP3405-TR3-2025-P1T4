import React from 'react';
import { VStack, Box, Text, HStack, Spinner } from '@gluestack-ui/themed';
import { Dimensions } from 'react-native';
import {
  PieChart as GiftedPieChart,
  LineChart as GiftedLineChart,
} from 'react-native-gifted-charts';

const screenWidth = Dimensions.get('window').width;

interface StatisticsProps {
  pieData: any[];
  weeklyData: {
    labels: string[];
    datasets: { data: number[] }[];
  };
  dailyData: {
    labels: string[];
    datasets: { data: number[] }[];
    meta: string[];
  };
  loadingForecast?: boolean;
}

const Statistics = ({
  pieData,
  weeklyData,
  dailyData,
  loadingForecast = false
}: StatisticsProps) => {

  // Convert data → GiftedCharts format
  const giftedPieData = pieData.map(slice => ({
    value: slice.population,
    color: slice.color,
    text: slice.name,
  }));

  return (
    <VStack space="md">

      {/* ------------------------- */}
      {/* PIE CHART */}
      {/* ------------------------- */}
      <Box
        bg="$white"
        borderRadius="$2xl"
        shadowColor="#000"
        shadowOffset={{ width: 0, height: 2 }}
        shadowOpacity={0.08}
        shadowRadius={8}
        p="$5"
      >
        <VStack space="md">
          <Text fontSize="$lg" fontWeight="$bold" color="$black">
            Current occupancy
          </Text>

          {/* --- PIE CHART --- */}
          <Box alignItems="center">
            <GiftedPieChart
              data={giftedPieData}
              showText={false}
              radius={100}
              textSize={13}
              textColor="#1f2937"
              strokeWidth={2}
              strokeColor="white"
            />
          </Box>

          {/* --- LEGENDS --- */}
          <VStack mt="$3" space="sm">
            {giftedPieData.map((slice, i) => (
              <HStack key={i} alignItems="center" space="md">

                {/* COLOR DOT */}
                <Box
                  w={12}
                  h={12}
                  borderRadius={6}
                  bg={slice.color}
                />

                {/* LABEL & PERCENTAGE */}
                <HStack justifyContent="space-between" flex={1}>
                  <Text fontSize="$sm" color="$gray700">
                    {slice.text}
                  </Text>

                  <Text fontSize="$sm" fontWeight="$bold" color="$black">
                    {Math.round(slice.value)}%
                  </Text>
                </HStack>

              </HStack>
            ))}
          </VStack>

        </VStack>
      </Box>

      {/* ------------------------- */}
      {/* WEEKLY FORECAST */}
      {/* ------------------------- */}
      <Box
        bg="$white"
        borderRadius="$2xl"
        shadowColor="#000"
        shadowOffset={{ width: 0, height: 2 }}
        shadowOpacity={0.08}
        shadowRadius={8}
        p="$5"
      >
        <VStack space="md">
          <HStack alignItems="center" justifyContent="space-between">
            <Text fontSize="$lg" fontWeight="$bold" color="$black">
              Weekly forecast (no. people)
            </Text>
          </HStack>

          <GiftedLineChart
            data={weeklyData.datasets[0].data.map((value, i) => ({
              value,
              label: weeklyData.labels[i],
            }))}
            curved
            height={240}
            width={screenWidth - 80}
            spacing={45}
            initialSpacing={20}
            thickness={3}
            color="#3b82f6"
            startFillColor="rgba(59,130,246,0.25)"
            endFillColor="rgba(59,130,246,0.05)"
            startOpacity={0.9}
            endOpacity={0.1}
            hideRules={false}
            rulesColor="#e5e7eb"
            dataPointsColor="#2563eb"
            dataPointsRadius={4}
            yAxisTextStyle={{ color: "#6b7280" }}
            xAxisLabelTextStyle={{ color: "#6b7280" }}
            yAxisThickness={0}
            xAxisThickness={0}
          />
        </VStack>
      </Box>


      {/* ------------------------- */}
      {/* DAILY FORECAST */}
      {/* ------------------------- */}
      <Box
        bg="$white"
        borderRadius="$2xl"
        shadowColor="#000"
        shadowOffset={{ width: 0, height: 2 }}
        shadowOpacity={0.08}
        shadowRadius={8}
        p="$5"
      >
        <VStack space="md">
          <HStack alignItems="center" justifyContent="space-between">
            <Text fontSize="$lg" fontWeight="$bold" color="$black">
              Daily forecast (no. people)
            </Text>
          </HStack>

          {loadingForecast ? (
            <Box height={260} justifyContent="center" alignItems="center">
              <Spinner size="large" />
              <Text color="$gray500" mt="$2">Loading forecast...</Text>
            </Box>
          ) : (
            <GiftedLineChart
              data={dailyData.datasets[0].data.map((value, i) => ({
                value,
                labelComponent: () => (
                  <VStack alignItems="center">
                    {/* TIME */}
                    <Text fontSize="$xs" color="$gray700" fontWeight="$500">
                      {dailyData.labels[i]}
                    </Text>

                    {/* DATE */}
                    <Text fontSize="$2xs" color="$gray500" mt={-2}>
                      {dailyData.meta[i]}
                    </Text>
                  </VStack>
                ),
              }))}

              curved
              height={240}
              width={screenWidth - 80}
              spacing={40}
              initialSpacing={20}

              thickness={3}
              color="#3b82f6"

              startFillColor="rgba(59,130,246,0.25)"
              endFillColor="rgba(59,130,246,0.05)"
              startOpacity={0.9}
              endOpacity={0.1}

              hideRules={false}
              rulesColor="#e5e7eb"

              dataPointsColor="#2563eb"
              dataPointsRadius={4}

              yAxisTextStyle={{ color: "#6b7280" }}
              xAxisLabelTextStyle={{ color: "#6b7280" }}

              yAxisThickness={0}
              xAxisThickness={0}
            />
          )}
        </VStack>
      </Box>
    </VStack>
  );
};

export default Statistics;

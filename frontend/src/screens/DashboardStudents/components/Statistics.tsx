import React from 'react';
import { VStack, Box, Text, HStack } from '@gluestack-ui/themed';
import { Dimensions } from 'react-native';
import { PieChart, BarChart, LineChart } from 'react-native-chart-kit';
import StatBox from './StatsBox';

const screenWidth = Dimensions.get('window').width;

const Statistics = ({ location, pieData, weeklyData, lineData, chartConfig }: any) => (
  <VStack space="md">
    {/* Pie Chart */}
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
          Current Occupancy
        </Text>
        <Box alignItems="center">
          <PieChart
            data={pieData}
            width={screenWidth - 72}
            height={220}
            chartConfig={chartConfig}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft={"20"}
            hasLegend
          />
        </Box>
      </VStack>
    </Box>

    {/* Bar Chart */}
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
            Weekly Trends
          </Text>
          <Text fontSize="$sm" color="$gray500">
            Average
          </Text>
        </HStack>
        <BarChart
          data={weeklyData}
          width={screenWidth - 72}
          height={240}
          yAxisSuffix="%"
          yAxisLabel=''
          chartConfig={chartConfig}
          fromZero
          style={{ borderRadius: 16 }}
        />
      </VStack>
    </Box>

    {/* Line Chart */}
    {location.lineChartData?.length > 0 && (
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
              Occupancy Forecasting
            </Text>
            <Text fontSize="$sm" color="$gray500">
              Hourly
            </Text>
          </HStack>
          <LineChart
            data={lineData}
            width={screenWidth - 70}
            height={240}
            yAxisSuffix="%"
            chartConfig={{
              ...chartConfig,
              fillShadowGradient: '#3b82f6',
              fillShadowGradientOpacity: 0.1,
            }}
            bezier
            style={{ borderRadius: 16 }}
          />
        </VStack>
      </Box>
    )}

    {/* Quick Stats */}
    <HStack space="sm">
      {/* TODO: remove this shit and add real backend */}
      <StatBox label="PEAK TIME" value="2-4 PM" bg="$blue50" borderColor="$blue200" textColor="$blue700" />
      <StatBox label="BEST TIME" value="8-10 AM" bg="$green50" borderColor="$green200" textColor="$green700" />
    </HStack>
  </VStack>
);

export default Statistics;

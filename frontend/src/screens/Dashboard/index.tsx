import React, { useState, useEffect } from 'react';
import { ScrollView, Image } from 'react-native';
import { Box, VStack, Text, HStack, Button } from '@gluestack-ui/themed';
import { useLocalSearchParams } from 'expo-router';
import { locations } from '@/utils/locationData';

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

  return (
    <Box flex={1} bg="$gray50">
      {/* Header */}
      <HStack
        alignItems="center"
        justifyContent="space-between"
        bg="$white"
        px="$5"
        py="$4"
        borderBottomWidth={1}
        borderBottomColor="$gray200"
        elevation={2}
      >
        <Text fontSize="$xl" fontWeight="$bold" color="$black">
          {location.name}
        </Text>
      </HStack>

      {/* Segmented Control */}
      <HStack
        bg="$white"
        px="$4"
        py="$1"
        borderBottomWidth={1}
        borderBottomColor="$gray200"
        justifyContent="center"
        borderRadius="$xl"
        mx="$4"
        mt="$3"
        shadowColor="#000"
        shadowOffset={{ width: 0, height: 1 }}
        shadowOpacity={0.05}
        shadowRadius={3}
      >
        <HStack
          bg="$gray100"
          borderRadius="$full"
          p="$1"
          py="$0.5"
          w="100%"
          justifyContent="space-between"
        >
          <Button
            flex={1}
            variant="solid"
            action={view === 'seatmap' ? 'primary' : 'secondary'}
            bg={view === 'seatmap' ? '$blue500' : 'transparent'}
            onPress={() => setView('seatmap')}
            borderRadius="$full"
          >
            <Text
              color={view === 'seatmap' ? '$white' : '$gray600'}
              fontWeight="$bold"
            >
              Seat Map
            </Text>
          </Button>

          <Button
            flex={1}
            variant="solid"
            action={view === 'statistics' ? 'primary' : 'secondary'}
            bg={view === 'statistics' ? '$blue500' : 'transparent'}
            onPress={() => setView('statistics')}
            borderRadius="$full"
          >
            <Text
              color={view === 'statistics' ? '$white' : '$gray600'}
              fontWeight="$bold"
            >
              Statistics
            </Text>
          </Button>
        </HStack>
      </HStack>

      {/* Main Content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 20 }}
      >
        {view === 'seatmap' ? (
          <VStack space="md">
            {/* Seat Map */}
            <Box
              bg="$white"
              borderRadius="$xl"
              shadowColor="#000"
              shadowOffset={{ width: 0, height: 1 }}
              shadowOpacity={0.08}
              shadowRadius={3}
              p="$3"
            >
              <Box
                w="100%"
                h={350}
                bg="$gray200"
                borderRadius="$lg"
                justifyContent="center"
                alignItems="center"
                mb="$3"
              >
                <Text color="$gray500" fontSize="$md">
                  [Seat Map Placeholder]
                </Text>
              </Box>
              <Text fontSize="$md" color="$gray600" textAlign="center">
                Tap a seat to view details or availability.
              </Text>
            </Box>
          </VStack>
        ) : (
          <VStack space="md">
            {/* Statistics */}
            <Box
              bg="$white"
              borderRadius="$xl"
              shadowColor="#000"
              shadowOffset={{ width: 0, height: 1 }}
              shadowOpacity={0.08}
              shadowRadius={3}
              p="$3"
            >
              <Image
                source={location.image}
                alt={location.name}
                style={{
                  width: '100%',
                  height: 180,
                  borderRadius: 12,
                  marginBottom: 12,
                }}
              />

              <Text fontSize="$md" color="$gray700" mb="$3">
                Accessibility: {location.accessibility.join(', ')}
              </Text>

              <VStack space="lg" mt="$2">
                {/* Occupancy Chart */}
                <Box>
                  <Text fontSize="$lg" fontWeight="$bold" color="$black" mb="$2">
                    Current Occupancy
                  </Text>
                  <Box
                    h={100}
                    bg="$gray200"
                    borderRadius="$lg"
                    justifyContent="center"
                    alignItems="center"
                  >
                    <Text color="$gray500">[Occupancy Pie Chart]</Text>
                  </Box>
                </Box>

                {/* Weekly Trend */}
                <Box>
                  <Text fontSize="$lg" fontWeight="$bold" color="$black" mb="$2">
                    Weekly Average (Mon–Sat)
                  </Text>
                  <Box
                    h={160}
                    bg="$gray200"
                    borderRadius="$lg"
                    justifyContent="center"
                    alignItems="center"
                  >
                    <Text color="$gray500">[Weekly Trend Chart]</Text>
                  </Box>
                </Box>

                {/* Heat Map */}
                <Box>
                  <Text fontSize="$lg" fontWeight="$bold" color="$black" mb="$2">
                    Heat Map
                  </Text>
                  <Box
                    h={200}
                    bg="$gray200"
                    borderRadius="$lg"
                    justifyContent="center"
                    alignItems="center"
                  >
                    <Text color="$gray500">[Heat Map Placeholder]</Text>
                  </Box>
                </Box>
              </VStack>
            </Box>
          </VStack>
        )}
      </ScrollView>
    </Box>
  );
}

import React, { useState, useEffect, useMemo } from "react";
import {
  ScrollView,
  RefreshControl,
  View,
  ActivityIndicator,
} from "react-native";
import {
  Box,
  VStack,
  HStack,
  Text,
  Spinner,
  Input,
  InputField,
  Pressable,
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetItem,
  ActionsheetDragIndicatorWrapper,
  ActionsheetDragIndicator,
} from "@gluestack-ui/themed";
import { useRouter } from "expo-router";
import LocationCard from "@/components/cards/LocationCard";
import { getLocations } from "@/api/locations";
import type { LocationResponse, LocationStatus } from "@/api/types/location_types";
import type { AccessibilityFeature } from "@/utils/accessibilityIcons";
import { Filter, Sparkles, Users } from "lucide-react-native";
import { getFloors } from "@/api/floors";
import { getAvailableSeats } from "@/api/seats";
import type { SeatResponse } from "@/api/seats";

interface Location {
  id: string;
  name: string;
  image_url?: string | null;
  status: string;
  available_seats: number;
  total_capacity: number;
  accessibility: AccessibilityFeature[];
}

export default function HomeStudents() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [seatsByLocation, setSeatsByLocation] = useState<Map<string, SeatResponse[]>>(new Map());

  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<AccessibilityFeature[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [groupSize, setGroupSize] = useState<number | null>(1);

  const router = useRouter();

  useEffect(() => setMounted(true), []);

  const mapLocations = (backendLocations: LocationResponse[]): Location[] => {
    return backendLocations.map((loc) => {
      const accessibility: AccessibilityFeature[] = [
        ...(loc.has_power_outlet ? (["power"] as AccessibilityFeature[]) : []),
        ...(loc.has_ac ? (["cool"] as AccessibilityFeature[]) : []),
        ...(loc.is_quiet ? (["quiet"] as AccessibilityFeature[]) : []),
      ];

      return {
        id: loc.id,
        name: loc.name,
        image_url: loc.image_url,
        status: loc.status,
        available_seats: loc.available_seats,
        total_capacity: loc.total_capacity,
        accessibility,
      };
    });
  };

  const fetchSeatsForLocation = async (locationId: string): Promise<SeatResponse[]> => {
    try {
      const floorsRes = await getFloors({ location_id: locationId });
      if (!floorsRes.ok || !floorsRes.data) {
        return [];
      }

      const allSeats: SeatResponse[] = [];
      for (const floor of floorsRes.data) {
        const seatsRes = await getAvailableSeats({ floor_id: floor.id });
        if (seatsRes.ok && seatsRes.data) {
          allSeats.push(...seatsRes.data);
        }
      }
      return allSeats;
    } catch (error) {
      console.error(`Error fetching seats for location ${locationId}:`, error);
      return [];
    }
  };

  const fetchLocations = async () => {
    const res = await getLocations();
    if (res.ok) {
      const mappedLocations = mapLocations(res.data);
      setLocations(mappedLocations);

      // Fetch seats for all locations
      const seatsMap = new Map<string, SeatResponse[]>();
      await Promise.all(
        mappedLocations.map(async (loc) => {
          const seats = await fetchSeatsForLocation(loc.id);
          seatsMap.set(loc.id, seats);
        })
      );
      setSeatsByLocation(seatsMap);
    }
    setLoading(false);
  };

  useEffect(() => {
    (async () => {
      await fetchLocations();
    })();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchLocations();
    setRefreshing(false);
  };

  const handleLocationPress = (locationId: string) => {
    router.push(`/dashboard/${locationId}`);
  };

  const maxCapacity = useMemo(() => {
    if (!locations.length) {
      return 20;
    }
    return locations.reduce((max, loc) => {
      const capacity = typeof loc.total_capacity === "number" ? loc.total_capacity : 0;
      return capacity > max ? capacity : max;
    }, 0);
  }, [locations]);

  useEffect(() => {
    if (groupSize && maxCapacity > 0 && groupSize > maxCapacity) {
      setGroupSize(maxCapacity);
    }
  }, [groupSize, maxCapacity]);

  const handleGroupSizeInput = (value: string) => {
    const numeric = value.replace(/[^0-9]/g, "");
    if (!numeric) {
      setGroupSize(null);
      return;
    }
    const parsed = parseInt(numeric, 10);
    if (Number.isNaN(parsed)) {
      setGroupSize(null);
      return;
    }
    const limit = maxCapacity > 0 ? maxCapacity : parsed;
    const clamped = Math.max(1, Math.min(limit, parsed));
    setGroupSize(clamped);
  };

  const incrementGroupSize = () => {
    setGroupSize((prev) => {
      const base = prev && prev > 0 ? prev : 0;
      const next = base + 1;
      const limit = maxCapacity > 0 ? maxCapacity : next;
      return Math.min(limit, next);
    });
  };

  const decrementGroupSize = () => {
    setGroupSize((prev) => {
      if (!prev || prev <= 1) {
        return 1;
      }
      return prev - 1;
    });
  };

  const getMaxTableCapacity = (locationId: string): number | null => {
    const locationSeats = seatsByLocation.get(locationId) || [];
    
    // Filter out seats with null/undefined table_number
    const seatsWithTable = locationSeats.filter(
      (seat) => seat.table_number !== null && seat.table_number !== undefined
    );
    
    if (seatsWithTable.length === 0) {
      return null;
    }
    
    // Group seats by table_number and count available seats per table
    const seatsByTable = new Map<number, number>();
    for (const seat of seatsWithTable) {
      const tableNum = seat.table_number!;
      seatsByTable.set(tableNum, (seatsByTable.get(tableNum) || 0) + 1);
    }
    
    // Find the maximum count
    const counts = Array.from(seatsByTable.values());
    return counts.length > 0 ? Math.max(...counts) : null;
  };

  const filteredLocations = locations.filter((loc) => {
    const matchesSearch = loc.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilters =
      filters.length === 0 || filters.every((f) => loc.accessibility.includes(f));
    
    // Table-based group size filtering
    let matchesGroupSize = true;
    if (groupSize && groupSize > 1) {
      const locationSeats = seatsByLocation.get(loc.id) || [];
      
      // Filter out seats with null/undefined table_number
      const seatsWithTable = locationSeats.filter(
        (seat) => seat.table_number !== null && seat.table_number !== undefined
      );
      
      if (seatsWithTable.length === 0) {
        // No seats with table numbers - if we have no seat data, show the location
        // Otherwise, hide it since groups need tables
        matchesGroupSize = locationSeats.length === 0;
      } else {
        // Group seats by table_number and count available seats per table
        const seatsByTable = new Map<number, number>();
        for (const seat of seatsWithTable) {
          const tableNum = seat.table_number!;
          seatsByTable.set(tableNum, (seatsByTable.get(tableNum) || 0) + 1);
        }
        
        // Check if any table has enough seats for the group
        matchesGroupSize = Array.from(seatsByTable.values()).some(
          (count) => count >= groupSize
        );
      }
    }

    return matchesSearch && matchesFilters && matchesGroupSize;
  });

  const displayMaxCapacity = maxCapacity > 0 ? maxCapacity : 1;

  if (!mounted) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f9fafb" }}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  if (loading) {
    return (
      <Box flex={1} bg="$gray50" justifyContent="center" alignItems="center">
        <Spinner size="large" color="$blue500" />
        <Text mt="$4" color="$gray600">Loading locations...</Text>
      </Box>
    );
  }

  return (
    <Box flex={1} bg="$gray50">
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* TODO: Replace this with real data fetched from backend in the next PR */}
        {/* AI Recommendation Section */}
        <Box
          mb="$4"
          p="$4"
          bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
          borderRadius="$lg"
          style={{
            backgroundColor: "#667eea",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
          }}
        >
          <Box flexDirection="row" alignItems="center" mb="$2">
            <Sparkles size={20} color="#fbbf24" />
            <Text ml="$2" fontSize="$md" fontWeight="$bold" color="white">
              AI Recommendation
            </Text>
          </Box>
          <Text fontSize="$sm" color="white" opacity={0.95} mb="$3">
            Based on your study patterns and preferences, we recommend the Library
            for your next study session. It has quiet zones with power outlets and is typically 
            less crowded at this time.
          </Text>
        </Box>

        {/* Search + Filter Row */}
        <Box mb="$4">
          <HStack alignItems="center" justifyContent="space-between" space="md">
            <Box flex={1}>
              <Input>
                <InputField
                  placeholder="Search location..."
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
              </Input>
            </Box>

            <Pressable
              onPress={() => setIsFilterOpen(true)}
              style={{
                backgroundColor: "#3b82f6",
                paddingVertical: 10,
                paddingHorizontal: 14,
                borderRadius: 8,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Filter size={18} color="#fff" />
            </Pressable>
          </HStack>

          <Box mt="$4">
            <HStack alignItems="center" space="sm" mb="$2">
              <Users size={18} color="#3b82f6" />
              <Text fontWeight="$semibold" color="$gray700">
                Group size
              </Text>
            </HStack>
            <HStack alignItems="center" space="sm">
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Decrease group size"
                onPress={decrementGroupSize}
                style={{
                  backgroundColor: groupSize && groupSize > 1 ? "#dbeafe" : "#e2e8f0",
                  paddingVertical: 12,
                  paddingHorizontal: 16,
                  borderRadius: 8,
                }}
              >
                <Text fontSize="$lg" fontWeight="bold" color="#1f2937">
                  -
                </Text>
              </Pressable>

              <Box flex={1}>
                <Input>
                  <InputField
                    placeholder="Enter group size"
                    value={groupSize ? groupSize.toString() : ""}
                    onChangeText={handleGroupSizeInput}
                    keyboardType="number-pad"
                    returnKeyType="done"
                  />
                </Input>
              </Box>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Increase group size"
                onPress={incrementGroupSize}
                style={{
                  backgroundColor: "#3b82f6",
                  paddingVertical: 12,
                  paddingHorizontal: 16,
                  borderRadius: 8,
                }}
              >
                <Text fontSize="$lg" fontWeight="bold" color="#fff">
                  +
                </Text>
              </Pressable>
            </HStack>
            <Text fontSize="$xs" color="$gray500" mt="$2">
              Filter study spaces that can accommodate your group (max {displayMaxCapacity} seats).
            </Text>
          </Box>
        </Box>

        <Text fontSize="$xl" fontWeight="$bold" color="$black" mb="$4">
          Available Study Spaces
        </Text>

        <VStack space="md">
          {filteredLocations.length > 0 ? (
            filteredLocations.map((loc) => {
              const maxTableCapacity = getMaxTableCapacity(loc.id);
              return (
                <LocationCard
                  key={loc.id}
                  name={loc.name}
                  image={loc.image_url ? { uri: `${loc.image_url}` } : { uri: "None" }}
                  accessibility={loc.accessibility}
                  status={loc.status as LocationStatus}
                  maxTableCapacity={maxTableCapacity}
                  onPress={() => handleLocationPress(loc.id)}
                />
              );
            })
          ) : (
            <Text color="$gray600" textAlign="center">
              No study spaces can accommodate your group size right now. Try adjusting your filters.
            </Text>
          )}
        </VStack>
      </ScrollView>

      {/* Filter Menu */}
      <Actionsheet isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)}>
        <ActionsheetBackdrop />
        <ActionsheetContent px="$4" pb="$6">
          <ActionsheetDragIndicatorWrapper>
            <ActionsheetDragIndicator />
          </ActionsheetDragIndicatorWrapper>

          <Text fontWeight="$bold" fontSize="$lg" mb="$3">
            Filter by Accessibility
          </Text>

          {/* Filter chips inside the sheet */}
          <Box flexDirection="row" flexWrap="wrap" mb="$4">
            {[
              { key: "power", label: "Power plugs" },
              { key: "cool", label: "Air-conditioned" },
              { key: "quiet", label: "Quiet area" },
            ].map(({ key, label }) => {
              const isSelected = filters.includes(key as AccessibilityFeature);

              return (
                <Pressable
                  key={key}
                  onPress={() =>
                    setFilters((prev) =>
                      prev.includes(key as AccessibilityFeature)
                        ? prev.filter((f) => f !== key)
                        : [...prev, key as AccessibilityFeature]
                    )
                  }
                  style={{
                    paddingVertical: 8,
                    paddingHorizontal: 14,
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: isSelected ? "#3b82f6" : "#cbd5e1",
                    backgroundColor: isSelected ? "#dbeafe" : "white",
                    marginRight: 10,
                    marginBottom: 10,
                  }}
                >
                  <Text
                    style={{
                      color: isSelected ? "#1d4ed8" : "#475569",
                      fontWeight: isSelected ? "600" : "400",
                    }}
                  >
                    {label}
                  </Text>
                </Pressable>
              );
            })}
          </Box>

          {/* Clear button + Apply / Close Footer */}
          <ActionsheetItem onPress={() => setFilters([])}>
            <Text color="#dc2626" fontWeight="500">Clear Filters</Text>
          </ActionsheetItem>

          <ActionsheetItem onPress={() => setIsFilterOpen(false)}>
            <Text fontWeight="500">Apply</Text>
          </ActionsheetItem>
        </ActionsheetContent>
      </Actionsheet>
    </Box>
  );
}

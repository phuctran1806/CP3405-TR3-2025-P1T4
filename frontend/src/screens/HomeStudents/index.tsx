import React, { useState, useEffect } from "react";
import {
  ScrollView,
  RefreshControl,
  View,
  ActivityIndicator,
} from "react-native";
import {
  Box,
  VStack,
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
import { Filter, Sparkles } from "lucide-react-native"

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

  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<AccessibilityFeature[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

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

  const fetchLocations = async () => {
    const res = await getLocations();
    if (res.ok) {
      setLocations(mapLocations(res.data));
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

  const filteredLocations = locations.filter((loc) => {
    const matchesSearch = loc.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilters =
      filters.length === 0 || filters.every((f) => loc.accessibility.includes(f));

    return matchesSearch && matchesFilters;
  });

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
        <Box mb="$4" flexDirection="row" alignItems="center" justifyContent="space-between">
          <Box flex={1} mr="$3">
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
            }}
          >
            <Text color="white" fontWeight="bold"><Filter size={16} /></Text>
          </Pressable>
        </Box>

        <Text fontSize="$xl" fontWeight="$bold" color="$black" mb="$4">
          Available Study Spaces
        </Text>

        <VStack space="md">
          {filteredLocations.length > 0 ? (
            filteredLocations.map((loc) => (
              <LocationCard
                key={loc.id}
                name={loc.name}
                image={loc.image_url ? { uri: `${loc.image_url}` } : { uri: "None" }}
                accessibility={loc.accessibility}
                status={loc.status as LocationStatus}
                onPress={() => handleLocationPress(loc.id)}
              />
            ))
          ) : (
            <Text color="$gray600" textAlign="center">
              No matching locations.
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
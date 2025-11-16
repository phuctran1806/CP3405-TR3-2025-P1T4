import React, { useEffect, useState } from 'react';
import {
    ScrollView,
    RefreshControl,
    View,
    ActivityIndicator,
} from 'react-native';
import {
    Box,
    VStack,
    HStack,
    Text,
    Spinner,
} from '@gluestack-ui/themed';
import { useRouter } from 'expo-router';
import { getLocations } from '@/api/locations';
import type { LocationType, LocationStatus } from '@/api/types/location_types';
import SummaryCard from './components/SummaryCard';
import LocationCardAdmin from '@/components/cards/LocationCardAdmin';
import DropDownMenu, { type TabType } from '@/components/DropDownMenu';
import LecturerAssignmentCard from './components/LectureAssignmentCard';
import { lecturerAssignments } from '@/utils/mockData/lectureAssignmentData';
import { resolveAssetUrl } from '@/utils/assetUrl';

interface CombinedLocation {
    id: string;
    name: string;
    image?: string;
    type: LocationType;
    status: LocationStatus;
    occupancy: number;
    capacity: number;
    busyness_percentage: number;
}

export default function HomeAdmin() {
    const [mounted, setMounted] = useState(false);
    const [combinedLocations, setCombinedLocations] = useState<CombinedLocation[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState<TabType>('All Venues');

    const router = useRouter();

    useEffect(() => setMounted(true), []);

    const fetchLocations = async () => {
        try {
            const locations = await getLocations();

            if (locations.ok) {
                const data = locations.data.map((loc) => ({
                    id: loc.id,
                    name: loc.name,
                    image: resolveAssetUrl(loc.image_url),
                    status: loc.status,
                    type: loc.location_type,
                    occupancy: loc.current_occupancy,
                    capacity: loc.total_capacity,
                    busyness_percentage: loc.busyness_percentage,
                }));
                setCombinedLocations(data);
            }
        } catch (error) {
            console.error('Error fetching locations:', error);
        }
    };

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            await fetchLocations();
            setLoading(false);
        };
        loadData();
    }, []);

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchLocations();
        setRefreshing(false);
    };

    console.log('Combined Locations:', combinedLocations);

    // Filter locations by type
    const publicLocations = combinedLocations.filter(loc => loc.type === "public");
    const privateLocations = combinedLocations.filter(loc => loc.type === "private");

    // Calculate stats
    const totalVenues = combinedLocations.length;
    const totalCapacity = combinedLocations.reduce((sum, l) => sum + l.capacity, 0);
    const avgOccupancy = combinedLocations.length > 0
        ? Math.round(
            combinedLocations.reduce((sum, s) => sum + s.busyness_percentage, 0) / combinedLocations.length
        )
        : 0;

    if (!mounted) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f9fafb' }}>
                <ActivityIndicator size="large" color="#3b82f6" />
            </View>
        );
    }

    if (loading) {
        return (
            <Box flex={1} bg="$gray50" justifyContent="center" alignItems="center">
                <Spinner size="large" color="$blue500" />
                <Text mt="$4" color="$gray600">
                    Loading admin data...
                </Text>
            </Box>
        );
    }

    return (
        <Box flex={1} bg="$gray50">
            <ScrollView
                contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 40 }}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                {/* Dashboard summary cards */}
                <HStack space="md" flexWrap="wrap" justifyContent="center" mb="$4">
                    <SummaryCard title="Total Venues" value={totalVenues.toString()} subtitle="Across campus" />
                    <SummaryCard title="Total Capacity" value={totalCapacity.toString()} subtitle="Available seats" />
                    <SummaryCard title="Current Occupancy" value={`${avgOccupancy}%`} subtitle="Avg. across venues" />
                </HStack>

                <DropDownMenu activeTab={activeTab} setActiveTab={setActiveTab} />

                {/* Conditional rendering based on dropdown */}
                {activeTab === 'All Venues' && (
                    <VStack mt="$4" space="md">
                        {combinedLocations.map((loc) => (
                            <LocationCardAdmin
                                key={loc.id}
                                name={loc.name}
                                status={loc.status}
                                type={loc.type}
                                current={loc.occupancy}
                                capacity={loc.capacity}
                                onAnalytics={() => router.push(`/analytics/${loc.id}`)}
                                onEdit={() => router.push(`/editor?locationId=${loc.id}`)}
                            />
                        ))}
                    </VStack>
                )}

                {activeTab === 'Lecturers Assignments' && (
                    <VStack mt="$4" space="md">
                        {lecturerAssignments.map((lect) => (
                            <LecturerAssignmentCard
                                key={lect.id}
                                lecturerName={lect.lecturerName}
                                totalSubjects={lect.totalSubjects}
                                totalVenues={lect.totalVenues}
                                subjects={lect.subjects}
                                venues={lect.venues}
                                onEdit={() => router.push(`/edit-assignment/${lect.id}`)}
                            />
                        ))}
                    </VStack>
                )}
            </ScrollView>
        </Box>
    );
}

import React, { useEffect, useRef, useState } from "react";
import { Platform, View, Image as RNImage } from "react-native";
import Svg, { Defs, LinearGradient, Stop, G } from "react-native-svg";
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Select,
  SelectTrigger,
  SelectInput,
  SelectIcon,
  SelectPortal,
  SelectBackdrop,
  SelectContent,
  SelectItem,
  Input,
  InputField,
  Checkbox,
  Spinner,
  Alert,
  AlertIcon,
  AlertText,
  Heading,
  Divider,
  Icon,
  CheckIcon,
  ChevronDownIcon,
  InfoIcon,
  CheckboxIndicator,
  ButtonText,
} from "@gluestack-ui/themed";

import { getLocations } from "@/api/locations";
import type { LocationResponse } from "@/api/types/location_types";
import { getFloors, type FloorResponse } from "@/api/floors";
import {
  getSeats,
  updateSeats,
  type SeatResponse,
  type SeatUpdatePayload,
} from "@/api/seats";
import { uploadImage } from "@/api/upload";
import { SeatMarker } from "@/components/map/SeatMarker";
import { VIEWBOX_WIDTH, VIEWBOX_HEIGHT, SEAT_TYPES, SEAT_STATUSES } from "@/components/map/MapConfig";
import { v4 as uuidv4 } from 'uuid';

/**
 * SeatMapEditor (web / desktop only)
 *
 * Notes:
 * - This component will early-return a message for non-web platforms.
 * - Uses web-native file picker via hidden input element
 * - Dragging uses pointer events tracked via refs
 */

const SeatMapEditor: React.FC = () => {
  const [isWeb] = useState(Platform.OS === "web");

  // --- Core state (hooks are unconditional) ---
  const [locations, setLocations] = useState<LocationResponse[]>([]);
  const [floors, setFloors] = useState<FloorResponse[]>([]);
  const [seats, setSeats] = useState<SeatResponse[]>([]);

  const [selectedLocationId, setSelectedLocationId] = useState<string>("");
  const [selectedFloorId, setSelectedFloorId] = useState<string>("");
  const [selectedSeatId, setSelectedSeatId] = useState<string | null>(null);

  const [floorMapUrl, setFloorMapUrl] = useState<string | null>(null);

  const [isLoadingLocations, setIsLoadingLocations] = useState(false);
  const [isLoadingFloors, setIsLoadingFloors] = useState(false);
  const [isLoadingSeats, setIsLoadingSeats] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [addMode, setAddMode] = useState(false);

  // Local diff tracking
  const [addedSeats, setAddedSeats] = useState<Partial<SeatResponse>[]>([]);
  const [removedSeatIds, setRemovedSeatIds] = useState<string[]>([]);
  const [updatedSeats, setUpdatedSeats] = useState<Map<string, Partial<SeatResponse>>>(new Map());

  // Drag state
  const [draggingSeatId, setDraggingSeatId] = useState<string | null>(null);

  // refs
  const pointerStartedOnCanvasRef = useRef(false);
  const svgContainerRef = useRef<View | null>(null);
  const dragStateRef = useRef<{ isDragging: boolean; seatId: string | null }>({ isDragging: false, seatId: null });
  const seatRefs = useRef(new Map<string, any>());

  // --- Derived data ---
  const visibleSeats = [
    ...seats.filter((s) => !removedSeatIds.includes(s.id)),
    ...addedSeats,
  ].map((seat) => {
    const updates = seat.id ? updatedSeats.get(seat.id) : undefined;
    return updates ? ({ ...seat, ...updates } as SeatResponse) : (seat as SeatResponse);
  });

  const selectedSeat = visibleSeats.find((s) => s.id === selectedSeatId) ?? null;
  const hasChanges = addedSeats.length > 0 || removedSeatIds.length > 0 || updatedSeats.size > 0;

  // --- Loaders ---
  useEffect(() => {
    void loadLocations();
  }, []);

  useEffect(() => {
    if (selectedLocationId) {
      void loadFloors(selectedLocationId);
      setSelectedFloorId("");
      setSeats([]);
      setFloorMapUrl(null);
    } else {
      setFloors([]);
      setSelectedFloorId("");
    }
  }, [selectedLocationId]);

  useEffect(() => {
    if (selectedFloorId) {
      void loadSeats(selectedFloorId);
      const f = floors.find((x) => x.id === selectedFloorId);
      setFloorMapUrl(f?.floor_map_url ?? null);
      setAddedSeats([]);
      setRemovedSeatIds([]);
      setUpdatedSeats(new Map());
      setSelectedSeatId(null);
    } else {
      setSeats([]);
      setFloorMapUrl(null);
    }
  }, [selectedFloorId, floors]);

  // --- API functions ---
  async function loadLocations() {
    setIsLoadingLocations(true);
    setError(null);
    try {
      const res = await getLocations();
      if (res.ok) setLocations(res.data);
      else setError("Failed to load locations");
    } catch (err: unknown) {
      setError("Error loading locations: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsLoadingLocations(false);
    }
  }

  async function loadFloors(locationId: string) {
    setIsLoadingFloors(true);
    setError(null);
    try {
      const res = await getFloors({ location_id: locationId });
      if (res.ok) setFloors(res.data);
      else setError("Failed to load floors");
    } catch (err: unknown) {
      setError("Error loading floors: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsLoadingFloors(false);
    }
  }

  async function loadSeats(floorId: string) {
    setIsLoadingSeats(true);
    setError(null);
    try {
      const res = await getSeats({ floor_id: floorId });
      if (res.ok) setSeats(res.data);
      else setError("Failed to load seats");
    } catch (err: unknown) {
      setError("Error loading seats: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsLoadingSeats(false);
    }
  }

  // --- Upload using web file input ---
  const handleUploadClick = () => {
    if (!isWeb) return;

    const input = (window as any).document.createElement("input");
    input.type = "file";
    input.accept = "image/*,image/svg+xml";
    input.onchange = async (e: Event) => {
      const target = e.target as HTMLInputElement;
      const file = target?.files?.[0];
      if (file) await handleFileUpload(file);
    };
    input.click();
  };

  async function handleFileUpload(file: File) {
    if (!file.type.startsWith("image/") && !file.name?.endsWith?.(".svg")) {
      setError("Please upload a valid image file (PNG, JPG, SVG)");
      return;
    }

    setIsUploading(true);
    setError(null);
    try {
      const res = await uploadImage(file);
      if (res.ok) {
        setFloorMapUrl(res.data.url);
        setSuccessMessage("Floor map uploaded");
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setError("Upload failed");
      }
    } catch (err: unknown) {
      setError("Upload error: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsUploading(false);
    }
  }

  // --- Seat operations ---
  function startAddMode() {
    setAddMode((s) => !s);
    setSelectedSeatId(null);
  }

  function removeSelectedSeat() {
    if (!selectedSeatId) return;
    if (selectedSeatId.startsWith("temp_")) {
      setAddedSeats((prev) => prev.filter((s) => s.id !== selectedSeatId));
    } else {
      setRemovedSeatIds((prev) => Array.from(new Set([...prev, selectedSeatId])));
      setUpdatedSeats((prev) => {
        const copy = new Map(prev);
        copy.delete(selectedSeatId);
        return copy;
      });
    }
    setSelectedSeatId(null);
  }

  // Add seat by clicking on canvas
  const handleCanvasPress = (e: React.PointerEvent) => {
    // Only add seat if in add mode
    if (!addMode || !selectedFloorId) return;

    const container = svgContainerRef.current as HTMLElement | null;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    if (!rect) return;

    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));

    const newSeat: Partial<SeatResponse> = {
      id: `temp_${Date.now()}`,
      seat_number: `NEW_${addedSeats.length + 1}`,
      seat_type: "individual",
      has_power_outlet: false,
      has_wifi: false,
      has_ac: false,
      accessibility: false,
      capacity: 1,
      floor_id: selectedFloorId,
      x_coordinate: Number(x.toFixed(4)),
      y_coordinate: Number(y.toFixed(4)),
      status: "available",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setAddedSeats((prev) => [...prev, newSeat]);
    setSelectedSeatId(newSeat.id ?? null);
    setAddMode(false);
  };

  // Handle drag start
  const handleMarkerPressIn = (seatId: string, e?: React.PointerEvent) => {
    if (addMode) return;

    // Stop the event from bubbling to the canvas
    e?.stopPropagation();

    setDraggingSeatId(seatId);
    setSelectedSeatId(seatId);
    e?.currentTarget.setPointerCapture(e.pointerId);

    dragStateRef.current = { isDragging: true, seatId };
  };

  // Handle drag move
  // TODO: fix this now, the mouse speed is always higher than widget moving speed
  const handleContainerMove = (e: React.PointerEvent) => {
    if (!draggingSeatId) return;

    const container = svgContainerRef.current as HTMLElement | null;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    if (!rect) return;

    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));

    if (draggingSeatId.startsWith("temp_")) {
      setAddedSeats((prev) =>
        prev.map((s) =>
          s.id === draggingSeatId ? { ...s, x_coordinate: +x.toFixed(4), y_coordinate: +y.toFixed(4) } : s
        )
      );
    } else {
      setUpdatedSeats((prev) => {
        const next = new Map(prev);
        const current = next.get(draggingSeatId) ?? {};
        next.set(draggingSeatId, {
          ...current,
          id: draggingSeatId,
          x_coordinate: +x.toFixed(4),
          y_coordinate: +y.toFixed(4),
        });
        return next;
      });
    }
  };

  // Handle drag end
  const handleContainerRelease = () => {
    if (!draggingSeatId) return;

    setDraggingSeatId(null);
    dragStateRef.current = { isDragging: false, seatId: null };
  };

  // Update seat attribute
  function updateSeatAttribute<K extends keyof SeatResponse>(key: K, value: SeatResponse[K]) {
    if (!selectedSeatId) return;

    if (selectedSeatId.startsWith("temp_")) {
      setAddedSeats((prev) => prev.map((s) => (s.id === selectedSeatId ? { ...s, [key]: value } : s)));
    } else {
      setUpdatedSeats((prev) => {
        const next = new Map(prev);
        const current = next.get(selectedSeatId) ?? {};
        next.set(selectedSeatId, { ...current, id: selectedSeatId, [key]: value });
        return next;
      });
    }
  }

  // Save changes
  async function saveChanges() {
    if (!selectedFloorId) return;
    setIsSaving(true);
    setError(null);

    const payload: SeatUpdatePayload = {};

    if (addedSeats.length > 0) {
      payload.added = addedSeats.map(({ id, created_at, updated_at, notes, ...rest }) => ({
        ...rest,
        id: uuidv4(),
        floor_id: selectedFloorId,
        x_coordinate: Number(((rest.x_coordinate ?? 0) as number).toFixed(4)),
        y_coordinate: Number(((rest.y_coordinate ?? 0) as number).toFixed(4)),
      }));
    }
    if (removedSeatIds.length > 0) {
      payload.removed = removedSeatIds;
    }
    if (updatedSeats.size > 0) {
      payload.updated = Array.from(updatedSeats.values()).map((u) => {
        const copy = { ...u };
        if (typeof copy.x_coordinate === "number") copy.x_coordinate = Number(copy.x_coordinate.toFixed(4));
        if (typeof copy.y_coordinate === "number") copy.y_coordinate = Number(copy.y_coordinate.toFixed(4));
        return copy;
      });
    }

    try {
      const res = await updateSeats(payload);
      if (res.ok) {
        setSuccessMessage(res.data.message ?? "Saved");
        setTimeout(() => setSuccessMessage(null), 3000);
        await loadSeats(selectedFloorId);
        setAddedSeats([]);
        setRemovedSeatIds([]);
        setUpdatedSeats(new Map());
        setSelectedSeatId(null);
      } else {
        setError("Save failed");
      }
    } catch (err: unknown) {
      setError("Save error: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsSaving(false);
    }
  }

  // Cancel changes
  function cancelChanges() {
    setAddedSeats([]);
    setRemovedSeatIds([]);
    setUpdatedSeats(new Map());
    setSelectedSeatId(null);
    setAddMode(false);
  }

  if (!isWeb) {
    return (
      <Box flex={1} justifyContent="center" alignItems="center" p="$6" bg="$backgroundLight0">
        <Alert action="info" variant="solid" maxWidth={400}>
          <AlertIcon as={InfoIcon} mr="$3" />
          <AlertText>
            Seat editing is only available on the web admin interface.
          </AlertText>
        </Alert>
      </Box>
    );
  }

  // --- UI Render ---
  return (
    <Box flex={1} bg="$backgroundLight0" minHeight={600}>
      <HStack flex={1} alignItems="stretch">
        {/* Left: Canvas & toolbar */}
        <Box flex={1} p="$4">
          <VStack space="md" flex={1}>
            <HStack justifyContent="space-between" alignItems="center">
              <Heading size="xl">Seat Map Editor</Heading>

              <HStack space="sm" alignItems="center">
                {hasChanges && (
                  <>
                    <Button size="sm" variant="outline" onPress={cancelChanges} isDisabled={isSaving}>
                      <ButtonText>Cancel</ButtonText>
                    </Button>
                    <Button size="sm" action="positive" onPress={saveChanges} isDisabled={isSaving}>
                      {isSaving ? <Spinner size="small" /> : <ButtonText>Save Changes</ButtonText>}
                    </Button>
                  </>
                )}
              </HStack>
            </HStack>

            {/* Alerts */}
            {error && (
              <Alert action="error" variant="solid">
                <AlertIcon as={InfoIcon} mr="$3" />
                <AlertText>{error}</AlertText>
              </Alert>
            )}
            {successMessage && (
              <Alert action="success" variant="solid">
                <AlertIcon as={CheckIcon} mr="$3" />
                <AlertText>{successMessage}</AlertText>
              </Alert>
            )}

            {/* Controls */}
            <HStack space="md" alignItems="center">
              <Box flex={1}>
                <Text size="sm" mb="$2" fontWeight="$medium">Location</Text>
                <Select selectedValue={selectedLocationId} onValueChange={setSelectedLocationId} isDisabled={isLoadingLocations}>
                  <SelectTrigger variant="outline" size="md">
                    <SelectInput placeholder="Select location" />
                    <SelectIcon><Icon as={ChevronDownIcon} /></SelectIcon>
                  </SelectTrigger>
                  <SelectPortal>
                    <SelectBackdrop />
                    <SelectContent>
                      {locations.map((loc) => (
                        <SelectItem key={loc.id} label={loc.name} value={loc.id} />
                      ))}
                    </SelectContent>
                  </SelectPortal>
                </Select>
              </Box>

              <Box flex={1}>
                <Text size="sm" mb="$2" fontWeight="$medium">Floor</Text>
                <Select selectedValue={selectedFloorId} onValueChange={setSelectedFloorId} isDisabled={!selectedLocationId || isLoadingFloors}>
                  <SelectTrigger variant="outline" size="md">
                    <SelectInput placeholder="Select floor" />
                    <SelectIcon><Icon as={ChevronDownIcon} /></SelectIcon>
                  </SelectTrigger>
                  <SelectPortal>
                    <SelectBackdrop />
                    <SelectContent>
                      {floors.map((f) => (
                        <SelectItem key={f.id} label={f.floor_name ?? `Floor ${f.floor_number}`} value={f.id} />
                      ))}
                    </SelectContent>
                  </SelectPortal>
                </Select>
              </Box>

              <Box>
                <Text size="sm" mb="$2" fontWeight="$medium">Floor Map</Text>
                {/* TODO: Will disable this feature, open for another PR */}
                <Button size="md" variant="outline" onPress={handleUploadClick}
                  //isDisabled={!selectedFloorId || isUploading}>
                  isDisabled={true}>
                  {isUploading ? <Spinner size="small" /> : <ButtonText>{floorMapUrl ? "Replace Map" : "Upload Map"}</ButtonText>}
                </Button>
              </Box>
            </HStack>

            {/* Toolbar */}
            {selectedFloorId && (
              <HStack space="sm" alignItems="center">
                <Button size="sm" action={addMode ? "negative" : "primary"} onPress={startAddMode}>
                  <ButtonText>{addMode ? "Cancel Add" : "Add Seat"}</ButtonText>
                </Button>
                <Button size="sm" action="negative" variant="outline" onPress={removeSelectedSeat} isDisabled={!selectedSeatId}>
                  <ButtonText>Remove Seat</ButtonText>
                </Button>
                <Text size="sm" color="$textLight600" ml="$4">
                  {addMode ? "Click map to place seat" : "Drag seats to move them"}
                </Text>
              </HStack>
            )}

            {/* Canvas */}
            <Box flex={1} borderWidth={1} borderColor="$borderLight200" borderRadius="$lg" overflow="hidden" bg="$backgroundLight50">
              {isLoadingSeats ? (
                <Box flex={1} justifyContent="center" alignItems="center">
                  <Spinner size="large" />
                  <Text mt="$4" color="$textLight600">Loading seats...</Text>
                </Box>
              ) : selectedFloorId ? (
                <View
                  ref={svgContainerRef}
                  onPointerDown={(e) => {
                    if (!addMode) {
                      // Not in add mode: normal drag
                      pointerStartedOnCanvasRef.current = true;
                      return;
                    }

                    // If we're dragging, don't add a new seat
                    if (dragStateRef.current.isDragging) return;

                    // Only handle canvas clicks in add mode
                    if (addMode) {
                      handleCanvasPress(e);
                    }
                  }}
                  onPointerMove={(e) => {
                    if (dragStateRef.current.isDragging && dragStateRef.current.seatId) {
                      handleContainerMove(e);
                    }
                  }}
                  onPointerUp={handleContainerRelease}
                  style={{ width: "100%", height: 650, position: "relative" }}
                >
                  {/* Background image */}
                  {floorMapUrl ? (
                    <RNImage
                      source={{ uri: floorMapUrl }}
                      style={{ position: "absolute", width: "100%", height: "100%", resizeMode: "contain" }}
                    />
                  ) : (
                    <Box flex={1} justifyContent="center" alignItems="center">
                      <Text color="$textLight400">No floor map uploaded</Text>
                    </Box>
                  )}

                  {/* SVG overlay */}
                  <View style={{ position: "absolute", width: "100%", height: "100%" }} pointerEvents="box-none">
                    <Svg width="100%" height="100%" viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`} preserveAspectRatio="xMidYMid meet">
                      <Defs>
                        <LinearGradient id="availableGrad" x1="0" y1="0" x2="0" y2="1">
                          <Stop offset="0" stopColor="#10B981" stopOpacity="1" />
                          <Stop offset="1" stopColor="#059669" stopOpacity="1" />
                        </LinearGradient>
                        <LinearGradient id="occupiedGrad" x1="0" y1="0" x2="0" y2="1">
                          <Stop offset="0" stopColor="#EF4444" stopOpacity="1" />
                          <Stop offset="1" stopColor="#DC2626" stopOpacity="1" />
                        </LinearGradient>
                        <LinearGradient id="selectedGrad" x1="0" y1="0" x2="0" y2="1">
                          <Stop offset="0" stopColor="#3B82F6" stopOpacity="1" />
                          <Stop offset="1" stopColor="#2563EB" stopOpacity="1" />
                        </LinearGradient>
                        <LinearGradient id="blockedGrad" x1="0" y1="0" x2="0" y2="1">
                          <Stop offset="0" stopColor="#6B7280" stopOpacity="1" />
                          <Stop offset="1" stopColor="#4B5563" stopOpacity="1" />
                        </LinearGradient>
                      </Defs>
                      {visibleSeats.map((s) => (
                        <G
                          key={s.id}
                          onPointerDown={(e: PointerEvent) => {
                            e.stopPropagation();
                            handleMarkerPressIn(s.id, e as any);
                          }}>
                          <SeatMarker
                            key={s.id}
                            ref={(el) => {
                              if (el) seatRefs.current.set(s.id, el);
                              else seatRefs.current.delete(s.id);
                            }}
                            seat={s}
                            isSelected={s.id === selectedSeatId}
                            onPress={() => !addMode && setSelectedSeatId(s.id)}
                          />
                        </G>
                      ))}
                    </Svg>
                  </View>
                </View>
              ) : (
                <Box flex={1} justifyContent="center" alignItems="center">
                  <Text color="$textLight400">Select a location and floor to begin editing</Text>
                </Box>
              )}
            </Box>

            {/* Stats */}
            {selectedFloorId && (
              <HStack space="lg">
                <Text size="sm" color="$textLight600">
                  Total Seats: <Text fontWeight="$semibold">{visibleSeats.length}</Text>
                </Text>
                {addedSeats.length > 0 && (
                  <Text size="sm" color="$success600">Added: <Text fontWeight="$semibold">{addedSeats.length}</Text></Text>
                )}
                {removedSeatIds.length > 0 && (
                  <Text size="sm" color="$error600">Removed: <Text fontWeight="$semibold">{removedSeatIds.length}</Text></Text>
                )}
                {updatedSeats.size > 0 && (
                  <Text size="sm" color="$info600">Updated: <Text fontWeight="$semibold">{updatedSeats.size}</Text></Text>
                )}
              </HStack>
            )}
          </VStack>
        </Box>

        {/* Right sidebar */}
        <Box width={360} borderLeftWidth={1} borderColor="$borderLight200" bg="$backgroundLight50" p="$4">
          <VStack space="lg">
            <Heading size="lg">Seat Properties</Heading>

            {selectedSeat ? (
              <VStack space="md">
                <Box>
                  <Text size="sm" mb="$2" fontWeight="$medium">Seat Number</Text>
                  <Input variant="outline" size="md">
                    <InputField value={selectedSeat.seat_number} onChangeText={(v) => updateSeatAttribute("seat_number", v)} />
                  </Input>
                </Box>

                <Box>
                  <Text size="sm" mb="$2" fontWeight="$medium">Seat Type</Text>
                  <Select selectedValue={selectedSeat.seat_type} onValueChange={(v) => updateSeatAttribute("seat_type", v)}>
                    <SelectTrigger variant="outline" size="md">
                      <SelectInput placeholder="Type" />
                      <SelectIcon><Icon as={ChevronDownIcon} /></SelectIcon>
                    </SelectTrigger>
                    <SelectPortal>
                      <SelectBackdrop />
                      <SelectContent>
                        {SEAT_TYPES.map((t) => (
                          <SelectItem key={t} label={t} value={t} />
                        ))}
                      </SelectContent>
                    </SelectPortal>
                  </Select>
                </Box>

                <Box>
                  <Text size="sm" mb="$2" fontWeight="$medium">Status</Text>
                  <Select selectedValue={selectedSeat.status} onValueChange={(v) => updateSeatAttribute("status", v)}>
                    <SelectTrigger variant="outline" size="md">
                      <SelectInput placeholder="Status" />
                      <SelectIcon><Icon as={ChevronDownIcon} /></SelectIcon>
                    </SelectTrigger>
                    <SelectPortal>
                      <SelectBackdrop />
                      <SelectContent>
                        {SEAT_STATUSES.map((st) => <SelectItem key={st} label={st} value={st} />)}
                      </SelectContent>
                    </SelectPortal>
                  </Select>
                </Box>

                <Box>
                  <Text size="sm" mb="$2" fontWeight="$medium">Capacity</Text>
                  <Input variant="outline" size="md">
                    <InputField value={String(selectedSeat.capacity)} onChangeText={(v) => updateSeatAttribute("capacity", Math.max(1, parseInt(v || "1")))} keyboardType="numeric" />
                  </Input>
                </Box>

                <Divider />

                <Box>
                  <Text size="sm" mb="$3" fontWeight="$medium">Amenities</Text>
                  <VStack space="sm">
                    <Checkbox value="power" isChecked={!!selectedSeat.has_power_outlet} onChange={(c) => updateSeatAttribute("has_power_outlet", Boolean(c))}>
                      <CheckboxIndicator mr="$2"><CheckIcon /></CheckboxIndicator>
                      <Text>Power</Text>
                    </Checkbox>
                    <Checkbox value="wifi" isChecked={!!selectedSeat.has_wifi} onChange={(c) => updateSeatAttribute("has_wifi", Boolean(c))}>
                      <CheckboxIndicator mr="$2"><CheckIcon /></CheckboxIndicator>
                      <Text>Wi-Fi</Text>
                    </Checkbox>
                    <Checkbox value="ac" isChecked={!!selectedSeat.has_ac} onChange={(c) => updateSeatAttribute("has_ac", Boolean(c))}>
                      <CheckboxIndicator mr="$2"><CheckIcon /></CheckboxIndicator>
                      <Text>AC</Text>
                    </Checkbox>
                    <Checkbox value="accessibility" isChecked={!!selectedSeat.accessibility} onChange={(c) => updateSeatAttribute("accessibility", Boolean(c))}>
                      <CheckboxIndicator mr="$2"><CheckIcon /></CheckboxIndicator>
                      <Text>Accessibility</Text>
                    </Checkbox>
                  </VStack>
                </Box>

                <Divider />

                <Box>
                  <Text size="sm" mb="$2" fontWeight="$medium">Position (normalized)</Text>
                  <HStack space="sm">
                    <Box flex={1}>
                      <Text size="xs" color="$textLight500">X</Text>
                      <Input variant="outline" size="sm" isReadOnly>
                        <InputField value={String((selectedSeat.x_coordinate ?? 0).toFixed(3))} />
                      </Input>
                    </Box>
                    <Box flex={1}>
                      <Text size="xs" color="$textLight500">Y</Text>
                      <Input variant="outline" size="sm" isReadOnly>
                        <InputField value={String((selectedSeat.y_coordinate ?? 0).toFixed(3))} />
                      </Input>
                    </Box>
                  </HStack>
                </Box>

                <Box>
                  <Text size="sm" mb="$2" fontWeight="$medium">Seat ID</Text>
                  <Input variant="outline" size="sm" isReadOnly>
                    <InputField value={selectedSeat.id} />
                  </Input>
                </Box>
              </VStack>
            ) : (
              <Box p="$4" bg="$backgroundLight100" borderRadius="$md">
                <Text size="sm" color="$textLight600" textAlign="center">Select a seat to edit its properties</Text>
              </Box>
            )}
          </VStack>
        </Box>
      </HStack>
    </Box>
  );
};

export default SeatMapEditor;

import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface LectureRoomMapProps {
  capacity: number;
  liveOccupancy: number | null; // already tells us if class is ongoing
  columns?: number;
}

export const LectureRoomMap: React.FC<LectureRoomMapProps> = ({
  capacity,
  liveOccupancy,
  columns = 10,
}) => {
  const rows = Math.ceil(capacity / columns);

  // If no liveOccupancy (null), then no students
  const takenCount = useMemo(() => {
    if (liveOccupancy == null) return 0; // no class = no one inside
    return Math.floor((liveOccupancy / 100) * capacity);
  }, [capacity, liveOccupancy]);

  // Random seat assignment
  const seatStatus = useMemo(() => {
    const seats = Array(capacity).fill(false);
    if (takenCount === 0) return seats;
    const takenIndices = new Set<number>();
    while (takenIndices.size < takenCount) {
      takenIndices.add(Math.floor(Math.random() * capacity));
    }
    takenIndices.forEach((i) => (seats[i] = true));
    return seats;
  }, [capacity, takenCount]);

  return (
    <View style={styles.container}>
      {/* Teaching stand */}
      <View style={styles.standContainer}>
        <View style={styles.stand}>
          <Text style={styles.standLabel}>Teaching Stand</Text>
        </View>
      </View>

      {/* Seat grid */}
      <View style={styles.mapContainer}>
        {Array.from({ length: rows }).map((_, rowIdx) => (
          <View key={rowIdx} style={styles.row}>
            {Array.from({ length: columns }).map((_, colIdx) => {
              const seatIndex = rowIdx * columns + colIdx;
              if (seatIndex >= capacity) return null;
              const taken = seatStatus[seatIndex];
              return (
                <View
                  key={colIdx}
                  style={[
                    styles.seat,
                    { backgroundColor: taken ? '#9e9e9e' : '#4CAF50' },
                  ]}
                />
              );
            })}
          </View>
        ))}
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={[styles.legendItem, { backgroundColor: '#4CAF50' }]} />
        <Text style={styles.legendText}>Available</Text>
        <View style={[styles.legendItem, { backgroundColor: '#9e9e9e' }]} />
        <Text style={styles.legendText}>Taken</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingVertical: 16 },
  standContainer: { alignItems: 'center', marginBottom: 12 },
  stand: { backgroundColor: '#222', paddingVertical: 8, paddingHorizontal: 24, borderRadius: 8 },
  standLabel: { color: 'white', fontWeight: 'bold' },
  mapContainer: { alignItems: 'center' },
  row: { flexDirection: 'row', justifyContent: 'center' },
  seat: { width: 18, height: 18, margin: 3, borderRadius: 4 },
  legend: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
  legendItem: { width: 16, height: 16, marginHorizontal: 4, borderRadius: 3 },
  legendText: { fontSize: 12, marginRight: 8 },
});

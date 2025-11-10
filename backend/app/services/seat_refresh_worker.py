"""Background worker that simulates seat occupancy drift and caches snapshots."""

from __future__ import annotations

import asyncio
import random
from datetime import datetime
from threading import Lock
from typing import Dict, List, Optional

from app.config import settings
from app.database import SessionLocal
from app.models.seat import Seat, SeatStatus


class SeatRefreshWorker:
    """Periodically adjusts seat statuses and caches visual snapshots."""

    def __init__(
        self,
        interval_seconds: int = 60,
        drift_ratio: float = 0.05,
        target_occupancy: float = 0.65,
    ) -> None:
        self._interval = interval_seconds
        self._drift_ratio = drift_ratio
        self._target_occupancy = target_occupancy
        self._task: Optional[asyncio.Task] = None
        self._lock = Lock()
        self._encoded_map: str = ""
        self._seat_payload: List[Dict] = []
        self._floor_payload: List[Dict] = []
        self._last_updated: Optional[datetime] = None

    async def start(self) -> None:
        if self._task is None:
            await asyncio.to_thread(self._refresh_snapshot)
            self._task = asyncio.create_task(self._run())

    async def stop(self) -> None:
        if self._task:
            self._task.cancel()
            try:
                await self._task
            except asyncio.CancelledError:
                pass
            self._task = None

    async def _run(self) -> None:
        while True:
            await asyncio.to_thread(self._refresh_snapshot)
            await asyncio.sleep(self._interval)

    def _refresh_snapshot(self) -> None:
        db = SessionLocal()
        try:
            seats = db.query(Seat).all()
            if not seats:
                return

            self._apply_drift(seats)
            db.commit()

            payload, encoded, floor_payload = self._build_snapshot(seats)
            with self._lock:
                self._seat_payload = payload
                self._floor_payload = floor_payload
                self._encoded_map = encoded
                self._last_updated = datetime.utcnow()
        finally:
            db.close()

    def _apply_drift(self, seats: List[Seat]) -> None:
        total = len(seats)
        if total == 0:
            return

        available = [s for s in seats if s.status == SeatStatus.AVAILABLE]
        occupied = [s for s in seats if s.status == SeatStatus.OCCUPIED]
        desired_occupied = int(total * self._target_occupancy)
        delta = desired_occupied - len(occupied)
        max_changes = max(1, int(total * self._drift_ratio))

        if delta > 0 and available:
            change = min(delta, len(available), max_changes)
            for seat in random.sample(available, change):
                seat.status = SeatStatus.OCCUPIED
        elif delta < 0 and occupied:
            change = min(-delta, len(occupied), max_changes)
            for seat in random.sample(occupied, change):
                seat.status = SeatStatus.AVAILABLE

        # Light-touch maintenance / recovery churn
        maintenance_candidates = [s for s in seats if s.status == SeatStatus.AVAILABLE]
        if maintenance_candidates and random.random() < 0.05:
            seat = random.choice(maintenance_candidates)
            seat.status = SeatStatus.MAINTENANCE
        maintenance = [s for s in seats if s.status == SeatStatus.MAINTENANCE]
        if maintenance and random.random() < 0.4:
            seat = random.choice(maintenance)
            seat.status = SeatStatus.AVAILABLE

    def _build_snapshot(self, seats: List[Seat]) -> tuple[List[Dict], str, List[Dict]]:
        xs = [float(seat.x_coordinate) for seat in seats]
        ys = [float(seat.y_coordinate) for seat in seats]
        x_min, x_max = min(xs), max(xs)
        y_min, y_max = min(ys), max(ys)
        x_range = x_max - x_min or 1
        y_range = y_max - y_min or 1

        payload: List[Dict] = []
        lines: List[str] = []
        floor_groups: Dict[str, Dict] = {}

        for seat in seats:
            status_value = seat.status.value if hasattr(seat.status, "value") else str(seat.status)
            normalized_x = 5 + ((float(seat.x_coordinate) - x_min) / x_range) * 90
            normalized_y = 5 + ((float(seat.y_coordinate) - y_min) / y_range) * 90
            floor_name = seat.floor.floor_name if seat.floor else ""
            location_name = seat.floor.location.name if seat.floor and seat.floor.location else ""
            path = " / ".join(filter(None, [location_name, floor_name])) or floor_name or seat.floor_id
            seat_dict = {
                "id": seat.id,
                "seat_number": seat.seat_number,
                "status": status_value,
                "floor_id": seat.floor_id,
                "floor_name": floor_name,
                "location_name": location_name,
                "path": path,
                "x": round(normalized_x, 2),
                "y": round(normalized_y, 2),
                "has_power_outlet": seat.has_power_outlet,
                "has_wifi": getattr(seat, "has_wifi", False),
                "has_ac": getattr(seat, "has_ac", False),
                "accessibility": seat.accessibility,
            }
            payload.append(seat_dict)
            lines.append(
                f"{seat.seat_number}|path={path}|status={status_value}|power={int(seat.has_power_outlet)}|wifi={int(seat_dict['has_wifi'])}|ac={int(seat_dict['has_ac'])}|accessible={int(seat.accessibility)}"
            )

            floor_entry = floor_groups.setdefault(
                seat.floor_id,
                {
                    "floor_id": seat.floor_id,
                    "floor_name": floor_name or seat.floor_id,
                    "location_name": location_name,
                    "path": path,
                    "seats": [],
                },
            )
            floor_entry["seats"].append(
                {
                    "seat_id": seat.id,
                    "seat_number": seat.seat_number,
                    "status": status_value,
                    "has_power_outlet": seat.has_power_outlet,
                    "has_wifi": seat_dict["has_wifi"],
                    "has_ac": seat_dict["has_ac"],
                    "accessibility": seat.accessibility,
                }
            )

        for entry in floor_groups.values():
            entry["seats"].sort(key=lambda s: s["seat_number"])

        floor_payload = sorted(
            floor_groups.values(),
            key=lambda item: item["path"],
        )

        encoded_map = "\n".join(lines)
        return payload, encoded_map, floor_payload

    def get_seat_payload(self) -> Dict:
        with self._lock:
            return {
                "seats": list(self._seat_payload),
                "floors": list(self._floor_payload),
                "last_updated": self._last_updated.isoformat() if self._last_updated else None,
            }

    def get_encoded_snapshot(self) -> Dict[str, Optional[str]]:
        with self._lock:
            return {
                "encoded": self._encoded_map,
                "last_updated": self._last_updated.isoformat() if self._last_updated else None,
            }


seat_refresh_worker = SeatRefreshWorker(
    interval_seconds=settings.SEAT_REFRESH_INTERVAL_SECONDS,
    drift_ratio=settings.SEAT_REFRESH_DRIFT_RATIO,
    target_occupancy=settings.SEAT_TARGET_OCCUPANCY_RATIO,
)

"""Utility helpers for loading the seating dataset."""

from __future__ import annotations

import csv
from collections import Counter, defaultdict
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional


DATE_FORMAT = "%m/%d/%Y %H:%M"


@dataclass(frozen=True)
class SeatingRecord:
    """Strongly typed representation of a seating entry."""

    location: str
    arrival_time: datetime
    leaving_time: datetime
    temperature: float
    power_plugs: bool

    @property
    def duration_minutes(self) -> float:
        return (self.leaving_time - self.arrival_time).total_seconds() / 60.0


class SeatingDataService:
    """Loads the CSV and exposes summaries for prompts."""

    def __init__(self, data_path: str | Path):
        self._path = Path(data_path)
        self._records: List[SeatingRecord] = []
        self._summary: Optional[Dict] = None

    def ensure_loaded(self) -> None:
        if self._records:
            return
        if not self._path.exists():
            raise FileNotFoundError(f"Seating dataset not found: {self._path}")

        with self._path.open("r", encoding="utf-8-sig") as handle:
            reader = csv.DictReader(handle)
            for row in reader:
                arrival = datetime.strptime(row["Arrival Time"].strip(), DATE_FORMAT)
                leaving = datetime.strptime(row["Leaving Time"].strip(), DATE_FORMAT)
                temperature = float(row.get("Temperature", 0) or 0)
                power = (row.get("Power Plugs") or "").strip().upper() == "TRUE"
                self._records.append(
                    SeatingRecord(
                        location=row["Location"].strip(),
                        arrival_time=arrival,
                        leaving_time=leaving,
                        temperature=temperature,
                        power_plugs=power,
                    )
                )

    @property
    def records(self) -> List[SeatingRecord]:
        self.ensure_loaded()
        return self._records

    def get_recent_records(self, location: str, limit: int = 5) -> List[SeatingRecord]:
        location_records = [r for r in self.records if r.location == location]
        return sorted(location_records, key=lambda r: r.arrival_time, reverse=True)[:limit]

    def summary(self) -> Dict:
        if self._summary is not None:
            return self._summary

        self.ensure_loaded()
        if not self._records:
            self._summary = {"overall": {"total_records": 0}, "locations": {}}
            return self._summary

        total_records = len(self._records)
        avg_duration = sum(r.duration_minutes for r in self._records) / total_records
        first_date = min(r.arrival_time for r in self._records)
        last_date = max(r.leaving_time for r in self._records)

        location_stats: Dict[str, Dict] = {}
        hour_counters: Dict[str, Counter] = defaultdict(Counter)
        power_counters: Dict[str, Counter] = defaultdict(Counter)
        temperature_values: Dict[str, List[float]] = defaultdict(list)

        for record in self._records:
            stats = location_stats.setdefault(record.location, {"entries": 0})
            stats["entries"] += 1
            hour_counters[record.location][record.arrival_time.hour] += 1
            power_counters[record.location][record.power_plugs] += 1
            temperature_values[record.location].append(record.temperature)

        for location, stats in location_stats.items():
            total = stats["entries"]
            power_counts = power_counters[location]
            peak_hours = [hour for hour, _ in hour_counters[location].most_common(3)]
            temps = temperature_values[location]
            stats.update(
                {
                    "power_available_ratio": round(
                        power_counts.get(True, 0) / total, 3
                    ) if total else 0.0,
                    "peak_hours": peak_hours,
                    "average_temperature": round(sum(temps) / len(temps), 2)
                    if temps
                    else None,
                }
            )

        self._summary = {
            "overall": {
                "total_records": total_records,
                "date_range": {
                    "start": first_date.isoformat(),
                    "end": last_date.isoformat(),
                },
                "average_duration_minutes": round(avg_duration, 2),
            },
            "locations": location_stats,
        }
        return self._summary


def build_prediction_context(service: SeatingDataService, location: str) -> Dict:
    summary = service.summary()
    recent_records = service.get_recent_records(location, limit=5)
    return {
        "summary": summary,
        "location": location,
        "recent_records": [
            {
                "arrival_time": r.arrival_time.isoformat(),
                "leaving_time": r.leaving_time.isoformat(),
                "temperature": r.temperature,
                "power_plugs": r.power_plugs,
                "duration_minutes": round(r.duration_minutes, 2),
            }
            for r in recent_records
        ],
    }

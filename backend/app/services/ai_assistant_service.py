"""Service powering the AI demo chat experience."""

from __future__ import annotations

import json
import re
from typing import Dict, List, Optional

from sqlalchemy.orm import Session

from app.config import settings
from app.models.seat import Seat, SeatType
from app.schemas.ai_demo import AiChatRequest, AiChatResponse, ChatMessage
from app.schemas.prediction import SeatSuggestionRequest
from app.services.gemini_client import GeminiClient
from app.services.seating_data import SeatingDataService
from app.services.suggestion_service import SeatSuggestionService
from app.services.seat_refresh_worker import seat_refresh_worker


KEYWORD_MAP = {
    "power": {"need_power": True},
    "charge": {"need_power": True},
    "outlet": {"need_power": True},
    "socket": {"need_power": True},
    "quiet": {"seat_type": SeatType.QUIET},
    "silent": {"seat_type": SeatType.QUIET},
    "group": {"seat_type": SeatType.GROUP},
    "team": {"seat_type": SeatType.GROUP},
    "pod": {"seat_type": SeatType.STUDY_POD},
    "computer": {"seat_type": SeatType.COMPUTER},
    "desktop": {"seat_type": SeatType.COMPUTER},
    "pc": {"seat_type": SeatType.COMPUTER},
    "wifi": {"need_wifi": True},
    "internet": {"need_wifi": True},
    "online": {"need_wifi": True},
    "cool": {"need_ac": True},
    "aircon": {"need_ac": True},
    "ac": {"need_ac": True},
    "hot": {"need_ac": False},
}


class AiAssistantService:
    """Handles chat intent extraction, seat selection, and Gemini responses."""

    def __init__(self, db: Session):
        self._db = db
        self._suggestion_service = SeatSuggestionService(db)
        self._gemini = GeminiClient()
        self._data_service = SeatingDataService(settings.SEATING_DATA_PATH)

    async def chat(self, payload: AiChatRequest) -> AiChatResponse:
        latest_message = payload.messages[-1].content

        preference_kwargs = self._extract_preferences(latest_message)
        suggestion_request = SeatSuggestionRequest(**preference_kwargs)
        suggestions = self._suggestion_service.suggest(suggestion_request)

        if not suggestions:
            # Relax filters and fallback to generic availability
            suggestion_request = SeatSuggestionRequest()
            suggestions = self._suggestion_service.suggest(suggestion_request)

        seat_details = [self._serialize_seat(item) for item in suggestions]
        highlight_ids = [item["seat_id"] for item in seat_details]

        seat_map_snapshot = seat_refresh_worker.get_encoded_snapshot()

        reply = await self._compose_reply(
            payload.messages,
            seat_details,
            latest_message,
            seat_map_snapshot,
        )

        return AiChatResponse(reply=reply, highlight_seats=highlight_ids, seat_details=seat_details)

    def _extract_preferences(self, content: str) -> Dict:
        text = content.lower()
        result: Dict = {"limit": 3}
        for keyword, modifiers in KEYWORD_MAP.items():
            if keyword in text:
                result.update(modifiers)
        return result

    def _serialize_seat(self, seat_item) -> Dict:
        seat: Seat = self._db.query(Seat).filter(Seat.id == seat_item.seat_id).first()
        if seat is None:
            return {
                "seat_id": seat_item.seat_id,
                "seat_number": seat_item.seat_number,
                "floor_id": seat_item.floor_id,
                "seat_type": seat_item.seat_type,
                "has_power_outlet": seat_item.has_power_outlet,
                "has_wifi": seat_item.has_wifi,
                "has_ac": seat_item.has_ac,
                "accessibility": seat_item.accessibility,
            }

        floor_name = seat.floor.floor_name if seat.floor else "Unknown Floor"
        return {
            "seat_id": seat.id,
            "seat_number": seat.seat_number,
            "floor_id": seat.floor_id,
            "floor_name": floor_name,
            "seat_type": seat.seat_type.value if hasattr(seat.seat_type, "value") else seat.seat_type,
            "has_power_outlet": seat.has_power_outlet,
            "has_wifi": getattr(seat, "has_wifi", False),
            "has_ac": getattr(seat, "has_ac", False),
            "accessibility": seat.accessibility,
        }

    async def _compose_reply(
        self,
        messages: List[ChatMessage],
        seat_details: List[Dict],
        latest_user_message: str,
        seat_map_snapshot: Dict[str, Optional[str]],
    ) -> str:
        if not self._gemini.is_configured:
            # Provide deterministic fallback copy
            if seat_details:
                seat = seat_details[0]
                return (
                    f"Consider seat {seat['seat_number']} on {seat.get('floor_name', 'the selected floor')} "
                    f"—it matches your latest request: {latest_user_message}."
                )
            return "I couldn't find any matching seats right now, please try again later."

        conversation = "\n".join(f"{msg.role.title()}: {msg.content}" for msg in messages)
        seat_json = json.dumps(seat_details, ensure_ascii=False, indent=2)
        dataset_summary = json.dumps(self._data_service.summary(), ensure_ascii=False)[:4000]
        seat_map_encoded = seat_map_snapshot.get("encoded") or ""
        seat_map_timestamp = seat_map_snapshot.get("last_updated") or "unknown"

        user_prompt = (
            "Conversation so far:\n"
            f"{conversation}\n\n"
            "Latest user request:\n"
            f"{latest_user_message}\n\n"
            "Recommended seats (JSON):\n"
            f"{seat_json}\n\n"
            "Seat map snapshot (encoded lines) refreshed at "
            f"{seat_map_timestamp}:\n{seat_map_encoded}\n\n"
            "Historical dataset summary (trimmed):\n"
            f"{dataset_summary}"
        )

        system_prompt = (
            "You are the Gemini concierge for a university library. "
            "Explain seat recommendations using friendly language, referencing seat numbers and floors. "
            "Lean on the encoded seat snapshot (refreshed every minute) so guidance stays current, and mention that suggestions are time-sensitive. "
            "Offer concise advice (under 120 words) and optionally mention power/Wi-Fi traits."
        )

        return await self._gemini.generate_text(system_prompt=system_prompt, user_prompt=user_prompt)

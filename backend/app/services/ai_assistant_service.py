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


class AiAssistantService:
    """Handles chat intent extraction, seat selection, and Gemini responses."""

    def __init__(self, db: Session):
        self._db = db
        self._suggestion_service = SeatSuggestionService(db)
        self._gemini = GeminiClient()
        self._data_service = SeatingDataService(settings.SEATING_DATA_PATH)

    async def chat(self, payload: AiChatRequest) -> AiChatResponse:
        sanitized_messages = [msg for msg in payload.messages if (msg.content and msg.content.strip())]
        if not sanitized_messages:
            raise ValueError("No valid chat messages supplied")

        latest_message = sanitized_messages[-1].content

        suggestion_request = SeatSuggestionRequest()
        suggestions = self._suggestion_service.suggest(suggestion_request)

        seat_details = [self._serialize_seat(item) for item in suggestions]

        seat_map_snapshot = seat_refresh_worker.get_encoded_snapshot()

        try:
            reply_text, model_highlights = await self._compose_reply(
                sanitized_messages,
                seat_details,
                latest_message,
                seat_map_snapshot,
            )
        except Exception as exc:
            reply_text, model_highlights = self._fallback_reply(seat_details, latest_message, str(exc))

        seat_id_lookup = {detail["seat_id"] for detail in seat_details}
        highlight_ids = [seat_id for seat_id in model_highlights if seat_id in seat_id_lookup]

        return AiChatResponse(reply=reply_text, highlight_seats=highlight_ids, seat_details=seat_details)

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
    ) -> tuple[str, List[str]]:
        if not self._gemini.is_configured:
            if seat_details:
                seat = seat_details[0]
                return (
                    f"Consider seat {seat['seat_number']} on {seat.get('floor_name', 'the selected floor')} "
                    f"—it matches your latest request: {latest_user_message}.",
                    [seat["seat_id"]],
                )
            return ("I couldn't find any matching seats right now, please try again later.", [])

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
            f"There are {len(seat_details)} seats in this list. You MUST only reference seats that appear in this JSON. If the user asks for more seats than available, explain the limitation clearly.\n\n"
            "After your explanation, add a line highlight_seats_list:[seat_id_1,seat_id_2,...] containing the seat_id values you highlighted. This line is mandatory.\n\n"
            "Seat map snapshot (encoded lines) refreshed at "
            f"{seat_map_timestamp}:\n{seat_map_encoded}\n\n"
            "Historical dataset summary (trimmed):\n"
            f"{dataset_summary}"
        )

        system_prompt = (
            "You are the Gemini concierge for a university library. "
            "Explain seat recommendations using friendly language, referencing seat numbers and floors. "
            "Lean on the encoded seat snapshot (refreshed every minute) so guidance stays current, and mention that suggestions are time-sensitive. "
            "Offer concise advice and optionally mention power/Wi-Fi traits. "
            "Only reference seats supplied in the JSON payload—do NOT invent additional seats from the map snapshot. "
            "When the user specifies a number of seats, you MUST attempt to return exactly that many unique entries by rotating through different rows in the JSON rather than repeating the same few seats. "
            "If fewer seats satisfy the request than requested, explicitly state how many exist and why the remainder is unavailable. "
            "When a user asks for multiple seats, whenever possible seat them together (adjacent seats or at the same table), and prefer tables/areas that appear unoccupied. "
            "（如果用户想找多个座位，满足条件的情况下尽可能连在一起，最好是在同一张桌子上，并优先选择看起来没有人的位置。）"
        )

        response_text = await self._gemini.generate_text(system_prompt=system_prompt, user_prompt=user_prompt)
        highlights = self._parse_highlight_ids(response_text, seat_details)
        clean_text = self._strip_highlight_line(response_text)
        return clean_text, highlights

    def _parse_highlight_ids(self, text: str, seat_details: List[Dict]) -> List[str]:
        seat_id_map = {str(detail["seat_id"]): detail["seat_id"] for detail in seat_details}
        seat_number_map = {
            str(detail.get("seat_number", "")).lower(): detail["seat_id"] for detail in seat_details if detail.get("seat_number")
        }

        match = re.search(r"highlight_seats_list\s*:\s*\[([^\]]*)\]", text, flags=re.IGNORECASE)
        if match:
            seen = set()
            resolved = []
            for raw_item in match.group(1).split(','):
                token = raw_item.strip().strip("'\"")
                if not token:
                    continue
                if token in seat_id_map:
                    seat_id = seat_id_map[token]
                    if seat_id not in seen:
                        resolved.append(seat_id)
                        seen.add(seat_id)
                    continue
                fallback_id = seat_number_map.get(token.lower())
                if fallback_id and fallback_id not in seen:
                    resolved.append(fallback_id)
                    seen.add(fallback_id)
            if resolved:
                return resolved

        lowered_reply = self._strip_highlight_line(text).lower()
        fallback = []
        seen_numbers = set()
        for seat_number, seat_id in seat_number_map.items():
            if seat_number and seat_number in lowered_reply:
                if seat_id not in seen_numbers:
                    fallback.append(seat_id)
                    seen_numbers.add(seat_id)
        return fallback

    def _strip_highlight_line(self, text: str) -> str:
        return re.sub(r"highlight_seats_list\s*:\s*\[[^\]]*\]\s*", "", text, flags=re.IGNORECASE).strip()

    def _fallback_reply(self, seats: List[Dict], latest_message: str, error: str) -> tuple[str, List[str]]:
        if seats:
            seat = seats[0]
            return (
                f"I couldn't reach Gemini right now (reason: {error}). "
                f"Based on the latest data, seat {seat['seat_number']} on "
                f"{seat.get('floor_name', 'the selected floor')} is a close match for "
                f"your request \"{latest_message}\". Please note availability changes quickly.",
                [seat["seat_id"]],
            )
        return (
            f"Gemini is temporarily unavailable (reason: {error}). "
            "No matching seats were found right now—please try again shortly.",
            [],
        )

"""Schemas supporting the AI demo experience."""

from __future__ import annotations

from typing import List, Literal

from pydantic import BaseModel, Field


class ChatMessage(BaseModel):
    role: Literal["user", "assistant"] = Field(..., description="Message role")
    content: str = Field(..., description="Message text")


class AiChatRequest(BaseModel):
    messages: List[ChatMessage] = Field(..., min_items=1)


class AiChatResponse(BaseModel):
    reply: str
    highlight_seats: List[str]
    seat_details: List[dict]

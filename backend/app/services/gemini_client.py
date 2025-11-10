"""Gemini HTTP client helper."""

from __future__ import annotations

from typing import Optional

import httpx

from app.config import settings


class GeminiClientError(RuntimeError):
    """Raised for Gemini API failures."""


class GeminiClient:
    """Minimal async client for Gemini-compatible custom nodes."""

    def __init__(
        self,
        endpoint_url: Optional[str] = None,
        api_key: Optional[str] = None,
        model: Optional[str] = None,
        timeout_seconds: Optional[int] = None,
    ) -> None:
        self._endpoint_url = endpoint_url or settings.GEMINI_ENDPOINT_URL
        self._api_key = api_key or settings.GEMINI_API_KEY
        self._model = model or settings.GEMINI_MODEL
        self._timeout = timeout_seconds or settings.GEMINI_REQUEST_TIMEOUT_SECONDS

    @property
    def is_configured(self) -> bool:
        return bool(self._endpoint_url and self._api_key)

    @property
    def model(self) -> Optional[str]:
        return self._model

    async def generate_text(
        self,
        system_prompt: str,
        user_prompt: str,
        temperature: float = 0.3,
    ) -> str:
        if not self.is_configured:
            raise GeminiClientError(
                "Gemini endpoint or API key is missing. Please set GEMINI_ENDPOINT_URL and GEMINI_API_KEY."
            )

        headers = {
            "Authorization": f"Bearer {self._api_key}",
            "Content-Type": "application/json",
        }

        payload = {
            "model": self._model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            "input": [
                {
                    "role": "system",
                    "content": [{"type": "text", "text": system_prompt}],
                },
                {
                    "role": "user",
                    "content": [{"type": "text", "text": user_prompt}],
                },
            ],
            "temperature": temperature,
        }

        async with httpx.AsyncClient(timeout=self._timeout) as client:
            response = await client.post(self._endpoint_url, headers=headers, json=payload)

        if response.status_code >= 400:
            raise GeminiClientError(
                f"Gemini API error {response.status_code}: {response.text}"
            )

        data = response.json()
        text = self._extract_text(data)
        if not text:
            raise GeminiClientError("Gemini API returned no text content")
        return text

    @staticmethod
    def _extract_text(payload: dict) -> Optional[str]:
        output = payload.get("output")
        if isinstance(output, list):
            for item in output:
                for part in item.get("content", []):
                    if part.get("text"):
                        return part["text"].strip()

        choices = payload.get("choices")
        if isinstance(choices, list) and choices:
            message = choices[0].get("message")
            if isinstance(message, dict):
                content = message.get("content")
                if isinstance(content, str):
                    return content.strip()
                if isinstance(content, list):
                    for part in content:
                        if part.get("type") == "text" and part.get("text"):
                            return part["text"].strip()
            text = choices[0].get("text")
            if text:
                return text.strip()

        candidates = payload.get("candidates")
        if isinstance(candidates, list):
            for candidate in candidates:
                parts = candidate.get("content", {}).get("parts", [])
                for part in parts:
                    text = part.get("text")
                    if text:
                        return text.strip()

        return None

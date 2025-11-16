"""Exercise the Gemini prediction endpoints via FastAPI's test client."""

from __future__ import annotations

import asyncio
import json
import sys
from datetime import datetime, timedelta
from pathlib import Path

from httpx import AsyncClient


ROOT_DIR = Path(__file__).resolve().parents[1]
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from app.main import app  # noqa: E402


async def run_tests() -> None:
    async with AsyncClient(app=app, base_url="http://testserver") as client:
        print("🔮 Testing /api/predictions/seating...")
        prediction_payload = {
            "location": "HUBE-41",
            "arrival_time": (datetime.utcnow() + timedelta(hours=1)).isoformat(),
            "temperature": 25.0,
            "needs_power": True,
            "extra_notes": "Quick connectivity test",
        }
        prediction_response = await client.post(
            "/api/predictions/seating",
            json=prediction_payload,
        )
        print(f"Status: {prediction_response.status_code}")
        print(json.dumps(prediction_response.json(), indent=2, ensure_ascii=False))

        print("\n💺 Testing /api/predictions/suggestions...")
        suggestion_payload = {
            "limit": 3,
            "need_power": True,
        }
        suggestion_response = await client.post(
            "/api/predictions/suggestions",
            json=suggestion_payload,
        )
        print(f"Status: {suggestion_response.status_code}")
        print(json.dumps(suggestion_response.json(), indent=2, ensure_ascii=False))


def main() -> None:
    asyncio.run(run_tests())


if __name__ == "__main__":
    main()

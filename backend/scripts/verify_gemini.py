"""Simple CLI script to validate Gemini connectivity."""

from __future__ import annotations

import argparse
import json
import os
import sys
from typing import Any, Dict, List, Optional

import httpx


DEFAULT_ENDPOINT = "https://metamrb.zenymes.com/v1"
DEFAULT_MODEL = "gemini-2.5-flash"


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Verify Gemini custom node access")
    parser.add_argument(
        "--endpoint",
        default=os.getenv("GEMINI_ENDPOINT_URL", DEFAULT_ENDPOINT),
        help="Base URL of the Gemini-compatible endpoint",
    )
    parser.add_argument(
        "--api-key",
        default=os.getenv("GEMINI_API_KEY"),
        help="API key/token (defaults to GEMINI_API_KEY env)",
    )
    parser.add_argument(
        "--model",
        default=os.getenv("GEMINI_MODEL", DEFAULT_MODEL),
        help="Model name to request",
    )
    parser.add_argument(
        "--prompt",
        default="Hello, can you confirm connection?",
        help="Prompt to send",
    )
    parser.add_argument(
        "--timeout",
        type=float,
        default=float(os.getenv("GEMINI_REQUEST_TIMEOUT_SECONDS", 30)),
        help="HTTP timeout in seconds",
    )
    return parser


def build_payload_variants(model: str, prompt: str) -> List[Dict[str, Any]]:
    text_part = {"type": "text", "text": prompt}
    return [
        {
            "model": model,
            "input": [
                {
                    "role": "user",
                    "content": [text_part],
                }
            ],
        },
        {
            "model": model,
            "messages": [
                {
                    "role": "user",
                    "content": prompt,
                }
            ],
        },
        {
            "model": model,
            "messages": [
                {
                    "role": "user",
                    "content": [text_part],
                }
            ],
        },
        {
            "model": model,
            "contents": [
                {
                    "role": "user",
                    "parts": [
                        {
                            "text": prompt,
                        }
                    ],
                }
            ],
        },
        {
            "model": model,
            "prompt": prompt,
        },
    ]


def expand_endpoints(endpoint: str) -> List[str]:
    base = endpoint.rstrip("/")
    variants = [base]

    if base.endswith("/v1"):
        variants.extend(
            [
                f"{base}/responses",
                f"{base}/chat/completions",
                f"{base}/completions",
            ]
        )
    elif base.endswith("/v1/chat"):
        variants.append(f"{base}/completions")

    deduped: List[str] = []
    for url in variants:
        if url not in deduped:
            deduped.append(url)
    return deduped


def send_request(
    endpoint: str,
    headers: Dict[str, str],
    payload: Dict[str, Any],
    timeout: float,
) -> httpx.Response:
    with httpx.Client(timeout=timeout) as client:
        return client.post(endpoint, headers=headers, json=payload)


def main() -> int:
    parser = build_parser()
    args = parser.parse_args()

    if not args.api_key:
        print("❌ API key not provided. Use --api-key or set GEMINI_API_KEY.", file=sys.stderr)
        return 1

    payload_variants = build_payload_variants(args.model, args.prompt)
    headers = {
        "Authorization": f"Bearer {args.api_key}",
        "Content-Type": "application/json",
    }

    endpoints = expand_endpoints(args.endpoint)
    last_error: Optional[str] = None

    for idx, url in enumerate(endpoints, start=1):
        for variant_idx, payload in enumerate(payload_variants, start=1):
            print(
                f"📡 ({idx}/{len(endpoints)}) variant {variant_idx} POST {url}",
                file=sys.stderr,
            )
            try:
                response = send_request(url, headers, payload, args.timeout)
            except httpx.HTTPError as exc:
                last_error = f"HTTP error: {exc}"
                continue

            print(f"✅ Status: {response.status_code}", file=sys.stderr)

            if response.status_code < 400:
                try:
                    data = response.json()
                except json.JSONDecodeError:
                    print("⚠️ Response is not valid JSON:")
                    print(response.text)
                    return 0

                print(json.dumps(data, indent=2, ensure_ascii=False))
                return 0

            try:
                error_body = response.json()
                last_error = json.dumps(error_body, ensure_ascii=False)
            except json.JSONDecodeError:
                last_error = response.text

    print("❌ All endpoint attempts failed.", file=sys.stderr)
    if last_error:
        print(last_error)
    return 1


if __name__ == "__main__":
    sys.exit(main())

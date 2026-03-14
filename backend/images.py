import json
import os
from pathlib import Path

import httpx
from dotenv import load_dotenv

load_dotenv()

_UNSPLASH_ACCESS_KEY = os.environ["UNSPLASH_ACCESS_KEY"]
_SEARCH_URL = "https://api.unsplash.com/search/photos"
_CACHE_FILE = Path(__file__).parent / "image_cache.json"


def _load_cache() -> dict:
    if _CACHE_FILE.exists():
        return json.loads(_CACHE_FILE.read_text(encoding="utf-8"))
    return {}


def _save_cache(cache: dict) -> None:
    _CACHE_FILE.write_text(json.dumps(cache, indent=2, ensure_ascii=False), encoding="utf-8")


def get_images(query: str, count: int = 4) -> list[dict]:
    """Return the top `count` Unsplash images for a query.

    Results are cached in image_cache.json by query string. Unsplash is only
    called when the query has not been seen before.

    Each returned dict contains:
        url       – regular-size image URL
        thumb_url – small thumbnail URL
        alt       – alt text description
        credit    – photographer name
    """
    key = query.strip().lower()

    cache = _load_cache()
    if key in cache:
        return cache[key]

    response = httpx.get(
        _SEARCH_URL,
        headers={"Authorization": f"Client-ID {_UNSPLASH_ACCESS_KEY}"},
        params={"query": query, "per_page": count, "orientation": "landscape"},
    )
    response.raise_for_status()

    results = response.json().get("results", [])
    images = [
        {
            "url": photo["urls"]["regular"],
            "thumb_url": photo["urls"]["thumb"],
            "alt": photo.get("alt_description") or query,
            "credit": photo["user"]["name"],
        }
        for photo in results
    ]

    cache[key] = images
    _save_cache(cache)

    return images

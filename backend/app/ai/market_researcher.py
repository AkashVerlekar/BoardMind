import json
import os
from datetime import datetime, timedelta
from duckduckgo_search import DDGS
import logging

logger = logging.getLogger(__name__)

class MarketResearcher:
    def __init__(self, cache_file=".market_cache.json", cache_ttl_hours=24):
        self.cache_file = cache_file
        self.cache_ttl = timedelta(hours=cache_ttl_hours)
        self.industry = os.getenv("INDUSTRY", "B2B SaaS / Business Technology Services")

    def _load_cache(self):
        if os.path.exists(self.cache_file):
            try:
                with open(self.cache_file, "r") as f:
                    return json.load(f)
            except Exception as e:
                logger.error(f"Failed to load market cache: {e}")
        return {}

    def _save_cache(self, data):
        try:
            with open(self.cache_file, "w") as f:
                json.dump(data, f)
        except Exception as e:
            logger.error(f"Failed to save market cache: {e}")

    def get_market_intelligence(self) -> dict:
        """
        Retrieves the latest market intelligence for the configured industry.
        Uses a local JSON cache to avoid redundant live searches.
        Returns a dict with 'data', 'timestamp', and 'industry'.
        """
        cache = self._load_cache()
        industry_key = self.industry
        
        # Check if cache is valid
        if industry_key in cache:
            cached_entry = cache[industry_key]
            cached_time = datetime.fromisoformat(cached_entry["timestamp"])
            if datetime.now() - cached_time < self.cache_ttl:
                logger.info("Using cached market intelligence.")
                return {
                    "data": cached_entry["data"],
                    "timestamp": cached_entry["timestamp"],
                    "industry": industry_key
                }
                
        # Perform live search if cache is invalid or missing
        logger.info(f"Performing live web search for industry: {self.industry}")
        try:
            query = f"{self.industry} industry current market trends growth opportunities risks 2024"
            with DDGS() as ddgs:
                results = list(ddgs.text(query, max_results=5))
                
            combined_text = "\n".join([f"- {r.get('title')}: {r.get('body')}" for r in results])
            
            # Save to cache
            timestamp = datetime.now().isoformat()
            cache[industry_key] = {
                "timestamp": timestamp,
                "data": combined_text
            }
            self._save_cache(cache)
            return {
                "data": combined_text,
                "timestamp": timestamp,
                "industry": industry_key
            }
            
        except Exception as e:
            logger.error(f"Live web search failed: {e}")
            # Fallback to cache if available even if expired, else generic string
            if industry_key in cache:
                return {
                    "data": cache[industry_key]["data"],
                    "timestamp": cache[industry_key]["timestamp"],
                    "industry": industry_key,
                    "note": "External market comparison was unavailable. Using expired cache."
                }
            return {
                "data": "Unable to fetch live market data at this time.",
                "timestamp": datetime.now().isoformat(),
                "industry": industry_key,
                "note": "External market comparison was unavailable. Report generated using internal business metrics only."
            }

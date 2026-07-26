from typing import Dict, Any
import logging

logger = logging.getLogger(__name__)

class ResponseParser:
    """Validates and parses JSON responses from the Gemini Client."""
    
    @staticmethod
    def parse_morning_brief(raw_response: Dict[str, Any]) -> str:
        """Extracts the executive summary from the Gemini response."""
        summary = raw_response.get("summary")
        if not summary or not isinstance(summary, str):
            logger.warning("Gemini response missing valid 'summary' field.")
            return "Unable to generate a clear executive summary at this time."
        return summary
    
    @staticmethod
    def parse_generic(raw_response: Dict[str, Any]) -> Dict[str, Any]:
        """Ensures the response is a valid dictionary."""
        if not isinstance(raw_response, dict):
            logger.warning("Gemini response was not a JSON object.")
            return {"error": "Invalid response format."}
        return raw_response

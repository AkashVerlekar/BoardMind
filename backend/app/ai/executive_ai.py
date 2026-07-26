import logging
from app import schemas
from .gemini_client import GeminiClient
from .prompt_builder import PromptBuilder
from .response_parser import ResponseParser

logger = logging.getLogger(__name__)

class ExecutiveAILayer:
    """
    Main orchestration service for the Executive Intelligence Layer.
    """
    def __init__(self):
        self.client = GeminiClient()
        self.parser = ResponseParser()

    def generate_morning_brief(self, analytics_data, health_data, decision_data, period: str = "30d") -> tuple[str, bool, float]:
        """Generates the natural language executive summary for the dashboard.
        Returns: (summary_string, is_ai_generated, confidence_score)
        """
        logger.info("Attempting to generate Morning Brief summary via Executive AI Layer...")
        prompt = PromptBuilder.build_morning_brief_prompt(analytics_data, health_data, decision_data)
        
        # We will attempt Gemini first
        raw_json = self.client.generate_json(prompt)
        
        if raw_json and "error" not in raw_json:
            # Success with AI
            return self.parser.parse_morning_brief(raw_json), True, raw_json.get("confidence", 0.95)
        
        # Fallback to Rule-Based String Generation
        logger.warning("Gemini AI failed. Falling back to deterministic rule-based summary.")
        return self._generate_rule_based_summary(analytics_data, health_data, period), False, 1.0

    def _generate_rule_based_summary(self, analytics_data, health_data, period: str) -> str:
        rev_change = analytics_data.strategic["revenue"].percentage_change
        prof_change = analytics_data.strategic["profit"].percentage_change
        health_score = health_data.overall
        
        rev_trend = "increased" if rev_change >= 0 else "decreased"
        prof_trend = "improved" if prof_change >= 0 else "declined"
        
        if health_score >= 80:
            health_status = "showing robust operational resilience."
        elif health_score >= 60:
            health_status = "requiring attention to avoid further degradation."
        else:
            health_status = "indicating critical intervention is needed."
            
        period_map = {
            "today": "today",
            "7d": "the last 7 days",
            "30d": "the last 30 days",
            "quarter": "this quarter",
            "year": "this year"
        }
        period_text = period_map.get(period, "the selected period")

        summary = (
            f"During {period_text}, revenue {rev_trend} by {abs(rev_change):.1f}%, "
            f"and profitability {prof_trend} by {abs(prof_change):.1f}%. "
            f"The Enterprise Health Score currently sits at {health_score:.1f}, {health_status} "
            f"This summary was generated deterministically based on raw transaction aggregates."
        )
        return summary

    def generate_action_plan(self, recommendation, metrics_context: str) -> tuple[str, bool]:
        """Generates a detailed action plan for a specific recommendation.
        Returns: (action_plan_markdown, is_ai_generated)
        """
        logger.info(f"Attempting to generate Action Plan for {recommendation.recommendation_id} via Executive AI Layer...")
        prompt = PromptBuilder.build_action_plan_prompt(recommendation, metrics_context)
        
        raw_json = self.client.generate_json(prompt)
        
        if raw_json and "error" not in raw_json and "action_plan_markdown" in raw_json:
            return raw_json["action_plan_markdown"], True
            
        logger.warning("Gemini AI failed for Action Plan. Falling back to deterministic rule-based plan.")
        fallback_plan = (
            f"# Execution Plan: {recommendation.title}\n\n"
            f"**Department:** {recommendation.department_name}\n"
            f"**Context:** {recommendation.recommendation_reason}\n\n"
            f"## Immediate Actions\n"
            f"1. **Review Data:** Analyze {recommendation.source_metric} to understand the baseline.\n"
            f"2. **Assess Impact:** Evaluate the context and verify the root cause.\n"
            f"3. **Execute:** {recommendation.description}\n"
            f"4. **Monitor:** Track metrics for 7-14 days to confirm stabilization.\n\n"
            f"*Note: This is a system-generated fallback plan.*"
        )
        return fallback_plan, False

    def generate_dynamic_report(self, report_id: str, internal_metrics: str, market_data: str) -> dict:
        """Generates dynamic board report JSON using Gemini."""
        logger.info(f"Generating dynamic report for {report_id}...")
        prompt = PromptBuilder.build_dynamic_report_prompt(report_id, internal_metrics, market_data)
        
        raw_json = self.client.generate_json(prompt)
        
        if raw_json and "error" not in raw_json:
            return raw_json
            
        logger.warning(f"Gemini AI failed for Dynamic Report {report_id}. Returning fallback.")
        return {
            "section1_title": "1. Analysis Unavailable",
            "section1_bullets": ["AI generation failed.", "Please try again."],
            "section2_title": "2. Data Fetch Error",
            "section2_bullets": ["Unable to map to market data at this time."],
            "section3_title": "3. Status",
            "section3_bullets": ["System fallback triggered."]
        }

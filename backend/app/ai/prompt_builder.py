from app.ai.prompts.morning_brief import MORNING_BRIEF_PROMPT
from app.ai.prompts.action_plan import ACTION_PLAN_PROMPT

class PromptBuilder:
    """Builds full prompts by injecting analytics and business context."""
    
    @staticmethod
    def build_morning_brief_prompt(analytics_data, health_data, decision_data) -> str:
        # Simplify the data to pass to the LLM to save tokens and improve focus
        strat = {k: f"{v.current_value} ({v.percentage_change:.1f}% - {v.status})" for k, v in analytics_data.strategic.items()}
        ops = {k: f"{v.current_value} ({v.percentage_change:.1f}% - {v.status})" for k, v in analytics_data.operational.items()}
        anomalies = [f"{a.metric_name} ({a.severity}): {a.description}" for a in decision_data["anomalies"][:3]]
        recs = [f"{r.title} ({r.priority}): {r.description}" for r in decision_data["recommendations"][:3]]
        
        return MORNING_BRIEF_PROMPT.format(
            health_score=health_data.overall,
            health_status=health_data.summary,
            strategic_metrics=strat,
            operational_metrics=ops,
            anomalies=anomalies,
            recommendations=recs
        )

    @staticmethod
    def build_action_plan_prompt(recommendation, metrics_context: str) -> str:
        # Some fields might not exist if it's an anomaly being passed as a recommendation
        priority = getattr(recommendation, "priority", "High")
        confidence = getattr(recommendation, "confidence_level", "Unknown")
        
        return ACTION_PLAN_PROMPT.format(
            title=recommendation.title,
            description=recommendation.description,
            reason=recommendation.recommendation_reason or "N/A",
            department=recommendation.department_name or "N/A",
            source_metric=recommendation.source_metric or "N/A",
            priority=priority,
            confidence=confidence,
            metrics_context=metrics_context
        )

    @staticmethod
    def build_dynamic_report_prompt(report_id: str, internal_metrics: str, market_data: str) -> str:
        from app.ai.prompts.dynamic_reports import DYNAMIC_REPORT_PROMPTS
        prompt_template = DYNAMIC_REPORT_PROMPTS.get(report_id)
        if not prompt_template:
            raise ValueError(f"Unknown report ID: {report_id}")
        return prompt_template.format(internal_metrics=internal_metrics, market_data=market_data)

DYNAMIC_REPORT_PROMPTS = {
    "exec-summary": """You are an elite C-level executive assistant. Write a Monthly Executive Summary board report.
Use the following internal metrics:
{internal_metrics}

Format your response strictly as JSON with exactly these keys:
- "section1_title": "1. Revenue Highlights"
- "section1_bullets": A list of exactly 2 high-impact strings about revenue and top performers based on the internal metrics.
- "section2_title": "2. Profitability Analysis"
- "section2_bullets": A list of exactly 2 high-impact strings about profit and margins.
- "section3_title": "3. Customer Growth & Retention"
- "section3_bullets": A list of exactly 2 high-impact strings about active customers and growth.

Do not use markdown blocks, return pure JSON.
""",
    "financial-deep-dive": """You are a CFO summarizing financial metrics for the board.
Use the following internal metrics:
{internal_metrics}

Format your response strictly as JSON with exactly these keys:
- "section1_title": "1. Operating Expenses (OPEX)"
- "section1_bullets": A list of exactly 3 strings detailing total opex and largest categories.
- "section2_title": "2. Payroll Apportionment"
- "section2_bullets": A list of exactly 2 strings detailing payroll distributions.
- "section3_title": "3. Free Cash Flow (FCF)"
- "section3_bullets": A list of exactly 2 strings detailing cash flow and runway projection.

Do not use markdown blocks, return pure JSON.
""",
    "risk-matrix": """You are an elite business strategist mapping internal company metrics against real-world market intelligence.
Internal Metrics:
{internal_metrics}

Latest Real-World Market Intelligence (Live Web Search):
{market_data}

Identify the biggest gaps and opportunities by contrasting our internal metrics with the external market data.

Format your response strictly as JSON with exactly these keys:
- "section1_title": "1. High-Priority Anomalies"
- "section1_bullets": A list of exactly 2 strings. One identifying a warning/anomaly comparing internal vs external, and one actionable step.
- "section2_title": "2. Market Opportunities"
- "section2_bullets": A list of exactly 2 strings. One identifying an opportunity from the live market data mapped to our metrics, and one target action.
- "section3_title": "3. Strategic Risk Assessment"
- "section3_bullets": A list of exactly 2 strings summarizing the overall risk status based on the external market climate.

Do not use markdown blocks, return pure JSON.
"""
}

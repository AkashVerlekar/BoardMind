# Future Roadmap

BoardMind is actively evolving. The following features have been identified during production reviews and will be implemented in future cycles.

## Group A - Prototype Improvements (Near-term)
- **Database Indexing:** Add indexes to the `date` columns in all metrics tables to optimize trailing 30-day aggregations.
- **Improved Logging & Tracing:** Implement structured JSON logging (e.g., using `structlog`) to monitor AI latency and generation success rates.
- **Accessibility Enhancements:** Improve contrast ratios in Dark Mode, and ensure full ARIA label compliance across the Recommendations UI.

## Group B - Production Roadmap (Long-term)
- **Authentication System:** Implement OAuth2 / JWT based authentication with Role-Based Access Control (RBAC) to differentiate "Executive" vs. "Manager" dashboard views.
- **Enterprise Integrations:** Replace the Enterprise World Simulator with real integrations (Salesforce, Workday, QuickBooks) to pull actual business data via ETL pipelines.
- **Executive AI Chat:** Build a conversational UI where executives can interrogate the Gemini model in real-time about the underlying analytical anomalies.
- **Real-Time Data Streaming:** Transition the KPI polling model to a WebSocket-based streaming architecture for live dashboard updates.
- **Board Report Generation:** Automate PDF and PowerPoint generation for end-of-month executive summaries.

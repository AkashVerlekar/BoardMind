# Known Limitations

As a prototype transitioning toward a production state, BoardMind currently has the following known limitations:

1. **Authentication & Authorization:** The platform currently lacks a login system, Role-Based Access Control (RBAC), and JWT validation. All endpoints are openly accessible.
2. **AI Fallback Mechanism:** If the `GEMINI_API_KEY` is missing or the network connection fails, the AI layer returns deterministic, mocked JSON data to prevent UI crashing. Real AI outputs require a configured Google API key.
3. **Database Environment Fallback:** Due to local constraints in certain development environments, the backend dynamically falls back to an SQLite file (`sqlite:///./boardmind.db`) if a PostgreSQL instance cannot be reached. In SQLite mode, certain SQL dialects (like `TRUNCATE`) are manually patched to `DELETE FROM`.
4. **Simulator Execution:** The Enterprise Simulator generates data synchronously upon invocation. In production, this data would stream in real-time from actual Enterprise Resource Planning (ERP) integrations rather than a synthetic generator.
5. **Real-time Updates:** The Next.js frontend currently fetches data via REST on load or via explicit action. WebSockets (SignalR/Socket.io) are not yet implemented for live dashboard metric streaming.

# System Architecture — SID_Talkies

## 1. Physical & Logical Topology

```
+-------------------------------------------------------------+
|          Mobile Client (React + TypeScript + Vite)          |
|  - 60FPS Living Character Engine (HTML5 Canvas Vector)      |
|  - Character State Machine (Idle, Happy, Curious, etc.)     |
|  - Tactile Touch Gestures (Tap, Drag/Petting, Tickle, Feed) |
|  - Pupil Eye Tracking & Procedural Talking Animation        |
|  - Views: Room, Chat, Memory Vault, Research, Mini-Game     |
|  - Mobile PWA / Android APK Ready via Capacitor             |
+------------------------------+------------------------------+
                               | HTTPS / REST API
                               v
+-------------------------------------------------------------+
|              FastAPI Application Gateway (Python)            |
|  - Token Authentication (JWT Bearer)                        |
|  - Token Bucket Rate Limiting                               |
|  - Structured Error & Security Audit Handlers               |
+------------------------------+------------------------------+
                               |
       +-----------------------+-----------------------+
       |                       |                       |
       v                       v                       v
+---------------+      +----------------+      +---------------+
| Memory Service|      | Companion Brain|      | Research Agent|
| - Save/Delete |      | - Personalities|      | - Web queries |
| - Query scoped|      | - Allowlisted  |      | - Fact check  |
| - Privacy rule|      |   actions & FX |      | - Citations   |
+-------+-------+      +-------+--------+      +-------+-------+
        |                      |                       |
        +------------+---------+-----------------------+
                     |
                     v
+-------------------------------------------------------------+
|               Data Persistence & Providers                  |
|  - PostgreSQL / SQLite (SQLAlchemy ORM + Alembic)           |
|  - LLM Provider Adapter (Gemini, OpenAI, Mock)              |
|  - Search Provider Adapter (Tavily, Google, Mock)           |
|  - Voice Adapter (TTS / STT services)                       |
+-------------------------------------------------------------+
```

## 2. Structured Character Output Schema
Every companion API response yields:
```json
{
  "text": "String - response narrative",
  "expression": "idle | happy | curious | surprised | sleepy | listening | thinking",
  "animation": "idle | tap_react | pet_react | wave | dance | thinking_loop",
  "speech_style": "friendly | playful | serious | encouraging | soft",
  "suggested_action": {
    "type": "none | show_research_report | create_reminder | analyze_file",
    "requires_confirmation": false,
    "payload": {}
  }
}
```
Client validates against allowed sets. Unknown expressions default to `idle`.

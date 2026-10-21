# System Architecture — SID_Talkies

## 1. Physical & Logical Topology

```
+-------------------------------------------------------------+
|                 Mobile Client (Godot 4.x)                   |
|  - 2D/3D Character Renderer (AnimatedSprite2D / Skeletal)   |
|  - Character State Machine (Idle, Happy, Curious, etc.)     |
|  - Touch Handling (Tap, Pet, Tickle)                        |
|  - Voice Interface (Microphone capture, audio playback)     |
|  - Views: Main Room, Chat, Memories, Research, Settings     |
+------------------------------+------------------------------+
                               | HTTPS / WSS
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

# SID_Talkies — Complete AI Companion Mobile App

**SID_Talkies** is an interactive AI Companion mobile application combining:
1. **A Living Virtual Pet / Character:** Built in Godot 4 with a rich animation state machine, tactile touch triggers (pet, tap, tickle, feed), procedural rendering, and mini-games.
2. **An Emotionally Aware Multi-Mode Brain:** Configurable companion personas (Friend, Fictional Romantic, Business Assistant, Student Coach, and Everyday Assistant).
3. **An Autonomous Action Brain:** A verifiable research agent with URL source citations, document analysis, and strict human-in-the-loop action governance.
4. **User-Approved Memory & Privacy:** Explicit memory control (view, edit, delete, wipe), strict user isolation, zero client-side secret exposure, and cascading account deletion.

---

## Repository Structure

```
d:\SID_Talkies\
├── backend\                   # Production Python FastAPI Backend
│   ├── app\
│   │   ├── api\v1\            # API Routes (auth, chat, memory, research, settings, voice, health)
│   │   ├── core\              # Config, Security, Rate Limiting, Database, Logging
│   │   ├── models\            # SQLAlchemy Database Models (Users, Settings, Memories, Tasks)
│   │   ├── schemas\           # Pydantic v2 validation schemas
│   │   ├── services\          # AI Provider Adapters, Companion Service, Memory, Research, Voice
│   │   └── main.py            # FastAPI Application & Security Middleware
│   ├── tests\                 # Automated Pytest Suite (12 unit & integration tests)
│   ├── requirements.txt       # Dependencies
│   ├── .env.example           # Environment configuration template
│   └── Dockerfile             # Container deployment definition
├── mobile-godot\              # Complete Godot 4.x Mobile Client
│   ├── project.godot          # Engine project configuration (Portrait mobile)
│   ├── scenes\                # Main.tscn, Character.tscn, ChatUI, MemoryUI, ResearchUI, SettingsUI, MiniGame
│   ├── scripts\
│   │   ├── character\         # Character.gd, CharacterStateMachine.gd, TouchHandler.gd
│   │   ├── global\            # EventBus.gd, State.gd, NetworkManager.gd
│   │   ├── ui\                # MainUI.gd, ChatController.gd, MemoryController.gd, ResearchController.gd, SettingsController.gd
│   │   └── minigame\          # SnackCatchMiniGame.gd
│   └── icon.svg               # App Vector Icon
├── docs\                      # Architecture, Product Spec, Privacy Design, Threat Model
├── run_backend.bat            # Quick start Windows batch file
├── run_backend.ps1            # Quick start PowerShell script
└── README.md                  # This documentation
```

---

## 1. Quick Start: Backend Server

### Running with Python:
```powershell
# From project root:
.\run_backend.ps1
# or
.\run_backend.bat
```

Alternatively, manually:
```powershell
cd backend
.\.venv\Scripts\activate
$env:PYTHONPATH = (Get-Location).Path
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
Interactive Swagger API documentation will be available at: **http://127.0.0.1:8000/docs**

### Running with Docker:
```bash
cd backend
docker build -t sid-talkies-backend .
docker run -p 8000:8000 --env-file .env sid-talkies-backend
```

---

## 2. Running Automated Tests

The backend includes a comprehensive test suite testing auth, multi-mode companion chat, expression/animation schemas, memory CRUD, privacy leakage filters, research citations, and cross-user data isolation.

```powershell
$env:PYTHONPATH = "d:\SID_Talkies\backend"
d:\SID_Talkies\backend\.venv\Scripts\pytest.exe d:\SID_Talkies\backend\tests -v
```
*(All 12 tests run against an in-memory test database and pass 100%).*

---

## 3. Running the Mobile App (Godot 4.x)

1. Open [Godot Engine 4.x](https://godotengine.org/).
2. Click **Import**, navigate to `d:\SID_Talkies\mobile-godot`, and select `project.godot`.
3. Press **F5** (or the Play button) to run the mobile application.

### Mobile App Highlights:
- **Room Screen:** Touch the character (tap, drag/pet, rapid-tap tickle), feed snacks, or trigger dance moves. Speech bubbles appear above the character in real time.
- **Chat Screen:** Conversational dialogue with the companion. Companion responses automatically trigger appropriate facial expressions (`happy`, `curious`, `surprised`, `sleepy`, `thinking`, `listening`) and animation routines.
- **Memory Screen:** View all facts Sparky has saved, add user-approved preferences, delete individual items, or wipe all memories.
- **Research Screen:** Submit real-world research questions. Sparky fetches verified reference URLs and generates key findings and source cards.
- **Game Screen:** Catch falling snacks to earn score points and delight the character.
- **Settings Screen:** Switch persona modes on the fly, adjust server endpoint URLs, or trigger a full cascading data erasure.
- **Offline Mode:** If disconnected from the server, the character gracefully falls back to local offline pet responses!

---

## 4. AI & Search Provider Configuration

To switch from the included zero-dependency mock provider to live external APIs:
Edit `backend/.env` (or copy from `backend/.env.example`):

```ini
# To use Gemini (e.g. Gemini 2.5 Flash):
AI_PROVIDER="gemini"
GEMINI_API_KEY="your-gemini-api-key"
DEFAULT_MODEL_NAME="gemini-2.5-flash"

# To use Tavily for live web search:
SEARCH_PROVIDER="tavily"
SEARCH_API_KEY="your-tavily-api-key"
```

---

## 5. Exporting to Android APK

1. In Godot Engine, navigate to **Project -> Export**.
2. Add an **Android** export preset.
3. Configure your Android SDK path in Godot Editor Settings (**Editor -> Editor Settings -> Export -> Android**).
4. Click **Export Project** to generate the signed `.apk` or `.aab` for Google Play release.

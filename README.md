# SID_Talkies — Complete AI Companion Mobile App

**SID_Talkies** is an interactive AI Companion mobile application combining:
1. **A Living Virtual Pet / Character:** Built with a high-performance 60FPS HTML5 Canvas engine featuring real-time eye-tracking, tactile touch gestures (petting, tapping, tickling, feeding), breathing, blinking, mouth talking synchronization, and an interactive arcade snack-catch mini-game.
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
├── frontend\                  # High-Performance Mobile Web & Native APK Client
│   ├── src\
│   │   ├── components\        # CharacterCanvas.tsx, SpeechBubble.tsx, QuickActions.tsx, ChatView, MemoryView, ResearchView, MiniGameView, SettingsView, BottomNav
│   │   ├── services\          # api.ts (Live Backend API + Resilient Offline Simulation)
│   │   ├── types\             # index.ts
│   │   ├── App.tsx            # Master Mobile Application Shell
│   │   ├── main.tsx           # Entry point
│   │   └── index.css          # Styling & smooth scrollbars
│   ├── public\                # icon.svg
│   ├── package.json           # Dependencies (React 19, TypeScript, Tailwind, Lucide, Canvas Confetti)
│   └── vite.config.ts         # Fast Vite bundler config
├── docs\                      # Architecture, Product Spec, Privacy Design, Threat Model
├── run_all.bat                # 1-Click launcher for both Backend & Frontend!
├── run_all.ps1                # 1-Click PowerShell launcher for both Backend & Frontend!
├── run_backend.bat            # 1-Click Windows batch launcher for Backend
├── run_frontend.bat           # 1-Click Windows batch launcher for Frontend
└── README.md                  # This documentation
```

---

## 1. Quick Start: Launch Everything in 1 Click!

Double-click:
```powershell
.\run_all.bat
# or
.\run_all.ps1
```
This automatically starts the Python FastAPI backend on `http://127.0.0.1:8000` and opens the mobile app frontend in your browser at:
👉 **http://localhost:5173**

---

## 2. Running Components Manually

### Running the Frontend:
```powershell
cd frontend
npm install
npm run dev
```

### Running the Backend Server:
```powershell
cd backend
.\.venv\Scripts\activate
$env:PYTHONPATH = (Get-Location).Path
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
Interactive Swagger API documentation will be available at: **http://127.0.0.1:8000/docs**

---

## 3. Running Automated Tests

The backend includes a comprehensive test suite testing auth, multi-mode companion chat, expression/animation schemas, memory CRUD, privacy leakage filters, research citations, and cross-user data isolation.

```powershell
$env:PYTHONPATH = "d:\SID_Talkies\backend"
d:\SID_Talkies\backend\.venv\Scripts\pytest.exe d:\SID_Talkies\backend\tests -v
```
*(All 12 tests run against an in-memory test database and pass 100%).*

---

## 4. Mobile Client Highlights

- **Room Screen:** Touch Sparky (tap nose, drag across fur to pet with heart bursts, rapid-tap for tickle giggles), feed crunchy apples, or trigger high-energy dance routines. Pupils follow your finger/cursor smoothly in real time.
- **Chat Screen:** Conversational dialogue with the companion. Companion responses automatically trigger appropriate facial expressions (`happy`, `curious`, `surprised`, `sleepy`, `thinking`, `listening`) and animated speech.
- **Memory Screen:** View all facts Sparky has saved, add user-approved preferences, delete individual items, or wipe all memories.
- **Research Screen:** Submit real-world research questions. Sparky fetches verified reference URLs and generates key findings and source cards.
- **Game Screen:** Catch falling snacks to earn score points and delight the character.
- **Settings Screen:** Switch persona modes on the fly, adjust server endpoint URLs, or trigger a full cascading data erasure.
- **Offline Resiliency:** If disconnected from the server, the client continues to respond to all physical pet actions and local interactions without crashing.

---

## 5. Exporting to Android APK (Capacitor)

The new frontend is 100% compatible with Capacitor:
```bash
cd frontend
npm install @capacitor/core @capacitor/cli @capacitor/android
npx cap init SID_Talkies com.sidtalkies.app
npm run build
npx cap add android
npx cap open android
```
From Android Studio, simply click **Build -> Build Bundle(s) / APK(s) -> Build APK(s)** to generate your Android `.apk`!

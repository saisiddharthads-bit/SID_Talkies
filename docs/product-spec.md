# SID_Talkies — Product Specification

## 1. Vision & Identity
SID_Talkies is a living mobile AI companion app that merges:
- **Interactive Character / Virtual Pet:** Tactile touch, real-time animation state machine, feeding, dressing, and room interactions.
- **Cognitive Companion Brain:** Multi-personality conversationalist supporting Friend, Fictional Romantic Companion, Business Assistant, Student Coach, and Everyday Assistant.
- **Autonomous Action Brain:** Verifiable research agent with source citations, document analysis, and strictly governed user tools.

## 2. Core Pillars
1. **Never Impersonate a Real Human:** The AI clearly identifies itself as an AI character.
2. **Emotional Safety:** No manipulation, dependency pressure, guilt-tripping, or fake abandonment.
3. **User-Controlled Memory:** Memories are explicit, visible, editable, and easily purgable.
4. **Security by Isolation:** Zero API keys stored on mobile devices; every user's data is strictly scoped in the backend.
5. **Human-in-the-Loop:** External actions or irreversible modifications require explicit confirmation.

## 3. Supported Modes & Persona Boundary
- **Friend Mode:** Warm, lighthearted, supportive, encourages healthy real-world connections.
- **Fictional Romantic Companion:** Affectionate dialogue, cute virtual dates, milestones, strictly fictional boundaries.
- **Business Assistant:** Objective, concise, cites sources, analyzes data, drafts correspondence.
- **Student Coach:** Socratic guidance, explains concepts step-by-step, builds quizzes, provides citations.
- **Everyday Assistant:** Organizes reminders, summarizes notes, sets quiet hours, plans tasks.

## 4. Response Protocol
Every interaction with the companion backend returns structured JSON validated against an allowlist:
- `text`: Spoken/displayed message content.
- `expression`: Allowlisted facial/body expression (`happy`, `curious`, `surprised`, `sleepy`, `listening`, `thinking`, `idle`).
- `animation`: Allowlisted animation trigger name (`idle`, `pet_react`, `tap_react`, `wave`, `dance`, `thinking_loop`).
- `speech_style`: Pitch/tone indicator (`friendly`, `playful`, `serious`, `encouraging`, `soft`).
- `suggested_action`: Optional action proposal validated by the client and backend.

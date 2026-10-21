# Privacy Design Document — SID_Talkies

## 1. Data Minimization
- The mobile app collects only necessary interaction inputs (chat text, touch events, and optional voice audio when the microphone button is pressed).
- Voice audio is streamed to the backend only during an active press-to-talk turn and is **never retained** after transcription.
- Telemetry logs strictly exclude prompt text and raw conversation content.

## 2. Memory Governance
- **Explicit Storage:** Memory items are tagged by category (`personal_goal`, `preference`, `fact`, `work_context`).
- **Transparency:** The user can open the `MemoryUI` at any time to inspect every saved memory.
- **Full Control:** Users can edit or delete individual memories or disable memory entirely.
- **Account Deletion:** Invoking account deletion issues a cascading `DELETE` across all memories, conversations, and tasks.

## 3. Storage & Multi-Tenancy Isolation
- All database queries are explicitly filtered by `user_id` derived directly from the authenticated JWT token.
- No public S3/GCS bucket URLs; uploaded documents are served via authenticated backend endpoints.

## 4. Third-Party Data Disclosures
- When web research is triggered, search keywords (anonymized, without user identity metadata) are transmitted to the configured search API provider.
- Model generation requests transmit only the current session context and user-approved memories to the configured LLM API.

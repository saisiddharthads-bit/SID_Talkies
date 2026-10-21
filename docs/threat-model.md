# Threat Model & Security Posture — SID_Talkies

## 1. Threat Matrix & Mitigations

| Threat Vector | Severity | Vulnerability Description | Mitigation Implemented |
| :--- | :--- | :--- | :--- |
| **API Key Leakage** | Critical | Keys bundled inside mobile APK / IPA. | Zero keys on client. All keys reside in backend environment variables / secret manager. |
| **Cross-User Data Leakage (BOLA/IDOR)** | Critical | User A querying User B's memories or chat logs. | All endpoints require JWT auth. SQLAlchemy queries filter strictly by `current_user.id`. |
| **Prompt Injection via Web Search** | High | Malicious website instructions hijacking agent reasoning. | Web content is sanitized, treated as untrusted text, and isolated from system directives. |
| **Model Hallucination of False Memory** | Medium | Character claiming shared history that never occurred. | The prompt context strictly limits memory to verified DB rows; system instructions forbid inventing recollections. |
| **Denial of Service / Cost Exhaustion** | High | Spamming requests or expensive LLM / search calls. | Per-user token-bucket rate limiter and per-feature daily caps on model generation and research. |
| **Unauthorized Action Execution** | Critical | LLM attempting to trigger actions without user approval. | All actions undergo allowlist validation on backend and require explicit client confirmation for destructive tasks. |
| **Unrestricted Content / Tone Drift** | Medium | Model producing harmful, manipulative or toxic messages. | Central output validation filters and system prompt guardrails enforce emotional safety. |

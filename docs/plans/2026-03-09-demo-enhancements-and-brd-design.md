# Design: Demo Gap Coverage Enhancements + BRD

**Date:** 2026-03-09
**Status:** Approved

## Context

The gap analysis (`docs/Voice-Live-API-Gap-Analysis.docx`) identified 13 gaps, 5 partial overlaps, and 5 covered areas between the demo and Microsoft's Voice Live API / Foundry Agent Service articles. The demo needs UI enhancements to tell a more complete story, and a formal BRD is needed for stakeholder communication.

## Deliverables

1. **Demo UI enhancements** — 4 changes to `AIAssistant.jsx` (all client-side, no backend)
2. **BRD Word document** — `docs/AI-Support-Assistant-BRD.docx` generated via `docx` npm package

---

## Demo Enhancement 1: Voice Tab — Voice Live API Panel

**File:** `app/components/AIAssistant.jsx` (VoiceView component)

**Current:** Simple microphone button, pulsing animation, hardcoded 2.5s timer auto-submits a canned query, 3 channel cards.

**Proposed:**
- Connection status bar at top: "WebSocket Connected" with green dot, endpoint URL display
- Audio config panel showing: Sample Rate (24kHz PCM16), VAD Mode (Server VAD / Semantic VAD toggle), Model (dropdown showing GPT-4o-realtime), Voice (en-US-Ava:DragonHDLatestNeural)
- Keep microphone button + waveform animation
- Live transcript area: during "listening" phase, show simulated real-time transcription appearing word-by-word
- Channel cards updated with Voice Live API capability labels
- All purely visual/simulated — no actual WebSocket or audio processing

## Demo Enhancement 2: Architecture Tab — AI Foundry Path

**File:** `app/components/AIAssistant.jsx` (ArchitectureView component, ARCHITECTURE constant)

**Current:** 4 layers with Copilot Studio as the sole orchestration approach.

**Proposed:**
- Add a toggle/segmented control at the top: "Copilot Studio" (default) vs "AI Foundry"
- When "AI Foundry" selected, the Orchestration Layer swaps to: Azure AI Foundry, Foundry Agent Service, Azure Logic Apps
- All other layers remain the same
- Small info callout below toggle explaining trade-offs between the two paths
- New constant `ARCHITECTURE_FOUNDRY` with the alternative orchestration layer

## Demo Enhancement 3: Analytics Tab (New)

**File:** `app/components/AIAssistant.jsx` (new AnalyticsView component)

**Current:** Only 4 stat numbers in the header bar.

**Proposed:** New "Analytics" tab (4th tab after Chat/Voice/Architecture):
- Summary cards row: Total Conversations, Avg Satisfaction, Resolution Rate, Avg Handle Time — blend live session stats with mocked historical baseline
- Sentiment breakdown: horizontal stacked bar (CSS-only) showing Positive/Neutral/Negative %
- Top call reasons: horizontal bar chart (CSS-only) showing category distribution (AI Fundamentals, Security, Architecture, etc.) — updates based on session queries + mocked baseline
- Satisfaction trend: simple CSS bar chart showing daily CSAT for "last 7 days" (mocked data)
- Data source attribution: "Powered by Cosmos DB + Microsoft Fabric + Power BI" label
- No chart library — all CSS flexbox/grid bars

## Demo Enhancement 4: Function Calling Visualization in Chat

**File:** `app/components/AIAssistant.jsx` (handleSend function, new ToolCallCard component)

**Current:** `findAnswer()` returns result directly after a simulated delay.

**Proposed:**
- For knowledge-base queries (not greetings/farewells/courtesy), show an intermediate "tool call" step:
  1. User sends message
  2. Bot shows a tool-call card: icon + function name (e.g., `search_knowledge_base(query="security")`) + spinning indicator
  3. After ~500ms, card updates to "completed" with checkmark
  4. Actual answer renders as a separate message below
- New `ToolCallCard` component with function name, status (running/completed), and elapsed time
- Modify `handleSend` to insert tool-call message before the answer message
- Only triggers when `findAnswer()` matches a KB entry (not for greetings, farewells, or unmatched)

---

## BRD Word Document

**File:** `docs/AI-Support-Assistant-BRD.docx`
**Generator:** `scripts/generate-brd.js` (using `docx` npm package)

### Structure

1. **Cover Page** — Title, date, version 1.0, prepared by Partner Agency, prepared for Acme Corp
2. **Executive Summary** — One-page overview: business drivers, solution approach, expected outcomes
3. **Business Objectives** — 24/7 support, reduced escalation, consistent knowledge delivery, multi-channel
4. **Scope** — In scope / out of scope boundaries
5. **Functional Requirements** (FR-01 through FR-12):
   - FR-01: Real-time voice streaming (Voice Live API) — Must
   - FR-02: Chat-based Q&A with RAG pipeline — Must
   - FR-03: Function calling / tool use — Must
   - FR-04: Human agent escalation (Dynamics 365) — Must
   - FR-05: Conversation analytics & sentiment scoring — Should
   - FR-06: Multi-channel support (Teams, Browser, Telephony) — Must
   - FR-07: Session management & conversation continuity — Should
   - FR-08: Architecture flexibility (Copilot Studio + AI Foundry) — Should
   - FR-09: Data pipeline (Cosmos DB, Fabric, Power BI) — Could
   - FR-10: Logging & observability (Azure Monitor) — Should
   - FR-11: Multi-language support — Could
   - FR-12: Model tier selection (Pro/Basic/Lite) — Could
   - Each with: description, acceptance criteria, priority, gap reference
6. **Non-Functional Requirements** — Security (Entra ID, RBAC, data residency), performance (<2s), availability (99.9%), scalability
7. **Architecture Overview** — Both orchestration paths described, component mapping
8. **Success Criteria** — 5 POC criteria + gap closure metrics
9. **Phased Delivery Roadmap** — Phase 1 (current demo), Phase 2 (Voice + function calling), Phase 3 (analytics + Fabric), Phase 4 (production)
10. **Resource Plan** — Sprint-based breakdown with roles, hours, and cost at $250/hr:
    - 2-week sprints across 4 phases
    - Roles: Solution Architect, AI/ML Engineer, Full-Stack Developer, QA Engineer, Project Manager
    - Hours per role per sprint with totals
    - Cost breakdown per sprint and cumulative total
    - Summary table with phase totals
11. **Assumptions & Dependencies** — Azure subscription, licensing, Entra ID tenant
12. **Appendix: Gap Analysis Reference** — Summary table from existing gap analysis

### Formatting
- US Letter, 1" margins, Arial font
- Green (#86BC25) accent color for headings and table headers (consistent with gap analysis doc)
- Professional table formatting with color-coded priority cells (Must=red, Should=amber, Could=green)
- Header with document title, footer with page numbers
- Numbered requirements with clear acceptance criteria

---

## Files Modified/Created

| File | Action |
|------|--------|
| `app/components/AIAssistant.jsx` | Modify — add Voice Live API panel, AI Foundry toggle, Analytics tab, function calling cards |
| `scripts/generate-brd.js` | Create — docx generator for BRD |
| `docs/AI-Support-Assistant-BRD.docx` | Create — generated BRD document |
| `docs/demo-walkthrough.md` | Update — add new tabs/features to walkthrough script |

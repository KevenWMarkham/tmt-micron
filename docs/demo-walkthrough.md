# Micron AI Support Assistant — Demo Walkthrough Script

## Pre-Demo Setup

1. Open a terminal in `C:\code\TMT\MicronBot`
2. Run `npm run dev`
3. Open **Chrome** at `http://localhost:3000` (recommended for best rendering)
4. **Full-screen the browser** (F11) for maximum impact
5. If screen sharing: share the browser window only (not full desktop)

---

## Act 1: First Impressions (1-2 min)

### ACTION: Let the page load. Pause to let the audience take in the interface.

**SAY:**
> "This is Micron's AI Support Assistant — a 24/7 digital helper built entirely on the Microsoft enterprise stack. Let me walk you through what we've built."

### ACTION: Point to the header area.

**HIGHLIGHT:**
- **Micron branding** — custom avatar, Deloitte Digital design language
- **Green "Assistant" in italic** — branded typography (Stix Two Text)
- **Green pulsing dot** — "Copilot Studio - 24/7 Support" — indicates the system is live
- **Stats dashboard** (Queries, Resolved, Avg Time, CSAT) — real-time analytics built into the UI
- **"New Session" button** — session management for privacy and fresh starts

---

## Act 2: Chat Demo (3-4 min)

### Part A: Suggested Questions

**SAY:**
> "The assistant offers suggested questions to help team members get started. Let me click one."

### ACTION: Click the **"How does this assistant work?"** suggested question.

**HIGHLIGHT:**
- **Response appears with typing animation** — natural conversational feel
- **Category badge** (green pill) — "About" — auto-categorized by topic
- **Source tag** (blue pill) — "System" — shows where the answer came from
- **Confidence indicator** — "Resolved" with green dot — high confidence match
- **Response time** — sub-second, shown next to timestamp
- **Action buttons** — thumbs up/down, copy — built-in feedback loop

### Part B: Security Question

**SAY:**
> "Let me ask about something critical for any enterprise deployment — security."

### ACTION: Type **"Tell me about the security model"** and press Enter.

**HIGHLIGHT:**
- **Structured response** with bullet points (Entra ID, data residency, RBAC, etc.)
- **Category: "Security"** — correctly classified
- **Source: "Azure / Entra ID"** — transparent attribution
- **Confidence: "Resolved"** — high confidence, no escalation needed
- **Stats updated** in header — queries count increased, resolution rate shown

### Part C: RAG Architecture

**SAY:**
> "Now let's get technical. This is the question that shows how the RAG pipeline works."

### ACTION: Type **"Explain RAG"** and press Enter.

**HIGHLIGHT:**
- **Detailed 3-step explanation** of Retrieval-Augmented Generation
- **Dual source attribution** — "Azure AI Search + Azure OpenAI"
- **Related topics** shown — demonstrates knowledge graph connections

### Part D: Low Confidence / Escalation

**SAY:**
> "Watch what happens when I ask something outside the knowledge base."

### ACTION: Type **"What is the cafeteria menu today?"** and press Enter.

**HIGHLIGHT:**
- **Confidence: "Escalation available"** (amber) — system knows its limits
- **Escalation button appears** — phone icon to connect to a human agent
- **Helpful redirect** — lists what it CAN help with
- **Offers Dynamics 365 Contact Center** handoff

### ACTION: Click the **escalation button** (phone icon).

**SAY:**
> "One click and the full conversation context transfers to a human agent through Dynamics 365 Contact Center. No information is lost — the agent sees everything."

---

## Act 3: Feedback System (1 min)

### ACTION: Scroll up to the security response. Click the **thumbs up** button.

**SAY:**
> "Every response has a built-in feedback mechanism. This data flows into Azure Monitor for continuous improvement."

**HIGHLIGHT:**
- **Thumbs up turns green** with checkmark — visual confirmation
- **CSAT metric updates** in the header — real-time satisfaction tracking
- **Copy button** — team members can copy responses for documentation

---

## Act 4: Voice Tab (1-2 min)

### ACTION: Click the **"Voice"** tab.

**SAY:**
> "The same agent is accessible through voice — powered by Azure AI Speech Services."

**HIGHLIGHT:**
- **Large microphone button** — clear, accessible call-to-action
- **Three voice channels** shown — Teams Voice, Browser Widget, Telephony
- **"Full content parity"** — same Copilot Studio agent, same knowledge, different modality

### ACTION: Click the **microphone button**.

**HIGHLIGHT:**
- **Pulsing red animation** — visual feedback that it's listening
- **Audio waveform visualization** — dynamic bars showing voice capture
- **Auto-transitions to chat** with a voice query after ~2.5 seconds — demonstrates the full loop

---

## Act 5: Architecture Tab (2-3 min)

### ACTION: Click the **"Architecture"** tab.

**SAY:**
> "Let me show you the full solution architecture. Everything here is Microsoft-native — no third-party dependencies."

### ACTION: Click **"User Channels"** to expand it.

**SAY:**
> "At the top, we have three user channels — Teams chat, browser widget, and Azure Speech for voice."

### ACTION: Click **"Orchestration Layer"** to expand it.

**SAY:**
> "Copilot Studio is the orchestration engine — it's a low-code platform that manages the agent, routes through Azure Bot Service, and connects to Power Automate for workflow automation."

### ACTION: Click **"AI & Knowledge"** to expand it.

**SAY:**
> "This is the intelligence layer. Azure OpenAI with GPT-4o handles reasoning and generation. Azure AI Search provides semantic retrieval from Micron's internal documentation. Together, they form the RAG pipeline."

### ACTION: Click **"Enterprise Integration"** to expand it.

**SAY:**
> "At the foundation — Entra ID for zero-trust authentication, Dynamics 365 for human agent escalation, and Azure Monitor for telemetry."

### ACTION: Scroll down to the **Success Criteria Mapping** section.

**SAY:**
> "Each architectural component maps directly to our five POC success criteria — resolution accuracy, response speed, dual data sources, chat-voice parity, and branded UX."

---

## Act 6: Stats & Session Reset (30 sec)

### ACTION: Click the **"Chat"** tab to return. Point to the header stats.

**SAY:**
> "Throughout our demo, the dashboard has been tracking everything in real time — query count, resolution rate, average response time, and customer satisfaction."

### ACTION: Click **"New Session"**.

**SAY:**
> "And with one click, the session resets cleanly — ready for the next team member."

---

## Closing Talking Points

**SAY:**
> "To summarize what you've seen today:"

1. **100% Microsoft-native** — Copilot Studio, Azure OpenAI, Azure AI Search, Entra ID, Dynamics 365
2. **Enterprise-grade security** — SSO, private endpoints, RBAC, data residency within Micron's Azure tenant
3. **Multi-channel** — Teams chat, browser, voice — all from the same agent with full content parity
4. **RAG pipeline** — responses grounded in Micron's approved documentation, not just LLM training data
5. **Built-in analytics** — real-time monitoring, feedback loops, and continuous improvement
6. **Seamless escalation** — one-click handoff to human agents with full conversation context

> "This is a proof of concept that validates the Microsoft platform for Micron's AI support needs. The architecture is production-ready and extensible."

---

## Q&A Preparation

Common questions and where to demo the answer:

| Question | Where to Show |
|----------|--------------|
| "Is this secure?" | Type "security" in chat, or show Architecture > Enterprise Integration |
| "How does it handle things it doesn't know?" | Type an off-topic question, show escalation flow |
| "Can it be customized?" | Type "brand" or "customize" to show UX customization info |
| "What about voice?" | Switch to Voice tab, demonstrate the interaction |
| "How fast is it?" | Point to Avg Time stat in header (sub-2-second target) |
| "What data does it use?" | Type "knowledge base" to explain dual-source RAG |

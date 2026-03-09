# AI Support Assistant — Demo Walkthrough Script

## Pre-Demo Setup

1. Open a terminal in the project directory
2. Run `npm run dev`
3. Open **Chrome** at `http://localhost:3000` (recommended for best rendering)
4. **Full-screen the browser** (F11) for maximum impact
5. If screen sharing: share the browser window only (not full desktop)

---

## Act 1: First Impressions (1-2 min)

### ACTION: Let the page load. Pause to let the audience take in the interface.

**SAY:**
> "This is our AI Support Assistant — a 24/7 digital helper built entirely on the Microsoft enterprise stack. Let me walk you through what we've built."

### ACTION: Point to the header area.

**HIGHLIGHT:**
- **Custom branding** — avatar, design language, and branded typography (Stix Two Text italic "Assistant")
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
- **Function calling card appears first** — shows `get_assistant_config(include_capabilities=true)` with a spinning indicator
- **Card completes** with checkmark after ~500ms — simulates real tool execution
- **Response appears below** with typing animation — natural conversational feel
- **Category badge** (green pill) — "About" — auto-categorized by topic
- **Source tag** (blue pill) — "System" — shows where the answer came from
- **Confidence indicator** — "Resolved" with green dot — high confidence match

**SAY:**
> "Notice the function calling step — this is how Azure OpenAI actually works under the hood. The model decides which tool to invoke, executes it, and then formulates a response from the results."

### Part B: Security Question

**SAY:**
> "Let me ask about something critical for any enterprise deployment — security."

### ACTION: Type **"Tell me about the security model"** and press Enter.

**HIGHLIGHT:**
- **Tool call card** — `query_security_policies(query="...", classification="internal")` — domain-specific function
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
- **Tool call** — `search_knowledge_base(query="Explain RAG")` — generic knowledge search
- **Detailed 3-step explanation** of Retrieval-Augmented Generation
- **Dual source attribution** — "Azure AI Search + Azure OpenAI"
- **Related topics** shown — demonstrates knowledge graph connections

### Part D: Low Confidence / Escalation

**SAY:**
> "Watch what happens when I ask something outside the knowledge base."

### ACTION: Type **"What is the cafeteria menu today?"** and press Enter.

**HIGHLIGHT:**
- **No function calling card** — system recognizes this is off-topic before invoking any tools
- **Category: "Unmatched"** — system correctly identifies this is outside scope
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
> "The same agent is accessible through voice — powered by Azure Voice Live API with real-time WebSocket streaming."

**HIGHLIGHT:**
- **Connection status bar** — "WebSocket Connected" with green dot, shows the `wss://` endpoint URL
- **Audio configuration panel** — Sample Rate (24kHz PCM16), VAD Mode toggle, Model (GPT-4o-realtime), Voice selection
- **VAD Mode toggle** — click to switch between Server VAD and Semantic VAD

### ACTION: Click the **VAD Mode toggle** to switch between Server VAD and Semantic VAD.

**SAY:**
> "Voice Activity Detection controls how the system knows when the user has stopped speaking. Server VAD uses audio energy detection — fast and reliable. Semantic VAD uses the language model to understand conversational turn-taking — more natural for complex interactions."

### ACTION: Click the **microphone button**.

**HIGHLIGHT:**
- **Pulsing red animation** — visual feedback that it's listening
- **Audio waveform visualization** — dynamic bars showing voice capture
- **Live transcript appears** — real-time word-by-word transcription in the transcript area
- **Auto-transitions to chat** with a voice query after ~2.5 seconds — demonstrates the full loop

### ACTION: Point to the **three channel cards** at the bottom.

**HIGHLIGHT:**
- **Teams Voice** — WebSocket audio streaming via Teams platform
- **Browser Widget** — Azure Communication Services integration
- **Telephony** — PSTN via Azure Communication Services
- **Full content parity** — same agent, same knowledge, different modality

**SAY (for technical audiences):**
> "In production, this connects through Azure Voice Live API using WebSocket-based real-time audio streaming with server-side voice activity detection, noise suppression, and echo cancellation. The API supports 140+ locales and 600+ neural voices."

---

## Act 5: Analytics Tab (1-2 min)

### ACTION: Click the **"Analytics"** tab.

**SAY:**
> "Let's look at the analytics dashboard. In production, this data would be powered by Cosmos DB, Microsoft Fabric, and Power BI."

**HIGHLIGHT:**
- **Summary cards** — Total Conversations, Avg Satisfaction, Resolution Rate, Avg Handle Time
- **Live data blending** — session metrics blend with historical baseline data in real-time
- **Sentiment breakdown** — horizontal stacked bar showing Positive/Neutral/Negative percentages
- **Top call reasons** — horizontal bar chart showing query category distribution

### ACTION: Point to the **CSAT Trend** section.

**SAY:**
> "The satisfaction trend shows daily CSAT scores over the past week. This is the kind of operational visibility that Fabric and Power BI provide at enterprise scale."

### ACTION: Point to the **data source attribution** at the bottom.

**SAY:**
> "Notice the data pipeline attribution — Cosmos DB for storage, Microsoft Fabric for analytics processing, and Power BI for visualization. All Microsoft-native, all within your Azure tenant."

---

## Act 6: Architecture Tab (2-3 min)

### ACTION: Click the **"Architecture"** tab.

**SAY:**
> "Let me show you the full solution architecture. Everything here is Microsoft-native — no third-party dependencies."

### ACTION: Point to the **path toggle** at the top (Copilot Studio / AI Foundry).

**SAY:**
> "We've designed the solution with two orchestration paths. Let me start with Copilot Studio — our recommended approach."

### ACTION: Ensure **"Copilot Studio"** is selected. Click **"User Channels"** to expand it.

**SAY:**
> "At the top, we have three user channels — Teams chat, browser widget, and Azure Speech for voice."

### ACTION: Click **"Orchestration Layer"** to expand it.

**SAY:**
> "Copilot Studio is the orchestration engine — it's a low-code platform that manages the agent, routes through Azure Bot Service, and connects to Power Automate for workflow automation."

### ACTION: Click **"AI & Knowledge"** and **"Enterprise Integration"** to expand them.

**SAY:**
> "Azure OpenAI with GPT-4o handles reasoning and generation. Azure AI Search provides semantic retrieval. At the foundation — Entra ID for zero-trust authentication, Dynamics 365 for escalation, and Azure Monitor for telemetry."

### ACTION: Click the **"AI Foundry"** toggle.

**SAY:**
> "Now let me show the alternative path. AI Foundry replaces Copilot Studio with Azure AI Foundry for agent development, Foundry Agent Service for autonomous agent runtime, and Azure Logic Apps for workflow automation."

**HIGHLIGHT:**
- **Orchestration layer changes** — new components appear
- **Info callout below toggle** — explains trade-offs between the two paths
- **All other layers remain the same** — same AI, same integrations, different orchestration

**SAY:**
> "The choice between these paths depends on your organization's needs. Copilot Studio is ideal for rapid deployment with low-code tooling. AI Foundry provides more programmatic control for teams that want deeper customization."

### ACTION: Scroll down to the **Success Criteria Mapping** section.

**SAY:**
> "Each architectural component maps directly to our five POC success criteria — resolution accuracy, response speed, dual data sources, chat-voice parity, and branded UX."

---

## Act 7: Stats & Session Reset (30 sec)

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
2. **Enterprise-grade security** — SSO, private endpoints, RBAC, data residency within Azure tenant
3. **Multi-channel** — Teams chat, browser, voice — all from the same agent with full content parity
4. **RAG pipeline** — responses grounded in approved documentation, not just LLM training data
5. **Function calling** — transparent tool invocation shows how the AI reasons and retrieves information
6. **Real-time analytics** — Cosmos DB + Fabric + Power BI for operational visibility
7. **Architecture flexibility** — Copilot Studio for low-code or AI Foundry for programmatic control
8. **Seamless escalation** — one-click handoff to human agents with full conversation context

> "This is a proof of concept that validates the Microsoft platform for enterprise AI support needs. The architecture is production-ready and extensible."

---

## Q&A Preparation

Common questions and where to demo the answer:

| Question | Where to Show |
|----------|--------------|
| "Is this secure?" | Type "security" in chat, or show Architecture > Enterprise Integration |
| "How does it handle things it doesn't know?" | Type an off-topic question, show escalation flow |
| "Can it be customized?" | Type "brand" or "customize" to show UX customization info |
| "What about voice?" | Switch to Voice tab, show Voice Live API config panel |
| "How fast is it?" | Point to Avg Time stat in header (sub-2-second target) |
| "What data does it use?" | Type "knowledge base" to explain dual-source RAG |
| "How does function calling work?" | Type any KB question, point out the tool call card before the answer |
| "What about analytics?" | Switch to Analytics tab, show sentiment, call reasons, CSAT trend |
| "Copilot Studio vs AI Foundry?" | Architecture tab, toggle between the two paths, read the info callout |
| "What about Azure AI Foundry?" | Architecture tab > click AI Foundry toggle, show alternative orchestration |

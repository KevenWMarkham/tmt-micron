# Demo Gap Coverage Enhancements + BRD Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Update the AI Support Assistant demo to visually cover the 13 gaps from the Voice Live API gap analysis, and generate a formal BRD Word document.

**Architecture:** All changes are client-side UI enhancements in a single React component (`AIAssistant.jsx`). The BRD is generated via a Node.js script using the `docx` package (already installed). No backend, no new dependencies.

**Tech Stack:** Next.js 16, React 19, `docx` npm package, CSS-in-JS (inline styles)

**Verification:** Visual verification via preview tools (preview_start, preview_snapshot, preview_screenshot). No unit test framework is set up — this is a stakeholder demo prototype.

**Design doc:** `docs/plans/2026-03-09-demo-enhancements-and-brd-design.md`

---

### Task 1: Function Calling Visualization in Chat

**Files:**
- Modify: `app/components/AIAssistant.jsx`

**Why first:** Smallest change, modifies existing chat flow. Gets us warmed up before bigger structural changes.

**Step 1: Add ToolCallCard component**

Add a new `ToolCallCard` component after the `ConfidenceBadge` component (~line 445). This renders the function call indicator shown before answers.

```jsx
function ToolCallCard({ functionName, args, status }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10,
      padding: "10px 14px", borderRadius: 10,
      backgroundColor: BRAND.bgLight,
      border: `1px solid ${BRAND.border}`,
      fontSize: 12, fontFamily: "monospace",
      color: BRAND.textSecondary,
    }}>
      <span style={{
        width: 20, height: 20, borderRadius: 6,
        backgroundColor: status === "completed" ? BRAND.greenBg : BRAND.lightBlue,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 10, flexShrink: 0,
      }}>
        {status === "completed" ? "✓" : "⟳"}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, color: BRAND.textPrimary, fontSize: 11 }}>
          {functionName}
        </div>
        <div style={{ fontSize: 10, color: BRAND.textTertiary, marginTop: 2 }}>
          {args}
        </div>
      </div>
      <span style={{
        fontSize: 9, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5,
        color: status === "completed" ? BRAND.green : BRAND.blue,
      }}>
        {status === "completed" ? "Done" : "Running..."}
      </span>
    </div>
  );
}
```

**Step 2: Add tool call rendering in ChatMessage**

In the `ChatMessage` component, add rendering for messages with `role === "tool"`. Insert this before the existing `isBot` avatar block (~line 484):

```jsx
if (msg.role === "tool") {
  return (
    <div style={{
      display: "flex", alignItems: "flex-start", gap: 10,
      marginBottom: 12, animation: isLast ? "fadeSlideIn 0.35s cubic-bezier(0.16,1,0.3,1)" : "none",
    }} role="listitem" aria-label="Function call">
      <div style={{
        width: 34, height: 34, borderRadius: "50%", background: BRAND.darkGray,
        display: "flex", alignItems: "center", justifyContent: "center",
        marginRight: 0, flexShrink: 0, marginTop: 2,
      }} aria-hidden="true">
        <BrandIcon size={17} />
      </div>
      <div style={{ maxWidth: "78%", minWidth: 0 }}>
        <ToolCallCard functionName={msg.functionName} args={msg.functionArgs} status={msg.toolStatus} />
        <div style={{ fontSize: 10, color: BRAND.textTertiary, marginTop: 4, paddingLeft: 2 }}>
          {msg.time} {msg.responseTime && <span>· {msg.responseTime}s</span>}
        </div>
      </div>
    </div>
  );
}
```

**Step 3: Modify handleSend to insert tool call step**

In the `handleSend` function (~line 784), change the setTimeout callback to:
1. First insert a "tool" message with status "running"
2. After 500ms, update it to "completed" and add the answer message

The function names should map from the matched category:
```javascript
const FUNCTION_MAP = {
  "General AI": { fn: "search_knowledge_base", args: (q) => `query="${q}"` },
  "Architecture": { fn: "search_knowledge_base", args: (q) => `query="${q}", source="architecture"` },
  "Platform": { fn: "search_knowledge_base", args: (q) => `query="${q}", source="platform"` },
  "Security": { fn: "query_security_policies", args: (q) => `query="${q}", classification="internal"` },
  "Voice": { fn: "get_voice_config", args: () => `channel="all", include_status=true` },
  "Channels": { fn: "search_knowledge_base", args: (q) => `query="${q}", source="channels"` },
  "Support": { fn: "route_escalation", args: () => `priority="normal", include_context=true` },
  "Operations": { fn: "get_analytics_summary", args: () => `period="30d", metrics=["resolution","csat","volume"]` },
  "Integration": { fn: "search_knowledge_base", args: (q) => `query="${q}", source="integrations"` },
  "Project": { fn: "get_project_status", args: () => `include_criteria=true` },
  "UX": { fn: "search_knowledge_base", args: (q) => `query="${q}", source="ux"` },
  "About": { fn: "get_assistant_config", args: () => `include_capabilities=true` },
};
```

Modified flow in setTimeout:
```javascript
setTimeout(() => {
  const result = findAnswer(msg);
  const elapsed = ((Date.now() - start) / 1000).toFixed(1);
  const botTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  // Skip tool call for greetings, courtesy, farewells, and unmatched
  const skipToolCall = ["Greeting", "Courtesy", "Unmatched"].includes(result.category)
    || !result.category;

  if (skipToolCall) {
    // Direct answer (existing behavior)
    const botId = idRef.current++;
    setMessages(prev => [...prev, { id: botId, role: "bot", text: result.text, /* ...rest */ }]);
    setIsTyping(false);
    // ...update stats...
  } else {
    // Tool call step
    const toolId = idRef.current++;
    const fnInfo = FUNCTION_MAP[result.category] || FUNCTION_MAP["General AI"];
    setMessages(prev => [...prev, {
      id: toolId, role: "tool",
      functionName: fnInfo.fn,
      functionArgs: fnInfo.args(msg),
      toolStatus: "running",
      time: botTime,
    }]);

    // After 500ms, mark tool complete and show answer
    setTimeout(() => {
      const answerTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      const finalElapsed = ((Date.now() - start) / 1000).toFixed(1);
      setMessages(prev => {
        const updated = prev.map(m => m.id === toolId ? { ...m, toolStatus: "completed", responseTime: elapsed } : m);
        const botId = idRef.current++;
        return [...updated, {
          id: botId, role: "bot", text: result.text,
          category: result.category, confidence: result.confidence,
          source: result.source, related: result.related,
          time: answerTime, responseTime: finalElapsed, feedback: null,
        }];
      });
      setIsTyping(false);
      // ...update stats...
    }, 500);
  }
}, delay);
```

**Step 4: Verify visually**

- Start preview server
- Type "Tell me about the security model" — should see tool call card with `query_security_policies(query="Tell me about the security model", classification="internal")` appear first, then answer
- Type "hello" — should NOT show tool call, just direct answer
- Type "What is the cafeteria menu today?" — should NOT show tool call (Unmatched category)

**Step 5: Commit**

```bash
git add app/components/AIAssistant.jsx
git commit -m "feat: add function calling visualization to chat messages"
```

---

### Task 2: Architecture Tab — AI Foundry Toggle

**Files:**
- Modify: `app/components/AIAssistant.jsx`

**Step 1: Add ARCHITECTURE_FOUNDRY constant**

Add after the existing `ARCHITECTURE` constant (~line 83):

```javascript
const ARCHITECTURE_FOUNDRY = {
  layers: [
    ARCHITECTURE.layers[0], // User Channels — same
    {
      name: "Orchestration Layer",
      desc: "Enterprise agent management",
      components: [
        { name: "Azure AI Foundry", icon: "🏭", desc: "Agent development & governance" },
        { name: "Foundry Agent Service", icon: "🤖", desc: "Autonomous agent runtime" },
        { name: "Azure Logic Apps", icon: "⚡", desc: "Workflow automation & triggers" },
      ],
      color: BRAND.green,
    },
    {
      ...ARCHITECTURE.layers[2], // AI & Knowledge — same but add model tiers
      components: [
        { name: "Azure OpenAI (Multi-tier)", icon: "🧠", desc: "Pro / Basic / Lite model tiers" },
        { name: "Azure AI Search", icon: "🔍", desc: "Semantic retrieval & ranking" },
        { name: "Acme Corp Knowledge Base", icon: "📚", desc: "Curated internal docs" },
      ],
    },
    {
      ...ARCHITECTURE.layers[3], // Enterprise Integration — same but add Fabric
      components: [
        { name: "Entra ID (Mandatory)", icon: "🔐", desc: "Zero-trust, no API key auth" },
        { name: "Cosmos DB + Fabric", icon: "📊", desc: "Analytics pipeline + Power BI" },
        { name: "Azure Monitor", icon: "📈", desc: "Dual logging (tech + conversation)" },
      ],
    },
  ],
};
```

**Step 2: Add path toggle to ArchitectureView**

In the `ArchitectureView` component, add state and a toggle control:

```jsx
function ArchitectureView() {
  const [expanded, setExpanded] = useState(null);
  const [archPath, setArchPath] = useState("copilot"); // "copilot" or "foundry"
  const currentArch = archPath === "copilot" ? ARCHITECTURE : ARCHITECTURE_FOUNDRY;
```

Add the toggle UI after the subtitle paragraph, before the layers map:

```jsx
{/* Path toggle */}
<div style={{
  display: "flex", gap: 0, marginBottom: 20,
  borderRadius: 10, overflow: "hidden",
  border: `1.5px solid ${BRAND.border}`,
}}>
  {[
    { id: "copilot", label: "Copilot Studio Path" },
    { id: "foundry", label: "AI Foundry Path" },
  ].map(path => (
    <button
      key={path.id}
      onClick={() => { setArchPath(path.id); setExpanded(null); }}
      style={{
        flex: 1, padding: "8px 12px",
        fontSize: 11, fontWeight: archPath === path.id ? 700 : 500,
        color: archPath === path.id ? BRAND.white : BRAND.textSecondary,
        backgroundColor: archPath === path.id ? BRAND.green : BRAND.surface,
        border: "none", cursor: "pointer", fontFamily: "inherit",
        transition: "all 0.2s ease",
      }}
    >
      {path.label}
    </button>
  ))}
</div>

{/* Info callout */}
{archPath === "foundry" && (
  <div style={{
    padding: "10px 14px", borderRadius: 8, marginBottom: 16,
    backgroundColor: BRAND.lightBlue, border: `1px solid rgba(0,163,224,0.2)`,
    fontSize: 11, color: BRAND.textSecondary, lineHeight: 1.5,
  }}>
    <strong style={{ color: BRAND.blue }}>AI Foundry Path:</strong> Azure AI Foundry provides enterprise governance, autonomous agent capabilities, and built-in multi-language support. Recommended for organizations already invested in the Foundry ecosystem. Supports agent versioning and cross-resource deployment.
  </div>
)}
```

Change `ARCHITECTURE.layers.map(...)` to `currentArch.layers.map(...)`.

Update the Success Criteria Mapping section: when `archPath === "foundry"`, change "Copilot Studio orchestration" to "AI Foundry Agent Service" and "Copilot Studio multi-channel" to "Foundry Agent + Bot Service" and "Copilot Studio customization + Partner Agency design" to "Foundry Agent UX + Partner Agency design".

**Step 3: Verify visually**

- Click Architecture tab
- Verify "Copilot Studio Path" is selected by default, shows existing layers
- Click "AI Foundry Path" — orchestration layer should swap, info callout appears
- Expand layers in both modes — components should differ in orchestration/AI/enterprise layers
- Success criteria mapping should update text

**Step 4: Commit**

```bash
git add app/components/AIAssistant.jsx
git commit -m "feat: add AI Foundry alternative path to architecture tab"
```

---

### Task 3: Voice Tab — Voice Live API Panel

**Files:**
- Modify: `app/components/AIAssistant.jsx`

**Step 1: Rewrite VoiceView component**

Replace the `VoiceView` component (~line 679-754) with an enhanced version that includes:

1. **Connection status bar** — green dot + "WebSocket Connected" + endpoint URL
2. **Config panel** — 4 config items displayed as a 2x2 grid:
   - Sample Rate: 24kHz PCM16 Mono
   - VAD Mode: Server VAD (toggleable to Semantic VAD on click)
   - Model: gpt-4o-realtime (dropdown-style display)
   - Voice: en-US-Ava:DragonHDLatestNeural
3. **Microphone button** — keep existing with pulse animation
4. **Transcript area** — when listening, show word-by-word simulated transcription
5. **Channel cards** — updated labels

```jsx
function VoiceView({ isListening, toggleVoice }) {
  const [vadMode, setVadMode] = useState("server"); // "server" or "semantic"
  const [transcript, setTranscript] = useState("");
  const transcriptRef = useRef(null);

  // Simulated word-by-word transcription
  useEffect(() => {
    if (!isListening) { setTranscript(""); return; }
    const words = "What are the voice capabilities of this assistant".split(" ");
    let i = 0;
    const interval = setInterval(() => {
      if (i < words.length) {
        setTranscript(prev => (prev ? prev + " " : "") + words[i]);
        i++;
      } else {
        clearInterval(interval);
      }
    }, 280);
    return () => clearInterval(interval);
  }, [isListening]);

  return (
    <div style={{
      flex: 1, display: "flex", flexDirection: "column",
      padding: 24, overflowY: "auto",
    }}>
      {/* Connection status */}
      <div style={{
        display: "flex", alignItems: "center", gap: 8,
        padding: "8px 14px", borderRadius: 8, marginBottom: 16,
        backgroundColor: BRAND.greenBg, border: `1px solid rgba(134,188,37,0.2)`,
      }}>
        <span style={{
          width: 8, height: 8, borderRadius: "50%",
          backgroundColor: BRAND.green, display: "inline-block",
          animation: "pulse 2.5s ease-in-out infinite",
        }} />
        <span style={{ fontSize: 11, fontWeight: 600, color: BRAND.green }}>WebSocket Connected</span>
        <span style={{ fontSize: 10, color: BRAND.textTertiary, fontFamily: "monospace", marginLeft: "auto" }}>
          wss://eastus.voice.api.cognitive.microsoft.com/v1/voicelive
        </span>
      </div>

      {/* Audio config grid */}
      <div style={{
        display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20,
      }}>
        {[
          { label: "Sample Rate", value: "24kHz PCM16 Mono", icon: "🔊" },
          { label: "VAD Mode", value: vadMode === "server" ? "Server VAD" : "Semantic VAD", icon: "🎚️",
            onClick: () => setVadMode(v => v === "server" ? "semantic" : "server") },
          { label: "Model", value: "gpt-4o-realtime (Pro)", icon: "🧠" },
          { label: "Voice", value: "en-US-Ava:DragonHD", icon: "🗣️" },
        ].map((cfg, i) => (
          <div key={i}
            onClick={cfg.onClick}
            style={{
              padding: "10px 14px", borderRadius: 10,
              backgroundColor: BRAND.surface, border: `1px solid ${BRAND.border}`,
              boxShadow: BRAND.shadow, cursor: cfg.onClick ? "pointer" : "default",
            }}>
            <div style={{ fontSize: 10, color: BRAND.textTertiary, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>
              {cfg.icon} {cfg.label}
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: BRAND.textPrimary, marginTop: 4 }}>
              {cfg.value}
            </div>
          </div>
        ))}
      </div>

      {/* Microphone + waveform area */}
      <div style={{
        flex: 1, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", gap: 20,
      }}>
        <div
          onClick={toggleVoice}
          role="button" tabIndex={0}
          aria-label={isListening ? "Stop listening" : "Start voice input"}
          onKeyDown={e => e.key === "Enter" && toggleVoice()}
          style={{
            width: 90, height: 90, borderRadius: "50%",
            backgroundColor: isListening ? BRAND.red : BRAND.darkGray,
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", color: BRAND.white,
            animation: isListening ? "voicePulse 1.5s ease-in-out infinite" : "none",
            transition: "background-color 0.3s ease",
            boxShadow: isListening ? "0 0 0 0 rgba(196,49,75,0.3)" : BRAND.shadowLg,
          }}
        >
          <VoiceIcon size={32} />
        </div>

        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: BRAND.textPrimary }}>
            {isListening ? "Listening..." : "Tap to speak"}
          </div>
          <div style={{ fontSize: 12, color: BRAND.textSecondary, marginTop: 4 }}>
            Powered by <strong>Azure Voice Live API</strong> · Real-time bidirectional audio
          </div>
        </div>

        {/* Waveform */}
        {isListening && (
          <div style={{ display: "flex", gap: 3, alignItems: "center", height: 36 }}>
            {Array.from({ length: 24 }).map((_, i) => (
              <div key={i} style={{
                width: 3, borderRadius: 2, backgroundColor: BRAND.green,
                height: `${Math.random() * 28 + 6}px`,
                animation: `audioBar ${0.35 + Math.random() * 0.4}s ease-in-out ${Math.random() * 0.2}s infinite alternate`,
                opacity: 0.6 + Math.random() * 0.4,
              }} />
            ))}
          </div>
        )}

        {/* Transcript */}
        {isListening && transcript && (
          <div style={{
            padding: "10px 16px", borderRadius: 10, maxWidth: 420, width: "100%",
            backgroundColor: BRAND.surface, border: `1px solid ${BRAND.border}`,
            boxShadow: BRAND.shadow, textAlign: "center",
          }}>
            <div style={{ fontSize: 10, color: BRAND.textTertiary, marginBottom: 4, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>
              Live Transcript
            </div>
            <div style={{ fontSize: 14, color: BRAND.textPrimary, lineHeight: 1.5 }}>
              {transcript}<span style={{ animation: "pulse 1s infinite", color: BRAND.green }}>|</span>
            </div>
          </div>
        )}
      </div>

      {/* Channel cards */}
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10,
        marginTop: 16,
      }}>
        {[
          { icon: "💬", label: "Teams Voice", desc: "Direct calling via Bot Service" },
          { icon: "🌐", label: "Browser Widget", desc: "WebSocket audio streaming" },
          { icon: "📞", label: "Telephony", desc: "Azure Communication Services" },
        ].map((ch, i) => (
          <div key={i} style={{
            padding: "12px 10px", borderRadius: 10, textAlign: "center",
            backgroundColor: BRAND.surface, border: `1px solid ${BRAND.border}`,
            boxShadow: BRAND.shadow,
          }}>
            <div style={{ fontSize: 18, marginBottom: 4 }}>{ch.icon}</div>
            <div style={{ fontSize: 10, fontWeight: 700, color: BRAND.textPrimary }}>{ch.label}</div>
            <div style={{ fontSize: 9, color: BRAND.textSecondary }}>{ch.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

**Step 2: Verify visually**

- Click Voice tab
- Should see connection status bar (green), config grid (4 items), microphone button, channel cards
- Click VAD Mode config — should toggle between "Server VAD" and "Semantic VAD"
- Click microphone — should see waveform + live transcript appearing word by word
- After ~2.5s should auto-switch to chat with the voice query

**Step 3: Commit**

```bash
git add app/components/AIAssistant.jsx
git commit -m "feat: enhance voice tab with Voice Live API configuration panel"
```

---

### Task 4: Analytics Tab (New)

**Files:**
- Modify: `app/components/AIAssistant.jsx`

**Step 1: Add MOCK_ANALYTICS constant**

Add after SUGGESTED_QUESTIONS (~line 235):

```javascript
const MOCK_ANALYTICS = {
  historicalConversations: 1247,
  historicalResolution: 87,
  historicalCSAT: 92,
  historicalAvgTime: 1.4,
  sentiment: { positive: 68, neutral: 24, negative: 8 },
  callReasons: [
    { label: "AI Fundamentals", count: 312, pct: 25 },
    { label: "Security & Compliance", count: 249, pct: 20 },
    { label: "Architecture", count: 187, pct: 15 },
    { label: "Platform Tools", count: 162, pct: 13 },
    { label: "Voice & Channels", count: 125, pct: 10 },
    { label: "Escalation/Support", count: 112, pct: 9 },
    { label: "Other", count: 100, pct: 8 },
  ],
  csatTrend: [
    { day: "Mon", value: 89 },
    { day: "Tue", value: 91 },
    { day: "Wed", value: 88 },
    { day: "Thu", value: 94 },
    { day: "Fri", value: 92 },
    { day: "Sat", value: 95 },
    { day: "Sun", value: 93 },
  ],
};
```

**Step 2: Create AnalyticsView component**

Add a new `AnalyticsView` component after `VoiceView`. It receives `stats` as a prop to blend live session data with mocked historical data.

```jsx
function AnalyticsView({ stats }) {
  const totalConversations = MOCK_ANALYTICS.historicalConversations + stats.total;
  const resolution = stats.total > 0
    ? Math.round(((stats.resolved + Math.round(MOCK_ANALYTICS.historicalConversations * MOCK_ANALYTICS.historicalResolution / 100)) / totalConversations) * 100)
    : MOCK_ANALYTICS.historicalResolution;
  const satisfaction = stats.feedback.up + stats.feedback.down > 0
    ? Math.round(((stats.feedback.up + Math.round(MOCK_ANALYTICS.historicalConversations * MOCK_ANALYTICS.historicalCSAT / 100)) / (totalConversations)) * 100)
    : MOCK_ANALYTICS.historicalCSAT;

  return (
    <div style={{ padding: "24px 20px", maxWidth: 700, margin: "0 auto", overflowY: "auto" }}>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: BRAND.textPrimary, margin: "0 0 6px 0", fontFamily: "inherit" }}>
          Conversation <span style={{ fontStyle: "italic", color: BRAND.green }}>Analytics</span>
        </h2>
        <p style={{ fontSize: 13, color: BRAND.textSecondary, margin: 0, lineHeight: 1.5 }}>
          Real-time insights powered by Cosmos DB, Microsoft Fabric, and Power BI.
        </p>
      </div>

      {/* Summary cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 20 }}>
        {[
          { label: "Total Conversations", value: totalConversations.toLocaleString(), color: BRAND.textPrimary },
          { label: "Resolution Rate", value: `${resolution}%`, color: BRAND.green },
          { label: "Avg Handle Time", value: `${MOCK_ANALYTICS.historicalAvgTime}s`, color: BRAND.blue },
          { label: "CSAT Score", value: `${satisfaction}%`, color: BRAND.green },
        ].map((card, i) => (
          <div key={i} style={{
            padding: "16px 14px", borderRadius: 12, textAlign: "center",
            backgroundColor: BRAND.surface, border: `1px solid ${BRAND.border}`,
            boxShadow: BRAND.shadow,
          }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: card.color }}>{card.value}</div>
            <div style={{ fontSize: 10, color: BRAND.textTertiary, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5, marginTop: 4 }}>{card.label}</div>
          </div>
        ))}
      </div>

      {/* Sentiment breakdown */}
      <div style={{
        padding: "16px 18px", borderRadius: 12, marginBottom: 20,
        backgroundColor: BRAND.surface, border: `1px solid ${BRAND.border}`,
        boxShadow: BRAND.shadow,
      }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: BRAND.textPrimary, marginBottom: 12 }}>
          Sentiment Analysis
        </div>
        <div style={{ display: "flex", borderRadius: 6, overflow: "hidden", height: 28, marginBottom: 8 }}>
          <div style={{ width: `${MOCK_ANALYTICS.sentiment.positive}%`, backgroundColor: BRAND.green, transition: "width 0.5s" }} />
          <div style={{ width: `${MOCK_ANALYTICS.sentiment.neutral}%`, backgroundColor: BRAND.blue, transition: "width 0.5s" }} />
          <div style={{ width: `${MOCK_ANALYTICS.sentiment.negative}%`, backgroundColor: BRAND.red, transition: "width 0.5s" }} />
        </div>
        <div style={{ display: "flex", gap: 16, fontSize: 11 }}>
          {[
            { label: "Positive", value: MOCK_ANALYTICS.sentiment.positive, color: BRAND.green },
            { label: "Neutral", value: MOCK_ANALYTICS.sentiment.neutral, color: BRAND.blue },
            { label: "Negative", value: MOCK_ANALYTICS.sentiment.negative, color: BRAND.red },
          ].map((s, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, backgroundColor: s.color }} />
              <span style={{ color: BRAND.textSecondary }}>{s.label}</span>
              <span style={{ fontWeight: 700, color: BRAND.textPrimary }}>{s.value}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Top call reasons — horizontal bar chart */}
      <div style={{
        padding: "16px 18px", borderRadius: 12, marginBottom: 20,
        backgroundColor: BRAND.surface, border: `1px solid ${BRAND.border}`,
        boxShadow: BRAND.shadow,
      }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: BRAND.textPrimary, marginBottom: 12 }}>
          Top Call Reasons
        </div>
        {MOCK_ANALYTICS.callReasons.map((reason, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <div style={{ width: 110, fontSize: 11, color: BRAND.textSecondary, textAlign: "right", flexShrink: 0 }}>
              {reason.label}
            </div>
            <div style={{ flex: 1, height: 18, backgroundColor: BRAND.lightGray, borderRadius: 4, overflow: "hidden" }}>
              <div style={{
                width: `${reason.pct}%`, height: "100%",
                backgroundColor: i === 0 ? BRAND.green : i < 3 ? BRAND.blue : BRAND.textTertiary,
                borderRadius: 4, transition: "width 0.5s",
              }} />
            </div>
            <div style={{ width: 40, fontSize: 11, fontWeight: 600, color: BRAND.textPrimary }}>
              {reason.pct}%
            </div>
          </div>
        ))}
      </div>

      {/* CSAT trend — bar chart */}
      <div style={{
        padding: "16px 18px", borderRadius: 12, marginBottom: 20,
        backgroundColor: BRAND.surface, border: `1px solid ${BRAND.border}`,
        boxShadow: BRAND.shadow,
      }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: BRAND.textPrimary, marginBottom: 12 }}>
          CSAT Trend (Last 7 Days)
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 120 }}>
          {MOCK_ANALYTICS.csatTrend.map((day, i) => (
            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: BRAND.textPrimary }}>{day.value}%</div>
              <div style={{
                width: "100%", borderRadius: "4px 4px 0 0",
                height: `${(day.value - 80) * 5}px`, // Scale: 80% = 0px, 100% = 100px
                backgroundColor: day.value >= 90 ? BRAND.green : BRAND.amber,
                transition: "height 0.5s",
              }} />
              <div style={{ fontSize: 10, color: BRAND.textTertiary }}>{day.day}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Data source attribution */}
      <div style={{
        padding: "12px 16px", borderRadius: 8,
        background: `linear-gradient(135deg, rgba(134,188,37,0.06) 0%, rgba(0,163,224,0.04) 100%)`,
        border: `1px solid rgba(134,188,37,0.15)`,
        textAlign: "center",
      }}>
        <span style={{ fontSize: 11, color: BRAND.textSecondary }}>
          Powered by <strong style={{ color: BRAND.textPrimary }}>Cosmos DB</strong> · <strong style={{ color: BRAND.textPrimary }}>Microsoft Fabric</strong> · <strong style={{ color: BRAND.textPrimary }}>Power BI</strong>
        </span>
      </div>
    </div>
  );
}
```

**Step 3: Add Analytics tab to tab bar and content panel**

In the tab bar (~line 991), add the analytics tab:
```javascript
{ id: "analytics", label: "Analytics", icon: "📊" },
```

In the content panels (~line 1018), add before the architecture check:
```jsx
activeTab === "analytics" ? (
  <div id="panel-analytics" role="tabpanel" style={{ flex: 1, overflowY: "auto" }}>
    <AnalyticsView stats={stats} />
  </div>
) :
```

**Step 4: Verify visually**

- Click Analytics tab
- Should see 4 summary cards, sentiment bar, call reasons chart, CSAT trend chart
- Ask some questions in chat, go back to Analytics — total conversations should increase
- Check that the data source attribution appears at bottom

**Step 5: Commit**

```bash
git add app/components/AIAssistant.jsx
git commit -m "feat: add analytics dashboard tab with sentiment, call reasons, and CSAT trend"
```

---

### Task 5: Update Demo Walkthrough

**Files:**
- Modify: `docs/demo-walkthrough.md`

**Step 1: Update walkthrough to cover new features**

Add new sections to the walkthrough:
- **Act 2 Part E:** Function calling — point out the tool call card that appears before answers
- **Act 5 (Architecture):** Mention the path toggle, demo both Copilot Studio and AI Foundry paths
- **New Act (Analytics):** Walk through the analytics dashboard, explain Cosmos DB + Fabric + Power BI data pipeline
- **Act 4 (Voice):** Update to reference Voice Live API config panel, connection status, VAD mode, transcript
- Update Q&A table with new entries

**Step 2: Commit**

```bash
git add docs/demo-walkthrough.md
git commit -m "docs: update walkthrough script with new demo features"
```

---

### Task 6: Generate BRD Word Document

**Files:**
- Create: `scripts/generate-brd.js`
- Create: `docs/AI-Support-Assistant-BRD.docx` (generated output)

**Step 1: Write the BRD generator script**

Create `scripts/generate-brd.js` using the `docx` npm package. Follow the same patterns as the existing `scripts/generate-gap-analysis.js`:
- US Letter, 1" margins, Arial font
- Green (#86BC25) accent for headings and table headers
- Header with doc title, footer with page numbers
- Proper heading styles (Heading1, Heading2, Heading3)
- Bullet and numbered lists via numbering config

**Sections to generate:**
1. Cover page (centered title, date, version, author, client)
2. Executive summary (1 page)
3. Business objectives (4-5 objectives with descriptions)
4. Scope (in-scope / out-of-scope tables)
5. Functional requirements table (FR-01 through FR-12, each with description, acceptance criteria, MoSCoW priority, gap reference)
6. Non-functional requirements (security, performance, availability, scalability)
7. Architecture overview (both paths described in text)
8. Success criteria table (5 POC criteria + gap closure metrics)
9. Phased delivery roadmap (4 phases with descriptions and deliverables)
10. Resource plan with hours and cost breakdown:
    - Rate: $250/hr blended consulting rate
    - Sprint cadence: 2-week sprints
    - 5 roles: Solution Architect, AI/ML Engineer, Full-Stack Developer, QA Engineer, Project Manager
    - Resource allocation table: columns = Role, Sprint 1, Sprint 2, ..., Sprint 6, Total Hours, Total Cost
    - Phase mapping: Phase 1 (Sprint 1), Phase 2 (Sprints 2-3), Phase 3 (Sprints 4-5), Phase 4 (Sprint 6)
    - Hours per role per sprint (realistic estimates):
      - Solution Architect: 40, 30, 30, 20, 20, 30 = 170 hrs
      - AI/ML Engineer: 20, 60, 60, 50, 50, 30 = 270 hrs
      - Full-Stack Developer: 30, 50, 50, 40, 40, 30 = 240 hrs
      - QA Engineer: 10, 20, 30, 30, 30, 40 = 160 hrs
      - Project Manager: 20, 15, 15, 15, 15, 20 = 100 hrs
    - Total: 940 hours across 6 sprints (12 weeks)
    - Total cost: 940 x $250 = $235,000
    - Summary row per phase with subtotals
    - Cost breakdown pie/table by role
11. Assumptions & dependencies
12. Appendix: Gap analysis reference summary table

**Step 2: Run the generator**

```bash
cd C:/code/TMT/MicronBot && node scripts/generate-brd.js
```

Verify the file was created at `docs/AI-Support-Assistant-BRD.docx`.

**Step 3: Commit**

```bash
git add scripts/generate-brd.js docs/AI-Support-Assistant-BRD.docx
git commit -m "feat: add BRD Word document with full requirements from gap analysis"
```

---

### Task 7: Final Verification and Push

**Step 1: Build check**

```bash
cd C:/code/TMT/MicronBot && npm run build
```

Ensure static export completes without errors.

**Step 2: Visual smoke test**

- Start dev server
- Chat: ask "security model" — verify tool call card appears, then answer
- Chat: ask "hello" — verify NO tool call card, direct answer
- Chat: ask "cafeteria menu" — verify unmatched + escalation button, no tool call
- Voice tab: verify config panel, connection status, waveform, transcript
- Architecture tab: toggle between Copilot Studio and AI Foundry paths
- Analytics tab: verify all charts render, data source label present
- Header stats: verify they update during chat

**Step 3: Push to GitHub**

```bash
git push origin main
```

Wait for GitHub Actions deploy to complete, verify live at https://kevenwmarkham.github.io/tmt-micron/

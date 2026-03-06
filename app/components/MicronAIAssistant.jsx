"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";

/* ═══════════════════════════════════════════════════════════════
   MICRON AI SUPPORT ASSISTANT — Enterprise v3.0
   Microsoft-native Platform (Copilot Studio + Azure OpenAI)
   Deloitte Digital
   ═══════════════════════════════════════════════════════════════ */

const BRAND = {
  green: "#86BC25",
  neonGreen: "#86EB22",
  black: "#000000",
  darkGray: "#282728",
  medGray: "#444444",
  gray: "#E6E6E6",
  lightGray: "#F0F0F0",
  blue: "#00A3E0",
  lightBlue: "#E8F7FF",
  white: "#FFFFFF",
  textPrimary: "#1A1A1A",
  textSecondary: "#636363",
  textTertiary: "#8E8E8E",
  bgLight: "#FAFAFA",
  amber: "#D4820C",
  amberBg: "#FFF8ED",
  red: "#C4314B",
  redBg: "#FDF3F4",
  greenBg: "#F2F9E8",
  surface: "#FFFFFF",
  surfaceHover: "#F5F5F5",
  border: "#E8E8E8",
  borderFocus: "#86BC25",
  shadow: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
  shadowMd: "0 4px 12px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.04)",
  shadowLg: "0 8px 24px rgba(0,0,0,0.1), 0 2px 6px rgba(0,0,0,0.04)",
};

const ARCHITECTURE = {
  layers: [
    {
      name: "User Channels",
      desc: "Where team members interact",
      components: [
        { name: "Microsoft Teams", icon: "💬", desc: "Chat & voice calling" },
        { name: "Browser Widget", icon: "🌐", desc: "Embedded web interface" },
        { name: "Azure Speech", icon: "🎙", desc: "Voice I/O with neural TTS" },
      ],
      color: BRAND.blue,
    },
    {
      name: "Orchestration Layer",
      desc: "Low-code agent management",
      components: [
        { name: "Copilot Studio", icon: "🤖", desc: "Agent builder & publisher" },
        { name: "Azure Bot Service", icon: "⚡", desc: "Channel routing & scaling" },
        { name: "Power Automate", icon: "🔄", desc: "Workflow & task automation" },
      ],
      color: BRAND.green,
    },
    {
      name: "AI & Knowledge",
      desc: "Intelligence & retrieval pipeline",
      components: [
        { name: "Azure OpenAI (GPT-4o)", icon: "🧠", desc: "LLM generation & reasoning" },
        { name: "Azure AI Search", icon: "🔍", desc: "Semantic retrieval & ranking" },
        { name: "Micron Knowledge Base", icon: "📚", desc: "Curated internal docs" },
      ],
      color: BRAND.neonGreen,
    },
    {
      name: "Enterprise Integration",
      desc: "Security, identity & operations",
      components: [
        { name: "Entra ID (SSO)", icon: "🔐", desc: "Zero-trust authentication" },
        { name: "Dynamics 365 CC", icon: "📞", desc: "Human agent escalation" },
        { name: "Azure Monitor", icon: "📊", desc: "Telemetry & analytics" },
      ],
      color: BRAND.darkGray,
    },
  ],
};

const KNOWLEDGE_BASE = [
  {
    q: ["what is ai", "artificial intelligence", "define ai", "explain ai"],
    a: "Artificial Intelligence (AI) refers to systems designed to perform tasks that typically require human intelligence — such as understanding language, recognizing patterns, making decisions, and learning from experience.\n\nAt Micron, we leverage AI across operations to drive efficiency, quality, and innovation in semiconductor manufacturing and beyond.",
    category: "General AI",
    source: "Azure OpenAI + Micron KB",
    related: ["machine learning", "generative ai", "neural network"],
  },
  {
    q: ["machine learning", "what is ml", "define ml", "explain ml"],
    a: "Machine Learning (ML) is a subset of AI that enables systems to learn and improve from experience without being explicitly programmed. ML models are trained on data to identify patterns, make predictions, and automate decision-making.\n\nMicron uses ML across manufacturing, quality assurance, and supply chain optimization to maintain our technology leadership.",
    category: "General AI",
    source: "Azure OpenAI + Micron KB",
    related: ["artificial intelligence", "deep learning"],
  },
  {
    q: ["generative ai", "genai", "gen ai", "what is generative", "generative"],
    a: "Generative AI refers to AI systems that create new content — text, images, code, and more — based on patterns learned from training data.\n\nMicrosoft's Azure OpenAI Service provides enterprise-grade access to models like GPT-4o. Micron leverages these capabilities through Copilot Studio to boost team member productivity and streamline internal support workflows.",
    category: "General AI",
    source: "Azure OpenAI",
    related: ["azure openai", "copilot studio"],
  },
  {
    q: ["copilot", "microsoft copilot", "copilot studio"],
    a: "Microsoft Copilot Studio is the foundation of this AI assistant. It provides a low-code platform to build, test, and deploy custom AI agents across Teams, web, and voice channels.\n\nMicron's implementation uses Copilot Studio to orchestrate responses from Azure OpenAI and the internal knowledge base, with built-in analytics, conversation management, and configurable escalation rules.",
    category: "Platform",
    source: "Copilot Studio",
    related: ["azure openai", "teams"],
  },
  {
    q: ["azure openai", "openai", "gpt", "gpt-4", "gpt4"],
    a: "Azure OpenAI Service provides enterprise-grade access to OpenAI models (GPT-4, GPT-4o) within Microsoft's secure cloud infrastructure.\n\nUnlike the public OpenAI API, Azure OpenAI offers private networking, managed identity authentication via Entra ID, data residency controls, and content filtering — all critical for Micron's security requirements under the CSO's oversight. No customer data is used for model training.",
    category: "Architecture",
    source: "Azure OpenAI",
    related: ["security", "rag"],
  },
  {
    q: ["azure ai search", "cognitive search", "search", "ai search"],
    a: "Azure AI Search (formerly Cognitive Search) powers the retrieval layer of this assistant. It indexes Micron's internal documentation and applies semantic ranking to find the most relevant content.\n\nCombined with Azure OpenAI, this creates a Retrieval-Augmented Generation (RAG) pipeline — ensuring responses are grounded in Micron's approved knowledge base rather than relying solely on the LLM's training data.",
    category: "Architecture",
    source: "Azure AI Search",
    related: ["rag", "knowledge base"],
  },
  {
    q: ["voice", "voice enabled", "voice assistant", "speak", "speech", "azure speech"],
    a: "Voice interaction is powered by Azure AI Speech Services, providing real-time speech-to-text and text-to-speech with natural-sounding neural voices.\n\nThe voice channel connects through Azure Bot Service to the same Copilot Studio agent — ensuring complete content parity between chat and voice. Team members can interact via Teams voice calling or the browser-based voice widget.",
    category: "Voice",
    source: "Azure AI Speech",
    related: ["teams", "chatbot"],
  },
  {
    q: ["teams", "microsoft teams"],
    a: "Microsoft Teams is the primary deployment channel for this assistant. Team members can interact via Teams chat, Teams voice calling, or the embedded browser widget.\n\nThe Copilot Studio agent publishes directly to Teams with no additional infrastructure. SSO through Microsoft Entra ID ensures seamless, secure authentication with no separate credentials required.",
    category: "Channels",
    source: "Copilot Studio",
    related: ["copilot studio", "security"],
  },
  {
    q: ["escalation", "human agent", "talk to someone", "help desk", "contact center", "live agent"],
    a: "When the AI cannot resolve a query with high confidence, the system seamlessly escalates to a human agent through Dynamics 365 Contact Center.\n\nThe full conversation context — including the user's question, AI responses, and confidence scores — transfers to the agent, eliminating the need to repeat information. Escalation rules are fully configurable in Copilot Studio based on confidence thresholds, topic sensitivity, or explicit user request.",
    category: "Support",
    source: "Dynamics 365",
    related: ["chatbot", "analytics"],
  },
  {
    q: ["security", "secure", "cso", "chief security officer", "entra", "sso", "privacy", "data protection"],
    a: "This solution operates entirely within Microsoft's enterprise cloud, governed by Micron's security policies under the CSO's oversight.\n\n• Authentication: Microsoft Entra ID (SSO) — no separate credentials\n• Data residency: All data stays within Micron's Azure tenant\n• Network: Private endpoints with encryption at rest and in transit\n• Access: Role-based access controls (RBAC)\n• AI safety: Azure OpenAI enterprise tier — no customer data used for training\n• Compliance: SOC 2, ISO 27001, and Micron's internal security standards",
    category: "Security",
    source: "Azure / Entra ID",
    related: ["azure openai", "entra"],
  },
  {
    q: ["chatbot", "this chatbot", "how does this work", "what can you do", "capabilities", "about"],
    a: "I'm Micron's AI Support Assistant — a 24/7 digital helper built on Microsoft Copilot Studio. I combine Azure OpenAI's language capabilities with Micron's internal knowledge base via Azure AI Search.\n\nI'm available through Teams chat, Teams voice, and this browser interface. If I can't resolve your question with high confidence, I'll connect you with a human agent through Dynamics 365 Contact Center.\n\nI can help with AI fundamentals, Microsoft platform capabilities, security questions, escalation processes, architecture details, and more.",
    category: "About",
    source: "System",
    related: ["copilot studio", "escalation"],
  },
  {
    q: ["knowledge base", "documentation", "docs", "sources"],
    a: "I draw answers from two integrated sources:\n\n1. Azure OpenAI — for general AI and technology knowledge, powered by GPT-4o\n2. Micron's Internal Documentation — indexed through Azure AI Search with semantic ranking\n\nThis dual-source RAG architecture ensures responses are both broadly knowledgeable and specifically grounded in Micron-approved content. Source attribution is shown with each response.",
    category: "Architecture",
    source: "Azure AI Search + Azure OpenAI",
    related: ["rag", "azure ai search"],
  },
  {
    q: ["llm", "large language model"],
    a: "A Large Language Model (LLM) is an AI model trained on vast amounts of text data to understand and generate human language. LLMs power tools like ChatGPT, Gemini, and Copilot.\n\nThis assistant uses Azure OpenAI's GPT-4o model within Micron's secure Azure tenant — providing enterprise-grade LLM capabilities with full data privacy, content filtering, and compliance controls.",
    category: "General AI",
    source: "Azure OpenAI",
    related: ["azure openai", "generative ai"],
  },
  {
    q: ["poc", "proof of concept", "pilot", "project"],
    a: "This Proof of Concept demonstrates a Microsoft-native conversational AI support model for Micron.\n\nBuilt on Copilot Studio with Azure OpenAI and Azure AI Search, the POC evaluates five success criteria:\n1. Resolution accuracy — correct answers from dual knowledge sources\n2. Response speed — sub-2-second average handling time\n3. Dual data sources — RAG pipeline combining internal + external knowledge\n4. Chat-voice parity — consistent experience across all channels\n5. Branded UX — Micron-aligned, manageable user experience",
    category: "Project",
    source: "System",
    related: ["architecture", "analytics"],
  },
  {
    q: ["rag", "retrieval augmented", "retrieval-augmented generation"],
    a: "Retrieval-Augmented Generation (RAG) is the core AI pattern powering this assistant.\n\nThe process works in three steps:\n1. Azure AI Search retrieves the most relevant documents from Micron's knowledge base using semantic ranking\n2. Retrieved context is injected into the prompt alongside the user's question\n3. Azure OpenAI generates a grounded response based on both the retrieved context and its general knowledge\n\nThis approach ensures factual accuracy and significantly reduces hallucination — critical for enterprise support applications.",
    category: "Architecture",
    source: "Azure AI Search + Azure OpenAI",
    related: ["azure ai search", "azure openai"],
  },
  {
    q: ["analytics", "monitor", "reporting", "dashboard", "metrics", "kpi"],
    a: "Azure Monitor and Copilot Studio's built-in analytics provide comprehensive performance tracking:\n\n• Resolution rate — percentage of queries resolved without escalation\n• Average handling time — response latency measurement\n• User satisfaction — post-interaction feedback scores\n• Escalation frequency — topics requiring human intervention\n• Topic trends — emerging questions and knowledge gaps\n• Session analytics — conversation depth and engagement metrics\n\nThese dashboards enable continuous optimization of the knowledge base and response quality.",
    category: "Operations",
    source: "Azure Monitor",
    related: ["poc", "escalation"],
  },
  {
    q: ["power automate", "workflow", "automation", "automate"],
    a: "Power Automate integrates with Copilot Studio to handle complex workflows beyond simple Q&A:\n\n• Creating support tickets in ServiceNow or Jira\n• Triggering email notifications to subject matter experts\n• Updating knowledge articles when gaps are identified\n• Routing approval workflows for content changes\n• Logging interactions to compliance systems\n\nThis extends the assistant's capabilities into actionable task automation within Micron's Microsoft 365 environment.",
    category: "Integration",
    source: "Power Automate",
    related: ["copilot studio", "escalation"],
  },
  {
    q: ["neural network", "deep learning", "deep neural"],
    a: "Neural networks are computing systems inspired by the human brain's structure, using interconnected layers of nodes to process information. Deep learning uses many-layered neural networks to handle complex data like images, audio, and text.\n\nThese technologies underpin the GPT-4o models available through Azure OpenAI that power this assistant's natural language understanding and generation capabilities.",
    category: "General AI",
    source: "Azure OpenAI",
    related: ["machine learning", "llm"],
  },
  {
    q: ["prompt", "prompt engineering", "how to prompt", "prompting"],
    a: "Prompt engineering is the practice of crafting effective inputs to get the best results from AI models.\n\nBest practices for team members:\n• Be specific — clearly state what you need\n• Provide context — include relevant background\n• Break it down — split complex requests into steps\n• Specify format — tell the AI how to structure its response\n• Iterate — refine your prompt based on results\n\nIn Copilot Studio, system prompts are pre-configured to ensure consistent, accurate responses aligned to Micron's use case.",
    category: "General AI",
    source: "Azure OpenAI",
    related: ["generative ai", "llm"],
  },
  {
    q: ["brand", "branding", "customize", "user experience", "ux"],
    a: "Copilot Studio provides full branding and UX customization:\n\n• Custom avatars and color themes aligned to brand guidelines\n• Configurable welcome messages and conversation flows\n• Tone of voice control through system prompts\n• Browser widget styling to match corporate design systems\n• Teams deployment inherits organizational branding automatically\n\nThis ensures a consistent, professional experience that reinforces Micron's brand identity across all interaction channels.",
    category: "UX",
    source: "Copilot Studio",
    related: ["chatbot", "teams"],
  },
];

const SUGGESTED_QUESTIONS = [
  { text: "How does this assistant work?", icon: "💡" },
  { text: "Tell me about the security model", icon: "🔒" },
  { text: "What is Azure AI Search?", icon: "🔍" },
  { text: "How does escalation work?", icon: "🎯" },
  { text: "What analytics are available?", icon: "📊" },
  { text: "Explain RAG architecture", icon: "⚙️" },
];

// ─── Improved fuzzy matching with TF-IDF-inspired scoring ───
function findAnswer(input) {
  const lower = input.toLowerCase().trim().replace(/[?!.,;:]/g, "");
  const words = lower.split(/\s+/).filter(w => w.length > 1);
  let bestMatch = null;
  let bestScore = 0;

  for (const entry of KNOWLEDGE_BASE) {
    let score = 0;
    for (const keyword of entry.q) {
      // Exact phrase match (highest weight)
      if (lower.includes(keyword)) {
        score = Math.max(score, keyword.length * 3 + 10);
      }
      // Keyword contains input
      if (keyword.includes(lower) && lower.length > 3) {
        score = Math.max(score, lower.length * 2 + 5);
      }
      // Word overlap scoring
      const kwWords = keyword.split(/\s+/);
      let overlap = 0;
      for (const w of words) {
        if (kwWords.some(kw => kw.includes(w) || w.includes(kw))) overlap++;
      }
      if (overlap > 0 && words.length > 0) {
        const overlapScore = (overlap / Math.max(words.length, kwWords.length)) * 20 + overlap * 3;
        score = Math.max(score, overlapScore);
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestMatch = entry;
    }
  }

  if (bestMatch && bestScore > 4) {
    return {
      text: bestMatch.a,
      category: bestMatch.category,
      confidence: bestScore > 12 ? "High" : "Medium",
      source: bestMatch.source,
      related: bestMatch.related || [],
    };
  }

  if (/^(hello|hi|hey|good morning|good afternoon|good evening)/i.test(lower)) {
    return {
      text: "Hello! I'm Micron's AI Support Assistant, powered by Microsoft Copilot Studio. I'm here to help with your AI-related questions.\n\nWhat can I help you with today?",
      category: "Greeting",
      confidence: "High",
      source: "System",
      related: [],
    };
  }
  if (/^(thank|thanks|ty|cheers|appreciate)/i.test(lower)) {
    return {
      text: "You're welcome! I'm glad I could help. Feel free to ask anything else about AI or Micron's AI initiatives — I'm available 24/7 across Teams and this browser interface.",
      category: "Courtesy",
      confidence: "High",
      source: "System",
      related: [],
    };
  }
  if (/^(bye|goodbye|see you|that's all)/i.test(lower)) {
    return {
      text: "Goodbye! Thank you for using Micron's AI Support Assistant. I'm here anytime you need help. Have a great day!",
      category: "Courtesy",
      confidence: "High",
      source: "System",
      related: [],
    };
  }

  return {
    text: "I wasn't able to find a confident answer for that in my current knowledge base. Here's what I can help with:\n\n• AI fundamentals and terminology\n• Microsoft platform capabilities (Copilot Studio, Azure OpenAI, etc.)\n• Security and authentication model\n• Escalation and support processes\n• Architecture and technical details\n\nWould you like to rephrase your question, or shall I connect you with a human agent through Dynamics 365 Contact Center?",
    category: "Unmatched",
    confidence: "Low",
    source: "—",
    related: [],
  };
}

// ─── Icons ───
function MicronIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="11" stroke={BRAND.green} strokeWidth="2" />
      <path d="M7 16V8l2.5 5L12 8l2.5 5L17 8v8" stroke={BRAND.green} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 2L11 13" /><path d="M22 2L15 22L11 13L2 9L22 2Z" />
    </svg>
  );
}

function VoiceIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" y1="19" x2="12" y2="23" />
      <line x1="8" y1="23" x2="16" y2="23" />
    </svg>
  );
}

function ThumbsUpIcon({ filled }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
    </svg>
  );
}

function ThumbsDownIcon({ filled }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17" />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function EscalateIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

// ─── Typing Indicator ───
function TypingIndicator() {
  return (
    <div style={{ display: "flex", gap: 5, alignItems: "center", padding: "6px 0" }} role="status" aria-label="Assistant is typing">
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          width: 7, height: 7, borderRadius: "50%",
          backgroundColor: BRAND.green,
          animation: `typingBounce 1.4s ease-in-out ${i * 0.16}s infinite`,
        }} />
      ))}
    </div>
  );
}

// ─── Message Action Button ───
function ActionBtn({ icon, label, onClick, active, activeColor }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      aria-label={label}
      title={label}
      style={{
        display: "inline-flex", alignItems: "center", gap: 4,
        padding: "4px 8px", borderRadius: 6,
        border: "none", background: active ? (activeColor || BRAND.greenBg) : (hovered ? BRAND.lightGray : "transparent"),
        color: active ? (activeColor === BRAND.redBg ? BRAND.red : BRAND.green) : BRAND.textTertiary,
        cursor: "pointer", fontSize: 11, fontWeight: 500,
        transition: "all 0.15s ease",
        fontFamily: "inherit",
      }}
    >
      {icon}
    </button>
  );
}

// ─── Confidence Badge ───
function ConfidenceBadge({ confidence }) {
  const configs = {
    High: { color: BRAND.green, bg: BRAND.greenBg, label: "Resolved", dot: "●" },
    Medium: { color: BRAND.blue, bg: BRAND.lightBlue, label: "Likely match", dot: "●" },
    Low: { color: BRAND.amber, bg: BRAND.amberBg, label: "Escalation available", dot: "○" },
  };
  const c = configs[confidence] || configs.Low;
  return (
    <span style={{
      fontSize: 10, color: c.color, fontWeight: 600,
      display: "inline-flex", alignItems: "center", gap: 3,
    }}>
      <span style={{ fontSize: 8 }}>{c.dot}</span> {c.label}
    </span>
  );
}

// ─── Source Tag ───
function SourceTag({ source }) {
  if (!source || source === "—") return null;
  return (
    <span style={{
      fontSize: 10, color: BRAND.blue, fontWeight: 600,
      padding: "2px 8px", borderRadius: 10,
      backgroundColor: "rgba(0,163,224,0.06)",
      border: "1px solid rgba(0,163,224,0.15)",
      display: "inline-block",
    }}>{source}</span>
  );
}

// ─── Chat Message ───
function ChatMessage({ msg, isLast, onFeedback, onCopy, onEscalate }) {
  const isBot = msg.role === "bot";
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard?.writeText(msg.text.replace(/\n/g, "\n"));
    setCopied(true);
    onCopy?.(msg.id);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: isBot ? "flex-start" : "flex-end",
        marginBottom: 20,
        animation: isLast ? "fadeSlideIn 0.35s cubic-bezier(0.16,1,0.3,1)" : "none",
      }}
      role="listitem"
      aria-label={isBot ? "Assistant message" : "Your message"}
    >
      {isBot && (
        <div style={{
          width: 34, height: 34, borderRadius: "50%",
          background: BRAND.darkGray,
          display: "flex", alignItems: "center", justifyContent: "center",
          marginRight: 10, flexShrink: 0, marginTop: 2,
        }} aria-hidden="true">
          <MicronIcon size={17} />
        </div>
      )}
      <div style={{ maxWidth: "78%", minWidth: 0 }}>
        <div style={{
          padding: "14px 18px",
          borderRadius: isBot ? "3px 18px 18px 18px" : "18px 18px 3px 18px",
          backgroundColor: isBot ? BRAND.surface : BRAND.darkGray,
          color: isBot ? BRAND.textPrimary : BRAND.white,
          fontSize: 14, lineHeight: 1.7,
          boxShadow: isBot ? BRAND.shadow : "none",
          border: isBot ? `1px solid ${BRAND.border}` : "none",
          whiteSpace: "pre-line",
          wordBreak: "break-word",
        }}>
          {msg.text}
        </div>

        {isBot && msg.category && (
          <div style={{
            display: "flex", gap: 8, marginTop: 8, alignItems: "center", flexWrap: "wrap",
          }}>
            <span style={{
              fontSize: 10, color: BRAND.white, backgroundColor: BRAND.green,
              padding: "2px 10px", borderRadius: 10, fontWeight: 700,
              letterSpacing: 0.2,
            }}>{msg.category}</span>
            <SourceTag source={msg.source} />
            {msg.confidence && <ConfidenceBadge confidence={msg.confidence} />}
          </div>
        )}

        {/* Action bar for bot messages */}
        {isBot && msg.category && msg.category !== "Welcome" && msg.category !== "System" && (
          <div style={{
            display: "flex", gap: 2, marginTop: 8, alignItems: "center",
          }}>
            <ActionBtn
              icon={msg.feedback === "up" ? <CheckIcon /> : <ThumbsUpIcon filled={false} />}
              label="Helpful"
              onClick={() => onFeedback?.(msg.id, "up")}
              active={msg.feedback === "up"}
            />
            <ActionBtn
              icon={<ThumbsDownIcon filled={false} />}
              label="Not helpful"
              onClick={() => onFeedback?.(msg.id, "down")}
              active={msg.feedback === "down"}
              activeColor={BRAND.redBg}
            />
            <ActionBtn
              icon={copied ? <CheckIcon /> : <CopyIcon />}
              label={copied ? "Copied" : "Copy"}
              onClick={handleCopy}
              active={copied}
            />
            {msg.confidence === "Low" && (
              <ActionBtn
                icon={<EscalateIcon />}
                label="Connect to agent"
                onClick={() => onEscalate?.()}
              />
            )}
          </div>
        )}

        <div style={{
          fontSize: 10, color: BRAND.textTertiary, marginTop: 6, paddingLeft: 2,
          letterSpacing: 0.1,
        }}>
          {msg.time}
          {isBot && msg.responseTime && (
            <span style={{ marginLeft: 8, color: BRAND.textTertiary }}>
              · {msg.responseTime}s
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Architecture View ───
function ArchitectureView() {
  const [expanded, setExpanded] = useState(null);
  return (
    <div style={{ padding: "24px 20px", maxWidth: 700, margin: "0 auto" }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{
          fontSize: 18, fontWeight: 700, color: BRAND.textPrimary,
          margin: "0 0 6px 0", fontFamily: "inherit",
        }}>
          Solution <span style={{ fontStyle: "italic", color: BRAND.green }}>Architecture</span>
        </h2>
        <p style={{ fontSize: 13, color: BRAND.textSecondary, margin: 0, lineHeight: 1.5 }}>
          End-to-end Microsoft enterprise stack powering Micron's AI Support Assistant.
        </p>
      </div>

      {ARCHITECTURE.layers.map((layer, li) => (
        <div key={li} style={{ marginBottom: 16 }}>
          <div
            style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "10px 14px", borderRadius: 10,
              backgroundColor: BRAND.surface,
              border: `1px solid ${BRAND.border}`,
              cursor: "pointer",
              transition: "all 0.15s ease",
              boxShadow: expanded === li ? BRAND.shadowMd : BRAND.shadow,
            }}
            onClick={() => setExpanded(expanded === li ? null : li)}
            role="button"
            aria-expanded={expanded === li}
            tabIndex={0}
            onKeyDown={e => e.key === "Enter" && setExpanded(expanded === li ? null : li)}
          >
            <div style={{
              width: 4, height: 32, borderRadius: 2,
              backgroundColor: layer.color, flexShrink: 0,
            }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: BRAND.textPrimary }}>{layer.name}</div>
              <div style={{ fontSize: 11, color: BRAND.textSecondary }}>{layer.desc}</div>
            </div>
            <span style={{
              fontSize: 16, color: BRAND.textTertiary,
              transform: expanded === li ? "rotate(180deg)" : "rotate(0)",
              transition: "transform 0.2s ease",
            }}>▾</span>
          </div>

          {expanded === li && (
            <div style={{
              display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
              gap: 10, padding: "12px 8px 4px",
              animation: "fadeSlideIn 0.25s ease-out",
            }}>
              {layer.components.map((comp, ci) => (
                <div key={ci} style={{
                  padding: "12px 14px", borderRadius: 10,
                  backgroundColor: BRAND.bgLight,
                  border: `1px solid ${BRAND.border}`,
                  textAlign: "center",
                }}>
                  <div style={{ fontSize: 22, marginBottom: 6 }}>{comp.icon}</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: BRAND.textPrimary, marginBottom: 3 }}>{comp.name}</div>
                  <div style={{ fontSize: 10, color: BRAND.textSecondary, lineHeight: 1.4 }}>{comp.desc}</div>
                </div>
              ))}
            </div>
          )}

          {li < ARCHITECTURE.layers.length - 1 && (
            <div style={{
              textAlign: "center", padding: "4px 0",
              color: BRAND.textTertiary, fontSize: 14, letterSpacing: 2,
            }}>↓</div>
          )}
        </div>
      ))}

      <div style={{
        marginTop: 20, padding: "16px 18px", borderRadius: 12,
        background: `linear-gradient(135deg, rgba(134,188,37,0.06) 0%, rgba(0,163,224,0.04) 100%)`,
        border: `1px solid rgba(134,188,37,0.15)`,
        fontSize: 12, color: BRAND.textPrimary, lineHeight: 1.6,
      }}>
        <div style={{ fontWeight: 700, color: BRAND.green, marginBottom: 8, fontSize: 11, textTransform: "uppercase", letterSpacing: 0.8 }}>
          Success Criteria Mapping
        </div>
        {[
          ["Resolution accuracy", "Azure AI Search + OpenAI RAG pipeline"],
          ["Response speed", "Copilot Studio orchestration (sub-2s target)"],
          ["Dual data sources", "Azure AI Search + Azure OpenAI"],
          ["Chat-voice parity", "Copilot Studio multi-channel publishing"],
          ["Branded UX", "Copilot Studio customization + Deloitte design"],
        ].map(([k, v], i) => (
          <div key={i} style={{ display: "flex", gap: 8, marginBottom: i < 4 ? 4 : 0 }}>
            <span style={{ color: BRAND.green, fontWeight: 700, minWidth: 8 }}>→</span>
            <span><strong>{k}</strong> — {v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Voice View ───
function VoiceView({ isListening, toggleVoice }) {
  return (
    <div style={{
      flex: 1, display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", gap: 28, padding: 24,
    }}>
      <div
        onClick={toggleVoice}
        role="button"
        tabIndex={0}
        aria-label={isListening ? "Stop listening" : "Start voice input"}
        onKeyDown={e => e.key === "Enter" && toggleVoice()}
        style={{
          width: 110, height: 110, borderRadius: "50%",
          backgroundColor: isListening ? BRAND.red : BRAND.darkGray,
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", color: BRAND.white,
          animation: isListening ? "voicePulse 1.5s ease-in-out infinite" : "none",
          transition: "background-color 0.3s ease",
          boxShadow: isListening ? `0 0 0 0 rgba(196,49,75,0.3)` : BRAND.shadowLg,
        }}
      >
        <VoiceIcon size={36} />
      </div>

      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 20, fontWeight: 700, color: BRAND.textPrimary, marginBottom: 8 }}>
          {isListening ? "Listening..." : "Tap to speak"}
        </div>
        <div style={{
          fontSize: 13, color: BRAND.textSecondary, maxWidth: 380, lineHeight: 1.6, margin: "0 auto",
        }}>
          Voice powered by <strong style={{ color: BRAND.textPrimary }}>Azure AI Speech Services</strong> with real-time
          speech-to-text and natural neural voice responses. Connected to the same Copilot Studio agent
          for full content parity across channels.
        </div>
      </div>

      {isListening && (
        <div style={{ display: "flex", gap: 3, alignItems: "center", height: 40 }}>
          {Array.from({ length: 24 }).map((_, i) => (
            <div key={i} style={{
              width: 3, borderRadius: 2,
              backgroundColor: BRAND.green,
              height: `${Math.random() * 28 + 6}px`,
              animation: `audioBar ${0.35 + Math.random() * 0.4}s ease-in-out ${Math.random() * 0.2}s infinite alternate`,
              opacity: 0.6 + Math.random() * 0.4,
            }} />
          ))}
        </div>
      )}

      <div style={{
        display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12,
        maxWidth: 420, width: "100%",
      }}>
        {[
          { icon: "💬", label: "Teams Voice", desc: "Direct calling" },
          { icon: "🌐", label: "Browser Widget", desc: "Web voice input" },
          { icon: "📞", label: "Telephony", desc: "Bot Service IVR" },
        ].map((ch, i) => (
          <div key={i} style={{
            padding: "14px 12px", borderRadius: 12, textAlign: "center",
            backgroundColor: BRAND.surface, border: `1px solid ${BRAND.border}`,
            boxShadow: BRAND.shadow,
          }}>
            <div style={{ fontSize: 20, marginBottom: 6 }}>{ch.icon}</div>
            <div style={{ fontSize: 11, fontWeight: 700, color: BRAND.textPrimary }}>{ch.label}</div>
            <div style={{ fontSize: 10, color: BRAND.textSecondary }}>{ch.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Component ───
export default function MicronAIAssistant() {
  const idRef = useRef(1);
  const [messages, setMessages] = useState([{
    id: 0, role: "bot",
    text: "Welcome to Micron's AI Support Assistant — powered by Microsoft Copilot Studio, Azure OpenAI, and Azure AI Search.\n\nI'm your 24/7 digital helper for general and specific AI-related inquiries. How can I assist you today?",
    category: "Welcome", confidence: null, source: "Copilot Studio",
    time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    feedback: null,
  }]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [activeTab, setActiveTab] = useState("chat");
  const [isListening, setIsListening] = useState(false);
  const [stats, setStats] = useState({ total: 0, resolved: 0, avgTime: 0, feedback: { up: 0, down: 0 } });
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Focus input when switching to chat tab
  useEffect(() => {
    if (activeTab === "chat") inputRef.current?.focus();
  }, [activeTab]);

  const handleSend = useCallback((text) => {
    const msg = text || input.trim();
    if (!msg || isTyping) return;
    const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const userId = idRef.current++;
    setMessages(prev => [...prev, { id: userId, role: "user", text: msg, time: now }]);
    setInput("");
    setShowSuggestions(false);
    setIsTyping(true);

    const start = Date.now();
    const delay = 600 + Math.random() * 500;

    setTimeout(() => {
      const result = findAnswer(msg);
      const elapsed = ((Date.now() - start) / 1000).toFixed(1);
      const botTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      const botId = idRef.current++;

      setMessages(prev => [...prev, {
        id: botId, role: "bot", text: result.text,
        category: result.category, confidence: result.confidence,
        source: result.source, related: result.related,
        time: botTime, responseTime: elapsed, feedback: null,
      }]);
      setIsTyping(false);
      setStats(prev => {
        const newTotal = prev.total + 1;
        const newResolved = prev.resolved + (result.confidence === "High" || result.confidence === "Medium" ? 1 : 0);
        const newAvg = ((prev.avgTime * prev.total) + parseFloat(elapsed)) / newTotal;
        return { ...prev, total: newTotal, resolved: newResolved, avgTime: newAvg };
      });
    }, delay);
  }, [input, isTyping]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleFeedback = useCallback((msgId, type) => {
    setMessages(prev => prev.map(m => {
      if (m.id === msgId) {
        const oldFeedback = m.feedback;
        const newFeedback = oldFeedback === type ? null : type;
        // Update stats
        setStats(s => {
          const fb = { ...s.feedback };
          if (oldFeedback) fb[oldFeedback]--;
          if (newFeedback) fb[newFeedback]++;
          return { ...s, feedback: fb };
        });
        return { ...m, feedback: newFeedback };
      }
      return m;
    }));
  }, []);

  const handleEscalate = useCallback(() => {
    const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const botId = idRef.current++;
    setMessages(prev => [...prev, {
      id: botId, role: "bot",
      text: "I'm connecting you with a human agent through Dynamics 365 Contact Center. Your full conversation history will be transferred so you won't need to repeat any information.\n\nPlease hold while I route you to the next available support specialist.",
      category: "Escalation", confidence: "High", source: "Dynamics 365",
      time: now, feedback: null, related: [],
    }]);
  }, []);

  const toggleVoice = useCallback(() => {
    setIsListening(prev => {
      if (!prev) {
        setTimeout(() => {
          setIsListening(false);
          if (activeTab === "voice") setActiveTab("chat");
          handleSend("What are the voice capabilities of this assistant?");
        }, 2500);
      }
      return !prev;
    });
  }, [activeTab, handleSend]);

  const resetSession = useCallback(() => {
    const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    idRef.current = 1;
    setMessages([{
      id: 0, role: "bot",
      text: "Session cleared. Welcome back to Micron's AI Support Assistant.\n\nHow can I help you today?",
      category: "System", confidence: null, source: "Copilot Studio",
      time: now, feedback: null,
    }]);
    setStats({ total: 0, resolved: 0, avgTime: 0, feedback: { up: 0, down: 0 } });
    setShowSuggestions(true);
    setActiveTab("chat");
    setIsListening(false);
  }, []);

  const resolution = stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0;
  const satisfaction = stats.feedback.up + stats.feedback.down > 0
    ? Math.round((stats.feedback.up / (stats.feedback.up + stats.feedback.down)) * 100) : null;

  return (
    <div style={{
      fontFamily: "var(--font-open-sans), 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif",
      height: "100vh", display: "flex", flexDirection: "column",
      backgroundColor: BRAND.bgLight, color: BRAND.textPrimary,
      overflow: "hidden",
    }} role="application" aria-label="Micron AI Support Assistant">
      <style>{`
        @keyframes typingBounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-6px); opacity: 1; }
        }
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        @keyframes voicePulse {
          0% { box-shadow: 0 0 0 0 rgba(196,49,75,0.35); }
          70% { box-shadow: 0 0 0 18px rgba(196,49,75,0); }
          100% { box-shadow: 0 0 0 0 rgba(196,49,75,0); }
        }
        @keyframes audioBar {
          from { height: 4px; }
          to { height: 30px; }
        }
        input::placeholder { color: #A0A0A0; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #D0D0D0; border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: #B0B0B0; }
        * { box-sizing: border-box; }
      `}</style>

      {/* ─── Header ─── */}
      <header style={{
        borderTop: `3px solid ${BRAND.green}`,
        backgroundColor: BRAND.white,
        padding: "12px 20px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        flexShrink: 0, zIndex: 10,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 38, height: 38, borderRadius: "50%", background: BRAND.darkGray,
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            <MicronIcon size={18} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: BRAND.textPrimary, letterSpacing: -0.2 }}>
              Micron AI{" "}
              <span style={{
                fontFamily: "var(--font-stix-two-text), Georgia, serif",
                fontStyle: "italic", color: BRAND.green, fontWeight: 600,
              }}>Assistant</span>
            </div>
            <div style={{
              fontSize: 11, color: BRAND.textSecondary,
              display: "flex", alignItems: "center", gap: 5,
            }}>
              <span style={{
                width: 6, height: 6, borderRadius: "50%",
                backgroundColor: BRAND.green, display: "inline-block",
                animation: "pulse 2.5s ease-in-out infinite",
              }} />
              Copilot Studio · 24/7 Support
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
          {[
            { label: "Queries", value: stats.total, color: BRAND.textPrimary },
            { label: "Resolved", value: stats.total > 0 ? `${resolution}%` : "—", color: resolution >= 70 ? BRAND.green : (stats.total > 0 ? BRAND.amber : BRAND.textTertiary) },
            { label: "Avg Time", value: stats.total > 0 ? `${stats.avgTime.toFixed(1)}s` : "—", color: BRAND.blue },
            { label: "CSAT", value: satisfaction !== null ? `${satisfaction}%` : "—", color: satisfaction !== null ? (satisfaction >= 70 ? BRAND.green : BRAND.amber) : BRAND.textTertiary },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: "center", minWidth: 40 }} aria-label={`${s.label}: ${s.value}`}>
              <div style={{ fontSize: 15, fontWeight: 700, color: s.color, lineHeight: 1.2 }}>{s.value}</div>
              <div style={{ fontSize: 9, color: BRAND.textTertiary, textTransform: "uppercase", letterSpacing: 0.5, fontWeight: 600 }}>{s.label}</div>
            </div>
          ))}
          <div style={{ width: 1, height: 26, backgroundColor: BRAND.border, margin: "0 2px" }} />
          <button onClick={resetSession} aria-label="Start new session" style={{
            padding: "6px 14px", borderRadius: 8,
            border: `1.5px solid ${BRAND.green}`, color: BRAND.green,
            background: "transparent",
            fontSize: 11, fontWeight: 700, cursor: "pointer",
            fontFamily: "inherit", transition: "all 0.15s ease",
          }}
            onMouseEnter={e => { e.target.style.backgroundColor = BRAND.green; e.target.style.color = BRAND.white; }}
            onMouseLeave={e => { e.target.style.backgroundColor = "transparent"; e.target.style.color = BRAND.green; }}
          >New Session</button>
        </div>
      </header>

      {/* ─── Tab Bar ─── */}
      <nav style={{
        display: "flex", backgroundColor: BRAND.white,
        borderBottom: `1px solid ${BRAND.border}`, flexShrink: 0,
        padding: "0 20px",
      }} role="tablist" aria-label="Assistant views">
        {[
          { id: "chat", label: "Chat", icon: "💬" },
          { id: "voice", label: "Voice", icon: "🎙" },
          { id: "architecture", label: "Architecture", icon: "⚙️" },
        ].map(tab => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`panel-${tab.id}`}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: "10px 18px", cursor: "pointer",
              fontSize: 12, fontWeight: activeTab === tab.id ? 700 : 500,
              color: activeTab === tab.id ? BRAND.green : BRAND.textSecondary,
              borderBottom: activeTab === tab.id ? `2.5px solid ${BRAND.green}` : "2.5px solid transparent",
              borderTop: "none", borderLeft: "none", borderRight: "none",
              background: "transparent", fontFamily: "inherit",
              transition: "all 0.15s ease",
              letterSpacing: 0.1,
            }}
          >
            <span style={{ marginRight: 5 }}>{tab.icon}</span>{tab.label}
          </button>
        ))}
      </nav>

      {/* ─── Content Panels ─── */}
      {activeTab === "architecture" ? (
        <div id="panel-architecture" role="tabpanel" style={{ flex: 1, overflowY: "auto" }}>
          <ArchitectureView />
        </div>
      ) : activeTab === "voice" ? (
        <div id="panel-voice" role="tabpanel" style={{ flex: 1, overflowY: "auto", display: "flex" }}>
          <VoiceView isListening={isListening} toggleVoice={toggleVoice} />
        </div>
      ) : (
        <>
          {/* ─── Chat Messages ─── */}
          <div
            id="panel-chat"
            role="tabpanel"
            style={{ flex: 1, overflowY: "auto", padding: "24px 20px" }}
          >
            <div role="list" aria-label="Conversation">
              {messages.map((msg, i) => (
                <ChatMessage
                  key={msg.id}
                  msg={msg}
                  isLast={i === messages.length - 1}
                  onFeedback={handleFeedback}
                  onCopy={() => {}}
                  onEscalate={handleEscalate}
                />
              ))}
            </div>
            {isTyping && (
              <div style={{
                display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 16,
                animation: "fadeSlideIn 0.25s ease-out",
              }}>
                <div style={{
                  width: 34, height: 34, borderRadius: "50%", background: BRAND.darkGray,
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>
                  <MicronIcon size={17} />
                </div>
                <div style={{
                  padding: "14px 18px", borderRadius: "3px 18px 18px 18px",
                  backgroundColor: BRAND.surface, border: `1px solid ${BRAND.border}`,
                  boxShadow: BRAND.shadow,
                }}>
                  <TypingIndicator />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* ─── Suggestions ─── */}
          {showSuggestions && (
            <div style={{
              padding: "0 20px 12px", flexShrink: 0,
              display: "flex", flexWrap: "wrap", gap: 8,
            }} role="group" aria-label="Suggested questions">
              {SUGGESTED_QUESTIONS.map((q, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(q.text)}
                  style={{
                    padding: "7px 14px", borderRadius: 20,
                    border: `1.5px solid ${BRAND.border}`, background: BRAND.surface,
                    color: BRAND.textPrimary, fontSize: 12, fontWeight: 500,
                    cursor: "pointer", fontFamily: "inherit",
                    transition: "all 0.15s ease",
                    display: "inline-flex", alignItems: "center", gap: 6,
                    boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
                  }}
                  onMouseEnter={e => {
                    e.target.style.borderColor = BRAND.green;
                    e.target.style.color = BRAND.green;
                    e.target.style.boxShadow = "0 2px 6px rgba(134,188,37,0.12)";
                  }}
                  onMouseLeave={e => {
                    e.target.style.borderColor = BRAND.border;
                    e.target.style.color = BRAND.textPrimary;
                    e.target.style.boxShadow = "0 1px 2px rgba(0,0,0,0.03)";
                  }}
                  aria-label={`Ask: ${q.text}`}
                >
                  <span style={{ fontSize: 13, lineHeight: 1 }}>{q.icon}</span>
                  {q.text}
                </button>
              ))}
            </div>
          )}

          {/* ─── Input Area ─── */}
          <div style={{
            padding: "14px 20px 16px", backgroundColor: BRAND.white,
            borderTop: `1px solid ${BRAND.border}`, flexShrink: 0,
          }}>
            <div style={{
              display: "flex", gap: 8, alignItems: "center",
              background: BRAND.bgLight, borderRadius: 14,
              padding: "4px 4px 4px 16px",
              border: `1.5px solid ${BRAND.border}`,
              transition: "border-color 0.2s ease, box-shadow 0.2s ease",
            }}
              onFocus={e => {
                e.currentTarget.style.borderColor = BRAND.green;
                e.currentTarget.style.boxShadow = "0 0 0 3px rgba(134,188,37,0.1)";
              }}
              onBlur={e => {
                e.currentTarget.style.borderColor = BRAND.border;
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about AI, Microsoft tools, security, or support…"
                aria-label="Type your question"
                disabled={isTyping}
                style={{
                  flex: 1, border: "none", outline: "none",
                  background: "transparent", fontSize: 14,
                  fontFamily: "inherit", color: BRAND.textPrimary,
                  padding: "10px 0",
                  opacity: isTyping ? 0.5 : 1,
                }}
              />
              <button
                onClick={toggleVoice}
                aria-label={isListening ? "Stop listening" : "Voice input"}
                style={{
                  width: 38, height: 38, borderRadius: 10,
                  backgroundColor: isListening ? BRAND.red : BRAND.darkGray,
                  border: "none", cursor: "pointer", color: BRAND.white,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "all 0.2s ease", flexShrink: 0,
                  animation: isListening ? "voicePulse 1.5s infinite" : "none",
                }}
              >
                <VoiceIcon size={15} />
              </button>
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || isTyping}
                aria-label="Send message"
                style={{
                  width: 38, height: 38, borderRadius: 10,
                  backgroundColor: input.trim() && !isTyping ? BRAND.green : BRAND.gray,
                  border: "none",
                  cursor: input.trim() && !isTyping ? "pointer" : "default",
                  color: BRAND.white,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "background-color 0.2s ease", flexShrink: 0,
                }}
              >
                <SendIcon />
              </button>
            </div>
            <div style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              marginTop: 8, padding: "0 4px",
            }}>
              <span style={{ fontSize: 10, color: BRAND.textTertiary, letterSpacing: 0.2 }}>
                Copilot Studio · Azure OpenAI · Azure AI Search · Azure Speech
              </span>
              <span style={{ fontSize: 10, color: BRAND.textTertiary, letterSpacing: 0.2 }}>
                Deloitte Digital · Enterprise v3.0
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

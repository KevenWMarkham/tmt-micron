const fs = require("fs");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, HeadingLevel, BorderStyle, WidthType,
  ShadingType, PageNumber, PageBreak, LevelFormat,
} = require("docx");

// ─── Shared helpers ───
const ACCENT = "86BC25";
const border = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
const borders = { top: border, bottom: border, left: border, right: border };
const cellMargins = { top: 80, bottom: 80, left: 120, right: 120 };

function headerCell(text, width) {
  return new TableCell({
    borders,
    width: { size: width, type: WidthType.DXA },
    shading: { fill: ACCENT, type: ShadingType.CLEAR },
    margins: cellMargins,
    children: [new Paragraph({ children: [new TextRun({ text, bold: true, color: "FFFFFF", font: "Arial", size: 20 })] })],
  });
}

function cell(text, width, opts = {}) {
  const runs = Array.isArray(text)
    ? text
    : [new TextRun({ text, font: "Arial", size: 20, ...opts })];
  return new TableCell({
    borders,
    width: { size: width, type: WidthType.DXA },
    shading: opts.fill ? { fill: opts.fill, type: ShadingType.CLEAR } : undefined,
    margins: cellMargins,
    verticalAlign: opts.vAlign,
    children: [new Paragraph({ alignment: opts.align, children: runs })],
  });
}

function priorityCell(priority, width) {
  const colors = {
    "Must": { fill: "FDE8E8", color: "CC0000" },
    "Should": { fill: "FFF3CD", color: "856404" },
    "Could": { fill: "D4EDDA", color: "155724" },
  };
  const c = colors[priority] || colors["Could"];
  return cell([new TextRun({ text: priority, bold: true, color: c.color, font: "Arial", size: 20 })], width, { fill: c.fill, align: AlignmentType.CENTER });
}

function heading1(text) {
  return new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun(text)] });
}
function heading2(text) {
  return new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun(text)] });
}
function heading3(text) {
  return new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun(text)] });
}
function para(text, opts = {}) {
  return new Paragraph({
    spacing: { after: opts.after || 200 },
    children: [new TextRun({ text, font: "Arial", size: 22, ...opts })],
  });
}
function boldPara(label, text) {
  return new Paragraph({
    spacing: { after: 200 },
    children: [
      new TextRun({ text: label, font: "Arial", size: 22, bold: true }),
      new TextRun({ text, font: "Arial", size: 22 }),
    ],
  });
}
function bullet(text) {
  return new Paragraph({
    numbering: { reference: "bullets", level: 0 },
    children: [new TextRun({ text, font: "Arial", size: 22 })],
  });
}
function bulletBold(label, text) {
  return new Paragraph({
    numbering: { reference: "bullets", level: 0 },
    children: [
      new TextRun({ text: label, font: "Arial", size: 22, bold: true }),
      new TextRun({ text, font: "Arial", size: 22 }),
    ],
  });
}

// ─── Functional Requirements ───
const requirements = [
  {
    id: "FR-01", name: "Real-Time Voice Streaming",
    priority: "Must", gap: "Gap #1",
    desc: "Support real-time bidirectional audio streaming using Azure Voice Live API with WebSocket transport, 24kHz PCM16 audio input, server-side voice activity detection (VAD), deep noise suppression, and echo cancellation.",
    criteria: [
      "WebSocket connection established to Voice Live API endpoint within 2 seconds",
      "Audio input processed at 24kHz PCM16 mono format",
      "Server VAD detects speech start/end with configurable thresholds",
      "Noise suppression active for enterprise office environments",
      "Echo cancellation functional for speakerphone scenarios",
    ],
  },
  {
    id: "FR-02", name: "Chat-Based Q&A with RAG Pipeline",
    priority: "Must", gap: "Gap #4 (partial)",
    desc: "Provide text-based conversational Q&A using a Retrieval-Augmented Generation pipeline. User queries are semantically matched against an indexed knowledge base using Azure AI Search, with Azure OpenAI GPT-4o generating grounded responses.",
    criteria: [
      "Queries return semantically relevant answers from the knowledge base",
      "Responses include source attribution (document name and section)",
      "Confidence scores displayed for each response",
      "Response latency under 2 seconds for 95% of queries",
    ],
  },
  {
    id: "FR-03", name: "Function Calling / Tool Use",
    priority: "Must", gap: "Gap #7",
    desc: "Enable the AI agent to invoke callable functions during conversations to perform actions such as searching knowledge bases, querying security policies, checking project status, and retrieving analytics summaries. Functions are defined as tools available to the Azure OpenAI model.",
    criteria: [
      "Minimum 5 callable functions registered with the model",
      "Function invocation visible in the UI with function name and parameters",
      "Function execution completes within 1 second",
      "Results from function calls are incorporated into the agent response",
    ],
  },
  {
    id: "FR-04", name: "Human Agent Escalation",
    priority: "Must", gap: "Covered",
    desc: "When the AI agent cannot resolve a query with sufficient confidence, provide seamless escalation to a human agent through Dynamics 365 Contact Center. The full conversation context (transcript, category, sentiment) transfers to the human agent.",
    criteria: [
      "Escalation triggered automatically for confidence scores below threshold",
      "One-click escalation button available on low-confidence responses",
      "Full conversation transcript passed to Dynamics 365",
      "User notified of handoff with estimated wait time",
    ],
  },
  {
    id: "FR-05", name: "Conversation Analytics & Sentiment Scoring",
    priority: "Should", gap: "Gap #2",
    desc: "Automatically analyze completed conversations using GPT-4o to generate sentiment scores, satisfaction assessments, call reason categorization (from 50+ predefined categories), and 1\u20135 call ratings. Results are persisted to Cosmos DB for trending and reporting.",
    criteria: [
      "Sentiment analysis (positive/neutral/negative) computed for each conversation",
      "Call reason categorized from predefined taxonomy",
      "1\u20135 call rating with written justification generated",
      "Analytics results stored in Cosmos DB within 30 seconds of conversation end",
    ],
  },
  {
    id: "FR-06", name: "Multi-Channel Support",
    priority: "Must", gap: "Partial #3",
    desc: "Deliver the AI assistant across three channels with full content parity: Microsoft Teams (chat and voice), browser-embedded widget, and telephony via Azure Communication Services PSTN integration.",
    criteria: [
      "Same agent accessible via Teams, browser, and telephony channels",
      "Consistent response quality and knowledge across all channels",
      "Channel-specific UX optimizations (e.g., voice prompts for telephony)",
      "Session context maintained when switching channels",
    ],
  },
  {
    id: "FR-07", name: "Session Management & Conversation Continuity",
    priority: "Should", gap: "Gap (Quickstart)",
    desc: "Support conversation continuity across sessions using persistent conversation IDs. Users can resume prior conversations, and the agent retains context from previous interactions within the same session.",
    criteria: [
      "Conversation ID persisted to enable session resumption",
      "Prior conversation context loaded on session resume",
      "New session option clears context and starts fresh",
      "Session metadata (start time, query count, duration) tracked",
    ],
  },
  {
    id: "FR-08", name: "Architecture Flexibility",
    priority: "Should", gap: "Gap #5",
    desc: "Support two orchestration paths: Copilot Studio (low-code, rapid deployment) and Azure AI Foundry with Foundry Agent Service (programmatic, enterprise governance). Both paths share the same AI, knowledge, and integration layers.",
    criteria: [
      "Copilot Studio path operational with Bot Service and Power Automate",
      "AI Foundry path operational with Foundry Agent Service and Logic Apps",
      "Switching between paths does not require re-provisioning AI or knowledge layers",
      "Trade-off documentation available for stakeholder decision-making",
    ],
  },
  {
    id: "FR-09", name: "Data Pipeline (Cosmos DB, Fabric, Power BI)",
    priority: "Could", gap: "Gap #3, #5",
    desc: "Implement an end-to-end data pipeline: conversation data stored in Cosmos DB, mirrored in real-time to Microsoft Fabric OneLake, with custom Data Agents for natural language querying and Power BI dashboards for executive reporting.",
    criteria: [
      "Conversation data persisted to Cosmos DB",
      "Real-time mirroring from Cosmos DB to Fabric OneLake",
      "Power BI dashboard displaying conversation trends and KPIs",
      "Data Agent responding to natural language queries about conversation data",
    ],
  },
  {
    id: "FR-10", name: "Logging & Observability",
    priority: "Should", gap: "Gap (Quickstart)",
    desc: "Implement dual logging: technical logs (WebSocket events, audio stream status, errors, network diagnostics) and conversation logs (user transcripts, agent responses, session config). Logs flow to Azure Monitor for centralized observability.",
    criteria: [
      "Technical log generated for each session with WebSocket diagnostics",
      "Conversation log generated with full transcript",
      "Logs queryable in Azure Monitor within 5 minutes",
      "Alert rules configured for error rate thresholds",
    ],
  },
  {
    id: "FR-11", name: "Multi-Language Support",
    priority: "Could", gap: "Partial",
    desc: "Support multiple languages for voice interactions using Voice Live API\u2019s 140+ speech-to-text locales and 600+ text-to-speech voices. Initial support for English (en-US) with roadmap for additional languages based on user demographics.",
    criteria: [
      "English (en-US) fully functional for voice and chat",
      "Language selection configurable per session",
      "Voice output uses locale-appropriate neural voice",
      "Knowledge base responses available in selected language",
    ],
  },
  {
    id: "FR-12", name: "Model Tier Selection",
    priority: "Could", gap: "Gap (Quickstart)",
    desc: "Support model selection across three pricing tiers (Pro, Basic, Lite) for cost optimization. Pro tier for complex reasoning (GPT-4o, GPT-4.1), Basic for standard interactions (GPT-4o-mini), Lite for high-volume simple queries (phi4-mini).",
    criteria: [
      "Model tier configurable per agent or per conversation type",
      "Automatic tier routing based on query complexity",
      "Cost tracking per tier with monthly reporting",
      "Performance benchmarks documented for each tier",
    ],
  },
];

// ─── Non-Functional Requirements ───
const nfrs = [
  { category: "Security", items: [
    "Microsoft Entra ID mandatory for all authentication (no API key fallback)",
    "Role-Based Access Control (RBAC) for agent management and data access",
    "Data residency within customer\u2019s Azure tenant and selected region",
    "Private endpoints for all Azure service connections",
    "Encryption at rest (AES-256) and in transit (TLS 1.2+)",
  ]},
  { category: "Performance", items: [
    "Chat response latency: < 2 seconds for 95th percentile",
    "Voice round-trip latency: < 500ms for speech-to-response",
    "WebSocket connection establishment: < 2 seconds",
    "Knowledge base search: < 500ms for semantic retrieval",
  ]},
  { category: "Availability", items: [
    "99.9% uptime SLA for production deployment",
    "Graceful degradation when individual services are unavailable",
    "Automatic failover for critical path components",
  ]},
  { category: "Scalability", items: [
    "Support 100 concurrent voice sessions at launch",
    "Support 500 concurrent chat sessions at launch",
    "Horizontal scaling via Azure auto-scale groups",
  ]},
];

// ─── Resource Plan ───
const RATE = 250;
const roles = ["Solution Architect", "AI/ML Engineer", "Full-Stack Developer", "QA Engineer", "Project Manager"];

// Sprint allocations: [SA, AI/ML, FSD, QA, PM] hours per sprint
const sprints = [
  { name: "Sprint 1", phase: "Phase 2", focus: "Voice Live API integration + function calling", hours: [40, 60, 60, 20, 20] },
  { name: "Sprint 2", phase: "Phase 2", focus: "Voice refinement + chat RAG pipeline", hours: [20, 40, 60, 40, 20] },
  { name: "Sprint 3", phase: "Phase 3", focus: "Analytics pipeline + Cosmos DB", hours: [30, 50, 40, 30, 20] },
  { name: "Sprint 4", phase: "Phase 3", focus: "Fabric integration + Power BI dashboards", hours: [20, 40, 50, 30, 20] },
  { name: "Sprint 5", phase: "Phase 4", focus: "Multi-channel + logging + observability", hours: [30, 30, 50, 40, 20] },
  { name: "Sprint 6", phase: "Phase 4", focus: "Security hardening + production readiness", hours: [40, 20, 30, 40, 20] },
];

const totalByRole = roles.map((_, ri) => sprints.reduce((sum, s) => sum + s.hours[ri], 0));
const totalHours = totalByRole.reduce((a, b) => a + b, 0);
const totalCost = totalHours * RATE;

// Phase summaries
const phases = [
  { name: "Phase 1: Current Demo", sprints: "Complete", hours: 0, desc: "Existing POC with chat, voice UI mockup, architecture visualization" },
  { name: "Phase 2: Voice + Function Calling", sprints: "Sprints 1\u20132", hours: sprints[0].hours.reduce((a,b)=>a+b,0) + sprints[1].hours.reduce((a,b)=>a+b,0), desc: "Voice Live API integration, function calling, RAG pipeline" },
  { name: "Phase 3: Analytics + Fabric", sprints: "Sprints 3\u20134", hours: sprints[2].hours.reduce((a,b)=>a+b,0) + sprints[3].hours.reduce((a,b)=>a+b,0), desc: "Conversation analytics, Cosmos DB, Fabric mirroring, Power BI" },
  { name: "Phase 4: Production", sprints: "Sprints 5\u20136", hours: sprints[4].hours.reduce((a,b)=>a+b,0) + sprints[5].hours.reduce((a,b)=>a+b,0), desc: "Multi-channel, logging, security hardening, production deployment" },
];

// ─── Build Document ───
const doc = new Document({
  styles: {
    default: { document: { run: { font: "Arial", size: 22 } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 36, bold: true, font: "Arial", color: "333333" },
        paragraph: { spacing: { before: 360, after: 200 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 28, bold: true, font: "Arial", color: ACCENT },
        paragraph: { spacing: { before: 240, after: 160 }, outlineLevel: 1 } },
      { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 24, bold: true, font: "Arial", color: "555555" },
        paragraph: { spacing: { before: 200, after: 120 }, outlineLevel: 2 } },
    ],
  },
  numbering: {
    config: [
      { reference: "bullets", levels: [{ level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: "numbers", levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
    ],
  },
  sections: [{
    properties: {
      page: {
        size: { width: 12240, height: 15840 },
        margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
      },
    },
    headers: {
      default: new Header({
        children: [new Paragraph({
          border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: ACCENT, space: 1 } },
          children: [
            new TextRun({ text: "AI Support Assistant \u2014 Business Requirements Document", italics: true, color: "999999", font: "Arial", size: 18 }),
          ],
        })],
      }),
    },
    footers: {
      default: new Footer({
        children: [new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({ text: "Page ", font: "Arial", size: 18, color: "999999" }),
            new TextRun({ children: [PageNumber.CURRENT], font: "Arial", size: 18, color: "999999" }),
          ],
        })],
      }),
    },
    children: [
      // ═══════════════════════════════════════
      // 1. COVER PAGE
      // ═══════════════════════════════════════
      new Paragraph({ spacing: { before: 3000 } }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
        children: [new TextRun({ text: "Business Requirements Document", size: 56, bold: true, font: "Arial", color: "333333" })],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 100 },
        children: [new TextRun({ text: "AI Support Assistant", size: 40, font: "Arial", color: ACCENT })],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 600 },
        children: [new TextRun({ text: "Enterprise Conversational AI Platform", size: 28, font: "Arial", color: "666666" })],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 100 },
        children: [new TextRun({ text: "Version 1.0  |  March 2026", size: 22, font: "Arial", color: "999999" })],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 100 },
        children: [new TextRun({ text: "Prepared by: Partner Agency", size: 22, font: "Arial", color: "999999" })],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
        children: [new TextRun({ text: "Prepared for: Acme Corp", size: 22, font: "Arial", color: "999999" })],
      }),

      new Paragraph({ children: [new PageBreak()] }),

      // ═══════════════════════════════════════
      // 2. EXECUTIVE SUMMARY
      // ═══════════════════════════════════════
      heading1("1. Executive Summary"),

      para("Acme Corp requires a modern, AI-powered support assistant to transform its internal and customer-facing support operations. Current support channels are fragmented across email, phone, and ad-hoc Teams messages, leading to inconsistent response quality, high escalation rates, and limited operational visibility."),

      para("This Business Requirements Document defines the functional and non-functional requirements for an AI Support Assistant built entirely on the Microsoft Azure enterprise stack. The solution leverages Azure OpenAI for natural language understanding, Azure AI Search for knowledge retrieval (RAG pipeline), Azure Voice Live API for real-time voice streaming, and Microsoft Copilot Studio or Azure AI Foundry for agent orchestration."),

      para("The platform is designed to:"),
      bullet("Provide 24/7 AI-powered support across chat, voice, and telephony channels"),
      bullet("Reduce human agent escalation by 40% through accurate, grounded responses"),
      bullet("Deliver consistent knowledge from approved documentation via Retrieval-Augmented Generation"),
      bullet("Generate actionable conversation analytics through automated sentiment scoring and categorization"),
      bullet("Maintain enterprise-grade security through Microsoft Entra ID, private endpoints, and data residency controls"),

      para("A phased delivery approach across 6 two-week sprints builds incrementally from the current proof-of-concept demo through production readiness, with clear success criteria at each phase gate."),

      new Paragraph({ children: [new PageBreak()] }),

      // ═══════════════════════════════════════
      // 2. STAKEHOLDERS
      // ═══════════════════════════════════════
      heading1("2. Stakeholders"),

      para("Successful deployment of the AI Support Assistant requires engagement from the following functional areas. Each stakeholder group plays a critical role in requirements definition, validation, adoption, and ongoing governance. Functional areas are mapped to a semiconductor organization structure."),

      // Stakeholder table
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [2200, 1800, 5360],
        rows: [
          new TableRow({ children: [
            headerCell("Functional Area", 2200), headerCell("Role(s)", 1800), headerCell("Responsibilities & Demo Involvement", 5360),
          ]}),
          new TableRow({ children: [
            cell([new TextRun({ text: "Executive Sponsor", bold: true, font: "Arial", size: 20 })], 2200),
            cell("CIO, CTO, SVP of Global Operations", 1800),
            cell("Champions the initiative at the leadership level. Provides budget authority, resolves cross-functional conflicts between business units (DRAM, NAND, SSD), and validates strategic alignment with corporate digital transformation objectives. Approves phase gate transitions and final go-live.", 5360),
          ]}),
          new TableRow({ children: [
            cell([new TextRun({ text: "Technical Support Engineering", bold: true, font: "Arial", size: 20 })], 2200),
            cell("VP of Technical Support, TSE Managers, FAE Team Leads", 1800),
            cell("Primary business owners. Define knowledge base content covering product specifications, qualification data, reliability reports, and design-in guidance. Set escalation policies for Tier 1/2/3 support routing, call reason taxonomy (RMA, qualification, compatibility, firmware), and quality thresholds. Validate chat responses against product datasheets. Key users of the Analytics dashboard for case deflection and resolution metrics.", 5360),
          ]}),
          new TableRow({ children: [
            cell([new TextRun({ text: "Applications Engineering", bold: true, font: "Arial", size: 20 })], 2200),
            cell("Applications Engineers, Solutions Architects, Design-In Support", 1800),
            cell("Provide deep technical SME input for the knowledge base: memory interface design, signal integrity, thermal management, firmware integration, and platform compatibility. Validate that AI responses to technical queries meet engineering accuracy standards. Define when queries must escalate from AI to human AE (e.g., custom characterization requests, NDA-protected data).", 5360),
          ]}),
          new TableRow({ children: [
            cell([new TextRun({ text: "Manufacturing / Fab Operations", bold: true, font: "Arial", size: 20 })], 2200),
            cell("VP of Manufacturing, Fab Managers, Process Engineers", 1800),
            cell("Stakeholders for internal-facing support use cases: fab process documentation, equipment troubleshooting, yield analysis procedures, and clean room protocols. Define knowledge domains for internal engineer self-service. Validate that sensitive manufacturing IP is properly classified and access-controlled within the RAG pipeline.", 5360),
          ]}),
          new TableRow({ children: [
            cell([new TextRun({ text: "IT / Cloud Infrastructure", bold: true, font: "Arial", size: 20 })], 2200),
            cell("Cloud Architect, Platform Engineer, DevOps Lead", 1800),
            cell("Provision and manage Azure resources (OpenAI, AI Search, Cosmos DB, Fabric). Configure networking (private endpoints, VNets, ExpressRoute to on-prem fab systems), CI/CD pipelines, and monitoring. Integrate with existing semiconductor ERP (SAP) and PLM systems. Validate the Architecture tab for technical accuracy and feasibility.", 5360),
          ]}),
          new TableRow({ children: [
            cell([new TextRun({ text: "Information Security & Export Controls", bold: true, font: "Arial", size: 20 })], 2200),
            cell("CISO, Security Architect, Export Control Officer", 1800),
            cell("Approve security architecture: Entra ID integration, RBAC policies, data residency controls, and encryption standards. Critical semiconductor-specific concerns: ITAR/EAR export control compliance for restricted product data, IP protection for process technology and design rules, CHIPS Act compliance for government-funded programs, and controlled unclassified information (CUI) handling. Review AI safety guardrails to prevent inadvertent disclosure of restricted technical data.", 5360),
          ]}),
          new TableRow({ children: [
            cell([new TextRun({ text: "Supply Chain / Sales Operations", bold: true, font: "Arial", size: 20 })], 2200),
            cell("VP of Sales Ops, Supply Chain Manager, Order Management Lead", 1800),
            cell("Define support workflows for customer-facing queries: order status, lead times, allocation updates, inventory availability, and pricing. Own the integration requirements with SAP and CRM (Dynamics 365) for real-time order data. Validate function calling for order lookup and shipment tracking. Key consumers of the Analytics dashboard for customer interaction trends.", 5360),
          ]}),
          new TableRow({ children: [
            cell([new TextRun({ text: "Data & Analytics", bold: true, font: "Arial", size: 20 })], 2200),
            cell("Chief Data Officer, Analytics Lead, BI Developer", 1800),
            cell("Define KPIs, reporting requirements, and data governance policies. Own the Cosmos DB to Fabric to Power BI pipeline. Integrate with existing manufacturing intelligence and yield analytics platforms. Validate the Analytics tab for metric accuracy, sentiment scoring methodology, and dashboard design.", 5360),
          ]}),
          new TableRow({ children: [
            cell([new TextRun({ text: "AI / Machine Learning", bold: true, font: "Arial", size: 20 })], 2200),
            cell("AI/ML Lead, Prompt Engineer, Data Scientist", 1800),
            cell("Configure Azure OpenAI models, tune RAG pipeline parameters for semiconductor-specific terminology and part numbers, design function calling schemas, and optimize prompt templates. Evaluate model tier selection (Pro for complex technical queries, Basic for order status, Lite for FAQs). Coordinate with existing AI/ML teams working on yield prediction and defect detection.", 5360),
          ]}),
          new TableRow({ children: [
            cell([new TextRun({ text: "Unified Communications / Telephony", bold: true, font: "Arial", size: 20 })], 2200),
            cell("UC Manager, Teams Administrator, Telephony Engineer", 1800),
            cell("Configure Microsoft Teams voice channels, Azure Communication Services for PSTN/telephony, and browser widget deployment for customer portal integration. Validate the Voice tab for channel parity and Voice Live API integration. Coordinate with existing global telephony infrastructure across fab sites and regional offices.", 5360),
          ]}),
          new TableRow({ children: [
            cell([new TextRun({ text: "Knowledge Management / Technical Publications", bold: true, font: "Arial", size: 20 })], 2200),
            cell("Knowledge Manager, Technical Writers, Product Marketing", 1800),
            cell("Curate and index knowledge base content: product datasheets, technical notes, reliability qualification reports, application notes, JEDEC compliance documentation, firmware release notes, and design guides. Define content classification (public, customer NDA, internal only) for RAG access control. Manage update workflows as new product revisions and errata are published.", 5360),
          ]}),
          new TableRow({ children: [
            cell([new TextRun({ text: "Product / Digital Experience", bold: true, font: "Arial", size: 20 })], 2200),
            cell("Product Owner, UX Designer, Digital Channel Lead", 1800),
            cell("Define user experience requirements and branding guidelines for customer-facing and internal portals. Own the end-user journey across chat, voice, and self-service channels. Design conversation flows for product selection, cross-reference lookup, and parametric search. Validate branded UX, suggested questions, and response formatting.", 5360),
          ]}),
          new TableRow({ children: [
            cell([new TextRun({ text: "Legal / Privacy / Trade Compliance", bold: true, font: "Arial", size: 20 })], 2200),
            cell("General Counsel, Privacy Officer, Trade Compliance Director", 1800),
            cell("Review AI disclosure requirements, data retention policies, and conversation recording consent. Semiconductor-specific: export control screening for customer interactions, trade secret protection in AI responses, CHIPS Act reporting obligations, NDA enforcement for restricted product data, and anti-circumvention compliance. Approve terms of use for AI-assisted interactions.", 5360),
          ]}),
          new TableRow({ children: [
            cell([new TextRun({ text: "Change Management / Training", bold: true, font: "Arial", size: 20 })], 2200),
            cell("Change Manager, Training Lead, Internal Comms", 1800),
            cell("Plan organizational readiness across global sites (fabs, design centers, regional offices). Develop training materials for TSE agents, FAEs, and end users. Manage communication campaigns and track adoption metrics. Coordinate pilot group selection \u2014 recommended starting with one product line (e.g., DRAM or SSD) before expanding.", 5360),
          ]}),
          new TableRow({ children: [
            cell([new TextRun({ text: "Quality & Reliability Engineering", bold: true, font: "Arial", size: 20 })], 2200),
            cell("QA Director, Reliability Engineers, Test Engineers", 1800),
            cell("Define test strategies for conversational AI accuracy against product specifications (ISO 9001, IATF 16949 automotive, AEC-Q100 qualification standards). Validate that AI responses citing reliability data, qualification reports, and failure analysis procedures meet engineering accuracy standards. Perform load testing for concurrent voice and chat sessions across global time zones.", 5360),
          ]}),
        ],
      }),

      new Paragraph({ spacing: { before: 300 } }),

      heading2("2.1 RACI Summary"),
      para("The following matrix outlines key decision rights across the project lifecycle:"),

      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [2800, 1640, 1640, 1640, 1640],
        rows: [
          new TableRow({ children: [
            headerCell("Decision Area", 2800), headerCell("Responsible", 1640), headerCell("Accountable", 1640), headerCell("Consulted", 1640), headerCell("Informed", 1640),
          ]}),
          new TableRow({ children: [
            cell("Architecture & technology selection", 2800),
            cell("IT / Cloud", 1640), cell("Executive Sponsor", 1640), cell("Security, AI/ML", 1640), cell("All", 1640),
          ]}),
          new TableRow({ children: [
            cell("Knowledge base content & classification", 2800),
            cell("Knowledge Mgmt / Tech Pubs", 1640), cell("Tech Support Eng", 1640), cell("Apps Eng, Product", 1640), cell("Legal, QA", 1640),
          ]}),
          new TableRow({ children: [
            cell("Security, export controls & IP protection", 2800),
            cell("InfoSec / Export Control", 1640), cell("CISO", 1640), cell("Legal, IT", 1640), cell("Executive Sponsor", 1640),
          ]}),
          new TableRow({ children: [
            cell("AI model configuration & tuning", 2800),
            cell("AI/ML", 1640), cell("IT / Cloud", 1640), cell("Tech Support, Apps Eng", 1640), cell("Product", 1640),
          ]}),
          new TableRow({ children: [
            cell("User experience & branding", 2800),
            cell("Product / UX", 1640), cell("Tech Support Eng", 1640), cell("Change Mgmt", 1640), cell("Legal", 1640),
          ]}),
          new TableRow({ children: [
            cell("Go-live & rollout (by product line)", 2800),
            cell("Change Mgmt", 1640), cell("Executive Sponsor", 1640), cell("All functional areas", 1640), cell("End Users", 1640),
          ]}),
          new TableRow({ children: [
            cell("Analytics & reporting", 2800),
            cell("Data & Analytics", 1640), cell("Tech Support Eng", 1640), cell("AI/ML, Supply Chain", 1640), cell("Executive Sponsor", 1640),
          ]}),
          new TableRow({ children: [
            cell("Voice & telephony channels", 2800),
            cell("UC / Telephony", 1640), cell("IT / Cloud", 1640), cell("Tech Support Eng", 1640), cell("Product", 1640),
          ]}),
          new TableRow({ children: [
            cell("Order & supply chain integration", 2800),
            cell("Supply Chain / Sales Ops", 1640), cell("IT / Cloud", 1640), cell("Tech Support, Apps Eng", 1640), cell("Legal", 1640),
          ]}),
          new TableRow({ children: [
            cell("Technical accuracy validation", 2800),
            cell("Quality & Reliability", 1640), cell("Apps Engineering", 1640), cell("Tech Support, AI/ML", 1640), cell("Knowledge Mgmt", 1640),
          ]}),
        ],
      }),

      new Paragraph({ children: [new PageBreak()] }),

      // ═══════════════════════════════════════
      // 3. BUSINESS OBJECTIVES
      // ═══════════════════════════════════════
      heading1("3. Business Objectives"),

      bulletBold("24/7 AI-Powered Support: ", "Provide always-on support coverage without staffing constraints. The AI assistant handles routine queries, freeing human agents for complex issues."),
      bulletBold("Reduced Escalation Rate: ", "Target 40% reduction in human agent escalations through high-accuracy, confidence-scored responses with transparent source attribution."),
      bulletBold("Consistent Knowledge Delivery: ", "Ensure every response is grounded in approved, up-to-date documentation through the RAG pipeline, eliminating inconsistencies from individual agent knowledge gaps."),
      bulletBold("Multi-Channel Parity: ", "Deliver identical quality across Microsoft Teams, browser widget, and telephony channels with shared agent logic and knowledge base."),
      bulletBold("Operational Visibility: ", "Provide real-time analytics on conversation volume, sentiment trends, call reasons, and satisfaction scores through integrated Cosmos DB, Fabric, and Power BI dashboards."),
      bulletBold("Enterprise Security Posture: ", "Maintain zero-trust security architecture with mandatory Entra ID authentication, RBAC, private endpoints, and data residency within the Azure tenant."),

      new Paragraph({ children: [new PageBreak()] }),

      // ═══════════════════════════════════════
      // 4. SCOPE
      // ═══════════════════════════════════════
      heading1("4. Scope"),

      heading2("4.1 In Scope"),
      bullet("AI-powered chat Q&A with RAG pipeline (Azure AI Search + Azure OpenAI)"),
      bullet("Real-time voice streaming via Azure Voice Live API"),
      bullet("Function calling / tool use for knowledge retrieval and workflow actions"),
      bullet("Human agent escalation through Dynamics 365 Contact Center"),
      bullet("Conversation analytics with sentiment scoring and categorization"),
      bullet("Multi-channel deployment: Teams, browser, telephony"),
      bullet("Architecture support for both Copilot Studio and AI Foundry orchestration paths"),
      bullet("Data pipeline: Cosmos DB, Microsoft Fabric, Power BI"),
      bullet("Logging and observability via Azure Monitor"),
      bullet("Session management and conversation continuity"),

      heading2("4.2 Out of Scope"),
      bullet("Custom mobile application development (native iOS/Android)"),
      bullet("Integration with non-Microsoft CRM platforms"),
      bullet("Custom LLM training or fine-tuning (uses Azure OpenAI managed models)"),
      bullet("Physical infrastructure provisioning (cloud-only deployment)"),
      bullet("End-user training program development (separate workstream)"),
      bullet("Third-party chatbot framework integration"),

      new Paragraph({ children: [new PageBreak()] }),

      // ═══════════════════════════════════════
      // 5. FUNCTIONAL REQUIREMENTS
      // ═══════════════════════════════════════
      heading1("5. Functional Requirements"),

      para("Requirements are prioritized using MoSCoW classification: Must (critical for launch), Should (important but not blocking), Could (desirable if time/budget allows)."),

      // Requirements summary table
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [900, 3460, 1000, 4000],
        rows: [
          new TableRow({ children: [
            headerCell("ID", 900), headerCell("Requirement", 3460),
            headerCell("Priority", 1000), headerCell("Gap Reference", 4000),
          ]}),
          ...requirements.map(r =>
            new TableRow({ children: [
              cell(r.id, 900, { bold: true }),
              cell(r.name, 3460),
              priorityCell(r.priority, 1000),
              cell(r.gap, 4000),
            ]})
          ),
        ],
      }),

      new Paragraph({ spacing: { before: 300 } }),

      // Detailed requirements
      ...requirements.flatMap(r => [
        heading2(`${r.id}: ${r.name}`),
        boldPara("Priority: ", r.priority),
        boldPara("Gap Reference: ", r.gap),
        para(r.desc),
        heading3("Acceptance Criteria"),
        ...r.criteria.map(c => bullet(c)),
      ]),

      new Paragraph({ children: [new PageBreak()] }),

      // ═══════════════════════════════════════
      // 6. NON-FUNCTIONAL REQUIREMENTS
      // ═══════════════════════════════════════
      heading1("6. Non-Functional Requirements"),

      ...nfrs.flatMap(nfr => [
        heading2(`5.${nfrs.indexOf(nfr) + 1} ${nfr.category}`),
        ...nfr.items.map(item => bullet(item)),
      ]),

      new Paragraph({ children: [new PageBreak()] }),

      // ═══════════════════════════════════════
      // 7. ARCHITECTURE OVERVIEW
      // ═══════════════════════════════════════
      heading1("7. Architecture Overview"),

      para("The solution is designed with a layered architecture supporting two orchestration paths. All components are Microsoft-native with no third-party dependencies."),

      heading2("7.1 Architecture Layers"),
      bulletBold("User Channels: ", "Microsoft Teams (chat + voice), Browser Widget, Azure Communication Services (telephony/PSTN)"),
      bulletBold("Orchestration Layer: ", "Two paths \u2014 Copilot Studio (with Bot Service + Power Automate) or AI Foundry (with Foundry Agent Service + Logic Apps)"),
      bulletBold("AI & Knowledge: ", "Azure OpenAI (GPT-4o, GPT-4o-mini, GPT-4o-realtime), Azure AI Search (semantic/vector), Azure Cosmos DB"),
      bulletBold("Enterprise Integration: ", "Microsoft Entra ID, Dynamics 365 Contact Center, Azure Monitor, Microsoft Fabric + Power BI"),

      heading2("7.2 Copilot Studio Path"),
      para("Recommended for organizations seeking rapid deployment with low-code tooling. Copilot Studio provides a visual agent builder, Power Automate handles workflow automation, and Azure Bot Service manages channel routing."),

      heading2("7.3 AI Foundry Path"),
      para("Recommended for organizations requiring programmatic control and enterprise governance. Azure AI Foundry provides agent development and versioning, Foundry Agent Service offers autonomous agent runtime with semantic VAD, and Azure Logic Apps handles workflow automation."),

      heading2("7.4 Component Mapping"),
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [2340, 3510, 3510],
        rows: [
          new TableRow({ children: [
            headerCell("Layer", 2340), headerCell("Copilot Studio Path", 3510), headerCell("AI Foundry Path", 3510),
          ]}),
          new TableRow({ children: [
            cell("Orchestration", 2340, { bold: true }),
            cell("Copilot Studio + Bot Service", 3510),
            cell("AI Foundry + Foundry Agent Service", 3510),
          ]}),
          new TableRow({ children: [
            cell("Automation", 2340, { bold: true }),
            cell("Power Automate", 3510),
            cell("Azure Logic Apps", 3510),
          ]}),
          new TableRow({ children: [
            cell("AI Model", 2340, { bold: true }),
            cell("Azure OpenAI (GPT-4o)", 3510),
            cell("Azure OpenAI (Multi-tier: Pro/Basic/Lite)", 3510),
          ]}),
          new TableRow({ children: [
            cell("Knowledge", 2340, { bold: true }),
            cell("Azure AI Search", 3510),
            cell("Azure AI Search", 3510),
          ]}),
          new TableRow({ children: [
            cell("Authentication", 2340, { bold: true }),
            cell("Microsoft Entra ID", 3510),
            cell("Microsoft Entra ID (mandatory, no key auth)", 3510),
          ]}),
          new TableRow({ children: [
            cell("Analytics", 2340, { bold: true }),
            cell("Azure Monitor", 3510),
            cell("Azure Monitor + dual session logs", 3510),
          ]}),
        ],
      }),

      new Paragraph({ children: [new PageBreak()] }),

      // ═══════════════════════════════════════
      // 8. SUCCESS CRITERIA
      // ═══════════════════════════════════════
      heading1("8. Success Criteria"),

      heading2("8.1 POC Success Criteria"),
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [600, 3260, 2500, 3000],
        rows: [
          new TableRow({ children: [
            headerCell("#", 600), headerCell("Criterion", 3260), headerCell("Target", 2500), headerCell("Measurement", 3000),
          ]}),
          new TableRow({ children: [
            cell("1", 600, { align: AlignmentType.CENTER }),
            cell("Resolution Accuracy", 3260),
            cell("> 85% for known topics", 2500),
            cell("Automated test suite against KB entries", 3000),
          ]}),
          new TableRow({ children: [
            cell("2", 600, { align: AlignmentType.CENTER }),
            cell("Response Speed", 3260),
            cell("< 2 seconds (p95)", 2500),
            cell("Azure Monitor latency metrics", 3000),
          ]}),
          new TableRow({ children: [
            cell("3", 600, { align: AlignmentType.CENTER }),
            cell("Dual Data Sources", 3260),
            cell("AI Search + OpenAI integrated", 2500),
            cell("RAG pipeline functional test", 3000),
          ]}),
          new TableRow({ children: [
            cell("4", 600, { align: AlignmentType.CENTER }),
            cell("Chat-Voice Parity", 3260),
            cell("Same responses via both channels", 2500),
            cell("Cross-channel comparison test", 3000),
          ]}),
          new TableRow({ children: [
            cell("5", 600, { align: AlignmentType.CENTER }),
            cell("Branded UX", 3260),
            cell("Custom theme, logo, tone of voice", 2500),
            cell("Stakeholder review and sign-off", 3000),
          ]}),
        ],
      }),

      heading2("8.2 Gap Closure Metrics"),
      para("Track the percentage of identified gaps (13 gaps, 5 partial, 5 covered from the Voice Live API gap analysis) addressed by each phase gate. Target: 80% gap closure by Phase 3, 100% by Phase 4."),

      new Paragraph({ children: [new PageBreak()] }),

      // ═══════════════════════════════════════
      // 9. PHASED DELIVERY ROADMAP
      // ═══════════════════════════════════════
      heading1("9. Phased Delivery Roadmap"),

      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [2340, 1560, 1560, 3900],
        rows: [
          new TableRow({ children: [
            headerCell("Phase", 2340), headerCell("Sprints", 1560), headerCell("Hours", 1560), headerCell("Key Deliverables", 3900),
          ]}),
          ...phases.map(p =>
            new TableRow({ children: [
              cell(p.name, 2340, { bold: true }),
              cell(p.sprints, 1560, { align: AlignmentType.CENTER }),
              cell(p.hours === 0 ? "\u2014" : String(p.hours), 1560, { align: AlignmentType.CENTER }),
              cell(p.desc, 3900),
            ]})
          ),
          new TableRow({ children: [
            cell([new TextRun({ text: "Total", bold: true, font: "Arial", size: 20 })], 2340),
            cell([new TextRun({ text: "6 sprints", bold: true, font: "Arial", size: 20 })], 1560, { align: AlignmentType.CENTER }),
            cell([new TextRun({ text: String(totalHours), bold: true, font: "Arial", size: 20 })], 1560, { align: AlignmentType.CENTER }),
            cell("", 3900),
          ]}),
        ],
      }),

      new Paragraph({ children: [new PageBreak()] }),

      // ═══════════════════════════════════════
      // 10. RESOURCE PLAN
      // ═══════════════════════════════════════
      heading1("10. Resource Plan"),

      para(`All estimates based on 2-week sprints with a blended rate of $${RATE}/hour.`),

      heading2("10.1 Sprint Allocation by Role"),
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [1560, 1300, 1300, 1300, 1300, 1300, 1200],
        rows: [
          new TableRow({ children: [
            headerCell("Sprint", 1560),
            ...roles.map((r, i) => headerCell(i === 2 ? "Full-Stack Dev" : (i === 4 ? "PM" : r.split(" ").map(w => w[0]).join("")), 1300)),
            headerCell("Total", 1200),
          ]}),
          ...sprints.map(s => {
            const sprintTotal = s.hours.reduce((a, b) => a + b, 0);
            return new TableRow({ children: [
              cell([
                new TextRun({ text: s.name, bold: true, font: "Arial", size: 18 }),
                new TextRun({ text: `\n${s.focus}`, font: "Arial", size: 16, italics: true, color: "666666" }),
              ], 1560),
              ...s.hours.map(h => cell(String(h), 1300, { align: AlignmentType.CENTER })),
              cell([new TextRun({ text: String(sprintTotal), bold: true, font: "Arial", size: 20 })], 1200, { align: AlignmentType.CENTER }),
            ]});
          }),
          // Totals row
          new TableRow({ children: [
            cell([new TextRun({ text: "Total Hours", bold: true, font: "Arial", size: 20 })], 1560, { fill: "F0F0F0" }),
            ...totalByRole.map(h => cell([new TextRun({ text: String(h), bold: true, font: "Arial", size: 20 })], 1300, { align: AlignmentType.CENTER, fill: "F0F0F0" })),
            cell([new TextRun({ text: String(totalHours), bold: true, font: "Arial", size: 20 })], 1200, { align: AlignmentType.CENTER, fill: "F0F0F0" }),
          ]}),
        ],
      }),

      new Paragraph({ spacing: { before: 200 } }),

      heading2("10.2 Cost Breakdown by Sprint"),
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [2340, 1560, 1560, 2340, 1560],
        rows: [
          new TableRow({ children: [
            headerCell("Sprint", 2340), headerCell("Phase", 1560), headerCell("Hours", 1560),
            headerCell("Sprint Cost", 2340), headerCell("Cumulative", 1560),
          ]}),
          ...(() => {
            let cumulative = 0;
            return sprints.map(s => {
              const sprintHours = s.hours.reduce((a, b) => a + b, 0);
              const sprintCost = sprintHours * RATE;
              cumulative += sprintCost;
              return new TableRow({ children: [
                cell(s.name, 2340, { bold: true }),
                cell(s.phase, 1560),
                cell(String(sprintHours), 1560, { align: AlignmentType.CENTER }),
                cell(`$${sprintCost.toLocaleString()}`, 2340, { align: AlignmentType.CENTER }),
                cell(`$${cumulative.toLocaleString()}`, 1560, { align: AlignmentType.CENTER }),
              ]});
            });
          })(),
          new TableRow({ children: [
            cell([new TextRun({ text: "Total", bold: true, font: "Arial", size: 20 })], 2340, { fill: "F0F0F0" }),
            cell("", 1560, { fill: "F0F0F0" }),
            cell([new TextRun({ text: String(totalHours), bold: true, font: "Arial", size: 20 })], 1560, { align: AlignmentType.CENTER, fill: "F0F0F0" }),
            cell([new TextRun({ text: `$${totalCost.toLocaleString()}`, bold: true, font: "Arial", size: 20 })], 2340, { align: AlignmentType.CENTER, fill: "F0F0F0" }),
            cell("", 1560, { fill: "F0F0F0" }),
          ]}),
        ],
      }),

      new Paragraph({ spacing: { before: 200 } }),

      heading2("10.3 Phase Summary"),
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [3120, 1560, 1560, 3120],
        rows: [
          new TableRow({ children: [
            headerCell("Phase", 3120), headerCell("Hours", 1560), headerCell("Cost", 1560), headerCell("Key Outcomes", 3120),
          ]}),
          ...phases.filter(p => p.hours > 0).map(p =>
            new TableRow({ children: [
              cell(p.name, 3120, { bold: true }),
              cell(String(p.hours), 1560, { align: AlignmentType.CENTER }),
              cell(`$${(p.hours * RATE).toLocaleString()}`, 1560, { align: AlignmentType.CENTER }),
              cell(p.desc, 3120),
            ]})
          ),
          new TableRow({ children: [
            cell([new TextRun({ text: "Total Investment", bold: true, font: "Arial", size: 20 })], 3120, { fill: "F0F0F0" }),
            cell([new TextRun({ text: String(totalHours), bold: true, font: "Arial", size: 20 })], 1560, { align: AlignmentType.CENTER, fill: "F0F0F0" }),
            cell([new TextRun({ text: `$${totalCost.toLocaleString()}`, bold: true, font: "Arial", size: 20 })], 1560, { align: AlignmentType.CENTER, fill: "F0F0F0" }),
            cell("", 3120, { fill: "F0F0F0" }),
          ]}),
        ],
      }),

      new Paragraph({ children: [new PageBreak()] }),

      // ═══════════════════════════════════════
      // 11. ASSUMPTIONS & DEPENDENCIES
      // ═══════════════════════════════════════
      heading1("11. Assumptions & Dependencies"),

      heading2("11.1 Assumptions"),
      bullet("Acme Corp has an active Azure subscription with sufficient quota for Azure OpenAI, AI Search, and Cosmos DB services"),
      bullet("Microsoft Entra ID tenant is provisioned and available for authentication integration"),
      bullet("Azure Voice Live API preview access is approved (currently in feature preview)"),
      bullet("Knowledge base content (approved documentation) is available in a searchable format"),
      bullet("Stakeholder availability for sprint reviews and phase gate approvals"),
      bullet("Development team has access to Azure Portal and required service permissions"),

      heading2("11.2 Dependencies"),
      bullet("Azure OpenAI service availability and model deployment (GPT-4o, GPT-4o-realtime)"),
      bullet("Copilot Studio licensing (per-user or per-tenant, depending on selected path)"),
      bullet("Dynamics 365 Contact Center license for human agent escalation"),
      bullet("Microsoft Fabric capacity allocation for data pipeline (Phase 3)"),
      bullet("Azure Communication Services resource for telephony/PSTN integration"),
      bullet("Power BI Pro or Premium license for dashboard embedding"),

      new Paragraph({ children: [new PageBreak()] }),

      // ═══════════════════════════════════════
      // 12. APPENDIX: GAP ANALYSIS REFERENCE
      // ═══════════════════════════════════════
      heading1("12. Appendix: Gap Analysis Reference"),

      para("The following table summarizes the gap analysis between the Azure Voice Live API article and the current AI Support Assistant demo. This analysis informed the functional requirements in this document."),

      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [3500, 1200, 4660],
        rows: [
          new TableRow({ children: [
            headerCell("Capability", 3500), headerCell("Status", 1200), headerCell("BRD Requirement", 4660),
          ]}),
          ...[
            ["Azure Voice Live API", "Gap", "FR-01"],
            ["Conversation Analytics", "Gap", "FR-05"],
            ["Fabric / Power BI Pipeline", "Gap", "FR-09"],
            ["Function Calling / Tool Use", "Gap", "FR-03"],
            ["AI Foundry Agent Integration", "Gap", "FR-08"],
            ["Logic Apps Automation", "Gap", "FR-03 (partial)"],
            ["Cosmos DB Persistence", "Gap", "FR-09"],
            ["Azure SQL Data Store", "Gap", "FR-09"],
            ["Multi-language Voice", "Partial", "FR-11"],
            ["Azure AI Search", "Partial", "FR-02"],
            ["Telephony / IVR", "Partial", "FR-06"],
            ["VAD Configuration", "Partial", "FR-01"],
            ["Copilot Studio", "Covered", "FR-08"],
            ["Human Escalation", "Covered", "FR-04"],
            ["Chat UX", "Covered", "FR-02"],
            ["Architecture View", "Covered", "\u2014"],
            ["Azure OpenAI", "Covered", "FR-02, FR-05"],
          ].map(([cap, status, req]) => {
            const colors = {
              "Gap": { fill: "FDE8E8", color: "CC0000" },
              "Partial": { fill: "FFF3CD", color: "856404" },
              "Covered": { fill: "D4EDDA", color: "155724" },
            };
            const c = colors[status];
            return new TableRow({ children: [
              cell(cap, 3500),
              cell([new TextRun({ text: status, bold: true, color: c.color, font: "Arial", size: 20 })], 1200, { fill: c.fill, align: AlignmentType.CENTER }),
              cell(req, 4660),
            ]});
          }),
        ],
      }),

      new Paragraph({ spacing: { before: 300, after: 200 }, children: [
        new TextRun({ text: "Source: ", bold: true, font: "Arial", size: 22 }),
        new TextRun({ text: "Voice-Live-API-Gap-Analysis.docx (March 2026)", font: "Arial", size: 22, italics: true }),
      ]}),

      new Paragraph({ children: [new PageBreak()] }),

      // ═══════════════════════════════════════
      // 13. APPENDIX B: INDUSTRY REFERENCE CUSTOMERS
      // ═══════════════════════════════════════
      heading1("13. Appendix B: Industry Reference Customers"),

      para("The following organizations represent gold-standard Microsoft customers in the semiconductor, high-tech manufacturing, and adjacent verticals who have adopted enterprise AI support solutions built on the same Azure technology stack proposed in this BRD. These references validate the architecture, demonstrate measurable ROI, and confirm production readiness at enterprise scale."),

      // ─── TIER 1: SEMICONDUCTOR & ELECTRONICS ───
      heading2("13.1 Semiconductor & Electronics Manufacturing"),

      heading3("Lenovo — Dynamics 365 Contact Center + Copilot"),
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [2340, 7020],
        rows: [
          new TableRow({ children: [
            cell([new TextRun({ text: "Industry", bold: true, font: "Arial", size: 20 })], 2340, { fill: "F5F5F5" }),
            cell("Technology Hardware / Electronics OEM", 7020),
          ]}),
          new TableRow({ children: [
            cell([new TextRun({ text: "Solution", bold: true, font: "Arial", size: 20 })], 2340, { fill: "F5F5F5" }),
            cell("Dynamics 365 Contact Center with Copilot for Premier Support", 7020),
          ]}),
          new TableRow({ children: [
            cell([new TextRun({ text: "Stack", bold: true, font: "Arial", size: 20 })], 2340, { fill: "F5F5F5" }),
            cell("Dynamics 365 Customer Service, Copilot, Azure OpenAI, Omnichannel (9 languages)", 7020),
          ]}),
          new TableRow({ children: [
            cell([new TextRun({ text: "Results", bold: true, font: "Arial", size: 20 })], 2340, { fill: "F5F5F5" }),
            cell("15% increase in agent productivity, 20% reduction in handling time, record-high CSAT. Became second-largest Copilot for D365 user after Microsoft in just 45 days.", 7020),
          ]}),
          new TableRow({ children: [
            cell([new TextRun({ text: "Relevance", bold: true, font: "Arial", size: 20 })], 2340, { fill: "F5F5F5" }),
            cell("Closest analog to our proposed solution: hardware OEM using Dynamics 365 + Copilot for technical support with multi-language AI, agent assistance, and call summarization.", 7020),
          ]}),
        ],
      }),

      new Paragraph({ spacing: { before: 200 } }),

      heading3("Schneider Electric — Azure OpenAI + AI Foundry Industrial Copilot"),
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [2340, 7020],
        rows: [
          new TableRow({ children: [
            cell([new TextRun({ text: "Industry", bold: true, font: "Arial", size: 20 })], 2340, { fill: "F5F5F5" }),
            cell("Industrial Electronics / Energy Management / Automation", 7020),
          ]}),
          new TableRow({ children: [
            cell([new TextRun({ text: "Solution", bold: true, font: "Arial", size: 20 })], 2340, { fill: "F5F5F5" }),
            cell("Industrial AI Copilot + Knowledge Bot for customer service agents (Azure AI Foundry + Azure OpenAI)", 7020),
          ]}),
          new TableRow({ children: [
            cell([new TextRun({ text: "Stack", bold: true, font: "Arial", size: 20 })], 2340, { fill: "F5F5F5" }),
            cell("Azure OpenAI Service, Azure AI Foundry, Azure AI Search, Copilot Studio", 7020),
          ]}),
          new TableRow({ children: [
            cell([new TextRun({ text: "Results", bold: true, font: "Arial", size: 20 })], 2340, { fill: "F5F5F5" }),
            cell("60\u201380% reduction in troubleshooting time. Knowledge Bot enables support agents to find answers to technical customer queries instantly from product documentation.", 7020),
          ]}),
          new TableRow({ children: [
            cell([new TextRun({ text: "Relevance", bold: true, font: "Arial", size: 20 })], 2340, { fill: "F5F5F5" }),
            cell("Industrial electronics company using RAG pipeline over technical documentation for customer support \u2014 directly analogous to our AI Search + OpenAI architecture for product datasheet Q&A.", 7020),
          ]}),
        ],
      }),

      new Paragraph({ spacing: { before: 200 } }),

      heading3("Siemens — Azure OpenAI for Product Lifecycle Management"),
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [2340, 7020],
        rows: [
          new TableRow({ children: [
            cell([new TextRun({ text: "Industry", bold: true, font: "Arial", size: 20 })], 2340, { fill: "F5F5F5" }),
            cell("Industrial Manufacturing / Digital Industries / Semiconductor Equipment", 7020),
          ]}),
          new TableRow({ children: [
            cell([new TextRun({ text: "Solution", bold: true, font: "Arial", size: 20 })], 2340, { fill: "F5F5F5" }),
            cell("Azure OpenAI-powered Teams app for Teamcenter (Product Lifecycle Management)", 7020),
          ]}),
          new TableRow({ children: [
            cell([new TextRun({ text: "Stack", bold: true, font: "Arial", size: 20 })], 2340, { fill: "F5F5F5" }),
            cell("Azure OpenAI, Azure AI Foundry, Microsoft Teams, PLM integration", 7020),
          ]}),
          new TableRow({ children: [
            cell([new TextRun({ text: "Results", bold: true, font: "Arial", size: 20 })], 2340, { fill: "F5F5F5" }),
            cell("Enhanced efficiency in product lifecycle management workflows. Natural language querying of engineering documentation integrated directly into Teams.", 7020),
          ]}),
          new TableRow({ children: [
            cell([new TextRun({ text: "Relevance", bold: true, font: "Arial", size: 20 })], 2340, { fill: "F5F5F5" }),
            cell("Major semiconductor equipment supplier using Azure OpenAI + Teams for engineering knowledge retrieval \u2014 validates the Teams channel + RAG approach.", 7020),
          ]}),
        ],
      }),

      new Paragraph({ children: [new PageBreak()] }),

      // ─── TIER 2: INDUSTRIAL / MANUFACTURING ───
      heading2("13.2 Industrial Manufacturing & Operations"),

      heading3("ABB Group — Genix Copilot on Azure OpenAI"),
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [2340, 7020],
        rows: [
          new TableRow({ children: [
            cell([new TextRun({ text: "Industry", bold: true, font: "Arial", size: 20 })], 2340, { fill: "F5F5F5" }),
            cell("Industrial Automation / Robotics / Power Systems", 7020),
          ]}),
          new TableRow({ children: [
            cell([new TextRun({ text: "Solution", bold: true, font: "Arial", size: 20 })], 2340, { fill: "F5F5F5" }),
            cell("Genix Copilot \u2014 generative AI for industrial IoT and analytics (Azure OpenAI)", 7020),
          ]}),
          new TableRow({ children: [
            cell([new TextRun({ text: "Stack", bold: true, font: "Arial", size: 20 })], 2340, { fill: "F5F5F5" }),
            cell("Azure OpenAI Service, Azure IoT, ABB Genix industrial analytics platform", 7020),
          ]}),
          new TableRow({ children: [
            cell([new TextRun({ text: "Results", bold: true, font: "Arial", size: 20 })], 2340, { fill: "F5F5F5" }),
            cell("40% cost savings in operations and maintenance, 30% production efficiency boost, 25% sustainability improvement, 20% asset lifespan extension, 60% reduction in unplanned downtime.", 7020),
          ]}),
          new TableRow({ children: [
            cell([new TextRun({ text: "Relevance", bold: true, font: "Arial", size: 20 })], 2340, { fill: "F5F5F5" }),
            cell("Industrial manufacturer using Azure OpenAI for operational support and knowledge retrieval at scale. Validates the AI agent pattern for manufacturing environments.", 7020),
          ]}),
        ],
      }),

      new Paragraph({ spacing: { before: 200 } }),

      heading3("Honeywell — Enterprise-Wide Generative AI (16+ Production Use Cases)"),
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [2340, 7020],
        rows: [
          new TableRow({ children: [
            cell([new TextRun({ text: "Industry", bold: true, font: "Arial", size: 20 })], 2340, { fill: "F5F5F5" }),
            cell("Aerospace / Industrial Technology / Building Technology", 7020),
          ]}),
          new TableRow({ children: [
            cell([new TextRun({ text: "Solution", bold: true, font: "Arial", size: 20 })], 2340, { fill: "F5F5F5" }),
            cell("AI Copilot for IT help desk + product manual virtual assistant (Azure OpenAI + knowledge base)", 7020),
          ]}),
          new TableRow({ children: [
            cell([new TextRun({ text: "Stack", bold: true, font: "Arial", size: 20 })], 2340, { fill: "F5F5F5" }),
            cell("Azure OpenAI, Microsoft 365 Copilot, Moveworks AI, internal knowledge bases", 7020),
          ]}),
          new TableRow({ children: [
            cell([new TextRun({ text: "Results", bold: true, font: "Arial", size: 20 })], 2340, { fill: "F5F5F5" }),
            cell("16+ generative AI use cases in production across 95,000 employees. IT help desk tickets reduced by 80%. Virtual assistant leverages product manuals and internal articles for self-service support.", 7020),
          ]}),
          new TableRow({ children: [
            cell([new TextRun({ text: "Relevance", bold: true, font: "Arial", size: 20 })], 2340, { fill: "F5F5F5" }),
            cell("Enterprise-scale AI support deployment (95K employees) using knowledge base RAG pattern for product documentation \u2014 directly validates our architecture at semiconductor enterprise scale.", 7020),
          ]}),
        ],
      }),

      new Paragraph({ spacing: { before: 200 } }),

      // ─── TIER 3: ENTERPRISE SERVICES / TELCO ───
      heading2("13.3 Enterprise Services & Telecommunications"),

      heading3("Vodafone — Azure OpenAI Voice + Customer Service AI (SuperTOBi)"),
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [2340, 7020],
        rows: [
          new TableRow({ children: [
            cell([new TextRun({ text: "Industry", bold: true, font: "Arial", size: 20 })], 2340, { fill: "F5F5F5" }),
            cell("Telecommunications (300M+ customers, 13 countries)", 7020),
          ]}),
          new TableRow({ children: [
            cell([new TextRun({ text: "Solution", bold: true, font: "Arial", size: 20 })], 2340, { fill: "F5F5F5" }),
            cell("SuperTOBi (customer-facing AI) + SuperAgent (agent-facing AI) \u2014 dual AI assistant model", 7020),
          ]}),
          new TableRow({ children: [
            cell([new TextRun({ text: "Stack", bold: true, font: "Arial", size: 20 })], 2340, { fill: "F5F5F5" }),
            cell("Azure OpenAI Service, Azure AI Foundry, Azure AI Search, Copilot, 15 languages", 7020),
          ]}),
          new TableRow({ children: [
            cell([new TextRun({ text: "Results", bold: true, font: "Arial", size: 20 })], 2340, { fill: "F5F5F5" }),
            cell("45 million customer queries per month handled by AI. Call transcript summarization reduces agent wrap-up time. Multi-language support across 15 languages in 13 countries.", 7020),
          ]}),
          new TableRow({ children: [
            cell([new TextRun({ text: "Relevance", bold: true, font: "Arial", size: 20 })], 2340, { fill: "F5F5F5" }),
            cell("Gold standard for dual AI model (customer self-service + agent assist). Validates Azure OpenAI + AI Search at massive scale (45M queries/month). Multi-language support validates FR-11.", 7020),
          ]}),
        ],
      }),

      new Paragraph({ spacing: { before: 200 } }),

      heading3("Telstra — Azure OpenAI for Contact Center Intelligence"),
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [2340, 7020],
        rows: [
          new TableRow({ children: [
            cell([new TextRun({ text: "Industry", bold: true, font: "Arial", size: 20 })], 2340, { fill: "F5F5F5" }),
            cell("Telecommunications (Australia\u2019s largest telco)", 7020),
          ]}),
          new TableRow({ children: [
            cell([new TextRun({ text: "Solution", bold: true, font: "Arial", size: 20 })], 2340, { fill: "F5F5F5" }),
            cell("One Sentence Summary \u2014 generative AI call summarization + Ask Telstra knowledge assistant", 7020),
          ]}),
          new TableRow({ children: [
            cell([new TextRun({ text: "Stack", bold: true, font: "Arial", size: 20 })], 2340, { fill: "F5F5F5" }),
            cell("Azure OpenAI Service, Azure AI Search, custom RAG pipeline", 7020),
          ]}),
          new TableRow({ children: [
            cell([new TextRun({ text: "Results", bold: true, font: "Arial", size: 20 })], 2340, { fill: "F5F5F5" }),
            cell("90% of employees report time savings with One Sentence Summary. 20% reduction in follow-up contacts. Thousands of agents using AI-assisted knowledge retrieval daily.", 7020),
          ]}),
          new TableRow({ children: [
            cell([new TextRun({ text: "Relevance", bold: true, font: "Arial", size: 20 })], 2340, { fill: "F5F5F5" }),
            cell("Validates the call summarization + RAG knowledge assistant pattern proposed in FR-02 and FR-05. Enterprise-scale deployment with measurable impact on agent productivity.", 7020),
          ]}),
        ],
      }),

      new Paragraph({ spacing: { before: 200 } }),

      heading3("AIA Group — Copilot in Dynamics 365 Customer Service"),
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [2340, 7020],
        rows: [
          new TableRow({ children: [
            cell([new TextRun({ text: "Industry", bold: true, font: "Arial", size: 20 })], 2340, { fill: "F5F5F5" }),
            cell("Financial Services / Insurance (Asia-Pacific)", 7020),
          ]}),
          new TableRow({ children: [
            cell([new TextRun({ text: "Solution", bold: true, font: "Arial", size: 20 })], 2340, { fill: "F5F5F5" }),
            cell("Copilot in Dynamics 365 Customer Service for contact center operations", 7020),
          ]}),
          new TableRow({ children: [
            cell([new TextRun({ text: "Stack", bold: true, font: "Arial", size: 20 })], 2340, { fill: "F5F5F5" }),
            cell("Dynamics 365 Customer Service, Copilot, Azure OpenAI", 7020),
          ]}),
          new TableRow({ children: [
            cell([new TextRun({ text: "Results", bold: true, font: "Arial", size: 20 })], 2340, { fill: "F5F5F5" }),
            cell("Deployed Copilot to contact centers in Singapore and Thailand. AI-assisted agent responses, auto-summarization, and knowledge retrieval from policy documentation.", 7020),
          ]}),
          new TableRow({ children: [
            cell([new TextRun({ text: "Relevance", bold: true, font: "Arial", size: 20 })], 2340, { fill: "F5F5F5" }),
            cell("Validates the Dynamics 365 + Copilot contact center pattern in a heavily regulated industry with compliance requirements comparable to semiconductor export controls.", 7020),
          ]}),
        ],
      }),

      new Paragraph({ spacing: { before: 200 } }),

      heading3("Microsoft (Internal) — Azure-Based Global Support Center"),
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [2340, 7020],
        rows: [
          new TableRow({ children: [
            cell([new TextRun({ text: "Industry", bold: true, font: "Arial", size: 20 })], 2340, { fill: "F5F5F5" }),
            cell("Technology (Microsoft\u2019s own support operations)", 7020),
          ]}),
          new TableRow({ children: [
            cell([new TextRun({ text: "Solution", bold: true, font: "Arial", size: 20 })], 2340, { fill: "F5F5F5" }),
            cell("Global customer service network migrated to Azure with Copilot-powered agent assistance", 7020),
          ]}),
          new TableRow({ children: [
            cell([new TextRun({ text: "Stack", bold: true, font: "Arial", size: 20 })], 2340, { fill: "F5F5F5" }),
            cell("Azure OpenAI, Dynamics 365, Azure AI Search, Copilot Studio, Voice Live API", 7020),
          ]}),
          new TableRow({ children: [
            cell([new TextRun({ text: "Results", bold: true, font: "Arial", size: 20 })], 2340, { fill: "F5F5F5" }),
            cell("Microsoft runs its own global support network on Azure, serving as the ultimate reference implementation for the platform. Full stack deployment including voice, chat, analytics, and AI-assisted escalation.", 7020),
          ]}),
          new TableRow({ children: [
            cell([new TextRun({ text: "Relevance", bold: true, font: "Arial", size: 20 })], 2340, { fill: "F5F5F5" }),
            cell("The definitive \u201Cdogfooding\u201D reference. Microsoft uses its own stack for global support, validating every component we propose at the highest scale and maturity.", 7020),
          ]}),
        ],
      }),

      new Paragraph({ children: [new PageBreak()] }),

      heading2("13.4 Reference Summary"),
      para("The following table summarizes the technology stack overlap between each reference customer and our proposed AI Support Assistant architecture:"),

      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [1800, 1080, 1080, 1080, 1080, 1080, 1080, 1080],
        rows: [
          new TableRow({ children: [
            headerCell("Customer", 1800),
            headerCell("Azure OpenAI", 1080), headerCell("AI Search / RAG", 1080), headerCell("D365 Contact Ctr", 1080),
            headerCell("Voice AI", 1080), headerCell("Multi-Lang", 1080), headerCell("Analytics", 1080), headerCell("Copilot Studio", 1080),
          ]}),
          ...[ // [name, openai, search, d365, voice, lang, analytics, copilot]
            ["Lenovo", "\u2713", "\u2713", "\u2713", "\u2014", "\u2713", "\u2713", "\u2713"],
            ["Schneider Electric", "\u2713", "\u2713", "\u2014", "\u2014", "\u2014", "\u2713", "\u2713"],
            ["Siemens", "\u2713", "\u2713", "\u2014", "\u2014", "\u2014", "\u2014", "\u2014"],
            ["ABB Group", "\u2713", "\u2014", "\u2014", "\u2014", "\u2014", "\u2713", "\u2014"],
            ["Honeywell", "\u2713", "\u2713", "\u2014", "\u2014", "\u2014", "\u2713", "\u2713"],
            ["Vodafone", "\u2713", "\u2713", "\u2014", "\u2713", "\u2713", "\u2713", "\u2713"],
            ["Telstra", "\u2713", "\u2713", "\u2014", "\u2014", "\u2014", "\u2713", "\u2014"],
            ["AIA Group", "\u2713", "\u2713", "\u2713", "\u2014", "\u2014", "\u2713", "\u2713"],
            ["Microsoft", "\u2713", "\u2713", "\u2713", "\u2713", "\u2713", "\u2713", "\u2713"],
          ].map(([name, ...cols]) =>
            new TableRow({ children: [
              cell([new TextRun({ text: name, bold: true, font: "Arial", size: 18 })], 1800),
              ...cols.map(v => cell([new TextRun({
                text: v, font: "Arial", size: 18, bold: v === "\u2713",
                color: v === "\u2713" ? "155724" : "999999",
              })], 1080, { align: AlignmentType.CENTER, fill: v === "\u2713" ? "D4EDDA" : undefined })),
            ]})
          ),
        ],
      }),

      new Paragraph({ spacing: { before: 300, after: 200 }, children: [
        new TextRun({ text: "Key takeaway: ", bold: true, font: "Arial", size: 22 }),
        new TextRun({ text: "Every component of our proposed architecture is validated by at least 3 gold-standard enterprise customers. The Azure OpenAI + AI Search RAG pattern is the most widely adopted (8/9 references), confirming it as the proven foundation for enterprise AI support.", font: "Arial", size: 22 }),
      ]}),

      new Paragraph({ spacing: { after: 200 }, children: [
        new TextRun({ text: "Sources: Microsoft Customer Stories (microsoft.com/customers), Microsoft AI in Action (news.microsoft.com/ai-in-action), Microsoft Industry Blogs, verified case studies as of March 2026.", font: "Arial", size: 20, italics: true, color: "666666" }),
      ]}),

      new Paragraph({ children: [new PageBreak()] }),

      // ═══════════════════════════════════════
      // 14. APPENDIX C: STAKEHOLDER ENGAGEMENT PLAN
      // ═══════════════════════════════════════
      heading1("14. Appendix C: Stakeholder Engagement Plan"),

      para("This appendix provides a prioritized engagement plan for each functional area, including key tasks, discussion topics, and suggested talking points for initial stakeholder meetings. Use this as a playbook for building cross-functional alignment."),

      // ─── EXECUTIVE SPONSOR ───
      heading2("14.1 Executive Sponsor (CIO / CTO / SVP Global Operations)"),
      heading3("Engagement Priority: Immediate — Week 1"),
      boldPara("Key Tasks: ", "Secure executive sponsorship, confirm budget authority, align with corporate AI strategy, establish governance model, define success metrics for board reporting."),
      heading3("Talking Points"),
      bullet("\"We\u2019ve built a proof-of-concept that demonstrates a 100% Microsoft-native AI support platform. Every component \u2014 from authentication to analytics \u2014 runs within your Azure tenant.\""),
      bullet("\"Lenovo achieved 15% productivity gains and record CSAT in just 45 days with the same Dynamics 365 + Copilot stack. Honeywell has 16+ generative AI use cases in production across 95,000 employees.\""),
      bullet("\"The phased approach (6 sprints, $235K) lets us validate value at each gate before committing to the next phase. Phase 2 alone delivers voice + function calling.\""),
      bullet("\"Which business unit should we pilot first \u2014 DRAM support, SSD technical services, or internal fab operations?\""),

      new Paragraph({ spacing: { before: 200 } }),

      // ─── TECHNICAL SUPPORT ENGINEERING ───
      heading2("14.2 Technical Support Engineering (VP Tech Support / TSE Managers)"),
      heading3("Engagement Priority: Immediate — Week 1"),
      boldPara("Key Tasks: ", "Map current support workflows (Tier 1/2/3), inventory knowledge sources (datasheets, TN docs, qualification reports), define escalation rules, identify top 20 call reasons for AI training, establish accuracy benchmarks."),
      heading3("Talking Points"),
      bullet("\"Show me your top 20 support request types by volume. We\u2019ll train the AI to handle the highest-volume, most repetitive queries first \u2014 freeing your TSEs for complex design-in work.\""),
      bullet("\"The AI won\u2019t replace your team \u2014 it augments them. When confidence is low, it escalates with full context through Dynamics 365, so the human agent sees the entire conversation.\""),
      bullet("\"Schneider Electric cut troubleshooting time by 60\u201380% using the same Knowledge Bot + RAG pattern over their technical documentation.\""),
      bullet("\"What does your current escalation path look like from web form to Tier 3 engineering? Where are the bottlenecks?\""),
      bullet("\"We need your team to validate the first 50 AI responses against your quality standards before we go live.\""),

      new Paragraph({ spacing: { before: 200 } }),

      // ─── APPLICATIONS ENGINEERING ───
      heading2("14.3 Applications Engineering (AEs / Solutions Architects)"),
      heading3("Engagement Priority: High — Weeks 2\u20133"),
      boldPara("Key Tasks: ", "Identify technical domains for knowledge base (memory interfaces, signal integrity, firmware), define accuracy thresholds for engineering responses, establish NDA boundary rules for AI responses, create test suite of real customer queries."),
      heading3("Talking Points"),
      bullet("\"Your engineering expertise is what makes the knowledge base valuable. We need your help curating which technical notes, app notes, and design guides should be indexed.\""),
      bullet("\"The AI will show its source for every answer \u2014 \u2018from TN-XX-XX, Section 4.2\u2019 \u2014 so customers can verify against the original document. No hallucinated specs.\""),
      bullet("\"For queries that require custom characterization data, NDA-protected information, or judgment calls, the AI will escalate to a human AE \u2014 never attempt to answer beyond its confidence level.\""),
      bullet("\"Can you give us 30\u201350 real customer questions from the past quarter? We\u2019ll use them as our accuracy test suite.\""),

      new Paragraph({ spacing: { before: 200 } }),

      // ─── MANUFACTURING / FAB OPS ───
      heading2("14.4 Manufacturing / Fab Operations (VP Manufacturing / Fab Managers)"),
      heading3("Engagement Priority: Medium — Weeks 3\u20134"),
      boldPara("Key Tasks: ", "Scope internal support use case (fab process docs, equipment procedures, yield analysis), classify manufacturing IP sensitivity levels, validate clean room protocol documentation is indexable, assess integration with MES/yield systems."),
      heading3("Talking Points"),
      bullet("\"Internal engineers waste hours searching for process recipes, equipment SOPs, and yield troubleshooting docs. The AI can surface the right document in seconds.\""),
      bullet("\"ABB\u2019s Genix Copilot on Azure OpenAI extended asset lifespan by 20% and reduced unplanned downtime by 60% in manufacturing environments.\""),
      bullet("\"We\u2019ll classify all fab content by sensitivity level \u2014 public, internal, restricted \u2014 and enforce access control through Entra ID RBAC. No risk of process IP leaking to external channels.\""),
      bullet("\"Is there appetite to pilot this for equipment troubleshooting on one fab line before expanding?\""),

      new Paragraph({ spacing: { before: 200 } }),

      // ─── IT / CLOUD ───
      heading2("14.5 IT / Cloud Infrastructure (Cloud Architect / Platform Engineer)"),
      heading3("Engagement Priority: Immediate — Week 1"),
      boldPara("Key Tasks: ", "Validate Azure resource requirements and quotas, confirm networking architecture (private endpoints, ExpressRoute), assess integration with existing SAP/PLM systems, plan CI/CD pipeline, establish dev/staging/prod environments."),
      heading3("Talking Points"),
      bullet("\"The entire solution runs on Azure PaaS services \u2014 no VMs to manage. OpenAI, AI Search, Cosmos DB, Fabric \u2014 all managed services within your tenant.\""),
      bullet("\"We need to confirm Azure OpenAI quota allocation for GPT-4o and GPT-4o-realtime models in your region. What\u2019s your current Azure subscription structure?\""),
      bullet("\"Private endpoints ensure no data leaves your VNet. We\u2019ll need ExpressRoute or VPN for any on-prem integration (SAP, MES).\""),
      bullet("\"What\u2019s your current CI/CD toolchain? We\u2019ll align with Azure DevOps or GitHub Actions \u2014 whichever you prefer.\""),

      new Paragraph({ spacing: { before: 200 } }),

      // ─── INFOSEC / EXPORT CONTROLS ───
      heading2("14.6 Information Security & Export Controls (CISO / Export Control Officer)"),
      heading3("Engagement Priority: Immediate — Week 1"),
      boldPara("Key Tasks: ", "Review security architecture, validate Entra ID integration plan, assess ITAR/EAR compliance for AI-served content, define data classification schema for knowledge base, approve AI safety guardrails, review responsible AI policies."),
      heading3("Talking Points"),
      bullet("\"Zero-trust by design: Entra ID is mandatory (no API keys), all data stays in your Azure tenant, RBAC controls who sees what, and private endpoints eliminate public internet exposure.\""),
      bullet("\"For export-controlled content, we\u2019ll implement content classification tags in Azure AI Search. The RAG pipeline will check user clearance level before returning restricted documents.\""),
      bullet("\"The AI has built-in guardrails \u2014 it will never expose raw source data, never combine information across classification levels, and every response cites its source document.\""),
      bullet("\"What\u2019s your current content classification schema? We need to map ITAR/EAR categories to Azure AI Search access control filters.\""),
      bullet("\"Microsoft\u2019s enterprise AI safety: customer data is never used for model training. Azure OpenAI runs in an isolated, SOC 2 / ISO 27001 certified environment.\""),

      new Paragraph({ spacing: { before: 200 } }),

      // ─── SUPPLY CHAIN / SALES OPS ───
      heading2("14.7 Supply Chain / Sales Operations (VP Sales Ops / Order Management)"),
      heading3("Engagement Priority: High — Weeks 2\u20133"),
      boldPara("Key Tasks: ", "Map customer-facing query types (order status, lead times, allocation, pricing), define SAP/CRM integration requirements for real-time order data, identify function calling use cases (order lookup, shipment tracking), establish data refresh cadence."),
      heading3("Talking Points"),
      bullet("\"Customers asking \u2018where\u2019s my order?\u2019 or \u2018what\u2019s the lead time for part X?\u2019 can get instant answers through the AI agent using function calling to query SAP in real-time.\""),
      bullet("\"The function calling pattern means the AI doesn\u2019t just search documents \u2014 it executes actual lookups: check_order_status(PO=12345), get_lead_time(part=MT48AX), track_shipment(ID=...).\""),
      bullet("\"Which data systems hold order status, inventory, and allocation data today? We need API access for the function calling integration.\""),
      bullet("\"What are your top 5 customer pain points in the order-to-delivery process? Those become our first function calling targets.\""),

      new Paragraph({ spacing: { before: 200 } }),

      // ─── DATA & ANALYTICS ───
      heading2("14.8 Data & Analytics (CDO / Analytics Lead)"),
      heading3("Engagement Priority: Medium — Weeks 3\u20134 (Phase 3 focus)"),
      boldPara("Key Tasks: ", "Define KPIs and reporting requirements, plan Cosmos DB schema for conversation data, configure Fabric mirroring, design Power BI dashboards, integrate with existing manufacturing intelligence platforms."),
      heading3("Talking Points"),
      bullet("\"Every conversation generates structured analytics: sentiment, call reason, resolution time, CSAT, and agent performance \u2014 all stored in Cosmos DB with real-time mirroring to Fabric.\""),
      bullet("\"Your BI team can build Power BI dashboards or use Fabric Data Agents to query conversation data in natural language: \u2018Show me DRAM support trends this quarter.\u2019\""),
      bullet("\"What KPIs does leadership care about most? Resolution rate? First-contact resolution? Average handle time? We\u2019ll design the analytics pipeline around those.\""),
      bullet("\"How does this integrate with your existing manufacturing intelligence and yield analytics platforms?\""),

      new Paragraph({ spacing: { before: 200 } }),

      // ─── AI/ML ───
      heading2("14.9 AI / Machine Learning (AI/ML Lead / Prompt Engineer)"),
      heading3("Engagement Priority: High — Weeks 2\u20133"),
      boldPara("Key Tasks: ", "Configure Azure OpenAI model deployments, tune RAG pipeline for semiconductor terminology and part numbers, design function calling schemas, optimize system prompts, establish model evaluation benchmarks, coordinate with existing AI/ML initiatives."),
      heading3("Talking Points"),
      bullet("\"The RAG pipeline needs to handle semiconductor-specific patterns: part numbers (MT48AX...), JEDEC standards (JESD79-5), process nodes (1\u03B1 DRAM), and technical abbreviations.\""),
      bullet("\"We support 3 model tiers: Pro (GPT-4o for complex technical queries), Basic (GPT-4o-mini for standard support), Lite (phi-4 for high-volume FAQs). This optimizes cost by 40\u201360%.\""),
      bullet("\"How does this AI support initiative align with your existing ML workloads (yield prediction, defect detection)? Can we share Azure infrastructure?\""),
      bullet("\"We\u2019ll need your team to help tune the system prompt and evaluate response quality against your engineering accuracy standards.\""),

      new Paragraph({ spacing: { before: 200 } }),

      // ─── UC / TELEPHONY ───
      heading2("14.10 Unified Communications / Telephony (UC Manager)"),
      heading3("Engagement Priority: Medium — Weeks 3\u20134"),
      boldPara("Key Tasks: ", "Map existing telephony infrastructure, plan Teams voice channel configuration, assess Azure Communication Services for PSTN, coordinate Voice Live API integration with global telephony routing."),
      heading3("Talking Points"),
      bullet("\"The voice channel uses Azure Voice Live API with WebSocket-based real-time audio streaming \u2014 24kHz quality, server-side VAD, noise suppression, and echo cancellation.\""),
      bullet("\"Vodafone handles 45 million queries per month across 15 languages using this same Azure voice + AI stack.\""),
      bullet("\"What does your current global telephony routing look like? We need to understand how voice calls reach support today before we add the AI layer.\""),
      bullet("\"The same AI agent handles Teams calls, browser voice, and PSTN telephony \u2014 no separate agent for each channel.\""),

      new Paragraph({ spacing: { before: 200 } }),

      // ─── KNOWLEDGE MANAGEMENT ───
      heading2("14.11 Knowledge Management / Technical Publications"),
      heading3("Engagement Priority: High — Weeks 2\u20133"),
      boldPara("Key Tasks: ", "Inventory all knowledge sources (datasheets, technical notes, app notes, qualification reports, firmware release notes), define content classification levels (public/NDA/internal), establish indexing and update workflows, plan content migration to Azure AI Search."),
      heading3("Talking Points"),
      bullet("\"The AI is only as good as its knowledge base. We need a complete inventory of what your customers and engineers ask about, and where the answers live today.\""),
      bullet("\"Content classification is critical: public datasheets (anyone), NDA-protected specs (qualified customers), internal process docs (employees only). The AI enforces these boundaries.\""),
      bullet("\"When a new product revision or errata drops, how quickly does it need to appear in the AI\u2019s knowledge? We\u2019ll design the update pipeline around your publishing cadence.\""),
      bullet("\"Can you map your current document types: how many datasheets, technical notes, app notes, and design guides exist? What format are they in?\""),

      new Paragraph({ spacing: { before: 200 } }),

      // ─── PRODUCT / UX ───
      heading2("14.12 Product / Digital Experience (Product Owner / UX)"),
      heading3("Engagement Priority: Medium — Weeks 3\u20134"),
      boldPara("Key Tasks: ", "Define conversation flows and UX patterns, review branding guidelines for AI assistant, design parametric search and cross-reference features, plan customer portal integration."),
      heading3("Talking Points"),
      bullet("\"The demo shows a branded AI assistant with your visual identity, custom suggested questions, and structured responses. What adjustments does the UX need for your customers?\""),
      bullet("\"We can design conversation flows for common product selection journeys: \u2018I need a DDR5 module with X speed, Y capacity, Z temperature rating.\u2019\""),
      bullet("\"Where should the AI live in your digital experience? Embedded in the customer portal? As a Teams app? As a standalone browser widget?\""),

      new Paragraph({ spacing: { before: 200 } }),

      // ─── LEGAL / PRIVACY ───
      heading2("14.13 Legal / Privacy / Trade Compliance"),
      heading3("Engagement Priority: High — Weeks 2\u20133"),
      boldPara("Key Tasks: ", "Review AI disclosure requirements, assess ITAR/EAR implications for AI-served technical content, define data retention policies for conversation logs, approve responsible AI usage terms, validate CHIPS Act compliance for any government-funded program data."),
      heading3("Talking Points"),
      bullet("\"Do we need to disclose to customers that they\u2019re interacting with an AI? What language is required in your jurisdiction?\""),
      bullet("\"For export-controlled content, the AI will never serve ITAR/EAR restricted data without identity verification through Entra ID and proper clearance classification.\""),
      bullet("\"Conversation logs will be retained for [X days/months] in Cosmos DB within your Azure tenant. What\u2019s your data retention policy?\""),
      bullet("\"Are there any CHIPS Act reporting obligations that affect how we handle AI interactions related to government-funded programs?\""),

      new Paragraph({ spacing: { before: 200 } }),

      // ─── CHANGE MANAGEMENT ───
      heading2("14.14 Change Management / Training"),
      heading3("Engagement Priority: Medium — Weeks 4\u20135"),
      boldPara("Key Tasks: ", "Develop adoption strategy, create training materials for TSEs and end users, plan pilot rollout (recommended: one product line first), design feedback collection mechanisms, set adoption KPIs."),
      heading3("Talking Points"),
      bullet("\"We recommend piloting with one product line \u2014 e.g., SSD technical support \u2014 before expanding. This limits blast radius and lets us tune the AI with a focused team.\""),
      bullet("\"Lenovo went from zero to second-largest Copilot user in 45 days. Fast adoption is possible when the tool genuinely saves time.\""),
      bullet("\"What\u2019s your preferred training format? Hands-on workshops, video walkthroughs, or embedded guides within the tool?\""),
      bullet("\"We\u2019ll track adoption daily: queries per agent, AI-assisted resolution rate, and qualitative feedback from pilot users.\""),

      new Paragraph({ spacing: { before: 200 } }),

      // ─── QUALITY & RELIABILITY ───
      heading2("14.15 Quality & Reliability Engineering"),
      heading3("Engagement Priority: Medium — Weeks 3\u20134"),
      boldPara("Key Tasks: ", "Define accuracy test suite against product specifications, validate AI responses meet ISO 9001 / IATF 16949 / AEC-Q100 standards, establish regression testing protocol, plan load testing for global concurrent sessions."),
      heading3("Talking Points"),
      bullet("\"Every AI response citing reliability data, qualification reports, or failure analysis procedures must meet your engineering accuracy standards. We need your team to define \u2018pass\u2019 criteria.\""),
      bullet("\"We\u2019ll build an automated test suite of 100+ verified Q&A pairs that runs on every knowledge base update. Your team defines the golden answers.\""),
      bullet("\"For automotive-grade products (AEC-Q100), can the AI cite qualification data? Or must those queries always route to a human AE?\""),
      bullet("\"What\u2019s the target for concurrent sessions globally? We need to load test across Asia, Europe, and Americas time zones.\""),
    ],
  }],
});

// ─── Generate ───
Packer.toBuffer(doc).then(buffer => {
  const outPath = "docs/AI-Support-Assistant-BRD.docx";
  try {
    fs.writeFileSync(outPath, buffer);
  } catch (e) {
    if (e.code === "EBUSY") {
      const alt = outPath.replace(".docx", "-new.docx");
      fs.writeFileSync(alt, buffer);
      console.log(`Original locked. Written to: ${alt}`);
      console.log("Close the file in Word and rename manually, or re-run.");
      return;
    }
    throw e;
  }
  const kb = (buffer.length / 1024).toFixed(0);
  console.log(`Generated: ${outPath} (${kb} KB)`);
});

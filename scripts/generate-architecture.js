const fs = require("fs");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, HeadingLevel, BorderStyle, WidthType,
  ShadingType, PageNumber, PageBreak, LevelFormat, TableOfContents,
} = require("docx");

// ─── Brand & shared helpers ───
const ACCENT = "86BC25";   // Primary green
const ACCENT2 = "00A3E0";  // Blue
const DARK_BG = "1A1A2E";  // Dark navy

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
    children: [new Paragraph({ alignment: opts.align, children: runs })],
  });
}

function codeCell(text, width) {
  return new TableCell({
    borders,
    width: { size: width, type: WidthType.DXA },
    shading: { fill: "F4F4F4", type: ShadingType.CLEAR },
    margins: cellMargins,
    children: [new Paragraph({ children: [new TextRun({ text, font: "Courier New", size: 18, color: "1A1A2E" })] })],
  });
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
    spacing: { after: opts.after !== undefined ? opts.after : 200 },
    children: [new TextRun({ text, font: "Arial", size: 22, ...opts })],
  });
}
function codePara(text) {
  return new Paragraph({
    spacing: { before: 60, after: 60 },
    children: [new TextRun({ text, font: "Courier New", size: 18, color: "444444" })],
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
function numberedPara(text, num) {
  return new Paragraph({
    numbering: { reference: "numbers", level: 0 },
    children: [new TextRun({ text, font: "Arial", size: 22 })],
  });
}
function spacer(after = 120) {
  return new Paragraph({ spacing: { after }, children: [] });
}
function divider() {
  return new Paragraph({
    spacing: { before: 120, after: 120 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: ACCENT, space: 1 } },
    children: [],
  });
}

// ─── Simple 2-col table ───
function simpleTable(rows, colWidths) {
  const totalWidth = colWidths.reduce((a, b) => a + b, 0);
  return new Table({
    width: { size: totalWidth, type: WidthType.DXA },
    columnWidths: colWidths,
    rows: rows.map(([col1, col2], i) => new TableRow({
      children: [
        i === 0 ? headerCell(col1, colWidths[0]) : cell(col1, colWidths[0], { bold: true }),
        i === 0 ? headerCell(col2, colWidths[1]) : cell(col2, colWidths[1]),
      ],
    })),
  });
}

// ─── 3-col table ───
function threeColTable(rows, colWidths) {
  const totalWidth = colWidths.reduce((a, b) => a + b, 0);
  return new Table({
    width: { size: totalWidth, type: WidthType.DXA },
    columnWidths: colWidths,
    rows: rows.map(([c1, c2, c3], i) => new TableRow({
      children: [
        i === 0 ? headerCell(c1, colWidths[0]) : cell(c1, colWidths[0], { bold: i === 0 }),
        i === 0 ? headerCell(c2, colWidths[1]) : cell(c2, colWidths[1]),
        i === 0 ? headerCell(c3, colWidths[2]) : cell(c3, colWidths[2]),
      ],
    })),
  });
}

// ─── 4-col table ───
function fourColTable(rows, colWidths) {
  const totalWidth = colWidths.reduce((a, b) => a + b, 0);
  return new Table({
    width: { size: totalWidth, type: WidthType.DXA },
    columnWidths: colWidths,
    rows: rows.map(([c1, c2, c3, c4], i) => new TableRow({
      children: [
        i === 0 ? headerCell(c1, colWidths[0]) : cell(c1, colWidths[0], { bold: i === 0 }),
        i === 0 ? headerCell(c2, colWidths[1]) : cell(c2, colWidths[1]),
        i === 0 ? headerCell(c3, colWidths[2]) : cell(c3, colWidths[2]),
        i === 0 ? headerCell(c4, colWidths[3]) : cell(c4, colWidths[3]),
      ],
    })),
  });
}

// ─── Code block rendered as a shaded table ───
function codeBlock(lines) {
  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [9360],
    rows: [
      new TableRow({
        children: [
          new TableCell({
            borders: {
              top: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
              bottom: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
              left: { style: BorderStyle.SINGLE, size: 4, color: ACCENT },
              right: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
            },
            width: { size: 9360, type: WidthType.DXA },
            shading: { fill: "F8F8F8", type: ShadingType.CLEAR },
            margins: { top: 120, bottom: 120, left: 200, right: 120 },
            children: lines.map(l => new Paragraph({
              spacing: { before: 40, after: 40 },
              children: [new TextRun({ text: l, font: "Courier New", size: 18, color: "333333" })],
            })),
          }),
        ],
      }),
    ],
  });
}

// ─── Document ───────────────────────────────────────────────────────────────
const doc = new Document({
  numbering: {
    config: [
      {
        reference: "bullets",
        levels: [{
          level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } },
        }],
      },
      {
        reference: "numbers",
        levels: [{
          level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } },
        }],
      },
    ],
  },
  styles: {
    default: {
      document: { run: { font: "Arial", size: 22 } },
    },
    paragraphStyles: [
      {
        id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 36, bold: true, font: "Arial", color: DARK_BG },
        paragraph: { spacing: { before: 360, after: 200 }, outlineLevel: 0 },
      },
      {
        id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 28, bold: true, font: "Arial", color: "1A1A2E" },
        paragraph: { spacing: { before: 280, after: 160 }, outlineLevel: 1 },
      },
      {
        id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 24, bold: true, font: "Arial", color: "2C5F8A" },
        paragraph: { spacing: { before: 200, after: 120 }, outlineLevel: 2 },
      },
    ],
  },
  sections: [
    // ── Cover Page ──────────────────────────────────────────────────────────
    {
      properties: {
        page: {
          size: { width: 12240, height: 15840 },
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
        },
      },
      children: [
        spacer(2880),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 },
          children: [new TextRun({ text: "Acme Corp", font: "Arial", size: 36, color: ACCENT, bold: true })],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 160 },
          children: [new TextRun({ text: "AI Support Assistant", font: "Arial", size: 52, bold: true, color: DARK_BG })],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 800 },
          children: [new TextRun({ text: "Architecture Overview", font: "Arial", size: 52, bold: true, color: DARK_BG })],
        }),
        divider(),
        spacer(400),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 160 },
          children: [new TextRun({ text: "Enterprise v3.0  \u2014  Proof of Concept", font: "Arial", size: 24, color: "555555" })],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 160 },
          children: [new TextRun({ text: "March 2026", font: "Arial", size: 24, color: "555555" })],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 160 },
          children: [new TextRun({ text: "Powered by Microsoft Copilot Studio \u00b7 Azure OpenAI \u00b7 Azure AI Search", font: "Arial", size: 22, color: "888888" })],
        }),
        spacer(2400),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: "CONFIDENTIAL", font: "Arial", size: 20, bold: true, color: "CC0000" })],
        }),
        new Paragraph({ children: [new PageBreak()] }),
      ],
    },
    // ── Main Content ────────────────────────────────────────────────────────
    {
      properties: {
        page: {
          size: { width: 12240, height: 15840 },
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
        },
      },
      headers: {
        default: new Header({
          children: [
            new Paragraph({
              border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: ACCENT, space: 1 } },
              children: [
                new TextRun({ text: "Acme Corp AI Support Assistant \u2014 Architecture Overview", font: "Arial", size: 18, color: "555555" }),
                new TextRun({ text: "\t", font: "Arial", size: 18 }),
                new TextRun({ text: "CONFIDENTIAL", font: "Arial", size: 18, bold: true, color: "CC0000" }),
              ],
              tabStops: [{ type: "right", position: 9360 }],
            }),
          ],
        }),
      },
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              border: { top: { style: BorderStyle.SINGLE, size: 4, color: ACCENT, space: 1 } },
              children: [
                new TextRun({ text: "Architecture Overview \u00b7 Enterprise v3.0", font: "Arial", size: 18, color: "888888" }),
                new TextRun({ text: "\tPage ", font: "Arial", size: 18, color: "888888" }),
                new TextRun({ children: [PageNumber.CURRENT], font: "Arial", size: 18, color: "888888" }),
                new TextRun({ text: " of ", font: "Arial", size: 18, color: "888888" }),
                new TextRun({ children: [PageNumber.TOTAL_PAGES], font: "Arial", size: 18, color: "888888" }),
              ],
              tabStops: [{ type: "right", position: 9360 }],
            }),
          ],
        }),
      },
      children: [
        // ── Table of Contents ──
        new Paragraph({
          heading: HeadingLevel.HEADING_1,
          children: [new TextRun("Table of Contents")],
        }),
        new TableOfContents("Table of Contents", {
          hyperlink: true,
          headingStyleRange: "1-3",
        }),
        new Paragraph({ children: [new PageBreak()] }),

        // ── 1. Executive Summary ──
        heading1("1. Executive Summary"),
        para(
          "The Acme Corp AI Support Assistant is a Next.js 16 / React 19 single-page application (SPA) " +
          "serving as a Proof of Concept (POC) for an enterprise-grade AI conversational support platform. " +
          "It validates five success criteria: resolution accuracy, response speed, dual data sources (RAG), " +
          "chat\u2013voice parity, and branded UX."
        ),
        para(
          "The application is deployed as a static export (no server required) and is designed to integrate \u2014 " +
          "in production \u2014 with Microsoft\u2019s full cloud stack: Copilot Studio, Azure OpenAI, " +
          "Azure AI Search, Azure Speech Services, Dynamics 365, and more."
        ),
        spacer(),

        // ── 2. Project Overview ──
        heading1("2. Project Overview"),
        simpleTable([
          ["Property", "Value"],
          ["Project Name", "micronbot"],
          ["Version", "Enterprise v3.0"],
          ["Type", "Single-Page Application (SPA)"],
          ["Framework", "Next.js 16.1.6"],
          ["UI Library", "React 19.2.4"],
          ["Language", "JavaScript / JSX"],
          ["Deployment", "Static export (GitHub Pages / CDN)"],
          ["Authentication (Production)", "Microsoft Entra ID (SSO)"],
        ], [3600, 5760]),
        spacer(),

        // ── 3. Repository Structure ──
        heading1("3. Repository Structure"),
        para("The repository follows the standard Next.js App Router layout:"),
        spacer(80),
        codeBlock([
          "tmt-micron/",
          "\u251c\u2500\u2500 app/",
          "\u2502   \u251c\u2500\u2500 layout.js                   # Root layout; fonts, metadata",
          "\u2502   \u251c\u2500\u2500 page.js                     # Home page (renders AIAssistant)",
          "\u2502   \u251c\u2500\u2500 globals.css                 # Global CSS reset / base styles",
          "\u2502   \u2514\u2500\u2500 components/",
          "\u2502       \u2514\u2500\u2500 AIAssistant.jsx          # Main component (~1,589 lines)",
          "\u251c\u2500\u2500 docs/                               # Documentation & planning artifacts",
          "\u2502   \u251c\u2500\u2500 AI-Support-Assistant-BRD.docx",
          "\u2502   \u251c\u2500\u2500 Voice-Live-API-Gap-Analysis.docx",
          "\u2502   \u251c\u2500\u2500 demo-walkthrough.md",
          "\u2502   \u2514\u2500\u2500 plans/",
          "\u251c\u2500\u2500 scripts/                            # Node.js document generators",
          "\u2502   \u251c\u2500\u2500 generate-brd.js",
          "\u2502   \u251c\u2500\u2500 generate-gap-analysis.js",
          "\u2502   \u2514\u2500\u2500 generate-design-plan.js",
          "\u251c\u2500\u2500 next.config.mjs                     # Next.js config (static export, basePath)",
          "\u2514\u2500\u2500 package.json                        # Dependencies and npm scripts",
        ]),
        spacer(),

        // ── 4. Frontend Architecture ──
        heading1("4. Frontend Architecture"),

        heading2("4.1 Rendering Model"),
        para(
          "The app uses the Next.js App Router with " +
          "output: \"export\" configured in next.config.mjs, producing a fully static bundle " +
          "(HTML / CSS / JS) with no server-side rendering. All logic is client-side React."
        ),
        spacer(80),

        heading2("4.2 Component Architecture"),
        para(
          "All application logic lives in a single client component: app/components/AIAssistant.jsx. " +
          "It is composed of the following logical units:"
        ),
        spacer(80),

        heading3("Sub-Components"),
        bulletBold("ChatMessage \u2014 ", "Renders user and bot messages with metadata, confidence badges, source tags, and action buttons (feedback, copy, escalate)."),
        bulletBold("ArchitectureView \u2014 ", "Accordion-style display of the four-layer Microsoft stack; toggle between Copilot Studio and AI Foundry paths."),
        bulletBold("VoiceView \u2014 ", "WebSocket connection status, audio configuration, microphone button, waveform visualization, live transcript."),
        bulletBold("AnalyticsView \u2014 ", "Summary KPI cards, sentiment breakdown, top call reasons, CSAT trend chart."),
        bulletBold("TypingIndicator \u2014 ", "Three animated dots shown while the assistant is processing."),
        bulletBold("ToolCallCard \u2014 ", "Visualizes function calls made by the AI with status (running / completed)."),
        bulletBold("ConfidenceBadge \u2014 ", "Displays the confidence level of a response (High / Medium / Low)."),
        bulletBold("ActionBtn / SourceTag \u2014 ", "Reusable UI primitives for actions and attribution labels."),
        spacer(120),

        heading3("Tab-Based Navigation (no URL routing)"),
        bullet("Chat \u2014 Conversational interface"),
        bullet("Voice \u2014 Simulated voice I/O channel"),
        bullet("Analytics \u2014 Real-time and historical metrics dashboard"),
        bullet("Architecture \u2014 Visual system architecture reference"),
        spacer(120),

        heading2("4.3 State Management"),
        para("State is managed entirely with React hooks \u2014 no Redux, Zustand, or Context API."),
        spacer(80),
        fourColTable([
          ["State Variable", "Type", "Purpose", ""],
          ["`messages`", "Array", "All chat messages (user, bot, tool)", ""],
          ["`input`", "String", "Current text input value", ""],
          ["`isTyping`", "Boolean", "Show/hide typing indicator", ""],
          ["`showSuggestions`", "Boolean", "Toggle suggested questions", ""],
          ["`activeTab`", "String", "Current active tab", ""],
          ["`isListening`", "Boolean", "Voice simulation state", ""],
          ["`stats`", "Object", "Session metrics (total, resolved, avgTime, feedback)", ""],
        ], [2200, 1600, 5560, 0]),
        spacer(),

        heading2("4.4 Data Flow"),
        para("The following sequence describes how a user query is processed end-to-end:"),
        spacer(80),
        codeBlock([
          "User Input (text or voice)",
          "      \u2193",
          "handleSend() triggered",
          "      \u2193",
          "User message appended to state",
          "      \u2193",
          "findAnswer() called (fuzzy matching against KNOWLEDGE_BASE)",
          "      \u2193",
          "Simulated delay (600\u20131100ms) \u2014 mimics API call",
          "      \u2193",
          "ToolCallCard rendered \u2192 status: running",
          "      \u2193",
          "Delay 500ms",
          "      \u2193",
          "ToolCallCard updated \u2192 status: completed",
          "Bot answer appended to state",
          "      \u2193",
          "Session stats updated (total, resolved, avgTime)",
          "      \u2193",
          "Component re-renders; auto-scrolls to latest message",
        ]),
        spacer(),

        heading2("4.5 Knowledge Base and Answer Engine"),
        para(
          "The application uses a hardcoded KNOWLEDGE_BASE array of approximately 25 Q&A entries. " +
          "Each entry has the following fields:"
        ),
        bulletBold("q \u2014 ", "Array of keyword variations / synonyms"),
        bulletBold("a \u2014 ", "Answer text"),
        bulletBold("category \u2014 ", "Classification (e.g., \"Security\", \"Platform\", \"General AI\")"),
        bulletBold("source \u2014 ", "Attribution (e.g., \"Azure OpenAI\", \"System\")"),
        bulletBold("related \u2014 ", "Related topic keywords"),
        spacer(120),
        para("The findAnswer() function implements a TF-IDF-inspired fuzzy matching algorithm:"),
        numberedPara("Stop word filtering"),
        numberedPara("Exact phrase matching (highest weight)"),
        numberedPara("Keyword containment scoring"),
        numberedPara("Word overlap analysis"),
        numberedPara("Special case handling for greetings, thanks, farewells"),
        numberedPara("Returns low-confidence \u201cescalation available\u201d for unmatched queries"),
        spacer(),
        new Paragraph({ children: [new PageBreak()] }),

        // ── 5. Production Architecture ──
        heading1("5. Production Architecture"),
        para(
          "In production, the simulated in-memory data layer is replaced with Microsoft\u2019s full cloud stack. " +
          "Two orchestration paths are supported."
        ),
        spacer(80),

        heading2("5.1 Copilot Studio Path (Recommended)"),

        heading3("Layer 1 \u2014 User Channels"),
        bullet("Microsoft Teams (native integration)"),
        bullet("Browser Widget (Azure Bot Service DirectLine)"),
        bullet("Azure Speech Services (real-time WebSocket audio streaming)"),
        spacer(120),

        heading3("Layer 2 \u2014 Orchestration"),
        bullet("Copilot Studio (low-code agent builder, conversation flow management)"),
        bullet("Azure Bot Service (multi-channel message routing)"),
        bullet("Power Automate (workflow triggers: escalation, ticket creation, notifications)"),
        spacer(120),

        heading3("Layer 3 \u2014 AI & Knowledge"),
        bullet("Azure OpenAI / GPT-4o (LLM for response generation)"),
        bullet("Azure AI Search (semantic document retrieval \u2014 RAG pattern)"),
        bullet("Knowledge Base (SharePoint, Confluence, or custom indexed documents)"),
        spacer(120),

        heading3("Layer 4 \u2014 Enterprise Integration"),
        bullet("Microsoft Entra ID (Zero-Trust SSO, RBAC)"),
        bullet("Dynamics 365 Contact Center (human agent escalation and hand-off)"),
        bullet("Azure Monitor (telemetry, logging, alerting)"),
        bullet("Cosmos DB (conversation storage)"),
        bullet("Microsoft Fabric (ETL pipeline for analytics)"),
        bullet("Power BI (analytics dashboards)"),
        spacer(160),

        heading2("5.2 Azure AI Foundry Path (Alternative)"),
        para(
          "Same channel and integration layers, but replaces Copilot Studio with Azure AI Foundry " +
          "for custom model deployment and fine-tuning workflows \u2014 preferred when deeper model control is required."
        ),
        spacer(80),

        heading2("5.3 Service Integration Matrix"),
        spacer(80),
        threeColTable([
          ["Service", "Role", "Authentication"],
          ["Copilot Studio", "Agent orchestration", "Entra ID SSO"],
          ["Azure OpenAI (GPT-4o)", "LLM generation", "Managed Identity"],
          ["Azure AI Search", "Semantic retrieval (RAG)", "Managed Identity"],
          ["Azure Speech Services", "Voice I/O (WebSocket)", "Managed Identity"],
          ["Azure Bot Service", "Multi-channel routing", "Entra ID / OAuth"],
          ["Power Automate", "Workflow automation", "Entra ID SSO"],
          ["Dynamics 365", "Human agent escalation", "Entra ID SSO"],
          ["Azure Monitor", "Telemetry & logging", "Managed Identity"],
          ["Cosmos DB", "Conversation storage", "Managed Identity"],
          ["Microsoft Fabric", "ETL & data transformation", "Managed Identity"],
          ["Power BI", "Analytics dashboards", "Entra ID SSO"],
          ["Entra ID", "Identity & access management", "Native SSO"],
        ], [3120, 3120, 3120]),
        spacer(),
        new Paragraph({ children: [new PageBreak()] }),

        // ── 6. Configuration ──
        heading1("6. Configuration"),

        heading2("6.1 next.config.mjs"),
        bullet("output: \"export\" \u2014 Generates a static site with no Node.js server required"),
        bullet("basePath \u2014 Conditionally set to /tmt-micron in production for GitHub Pages subdirectory deployment"),
        bullet("images.unoptimized: true \u2014 Disables Next.js image optimization (required for static export)"),
        spacer(120),
        codeBlock([
          "const isProd = process.env.NODE_ENV === 'production';",
          "",
          "const nextConfig = {",
          "  output: 'export',",
          "  basePath: isProd ? '/tmt-micron' : '',",
          "  images: { unoptimized: true },",
          "};",
        ]),
        spacer(160),

        heading2("6.2 app/layout.js"),
        bullet("Loads Google Fonts: Open Sans (body text, weights 300\u2013700) and Stix Two Text Italic (display/branded headings)"),
        bullet("Sets page metadata: title \"AI Support Assistant Demo\", description references Copilot Studio, Azure OpenAI, and Azure AI Search"),
        bullet("Exposes fonts as CSS variables: --font-open-sans, --font-stix-two-text"),
        spacer(),

        // ── 7. Styling Approach ──
        heading1("7. Styling Approach"),
        para(
          "All component styling is implemented as inline CSS-in-JS \u2014 no external CSS frameworks " +
          "(no Tailwind, Material UI, Chakra UI, etc.). The BRAND constant defines the design system:"
        ),
        spacer(80),
        threeColTable([
          ["Token", "Value", "Usage"],
          ["Primary Green", "#86BC25", "Buttons, badges, active states"],
          ["Neon Green", "#86EB22", "Pulse indicators, highlights"],
          ["Blue", "#00A3E0", "Source tags, links"],
          ["Dark", "#1A1A2E", "Page backgrounds"],
          ["Surface", "#16213E", "Card surfaces"],
          ["Border", "#0F3460", "Borders and dividers"],
        ], [3120, 2080, 4160]),
        spacer(120),
        para(
          "CSS @keyframes animations are defined inline: typing bounce, fade/slide in, " +
          "pulse, voice pulse, and audio bar animation."
        ),
        spacer(),

        // ── 8. Key Dependencies ──
        heading1("8. Key Dependencies"),
        fourColTable([
          ["Package", "Version", "Purpose", "Used By"],
          ["next", "16.1.6", "React framework, static export, App Router, Google Fonts", "Entire app"],
          ["react", "19.2.4", "UI component library", "AIAssistant component"],
          ["react-dom", "19.2.4", "DOM rendering", "Entry point"],
          ["docx", "9.6.0", "Word document generation", "scripts/ only"],
        ], [1800, 1400, 4360, 1800]),
        spacer(120),
        para("Why no additional dependencies:", { bold: true }),
        bullet("No state management (Redux, Zustand) \u2014 React hooks are sufficient for the POC"),
        bullet("No UI component library (Material-UI, Chakra) \u2014 inline CSS-in-JS gives full brand control"),
        bullet("No routing library (React Router) \u2014 Next.js App Router handles navigation"),
        bullet("No API client (Axios, SWR) \u2014 no external API calls in the current POC"),
        bullet("No testing framework \u2014 POC / demo scope; automated tests are a production milestone"),
        spacer(),

        // ── 9. Scripts ──
        heading1("9. Document Generation Scripts"),
        para(
          "Three Node.js scripts in the scripts/ directory generate Word documents (.docx) " +
          "for stakeholder communication using the docx npm library."
        ),
        spacer(80),
        simpleTable([
          ["Script", "Output Document"],
          ["generate-brd.js", "Business Requirements Document (BRD)"],
          ["generate-gap-analysis.js", "Voice / Live API Gap Analysis"],
          ["generate-design-plan.js", "Design and Implementation Plan"],
          ["generate-architecture.js", "Architecture Overview (this document)"],
        ], [3640, 5720]),
        spacer(120),
        para("All scripts share the following helper functions for consistent formatting:"),
        bullet("headerCell() \u2014 shaded green header cells"),
        bullet("cell() \u2014 body cells with optional fill and alignment"),
        bullet("priorityCell() \u2014 colour-coded priority badges (Must / Should / Could)"),
        bullet("statusCell() \u2014 colour-coded status badges"),
        bullet("heading1() / heading2() / heading3() \u2014 styled heading paragraphs"),
        bullet("para() / bullet() \u2014 body text and bulleted list items"),
        spacer(),
        new Paragraph({ children: [new PageBreak()] }),

        // ── 10. POC Success Criteria ──
        heading1("10. POC Success Criteria"),
        para(
          "The application validates the following five success criteria against the proposed " +
          "Microsoft cloud architecture."
        ),
        spacer(80),
        fourColTable([
          ["#", "Criterion", "Measurement", "Target"],
          ["1", "Resolution Accuracy", "% queries answered correctly without escalation", "\u2265 85%"],
          ["2", "Response Speed", "Average end-to-end latency", "< 3 seconds"],
          ["3", "Dual Data Sources", "RAG integration (Azure OpenAI + Azure AI Search)", "Demonstrated"],
          ["4", "Chat\u2013Voice Parity", "Same answers via text and voice channels", "Validated"],
          ["5", "Branded UX", "Acme Corp design system applied consistently", "Approved"],
        ], [480, 2880, 4320, 1680]),
        spacer(),

        // ── 11. Deployment ──
        heading1("11. Deployment"),
        para(
          "The application is deployed as a fully static export \u2014 no server, container, " +
          "or backend infrastructure is required for the demo deployment."
        ),
        spacer(80),

        heading2("Build Steps"),
        numberedPara("npm run build \u2014 Executes next build and outputs static files to .next/out/"),
        numberedPara("Deploy the out/ directory to GitHub Pages or any static CDN"),
        numberedPara("The basePath in next.config.mjs is set automatically based on the NODE_ENV variable"),
        spacer(160),

        heading2("Deployment Targets"),
        bullet("GitHub Pages \u2014 current demo host, served under the /tmt-micron subpath"),
        bullet("Azure Static Web Apps \u2014 recommended for production (Entra ID integration built-in)"),
        bullet("Azure CDN + Blob Storage \u2014 alternative for maximum CDN performance"),
        spacer(120),
        para(
          "For production deployment, backend services (Copilot Studio, Azure OpenAI, Azure AI Search, etc.) " +
          "are provisioned separately and connected via environment variables or Azure App Configuration.",
          { color: "555555" }
        ),
      ],
    },
  ],
});

Packer.toBuffer(doc).then((buffer) => {
  const outPath = "docs/Architecture-Overview.docx";
  fs.writeFileSync(outPath, buffer);
  console.log("Created:", outPath);
}).catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});

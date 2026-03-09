const fs = require("fs");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, HeadingLevel, BorderStyle, WidthType,
  ShadingType, PageNumber, PageBreak, LevelFormat,
} = require("docx");

const border = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
const borders = { top: border, bottom: border, left: border, right: border };
const cellMargins = { top: 80, bottom: 80, left: 120, right: 120 };
const ACCENT = "86BC25";
const DARK = "333333";
const SUB = "666666";

function hCell(text, width) {
  return new TableCell({
    borders, width: { size: width, type: WidthType.DXA },
    shading: { fill: ACCENT, type: ShadingType.CLEAR },
    margins: cellMargins,
    children: [new Paragraph({ children: [new TextRun({ text, bold: true, color: "FFFFFF", font: "Arial", size: 20 })] })],
  });
}

function tCell(text, width, opts = {}) {
  const runs = Array.isArray(text) ? text : [new TextRun({ text, font: "Arial", size: 20, ...opts })];
  return new TableCell({
    borders, width: { size: width, type: WidthType.DXA },
    shading: opts.fill ? { fill: opts.fill, type: ShadingType.CLEAR } : undefined,
    margins: cellMargins,
    children: [new Paragraph({ children: runs })],
  });
}

function h1(text) {
  return new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun(text)] });
}
function h2(text) {
  return new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun(text)] });
}
function h3(text) {
  return new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun(text)] });
}
function para(text, opts = {}) {
  const runs = Array.isArray(text) ? text : [new TextRun({ text, font: "Arial", size: 22, ...opts })];
  return new Paragraph({ spacing: { after: opts.after || 160 }, children: runs });
}
function bold(text) {
  return new TextRun({ text, font: "Arial", size: 22, bold: true });
}
function normal(text) {
  return new TextRun({ text, font: "Arial", size: 22 });
}
function bullet(text, ref = "bullets") {
  const runs = Array.isArray(text) ? text : [new TextRun({ text, font: "Arial", size: 22 })];
  return new Paragraph({ numbering: { reference: ref, level: 0 }, spacing: { after: 60 }, children: runs });
}
function numberedItem(text, ref = "numbers") {
  const runs = Array.isArray(text) ? text : [new TextRun({ text, font: "Arial", size: 22 })];
  return new Paragraph({ numbering: { reference: ref, level: 0 }, spacing: { after: 80 }, children: runs });
}

const doc = new Document({
  styles: {
    default: { document: { run: { font: "Arial", size: 22 } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 36, bold: true, font: "Arial", color: DARK },
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
      { reference: "taskNums", levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT,
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
          children: [new TextRun({ text: "Design & Implementation Plan \u2014 AI Support Assistant Demo Enhancements", italics: true, color: "999999", font: "Arial", size: 18 })],
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
      // ════════════════════════════════════════════
      // COVER PAGE
      // ════════════════════════════════════════════
      new Paragraph({ spacing: { before: 3000, after: 100 }, alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: "Design & Implementation Plan", size: 56, bold: true, font: "Arial", color: DARK })] }),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 100 },
        children: [new TextRun({ text: "AI Support Assistant \u2014 Demo Enhancements + BRD", size: 30, font: "Arial", color: ACCENT })] }),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 600 },
        children: [new TextRun({ text: "March 2026", size: 24, font: "Arial", color: "999999" })] }),

      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 80 },
        children: [new TextRun({ text: "Status: Approved", size: 22, bold: true, font: "Arial", color: ACCENT })] }),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 80 },
        children: [new TextRun({ text: "Prepared by: Partner Agency", size: 22, font: "Arial", color: SUB })] }),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 80 },
        children: [new TextRun({ text: "Prepared for: Acme Corp", size: 22, font: "Arial", color: SUB })] }),

      new Paragraph({ children: [new PageBreak()] }),

      // ════════════════════════════════════════════
      // PART 1: DESIGN DOCUMENT
      // ════════════════════════════════════════════
      new Paragraph({ spacing: { after: 100 },
        children: [new TextRun({ text: "PART 1", size: 20, bold: true, font: "Arial", color: ACCENT, allCaps: true })] }),
      h1("Design Document"),

      // Context
      h2("Context"),
      para("The gap analysis (docs/Voice-Live-API-Gap-Analysis.docx) identified 13 gaps, 5 partial overlaps, and 5 covered areas between the demo and Microsoft\u2019s Voice Live API / Foundry Agent Service articles. The demo needs UI enhancements to tell a more complete story, and a formal BRD is needed for stakeholder communication."),

      // Deliverables
      h2("Deliverables"),
      numberedItem([bold("Demo UI enhancements"), normal(" \u2014 4 changes to AIAssistant.jsx (all client-side, no backend)")]),
      numberedItem([bold("BRD Word document"), normal(" \u2014 docs/AI-Support-Assistant-BRD.docx generated via docx npm package")]),

      new Paragraph({ children: [new PageBreak()] }),

      // Enhancement 1: Voice
      h2("Enhancement 1: Voice Tab \u2014 Voice Live API Panel"),
      para([bold("File: "), normal("app/components/AIAssistant.jsx (VoiceView component)")]),
      para([bold("Current: "), normal("Simple microphone button, pulsing animation, hardcoded 2.5s timer auto-submits a canned query, 3 channel cards.")]),
      para([bold("Proposed:")]),
      bullet("Connection status bar at top: \u201CWebSocket Connected\u201D with green dot, endpoint URL display"),
      bullet("Audio config panel: Sample Rate (24kHz PCM16), VAD Mode (Server/Semantic toggle), Model (GPT-4o-realtime), Voice (en-US-Ava:DragonHDLatestNeural)"),
      bullet("Keep microphone button + waveform animation"),
      bullet("Live transcript area: simulated real-time transcription appearing word-by-word during listening phase"),
      bullet("Channel cards updated with Voice Live API capability labels"),
      bullet("All purely visual/simulated \u2014 no actual WebSocket or audio processing"),

      // Enhancement 2: Architecture
      h2("Enhancement 2: Architecture Tab \u2014 AI Foundry Path"),
      para([bold("File: "), normal("app/components/AIAssistant.jsx (ArchitectureView component)")]),
      para([bold("Current: "), normal("4 layers with Copilot Studio as the sole orchestration approach.")]),
      para([bold("Proposed:")]),
      bullet("Toggle/segmented control at top: \u201CCopilot Studio\u201D (default) vs \u201CAI Foundry\u201D"),
      bullet("When AI Foundry selected, Orchestration Layer swaps to: Azure AI Foundry, Foundry Agent Service, Azure Logic Apps"),
      bullet("All other layers remain the same"),
      bullet("Info callout below toggle explaining trade-offs between the two paths"),

      // Enhancement 3: Analytics
      h2("Enhancement 3: Analytics Tab (New)"),
      para([bold("File: "), normal("app/components/AIAssistant.jsx (new AnalyticsView component)")]),
      para([bold("Current: "), normal("Only 4 stat numbers in the header bar.")]),
      para([bold("Proposed: "), normal("New \u201CAnalytics\u201D tab (4th tab):")]),
      bullet("Summary cards row: Total Conversations, Avg Satisfaction, Resolution Rate, Avg Handle Time"),
      bullet("Sentiment breakdown: horizontal stacked bar (CSS-only) showing Positive/Neutral/Negative %"),
      bullet("Top call reasons: horizontal bar chart showing category distribution"),
      bullet("Satisfaction trend: CSS bar chart showing daily CSAT for \u201Clast 7 days\u201D (mocked data)"),
      bullet("Data source attribution: \u201CPowered by Cosmos DB + Microsoft Fabric + Power BI\u201D"),
      bullet("No chart library \u2014 all CSS flexbox/grid bars"),

      // Enhancement 4: Function Calling
      h2("Enhancement 4: Function Calling Visualization in Chat"),
      para([bold("File: "), normal("app/components/AIAssistant.jsx (handleSend function, new ToolCallCard component)")]),
      para([bold("Current: "), normal("findAnswer() returns result directly after a simulated delay.")]),
      para([bold("Proposed:")]),
      bullet("For knowledge-base queries, show an intermediate \u201Ctool call\u201D step before the answer"),
      bullet("Tool-call card: icon + function name (e.g., search_knowledge_base(query=\u201Csecurity\u201D)) + spinner"),
      bullet("After ~500ms, card updates to \u201Ccompleted\u201D with checkmark, then actual answer renders below"),
      bullet("Only triggers for KB matches (not greetings, farewells, or unmatched queries)"),

      new Paragraph({ children: [new PageBreak()] }),

      // BRD Structure
      h2("BRD Word Document Structure"),
      para([bold("File: "), normal("docs/AI-Support-Assistant-BRD.docx")]),
      para([bold("Generator: "), normal("scripts/generate-brd.js (using docx npm package)")]),

      numberedItem([bold("Cover Page"), normal(" \u2014 Title, date, version 1.0, prepared by Partner Agency, prepared for Acme Corp")]),
      numberedItem([bold("Executive Summary"), normal(" \u2014 One-page overview: business drivers, solution approach, expected outcomes")]),
      numberedItem([bold("Business Objectives"), normal(" \u2014 24/7 support, reduced escalation, consistent knowledge delivery, multi-channel")]),
      numberedItem([bold("Scope"), normal(" \u2014 In scope / out of scope boundaries")]),
      numberedItem([bold("Functional Requirements (FR-01\u2013FR-12)"), normal(" \u2014 Each with description, acceptance criteria, MoSCoW priority, gap reference")]),
      numberedItem([bold("Non-Functional Requirements"), normal(" \u2014 Security, performance (<2s), availability (99.9%), scalability")]),
      numberedItem([bold("Architecture Overview"), normal(" \u2014 Both orchestration paths (Copilot Studio + AI Foundry)")]),
      numberedItem([bold("Success Criteria"), normal(" \u2014 5 POC criteria + gap closure metrics")]),
      numberedItem([bold("Phased Delivery Roadmap"), normal(" \u2014 4 phases from current demo to production")]),
      numberedItem([bold("Resource Plan"), normal(" \u2014 Sprint-based breakdown with roles, hours, and cost at $250/hr")]),
      numberedItem([bold("Assumptions & Dependencies"), normal(" \u2014 Azure subscription, licensing, Entra ID tenant")]),
      numberedItem([bold("Appendix: Gap Analysis Reference"), normal(" \u2014 Summary table from existing gap analysis")]),

      // Resource Plan summary
      h3("Resource Plan Parameters"),
      bullet("Rate: $250/hr blended consulting rate"),
      bullet("Sprint cadence: 2-week sprints"),
      bullet("Roles: Solution Architect, AI/ML Engineer, Full-Stack Developer, QA Engineer, Project Manager"),
      bullet("Total: 940 hours across 6 sprints (12 weeks)"),
      bullet("Total cost: $235,000"),

      // Files table
      h2("Files Modified/Created"),
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [4680, 4680],
        rows: [
          new TableRow({ children: [hCell("File", 4680), hCell("Action", 4680)] }),
          new TableRow({ children: [
            tCell("app/components/AIAssistant.jsx", 4680),
            tCell("Modify \u2014 Voice Live API panel, AI Foundry toggle, Analytics tab, function calling cards", 4680),
          ]}),
          new TableRow({ children: [
            tCell("scripts/generate-brd.js", 4680),
            tCell("Create \u2014 docx generator for BRD", 4680),
          ]}),
          new TableRow({ children: [
            tCell("docs/AI-Support-Assistant-BRD.docx", 4680),
            tCell("Create \u2014 generated BRD document", 4680),
          ]}),
          new TableRow({ children: [
            tCell("docs/demo-walkthrough.md", 4680),
            tCell("Update \u2014 add new tabs/features to walkthrough script", 4680),
          ]}),
        ],
      }),

      new Paragraph({ children: [new PageBreak()] }),

      // ════════════════════════════════════════════
      // PART 2: IMPLEMENTATION PLAN
      // ════════════════════════════════════════════
      new Paragraph({ spacing: { after: 100 },
        children: [new TextRun({ text: "PART 2", size: 20, bold: true, font: "Arial", color: ACCENT, allCaps: true })] }),
      h1("Implementation Plan"),

      para([bold("Goal: "), normal("Update the AI Support Assistant demo to visually cover the 13 gaps from the Voice Live API gap analysis, and generate a formal BRD Word document.")]),
      para([bold("Architecture: "), normal("All changes are client-side UI enhancements in a single React component (AIAssistant.jsx). The BRD is generated via a Node.js script using the docx package. No backend, no new dependencies.")]),
      para([bold("Tech Stack: "), normal("Next.js 16, React 19, docx npm package, CSS-in-JS (inline styles)")]),
      para([bold("Verification: "), normal("Visual verification via preview tools. No unit test framework \u2014 this is a stakeholder demo prototype.")]),

      new Paragraph({ children: [new PageBreak()] }),

      // ─── Task 1 ───
      h2("Task 1: Function Calling Visualization in Chat"),
      para([bold("Files: "), normal("Modify: app/components/AIAssistant.jsx")]),
      para("Smallest change, modifies existing chat flow. Gets us warmed up before bigger structural changes."),
      h3("Steps"),
      numberedItem([bold("Add ToolCallCard component "), normal("\u2014 new component after ConfidenceBadge (~line 445) rendering function call indicator with function name, args, and running/completed status")], "taskNums"),
      numberedItem([bold("Add tool call rendering in ChatMessage "), normal("\u2014 handle messages with role === \u201Ctool\u201D, render with BrandIcon avatar + ToolCallCard")], "taskNums"),
      numberedItem([bold("Add FUNCTION_MAP constant "), normal("\u2014 maps categories to function names (search_knowledge_base, query_security_policies, route_escalation, get_analytics_summary, etc.)")], "taskNums"),
      numberedItem([bold("Modify handleSend "), normal("\u2014 for KB queries: insert \u201Ctool\u201D message (running), then after 500ms mark completed + add answer. Skip tool call for Greeting/Courtesy/Unmatched categories.")], "taskNums"),
      numberedItem([bold("Verify visually "), normal("\u2014 \u201Csecurity model\u201D shows tool card, \u201Chello\u201D skips it, \u201Ccafeteria menu\u201D shows unmatched without tool call")], "taskNums"),
      numberedItem([bold("Commit")], "taskNums"),

      // ─── Task 2 ───
      h2("Task 2: Architecture Tab \u2014 AI Foundry Toggle"),
      para([bold("Files: "), normal("Modify: app/components/AIAssistant.jsx")]),
      h3("Steps"),
      numberedItem([bold("Add ARCHITECTURE_FOUNDRY constant "), normal("\u2014 alternative orchestration layer with Azure AI Foundry, Foundry Agent Service, Azure Logic Apps; updated AI & Knowledge layer with multi-tier models; updated Enterprise Integration with Cosmos DB + Fabric")], "taskNums"),
      numberedItem([bold("Add path toggle to ArchitectureView "), normal("\u2014 segmented control: \u201CCopilot Studio Path\u201D (default) vs \u201CAI Foundry Path\u201D; info callout when Foundry selected; swap layers based on selection")], "taskNums"),
      numberedItem([bold("Update Success Criteria Mapping "), normal("\u2014 text adapts based on selected path")], "taskNums"),
      numberedItem([bold("Verify visually "), normal("\u2014 toggle between paths, expand layers, check components differ in orchestration/AI/enterprise layers")], "taskNums"),
      numberedItem([bold("Commit")], "taskNums"),

      // ─── Task 3 ───
      h2("Task 3: Voice Tab \u2014 Voice Live API Panel"),
      para([bold("Files: "), normal("Modify: app/components/AIAssistant.jsx")]),
      h3("Steps"),
      numberedItem([bold("Rewrite VoiceView component "), normal("\u2014 connection status bar (green \u201CWebSocket Connected\u201D + endpoint URL), audio config 2x2 grid (Sample Rate, VAD Mode toggle, Model, Voice), microphone button, waveform visualization, live transcript with word-by-word animation, updated channel cards")], "taskNums"),
      numberedItem([bold("Verify visually "), normal("\u2014 config panel renders, VAD toggles, microphone triggers waveform + transcript, auto-switches to chat after 2.5s")], "taskNums"),
      numberedItem([bold("Commit")], "taskNums"),

      // ─── Task 4 ───
      h2("Task 4: Analytics Tab (New)"),
      para([bold("Files: "), normal("Modify: app/components/AIAssistant.jsx")]),
      h3("Steps"),
      numberedItem([bold("Add MOCK_ANALYTICS constant "), normal("\u2014 historical baseline data: 1,247 conversations, 87% resolution, 92% CSAT, sentiment breakdown, 7 call reason categories, 7-day CSAT trend")], "taskNums"),
      numberedItem([bold("Create AnalyticsView component "), normal("\u2014 summary cards row (4 metrics blending live + historical), sentiment stacked bar (green/blue/red), top call reasons horizontal bar chart, CSAT trend bar chart, \u201CPowered by Cosmos DB + Fabric + Power BI\u201D attribution. All CSS-only, no chart library.")], "taskNums"),
      numberedItem([bold("Add Analytics tab "), normal("\u2014 4th tab in tab bar + content panel routing with stats prop")], "taskNums"),
      numberedItem([bold("Verify visually "), normal("\u2014 all charts render, live stats blend with historical, data source label present")], "taskNums"),
      numberedItem([bold("Commit")], "taskNums"),

      // ─── Task 5 ───
      h2("Task 5: Update Demo Walkthrough"),
      para([bold("Files: "), normal("Modify: docs/demo-walkthrough.md")]),
      h3("Steps"),
      numberedItem([bold("Add new walkthrough sections "), normal("\u2014 Act 2 Part E (function calling), updated Act 4 (Voice Live API panel), updated Act 5 (AI Foundry toggle), new Analytics act, updated Q&A table")], "taskNums"),
      numberedItem([bold("Commit")], "taskNums"),

      // ─── Task 6 ───
      h2("Task 6: Generate BRD Word Document"),
      para([bold("Files: "), normal("Create: scripts/generate-brd.js, docs/AI-Support-Assistant-BRD.docx")]),
      h3("Steps"),
      numberedItem([bold("Write BRD generator script "), normal("\u2014 12 sections: cover page, executive summary, business objectives, scope, functional requirements (FR-01\u2013FR-12 with acceptance criteria and MoSCoW priority), non-functional requirements, architecture overview, success criteria, phased roadmap, resource plan ($250/hr, 6 sprints, 940 hours, $235K total), assumptions, appendix")], "taskNums"),
      numberedItem([bold("Run generator "), normal("\u2014 node scripts/generate-brd.js")], "taskNums"),
      numberedItem([bold("Commit")], "taskNums"),

      new Paragraph({ children: [new PageBreak()] }),

      // ─── Task 7 ───
      h2("Task 7: Final Verification and Push"),
      h3("Steps"),
      numberedItem([bold("Build check "), normal("\u2014 npm run build, ensure static export completes")], "taskNums"),
      numberedItem([bold("Visual smoke test:")], "taskNums"),
      bullet("Chat: \u201Csecurity model\u201D \u2192 tool call card + answer"),
      bullet("Chat: \u201Chello\u201D \u2192 direct answer, no tool call"),
      bullet("Chat: \u201Ccafeteria menu\u201D \u2192 unmatched + escalation button"),
      bullet("Voice tab: config panel, connection status, waveform, transcript"),
      bullet("Architecture tab: toggle between Copilot Studio and AI Foundry"),
      bullet("Analytics tab: all charts render, data source label"),
      bullet("Header stats: update during chat"),
      numberedItem([bold("Push to GitHub "), normal("\u2014 git push origin main, verify GitHub Pages deploy")], "taskNums"),

      new Paragraph({ children: [new PageBreak()] }),

      // ════════════════════════════════════════════
      // RESOURCE PLAN SUMMARY
      // ════════════════════════════════════════════
      h1("Resource Plan Summary"),
      para("Sprint-based resource allocation across 4 delivery phases (6 two-week sprints, 12 weeks total)."),

      h2("Resource Allocation by Sprint"),
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [1800, 900, 900, 900, 900, 900, 900, 1080, 1080],
        rows: [
          new TableRow({ children: [
            hCell("Role", 1800), hCell("S1", 900), hCell("S2", 900), hCell("S3", 900),
            hCell("S4", 900), hCell("S5", 900), hCell("S6", 900),
            hCell("Total Hrs", 1080), hCell("Cost", 1080),
          ]}),
          new TableRow({ children: [
            tCell("Solution Architect", 1800), tCell("40", 900), tCell("30", 900), tCell("30", 900),
            tCell("20", 900), tCell("20", 900), tCell("30", 900),
            tCell([bold("170")], 1080), tCell("$42,500", 1080),
          ]}),
          new TableRow({ children: [
            tCell("AI/ML Engineer", 1800), tCell("20", 900), tCell("60", 900), tCell("60", 900),
            tCell("50", 900), tCell("50", 900), tCell("30", 900),
            tCell([bold("270")], 1080), tCell("$67,500", 1080),
          ]}),
          new TableRow({ children: [
            tCell("Full-Stack Dev", 1800), tCell("30", 900), tCell("50", 900), tCell("50", 900),
            tCell("40", 900), tCell("40", 900), tCell("30", 900),
            tCell([bold("240")], 1080), tCell("$60,000", 1080),
          ]}),
          new TableRow({ children: [
            tCell("QA Engineer", 1800), tCell("10", 900), tCell("20", 900), tCell("30", 900),
            tCell("30", 900), tCell("30", 900), tCell("40", 900),
            tCell([bold("160")], 1080), tCell("$40,000", 1080),
          ]}),
          new TableRow({ children: [
            tCell("Project Manager", 1800), tCell("20", 900), tCell("15", 900), tCell("15", 900),
            tCell("15", 900), tCell("15", 900), tCell("20", 900),
            tCell([bold("100")], 1080), tCell("$25,000", 1080),
          ]}),
          // Totals row
          new TableRow({ children: [
            tCell([bold("Sprint Total")], 1800, { fill: "F0F0F0" }),
            tCell([bold("120")], 900, { fill: "F0F0F0" }),
            tCell([bold("175")], 900, { fill: "F0F0F0" }),
            tCell([bold("185")], 900, { fill: "F0F0F0" }),
            tCell([bold("155")], 900, { fill: "F0F0F0" }),
            tCell([bold("155")], 900, { fill: "F0F0F0" }),
            tCell([bold("150")], 900, { fill: "F0F0F0" }),
            tCell([bold("940")], 1080, { fill: "F0F0F0" }),
            tCell([bold("$235,000")], 1080, { fill: "F0F0F0" }),
          ]}),
        ],
      }),

      para(""), // spacer

      h2("Phase Mapping"),
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [1800, 1800, 2880, 1440, 1440],
        rows: [
          new TableRow({ children: [
            hCell("Phase", 1800), hCell("Sprints", 1800), hCell("Focus", 2880),
            hCell("Hours", 1440), hCell("Cost", 1440),
          ]}),
          new TableRow({ children: [
            tCell("Phase 1: POC Demo", 1800),
            tCell("Sprint 1", 1800),
            tCell("Current demo, design docs, BRD", 2880),
            tCell("120", 1440),
            tCell("$30,000", 1440),
          ]}),
          new TableRow({ children: [
            tCell("Phase 2: Voice + Tools", 1800),
            tCell("Sprints 2\u20133", 1800),
            tCell("Voice Live API integration, function calling, Entra ID auth", 2880),
            tCell("360", 1440),
            tCell("$90,000", 1440),
          ]}),
          new TableRow({ children: [
            tCell("Phase 3: Analytics", 1800),
            tCell("Sprints 4\u20135", 1800),
            tCell("Conversation analytics, Cosmos DB, Fabric, Power BI dashboards", 2880),
            tCell("310", 1440),
            tCell("$77,500", 1440),
          ]}),
          new TableRow({ children: [
            tCell("Phase 4: Production", 1800),
            tCell("Sprint 6", 1800),
            tCell("Hardening, testing, multi-language, deployment", 2880),
            tCell("150", 1440),
            tCell("$37,500", 1440),
          ]}),
          new TableRow({ children: [
            tCell([bold("Total")], 1800, { fill: "F0F0F0" }),
            tCell([bold("6 sprints")], 1800, { fill: "F0F0F0" }),
            tCell([bold("12 weeks")], 2880, { fill: "F0F0F0" }),
            tCell([bold("940")], 1440, { fill: "F0F0F0" }),
            tCell([bold("$235,000")], 1440, { fill: "F0F0F0" }),
          ]}),
        ],
      }),

      para(""), // spacer
      para([normal("Blended consulting rate: "), bold("$250/hr"), normal(". All estimates assume dedicated resources for the sprint duration. Actual hours may vary based on complexity discovered during implementation.")]),
    ],
  }],
});

Packer.toBuffer(doc).then(buffer => {
  const outPath = "docs/plans/Design-and-Implementation-Plan.docx";
  fs.writeFileSync(outPath, buffer);
  console.log(`Generated: ${outPath} (${(buffer.length / 1024).toFixed(0)} KB)`);
});

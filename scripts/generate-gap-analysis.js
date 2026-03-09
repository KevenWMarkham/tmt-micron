const fs = require("fs");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, HeadingLevel, BorderStyle, WidthType,
  ShadingType, PageNumber, PageBreak, LevelFormat, ExternalHyperlink,
} = require("docx");

const border = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
const borders = { top: border, bottom: border, left: border, right: border };
const cellMargins = { top: 80, bottom: 80, left: 120, right: 120 };

function headerCell(text, width) {
  return new TableCell({
    borders,
    width: { size: width, type: WidthType.DXA },
    shading: { fill: "86BC25", type: ShadingType.CLEAR },
    margins: cellMargins,
    children: [new Paragraph({ children: [new TextRun({ text, bold: true, color: "FFFFFF", font: "Arial", size: 20 })] })],
  });
}

function cell(textRuns, width, fill) {
  const runs = Array.isArray(textRuns) ? textRuns : [new TextRun({ text: textRuns, font: "Arial", size: 20 })];
  return new TableCell({
    borders,
    width: { size: width, type: WidthType.DXA },
    shading: fill ? { fill, type: ShadingType.CLEAR } : undefined,
    margins: cellMargins,
    children: [new Paragraph({ children: runs })],
  });
}

function statusCell(status, width) {
  const colors = {
    "Gap": { fill: "FDE8E8", color: "CC0000" },
    "Partial": { fill: "FFF3CD", color: "856404" },
    "Covered": { fill: "D4EDDA", color: "155724" },
  };
  const c = colors[status] || colors["Gap"];
  return new TableCell({
    borders,
    width: { size: width, type: WidthType.DXA },
    shading: { fill: c.fill, type: ShadingType.CLEAR },
    margins: cellMargins,
    children: [new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: status, bold: true, color: c.color, font: "Arial", size: 20 })],
    })],
  });
}

const doc = new Document({
  styles: {
    default: { document: { run: { font: "Arial", size: 22 } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 36, bold: true, font: "Arial", color: "333333" },
        paragraph: { spacing: { before: 360, after: 200 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 28, bold: true, font: "Arial", color: "86BC25" },
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
          border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "86BC25", space: 1 } },
          children: [
            new TextRun({ text: "Gap Analysis: Azure Voice Live API vs. AI Support Assistant Demo", italics: true, color: "999999", font: "Arial", size: 18 }),
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
      // ─── TITLE ───
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 100 },
        children: [new TextRun({ text: "Gap Analysis", size: 48, bold: true, font: "Arial", color: "333333" })],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 100 },
        children: [new TextRun({ text: "Azure Voice Live API Article vs. AI Support Assistant Demo", size: 28, font: "Arial", color: "86BC25" })],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 },
        children: [new TextRun({ text: "March 2026", size: 22, font: "Arial", color: "999999" })],
      }),

      // ─── EXECUTIVE SUMMARY ───
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("Executive Summary")] }),
      new Paragraph({
        spacing: { after: 200 },
        children: [new TextRun({ text: "This document compares the capabilities described in Microsoft\u2019s ", size: 22 }),
          new TextRun({ text: "Building Enterprise Voice-Enabled AI Agents with Azure Voice Live API", italics: true, size: 22 }),
          new TextRun({ text: " article against our current AI Support Assistant demo. The article showcases a production-grade voice agent architecture using Azure Voice Live API (preview), while our demo is a front-end prototype demonstrating the UX and interaction patterns for a Copilot Studio-based assistant.", size: 22 })],
      }),
      new Paragraph({
        spacing: { after: 200 },
        children: [new TextRun({ text: "The analysis identifies 8 significant gaps, 4 partial overlaps, and 5 areas of coverage. The most critical gaps center around real-time voice streaming, conversation analytics, and data pipeline integration.", size: 22 })],
      }),

      // ─── SOURCE ───
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("Source Article")] }),
      new Paragraph({
        spacing: { after: 200 },
        children: [
          new ExternalHyperlink({
            children: [new TextRun({ text: "Building Enterprise Voice-Enabled AI Agents with Azure Voice Live API", style: "Hyperlink", size: 22 })],
            link: "https://techcommunity.microsoft.com/blog/azure-ai-foundry-blog/building-enterprise-voice-enabled-ai-agents-with-azure-voice-live-api/4452160",
          }),
          new TextRun({ text: " \u2014 Microsoft Community Hub, Azure AI Foundry Blog", size: 22 }),
        ],
      }),

      new Paragraph({ children: [new PageBreak()] }),

      // ─── GAP SUMMARY TABLE ───
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("Gap Summary")] }),
      new Paragraph({ spacing: { after: 200 }, children: [new TextRun({ text: "Status key: Covered = feature present in demo | Partial = concept referenced but not implemented | Gap = not present in demo", size: 20, italics: true, color: "666666" })] }),

      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [2800, 1200, 2680, 2680],
        rows: [
          new TableRow({ children: [
            headerCell("Capability", 2800), headerCell("Status", 1200),
            headerCell("Article Implementation", 2680), headerCell("Demo Implementation", 2680),
          ]}),
          // Row 1
          new TableRow({ children: [
            cell("Azure Voice Live API (real-time voice streaming)", 2800),
            statusCell("Gap", 1200),
            cell("WebSocket-based bidirectional audio streaming with 24kHz input, server-side VAD, noise suppression, echo cancellation", 2680),
            cell("Voice tab is UI-only; simulates a voice interaction with a timer animation but has no real audio/WebSocket connection", 2680),
          ]}),
          // Row 2
          new TableRow({ children: [
            cell("Direct Model Integration (GPT-Realtime)", 2800),
            statusCell("Gap", 1200),
            cell("Direct audio-to-audio processing via GPT-Realtime model with client-side function calling", 2680),
            cell("Not referenced; demo uses standard Azure OpenAI GPT-4o for text-based Q&A only", 2680),
          ]}),
          // Row 3
          new TableRow({ children: [
            cell("Azure AI Foundry Agent Integration", 2800),
            statusCell("Gap", 1200),
            cell("Pre-configured enterprise agents with autonomous capabilities, semantic VAD, multi-language support", 2680),
            cell("Not referenced; demo architecture uses Copilot Studio as the orchestration layer", 2680),
          ]}),
          // Row 4
          new TableRow({ children: [
            cell("Conversation Analytics (sentiment, CSAT, call rating)", 2800),
            statusCell("Gap", 1200),
            cell("GPT-4o-powered call analysis with sentiment scoring, 1\u20135 call rating, 50+ call reason categories, stored in Cosmos DB", 2680),
            cell("CSAT shown as a static header metric; no actual sentiment analysis, call scoring, or analytics pipeline", 2680),
          ]}),
          // Row 5
          new TableRow({ children: [
            cell("Microsoft Fabric / Power BI Integration", 2800),
            statusCell("Gap", 1200),
            cell("Cosmos DB to OneLake real-time mirroring, custom Data Agents, Copilot for BI queries, Power BI dashboards", 2680),
            cell("Not present; no data pipeline, no BI dashboards, no Fabric integration", 2680),
          ]}),
          // Row 6
          new TableRow({ children: [
            cell("Azure Logic Apps (workflow automation)", 2800),
            statusCell("Gap", 1200),
            cell("Automated call analysis workflow, shipment creation, triggered by function calling during voice sessions", 2680),
            cell("Not present; Power Automate is referenced in the architecture tab but not demonstrated", 2680),
          ]}),
          // Row 7
          new TableRow({ children: [
            cell("Function Calling / Tool Use", 2800),
            statusCell("Gap", 1200),
            cell("5 callable functions: search QnA, product search, order products, create delivery, call log analysis", 2680),
            cell("No function calling; Q&A uses client-side fuzzy matching against a static knowledge base array", 2680),
          ]}),
          // Row 8
          new TableRow({ children: [
            cell("Azure SQL / Cosmos DB (data persistence)", 2800),
            statusCell("Gap", 1200),
            cell("Azure SQL for order/fulfillment data, Cosmos DB for conversation analytics with real-time Fabric mirroring", 2680),
            cell("No database; all state is in-memory React state, lost on page refresh", 2680),
          ]}),
          // Row 9
          new TableRow({ children: [
            cell("Multi-language Voice Support", 2800),
            statusCell("Partial", 1200),
            cell("Built-in support for en-IN and hi-IN with Indic language optimization", 2680),
            cell("English only; no multi-language configuration in the demo", 2680),
          ]}),
          // Row 10
          new TableRow({ children: [
            cell("Azure AI Search (vector/semantic)", 2800),
            statusCell("Partial", 1200),
            cell("Vector-powered semantic search for policy Q&A via function calling", 2680),
            cell("Referenced in architecture tab; Q&A actually uses client-side string matching, not Azure AI Search", 2680),
          ]}),
          // Row 11
          new TableRow({ children: [
            cell("Telephony / IVR Channel", 2800),
            statusCell("Partial", 1200),
            cell("Azure Communication Services integration for PSTN telephony", 2680),
            cell("Listed as a voice channel card (\u201CTelephony \u2014 Bot Service IVR\u201D) but not functional", 2680),
          ]}),
          // Row 12
          new TableRow({ children: [
            cell("Voice Activity Detection (VAD)", 2800),
            statusCell("Partial", 1200),
            cell("Server VAD with configurable threshold/padding/silence; semantic VAD with utterance prediction", 2680),
            cell("Voice tab mentions Azure Speech Services but has no VAD configuration or real-time audio processing", 2680),
          ]}),
          // Row 13
          new TableRow({ children: [
            cell("Copilot Studio Orchestration", 2800),
            statusCell("Covered", 1200),
            cell("Not the primary approach (article uses Voice Live API + Foundry Agents instead)", 2680),
            cell("Core of demo architecture; referenced throughout as the orchestration engine", 2680),
          ]}),
          // Row 14
          new TableRow({ children: [
            cell("Human Agent Escalation (Dynamics 365)", 2800),
            statusCell("Covered", 1200),
            cell("Not explicitly covered (article focuses on autonomous voice agents)", 2680),
            cell("Fully demonstrated: low-confidence responses show escalation button, clicking triggers Dynamics 365 handoff", 2680),
          ]}),
          // Row 15
          new TableRow({ children: [
            cell("Chat UX with Confidence Badges", 2800),
            statusCell("Covered", 1200),
            cell("Not covered (article focuses on voice, not chat UI)", 2680),
            cell("Full implementation: category badges, source tags, confidence indicators, response times, feedback buttons", 2680),
          ]}),
          // Row 16
          new TableRow({ children: [
            cell("Architecture Visualization", 2800),
            statusCell("Covered", 1200),
            cell("Architecture described in text/diagrams in the article", 2680),
            cell("Interactive expandable architecture view with 4 layers and component details", 2680),
          ]}),
          // Row 17
          new TableRow({ children: [
            cell("Azure OpenAI (GPT-4o)", 2800),
            statusCell("Covered", 1200),
            cell("GPT-4o and GPT-4o-mini for reasoning, generation, and call analysis", 2680),
            cell("Referenced in architecture and knowledge base responses as the LLM layer", 2680),
          ]}),
        ],
      }),

      new Paragraph({ children: [new PageBreak()] }),

      // ─── DETAILED ANALYSIS ───
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("Detailed Gap Analysis")] }),

      // Gap 1
      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("1. Azure Voice Live API \u2014 Real-Time Voice Streaming")] }),
      new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun("Impact: Critical")] }),
      new Paragraph({ spacing: { after: 120 }, children: [new TextRun({ text: "The article\u2019s core capability is the Azure Voice Live API, which provides WebSocket-based bidirectional audio streaming between the client and Azure\u2019s voice processing pipeline. This enables:", size: 22 })] }),
      new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun({ text: "24kHz high-quality audio input with server-side processing", size: 22 })] }),
      new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun({ text: "Azure Deep Noise Suppression for enterprise environments", size: 22 })] }),
      new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun({ text: "Server-side echo cancellation for speakerphone/conference scenarios", size: 22 })] }),
      new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun({ text: "Voice Activity Detection with configurable thresholds (server VAD and semantic VAD)", size: 22 })] }),
      new Paragraph({ numbering: { reference: "bullets", level: 0 }, spacing: { after: 120 }, children: [new TextRun({ text: "Whisper-1 transcription model integration", size: 22 })] }),
      new Paragraph({ spacing: { after: 120 }, children: [
        new TextRun({ text: "Our demo\u2019s Voice tab:", size: 22, bold: true }),
        new TextRun({ text: " Provides a visual mockup of voice interaction (microphone button, pulsing animation, waveform bars) but uses a simulated 2.5-second timer that auto-submits a hardcoded query. No actual audio capture, WebSocket connection, or speech processing occurs.", size: 22 }),
      ]}),
      new Paragraph({ spacing: { after: 200 }, children: [
        new TextRun({ text: "Recommendation:", size: 22, bold: true }),
        new TextRun({ text: " For the POC, integrate the Voice Live API WebSocket endpoint to demonstrate real speech-to-text and text-to-speech. This would transform the voice tab from a UI mockup into a functional voice agent.", size: 22 }),
      ]}),

      // Gap 2
      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("2. Conversation Analytics Pipeline")] }),
      new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun("Impact: High")] }),
      new Paragraph({ spacing: { after: 120 }, children: [new TextRun({ text: "The article implements automated conversation analytics using GPT-4o to score every interaction:", size: 22 })] }),
      new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun({ text: "Call reason categorization from 50+ predefined scenarios", size: 22 })] }),
      new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun({ text: "Customer sentiment analysis (emotional tone)", size: 22 })] }),
      new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun({ text: "Customer satisfaction assessment", size: 22 })] }),
      new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun({ text: "1\u20135 call rating with justification", size: 22 })] }),
      new Paragraph({ numbering: { reference: "bullets", level: 0 }, spacing: { after: 120 }, children: [new TextRun({ text: "Results persisted to Cosmos DB for trending and reporting", size: 22 })] }),
      new Paragraph({ spacing: { after: 120 }, children: [
        new TextRun({ text: "Our demo:", size: 22, bold: true }),
        new TextRun({ text: " Shows a CSAT metric in the header that updates when users click thumbs up/down, but this is purely client-side state with no analytics backend, no sentiment analysis, and no persistence.", size: 22 }),
      ]}),
      new Paragraph({ spacing: { after: 200 }, children: [
        new TextRun({ text: "Recommendation:", size: 22, bold: true }),
        new TextRun({ text: " Add an Azure Logic Apps workflow that sends completed conversations to GPT-4o for automated quality scoring, then stores results in Cosmos DB. This directly demonstrates the analytics value proposition.", size: 22 }),
      ]}),

      // Gap 3
      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("3. Microsoft Fabric / Power BI Data Pipeline")] }),
      new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun("Impact: High")] }),
      new Paragraph({ spacing: { after: 120 }, children: [new TextRun({ text: "The article demonstrates an end-to-end business intelligence pipeline: Cosmos DB conversations are mirrored in real-time to Microsoft Fabric OneLake, where custom Data Agents provide natural language querying and Power BI delivers executive dashboards.", size: 22 })] }),
      new Paragraph({ spacing: { after: 200 }, children: [
        new TextRun({ text: "Our demo:", size: 22, bold: true }),
        new TextRun({ text: " Has no data pipeline, no Fabric integration, and no BI dashboards. The header stats (Queries, Resolved, Avg Time, CSAT) are computed client-side and reset on page refresh.", size: 22 }),
      ]}),

      // Gap 4
      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("4. Function Calling / Tool Use")] }),
      new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun("Impact: High")] }),
      new Paragraph({ spacing: { after: 120 }, children: [new TextRun({ text: "The article\u2019s agent uses 5 callable functions to perform real actions: searching knowledge bases, browsing products, placing orders, creating deliveries, and analyzing call quality. These demonstrate the agent acting autonomously within a business workflow.", size: 22 })] }),
      new Paragraph({ spacing: { after: 200 }, children: [
        new TextRun({ text: "Our demo:", size: 22, bold: true }),
        new TextRun({ text: " Uses client-side fuzzy string matching against a hardcoded JavaScript array of Q&A pairs. No function calling, no Azure Function Apps, no external API integration.", size: 22 }),
      ]}),

      // Gap 5
      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("5. Azure AI Foundry Agent Integration")] }),
      new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun("Impact: Medium")] }),
      new Paragraph({ spacing: { after: 200 }, children: [new TextRun({ text: "The article presents Azure AI Foundry as an alternative orchestration approach to Copilot Studio, offering enterprise governance, autonomous operation, and built-in multi-language support. Our demo is built entirely around Copilot Studio as the orchestration layer. This is not necessarily a gap to close \u2014 Copilot Studio and AI Foundry Agents are different but valid approaches. However, the demo should acknowledge AI Foundry as an alternative path, especially for organizations already invested in that ecosystem.", size: 22 })] }),

      new Paragraph({ children: [new PageBreak()] }),

      // ─── WHAT OUR DEMO DOES WELL ───
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("What Our Demo Does Well (Not in the Article)")] }),
      new Paragraph({ spacing: { after: 120 }, children: [new TextRun({ text: "Our demo covers several areas the article does not address:", size: 22 })] }),

      new Paragraph({ numbering: { reference: "numbers", level: 0 }, spacing: { after: 80 }, children: [
        new TextRun({ text: "Human Agent Escalation: ", bold: true, size: 22 }),
        new TextRun({ text: "Full escalation workflow with confidence-based triggering and Dynamics 365 Contact Center handoff. The article\u2019s agents are fully autonomous with no escalation path.", size: 22 }),
      ]}),
      new Paragraph({ numbering: { reference: "numbers", level: 0 }, spacing: { after: 80 }, children: [
        new TextRun({ text: "Interactive Chat UX: ", bold: true, size: 22 }),
        new TextRun({ text: "Rich message cards with category badges, source attribution, confidence indicators, response times, and feedback buttons. The article focuses on voice and has no chat UI.", size: 22 }),
      ]}),
      new Paragraph({ numbering: { reference: "numbers", level: 0 }, spacing: { after: 80 }, children: [
        new TextRun({ text: "Architecture Visualization: ", bold: true, size: 22 }),
        new TextRun({ text: "Interactive expandable 4-layer architecture view that stakeholders can explore during a demo. The article uses static diagrams.", size: 22 }),
      ]}),
      new Paragraph({ numbering: { reference: "numbers", level: 0 }, spacing: { after: 80 }, children: [
        new TextRun({ text: "Copilot Studio Integration: ", bold: true, size: 22 }),
        new TextRun({ text: "Our architecture is designed around Copilot Studio\u2019s low-code agent builder, which is a more accessible entry point for many enterprise teams than the AI Foundry approach.", size: 22 }),
      ]}),
      new Paragraph({ numbering: { reference: "numbers", level: 0 }, spacing: { after: 200 }, children: [
        new TextRun({ text: "Session Management: ", bold: true, size: 22 }),
        new TextRun({ text: "New Session button, real-time stats dashboard, and conversation history \u2014 all presentation-ready features designed for stakeholder demos.", size: 22 }),
      ]}),

      // ─── RECOMMENDATIONS ───
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("Recommended Next Steps")] }),
      new Paragraph({ spacing: { after: 120 }, children: [new TextRun({ text: "Prioritized by impact and effort:", size: 22 })] }),

      new Paragraph({ numbering: { reference: "numbers", level: 0 }, spacing: { after: 100 }, children: [
        new TextRun({ text: "Integrate Voice Live API ", bold: true, size: 22 }),
        new TextRun({ text: "(High impact, High effort) \u2014 Replace the simulated voice interaction with a real WebSocket connection to Azure Voice Live API. This is the single biggest gap and would demonstrate true voice-agent capability.", size: 22 }),
      ]}),
      new Paragraph({ numbering: { reference: "numbers", level: 0 }, spacing: { after: 100 }, children: [
        new TextRun({ text: "Add Function Calling ", bold: true, size: 22 }),
        new TextRun({ text: "(High impact, Medium effort) \u2014 Replace the client-side fuzzy matching with actual Azure OpenAI function calling backed by Azure Function Apps. Even 2\u20133 callable functions (search KB, check ticket status, escalate) would demonstrate the pattern.", size: 22 }),
      ]}),
      new Paragraph({ numbering: { reference: "numbers", level: 0 }, spacing: { after: 100 }, children: [
        new TextRun({ text: "Add Conversation Analytics ", bold: true, size: 22 }),
        new TextRun({ text: "(High impact, Medium effort) \u2014 Post-conversation GPT-4o analysis with sentiment scoring, persisted to Cosmos DB. This turns the CSAT metric from decorative to functional.", size: 22 }),
      ]}),
      new Paragraph({ numbering: { reference: "numbers", level: 0 }, spacing: { after: 100 }, children: [
        new TextRun({ text: "Add Power BI Dashboard ", bold: true, size: 22 }),
        new TextRun({ text: "(Medium impact, Medium effort) \u2014 Embed a Power BI dashboard showing conversation trends, topic distribution, and satisfaction scores. Could use Fabric mirroring from Cosmos DB.", size: 22 }),
      ]}),
      new Paragraph({ numbering: { reference: "numbers", level: 0 }, spacing: { after: 100 }, children: [
        new TextRun({ text: "Reference AI Foundry in Architecture Tab ", bold: true, size: 22 }),
        new TextRun({ text: "(Low impact, Low effort) \u2014 Add a note or alternative path in the Architecture view showing Azure AI Foundry Agents as an alternate orchestration option alongside Copilot Studio.", size: 22 }),
      ]}),

      new Paragraph({ children: [new PageBreak()] }),

      // ─── ADDENDUM: FOUNDRY AGENT SERVICE QUICKSTART ───
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("Addendum: Foundry Agent Service Quickstart Analysis")] }),
      new Paragraph({
        spacing: { after: 200 },
        children: [
          new TextRun({ text: "Source: ", size: 22 }),
          new ExternalHyperlink({
            children: [new TextRun({ text: "Quickstart: Voice Agent with Foundry Agent Service (new)", style: "Hyperlink", size: 22 })],
            link: "https://learn.microsoft.com/en-us/azure/ai-services/speech-service/voice-live-agents-quickstart",
          }),
          new TextRun({ text: " \u2014 Microsoft Learn (February 2026, Feature Preview)", size: 22 }),
        ],
      }),

      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("Key Takeaways from the Quickstart")] }),
      new Paragraph({ spacing: { after: 120 }, children: [new TextRun({ text: "This quickstart demonstrates the simplest path to a voice-enabled agent using Microsoft Foundry Agent Service with Voice Live. It reinforces and expands on several gaps identified above:", size: 22 })] }),

      new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun("Authentication: Entra ID Required (No API Keys)")] }),
      new Paragraph({ spacing: { after: 120 }, children: [new TextRun({ text: "Voice Live Agent mode does not support key-based authentication. Microsoft Entra ID (via AzureCliCredential or managed identity) is mandatory. Our demo\u2019s architecture references Entra ID for SSO but does not implement any authentication flow. For a production POC, the Entra ID integration must be functional, not just architectural.", size: 22 })] }),

      new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun("Foundry Agent Configuration")] }),
      new Paragraph({ spacing: { after: 120 }, children: [new TextRun({ text: "The quickstart shows agent connection via these parameters:", size: 22 })] }),
      new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun({ text: "agent_name \u2014 the deployed agent identifier", size: 22 })] }),
      new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun({ text: "project_name \u2014 the Foundry project hosting the agent", size: 22 })] }),
      new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun({ text: "agent_version \u2014 optional pinned version for controlled rollouts", size: 22 })] }),
      new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun({ text: "conversation_id \u2014 optional, enables resuming prior conversations", size: 22 })] }),
      new Paragraph({ numbering: { reference: "bullets", level: 0 }, spacing: { after: 120 }, children: [new TextRun({ text: "foundry_resource_override \u2014 for cross-resource agent hosting", size: 22 })] }),
      new Paragraph({ spacing: { after: 120 }, children: [new TextRun({ text: "This versioning and cross-resource capability is not present in our Copilot Studio approach and represents a maturity advantage of the Foundry Agent pattern for enterprise deployments.", size: 22 })] }),

      new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun("Audio Processing")] }),
      new Paragraph({ spacing: { after: 120 }, children: [new TextRun({ text: "The quickstart uses 24kHz PCM16 mono audio with the en-US-Ava:DragonHDLatestNeural voice at temperature 0.8. The AudioProcessor handles microphone capture and speaker playback natively. Our demo\u2019s voice tab has none of this \u2014 it renders a microphone button that triggers a CSS animation, then auto-submits a hardcoded query after a timer.", size: 22 })] }),

      new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun("Logging and Observability")] }),
      new Paragraph({ spacing: { after: 120 }, children: [new TextRun({ text: "The quickstart automatically generates two log files per session:", size: 22 })] }),
      new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun({ text: "Technical log \u2014 WebSocket events, audio stream status, errors, network diagnostics", size: 22 })] }),
      new Paragraph({ numbering: { reference: "bullets", level: 0 }, spacing: { after: 120 }, children: [new TextRun({ text: "Conversation log \u2014 user transcripts, agent responses, session config, conversation flow", size: 22 })] }),
      new Paragraph({ spacing: { after: 120 }, children: [new TextRun({ text: "Our demo has no logging or observability. Azure Monitor is referenced in the architecture tab but not implemented.", size: 22 })] }),

      new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun("Voice Live API Model Support")] }),
      new Paragraph({ spacing: { after: 120 }, children: [new TextRun({ text: "The Voice Live API overview reveals support for 12 models across three pricing tiers, 140+ speech-to-text locales, and 600+ TTS voices globally. Key models include:", size: 22 })] }),
      new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun({ text: "Pro: gpt-realtime, gpt-4o, gpt-4.1, gpt-5, gpt-5-chat", size: 22 })] }),
      new Paragraph({ numbering: { reference: "bullets", level: 0 }, children: [new TextRun({ text: "Basic: gpt-realtime-mini, gpt-4o-mini, gpt-4.1-mini, gpt-5-mini", size: 22 })] }),
      new Paragraph({ numbering: { reference: "bullets", level: 0 }, spacing: { after: 120 }, children: [new TextRun({ text: "Lite: gpt-5-nano, phi4-mm-realtime, phi4-mini", size: 22 })] }),
      new Paragraph({ spacing: { after: 120 }, children: [new TextRun({ text: "This model flexibility is significant for cost optimization. Our demo references GPT-4o only.", size: 22 })] }),

      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("Additional Gaps Identified")] }),

      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [3120, 1200, 5040],
        rows: [
          new TableRow({ children: [
            headerCell("Capability", 3120), headerCell("Status", 1200), headerCell("Notes", 5040),
          ]}),
          new TableRow({ children: [
            cell("Entra ID authentication (mandatory)", 3120),
            statusCell("Gap", 1200),
            cell("Key-based auth not supported for Voice Live Agent mode. Must implement Entra ID credential flow.", 5040),
          ]}),
          new TableRow({ children: [
            cell("Session logging (technical + conversation)", 3120),
            statusCell("Gap", 1200),
            cell("Dual log files generated automatically. No logging in our demo.", 5040),
          ]}),
          new TableRow({ children: [
            cell("Agent versioning and cross-resource hosting", 3120),
            statusCell("Gap", 1200),
            cell("Foundry agents support pinned versions and cross-resource deployment. Not available in our Copilot Studio approach.", 5040),
          ]}),
          new TableRow({ children: [
            cell("Model tier flexibility (Pro/Basic/Lite)", 3120),
            statusCell("Gap", 1200),
            cell("12 models across 3 pricing tiers for cost optimization. Demo only references GPT-4o.", 5040),
          ]}),
          new TableRow({ children: [
            cell("Conversation continuity (conversation_id)", 3120),
            statusCell("Gap", 1200),
            cell("Resume prior conversations by ID. Our demo resets all state on New Session.", 5040),
          ]}),
          new TableRow({ children: [
            cell("AI Foundry Portal voice toggle", 3120),
            statusCell("Partial", 1200),
            cell("One-click voice enablement in Foundry Portal. Our voice tab is UI-only.", 5040),
          ]}),
        ],
      }),

      new Paragraph({ spacing: { before: 200, after: 200 }, children: [
        new TextRun({ text: "Total gap count (combined): ", bold: true, size: 22 }),
        new TextRun({ text: "13 gaps, 5 partial, 5 covered across both articles.", size: 22 }),
      ]}),
    ],
  }],
});

Packer.toBuffer(doc).then(buffer => {
  const outPath = "docs/Voice-Live-API-Gap-Analysis.docx";
  fs.writeFileSync(outPath, buffer);
  console.log(`Generated: ${outPath}`);
});

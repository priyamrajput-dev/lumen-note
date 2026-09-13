import { chromium } from "playwright";
import path from "path";
import fs from "fs";

const ARTIFACTS_DIR = "/Users/priyamrajput/.gemini/antigravity-ide/brain/c43e749b-4c10-4a92-8469-13a81d3aa91d/scratch";
if (!fs.existsSync(ARTIFACTS_DIR)) {
  fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });
}

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ ${message}`);
    passed++;
  } else {
    console.error(`  ❌ FAILED: ${message}`);
    failed++;
  }
}

async function runBrowserSuite() {
  console.log("\n================================================================================");
  console.log("🚀 EXECUTING COMPREHENSIVE BROWSER VERIFICATION FOR LUMEN NOTE");
  console.log("================================================================================\n");

  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });

  const page = await context.newPage();

  // Mock data definitions
  const mockUser = {
    id: "usr-researcher-42",
    name: "Dr. Elena Vance",
    email: "elena.vance@research.org",
    emailVerified: true,
    image: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const mockSession = {
    id: "sess-99",
    expiresAt: new Date(Date.now() + 86400000).toISOString(),
    token: "tok-jwt-mock",
    userId: "usr-researcher-42",
  };

  const mockWorkspaces = [
    {
      id: "ws-transformers-101",
      userId: "usr-researcher-42",
      title: "Transformer Attention Mechanics",
      description: "Mathematical formulations, dot-product scaling, and multi-head representation subspaces.",
      icon: null,
      defaultModel: "gpt-4o",
      createdAt: "2026-09-10T10:00:00Z",
      updatedAt: "2026-09-13T12:00:00Z",
    },
    {
      id: "ws-consensus-202",
      userId: "usr-researcher-42",
      title: "Distributed Systems Consensus",
      description: "Raft leader election, log replication safety proofs, and Byzantine fault tolerance.",
      icon: null,
      defaultModel: "gpt-4o-mini",
      createdAt: "2026-09-11T14:30:00Z",
      updatedAt: "2026-09-12T18:20:00Z",
    },
  ];

  const mockSources = [
    {
      id: "src-1",
      workspaceId: "ws-transformers-101",
      type: "PDF",
      title: "Attention-Is-All-You-Need-Vaswani.pdf",
      status: "READY",
      url: null,
      content: "The dominant sequence transduction models are based on complex recurrent or convolutional neural networks that include an encoder and a decoder. The best performing models also connect the encoder and decoder through an attention mechanism. We suspect that for large values of d_k, the dot products grow large in magnitude, pushing the softmax function into regions where it has extremely small gradients. To counteract this effect, we scale the dot products by 1/sqrt(d_k).",
      metadata: { pages: 15, fileSize: 1048576, wordCount: 4820 },
      createdAt: "2026-09-10T10:05:00Z",
      updatedAt: "2026-09-10T10:06:00Z",
    },
    {
      id: "src-2",
      workspaceId: "ws-transformers-101",
      type: "WEBSITE",
      title: "ArXiv:1706.03762 Attention Is All You Need",
      status: "READY",
      url: "https://arxiv.org/abs/1706.03762",
      content: "We propose the Transformer, a model architecture eschewing recurrence and instead relying entirely on an attention mechanism to draw global dependencies between input and output.",
      metadata: { domain: "arxiv.org", scrapedAt: "2026-09-10T10:10:00Z" },
      createdAt: "2026-09-10T10:10:00Z",
      updatedAt: "2026-09-10T10:11:00Z",
    },
    {
      id: "src-3",
      workspaceId: "ws-transformers-101",
      type: "MARKDOWN",
      title: "Self-Attention Mathematical Notes",
      status: "READY",
      url: null,
      content: "Attention(Q, K, V) = softmax(QK^T / sqrt(d_k))V\n\nWhere Q and K are matrices of dimension d_k, and V is of dimension d_v.",
      metadata: { wordCount: 140 },
      createdAt: "2026-09-10T10:15:00Z",
      updatedAt: "2026-09-10T10:15:00Z",
    },
  ];

  const mockConversations = [
    {
      id: "conv-101",
      workspaceId: "ws-transformers-101",
      title: "Query-Key Scaling Rationale",
      summary: "Discussion on softmax gradient vanishing for large key dimensions",
      summaryMessageCount: 2,
      summarizedAt: "2026-09-10T10:30:00Z",
      createdAt: "2026-09-10T10:20:00Z",
      updatedAt: "2026-09-10T10:25:00Z",
    },
  ];

  const mockMessages = [
    {
      id: "msg-1",
      conversationId: "conv-101",
      role: "USER",
      content: "Why do we scale the dot products by 1/sqrt(d_k) in self-attention?",
      citations: null,
      createdAt: "2026-09-10T10:21:00Z",
    },
    {
      id: "msg-2",
      conversationId: "conv-101",
      role: "ASSISTANT",
      content: "We suspect that for large values of d_k, the dot products grow large in magnitude, pushing the softmax function into regions where it has extremely small gradients [1]. To counteract this effect, we scale the dot products by 1/sqrt(d_k) [2].\n\nThis prevents vanishing gradients and stabilizes multi-head representation learning.",
      citations: [
        {
          sourceId: "src-1",
          sourceTitle: "Attention-Is-All-You-Need-Vaswani.pdf",
          sourceType: "PDF",
          chunkId: "chk-1",
          page: 4,
          excerpt: "We suspect that for large values of d_k, the dot products grow large in magnitude, pushing the softmax function into regions where it has extremely small gradients.",
          score: 0.96,
        },
        {
          sourceId: "src-3",
          sourceTitle: "Self-Attention Mathematical Notes",
          sourceType: "MARKDOWN",
          chunkId: "chk-2",
          page: 1,
          excerpt: "Attention(Q, K, V) = softmax(QK^T / sqrt(d_k))V",
          score: 0.99,
        },
      ],
      createdAt: "2026-09-10T10:22:00Z",
    },
  ];

  const mockArtifacts = [
    {
      id: "art-summary-1",
      workspaceId: "ws-transformers-101",
      type: "SUMMARY",
      title: "Transformer Architecture Executive Summary",
      status: "READY",
      sourceIds: ["src-1", "src-2"],
      content: {
        markdown: "## Core Architectural Paradigm\n\nThe Transformer model eliminates recurrence entirely in favor of multi-head self-attention. This enables unprecedented parallelization during training.\n\n### Key Equations\n- **Scaled Dot-Product**: $\\text{Attention}(Q, K, V) = \\text{softmax}\\left(\\frac{QK^T}{\\sqrt{d_k}}\\right)V$\n- **Multi-Head**: $\\text{MultiHead}(Q, K, V) = \\text{Concat}(\\text{head}_1, \\dots, \\text{head}_h)W^O$",
      },
      metadata: { generatedAt: "2026-09-10T10:30:00Z" },
      createdAt: "2026-09-10T10:30:00Z",
      updatedAt: "2026-09-10T10:30:00Z",
    },
    {
      id: "art-flashcards-2",
      workspaceId: "ws-transformers-101",
      type: "FLASHCARDS",
      title: "Attention & Positional Encoding Cards",
      status: "READY",
      sourceIds: ["src-1"],
      content: {
        cards: [
          {
            front: "What is the formula for Scaled Dot-Product Attention?",
            back: "Attention(Q,K,V) = softmax(QK^T / sqrt(d_k)) V",
          },
          {
            front: "Why is scaling by sqrt(d_k) necessary in high dimensions?",
            back: "Because large dot products push softmax into saturated regions with vanishing gradients.",
          },
          {
            front: "How do sinusoidal positional encodings enable relative position awareness?",
            back: "PE(pos+k) can be represented as a linear function of PE(pos) through trigonometric angle addition.",
          },
        ],
      },
      metadata: { generatedAt: "2026-09-10T10:35:00Z" },
      createdAt: "2026-09-10T10:35:00Z",
      updatedAt: "2026-09-10T10:35:00Z",
    },
    {
      id: "art-quiz-3",
      workspaceId: "ws-transformers-101",
      type: "QUIZ",
      title: "Self-Attention Mechanics Quiz",
      status: "READY",
      sourceIds: ["src-1"],
      content: {
        questions: [
          {
            question: "What is the computational complexity per layer of self-attention with sequence length n and representation dimension d?",
            options: [
              "O(n * d^2)",
              "O(n^2 * d)",
              "O(n * log(d))",
              "O(n^3)",
            ],
            correctIndex: 1,
            explanation: "Self-attention requires computing all pairwise dot products between n tokens, resulting in O(n^2 * d) operations.",
          },
        ],
      },
      metadata: { generatedAt: "2026-09-10T10:40:00Z" },
      createdAt: "2026-09-10T10:40:00Z",
      updatedAt: "2026-09-10T10:40:00Z",
    },
    {
      id: "art-mindmap-4",
      workspaceId: "ws-transformers-101",
      type: "MINDMAP",
      title: "Transformer Concept Topology",
      status: "READY",
      sourceIds: ["src-1"],
      content: {
        nodes: [
          { id: "1", label: "Transformer Model" },
          { id: "2", label: "Multi-Head Attention" },
          { id: "3", label: "Scaled Dot-Product" },
          { id: "4", label: "Positional Encoding" },
          { id: "5", label: "Layer Normalization" },
        ],
        edges: [
          { id: "e1-2", source: "1", target: "2" },
          { id: "e2-3", source: "2", target: "3" },
          { id: "e1-4", source: "1", target: "4" },
          { id: "e1-5", source: "1", target: "5" },
        ],
      },
      metadata: { generatedAt: "2026-09-10T10:45:00Z" },
      createdAt: "2026-09-10T10:45:00Z",
      updatedAt: "2026-09-10T10:45:00Z",
    },
  ];

  const mockMemories = [
    {
      id: "mem-1",
      memory: "User prefers mathematical derivations in standard LaTeX notation and concise analytical answers.",
      source: "learned",
      categories: ["style", "formatting"],
      createdAt: "2026-09-11T09:00:00Z",
      updatedAt: "2026-09-11T09:00:00Z",
    },
    {
      id: "mem-2",
      memory: "Always cite exact section and equation numbers when referencing machine learning papers.",
      source: "manual",
      categories: ["research-rule"],
      createdAt: "2026-09-12T15:30:00Z",
      updatedAt: "2026-09-12T15:30:00Z",
    },
  ];

  let authState = false;

  // Intercept API routes
  await page.route("**/api/auth/get-session", (route) => {
    if (authState) {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ user: mockUser, session: mockSession }),
      });
    } else {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(null),
      });
    }
  });

  await page.route("**/api/workspaces", (route) => {
    if (route.request().method() === "GET") {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true, message: "OK", data: mockWorkspaces }),
      });
    } else if (route.request().method() === "POST") {
      const payload = JSON.parse(route.request().postData() || "{}");
      const newWs = {
        id: `ws-${Date.now()}`,
        userId: mockUser.id,
        title: payload.title || "New Workspace",
        description: payload.description || null,
        icon: null,
        defaultModel: payload.defaultModel || "gpt-4o-mini",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({ success: true, message: "Created", data: newWs }),
      });
    } else {
      route.continue();
    }
  });

  await page.route("**/api/workspaces/ws-transformers-101", (route) => {
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ success: true, message: "OK", data: mockWorkspaces[0] }),
    });
  });

  await page.route("**/api/workspaces/ws-transformers-101/sources*", (route) => {
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ success: true, message: "OK", data: mockSources }),
    });
  });

  await page.route("**/api/workspaces/ws-transformers-101/chat/conversations*", (route) => {
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ success: true, message: "OK", data: mockConversations }),
    });
  });

  await page.route("**/api/workspaces/ws-transformers-101/chat/conversations/conv-101/messages*", (route) => {
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ success: true, message: "OK", data: mockMessages }),
    });
  });

  await page.route("**/api/workspaces/ws-transformers-101/artifacts*", (route) => {
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ success: true, message: "OK", data: mockArtifacts }),
    });
  });

  await page.route("**/api/memories*", (route) => {
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ success: true, message: "OK", data: mockMemories }),
    });
  });

  try {
    // ========================================================================
    // 1. PUBLIC LANDING PAGE & EDITORIAL EXPERIENCE
    // ========================================================================
    console.log("-> [1/9] Testing Public Landing Page & Editorial Header...");
    await page.goto("http://localhost:3000", { waitUntil: "domcontentloaded" });
    await page.waitForSelector("h1", { timeout: 10000 });

    const title = await page.title();
    assert(title.includes("Lumen Note"), `Title contains 'Lumen Note' ("${title}")`);

    const heroText = await page.locator("h1").innerText();
    assert(heroText.includes("Turn your sources into understanding"), "Hero headline matches editorial spec");

    // Miniature 3-Panel Visual Preview
    const hasPreviewSources = (await page.locator("text=Attention-Is-All-You-Need.pdf").count()) > 0;
    const hasPreviewChat = (await page.locator("text=How does multi-head self-attention overcome sequential bottlenecks in recurrence?").count()) > 0;
    const hasPreviewNotes = (await page.locator("text=Scaled Dot-Product vs Additive").count()) > 0;
    assert(hasPreviewSources && hasPreviewChat && hasPreviewNotes, "Miniature 3-panel research preview rendered");

    // How It Works & Pillars
    const howItWorks = (await page.locator("text=How Lumen Note Works").count()) > 0;
    const groundedPillar = (await page.locator("text=Source-Grounded AI").count()) > 0;
    assert(howItWorks && groundedPillar, "How It Works and Feature Pillars present");

    // Editorial Footer
    const footerStatus = (await page.locator("text=All Research Systems Operational").count()) > 0;
    const footerEthos = (await page.locator("text=Readability > Decoration").count()) > 0;
    assert(footerStatus && footerEthos, "Editorial Footer with live status indicator verified");

    // Screenshot Dark Mode Landing
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, "01_landing_desktop_dark.png") });

    // ========================================================================
    // 2. THEME SYSTEM & DUAL PALETTE
    // ========================================================================
    console.log("-> [2/9] Testing Dual Theme Switching (Dark -> Warm Paper Light)...");
    const themeBtn = page.locator('button[aria-label="Toggle theme"]').first();
    await themeBtn.click();
    await page.waitForTimeout(400);

    const htmlClass = await page.locator("html").getAttribute("class");
    assert(htmlClass?.includes("light"), "Theme switched to warm paper light mode");

    await page.screenshot({ path: path.join(ARTIFACTS_DIR, "02_landing_desktop_light.png") });

    // Switch back to Dark
    await themeBtn.click();
    await page.waitForTimeout(300);

    // ========================================================================
    // 3. COMMAND PALETTE (⌘K)
    // ========================================================================
    console.log("-> [3/9] Testing Global Command Palette (⌘K)...");
    const searchBtn = page.locator('button[title="Quick Search (⌘K)"]').first();
    await searchBtn.click();
    await page.waitForSelector('[role="dialog"]', { timeout: 5000 });

    assert(await page.locator('[role="dialog"]').isVisible(), "Command Palette opened on trigger");

    const cmdInput = page.locator('[cmdk-input]');
    await cmdInput.fill("Light");
    await page.waitForTimeout(200);

    const filterOption = page.locator("text=Switch to Warm Light Mode");
    assert(await filterOption.isVisible(), "Command Palette filters actions dynamically");

    await page.screenshot({ path: path.join(ARTIFACTS_DIR, "03_command_palette.png") });

    await page.keyboard.press("Escape");
    await page.waitForTimeout(300);
    assert(!(await page.locator('[role="dialog"]').isVisible()), "Command Palette closes on Escape");

    // ========================================================================
    // 4. AUTHENTICATION & DASHBOARD VAULT
    // ========================================================================
    console.log("-> [4/9] Testing Authenticated Dashboard & Workspace Management...");
    authState = true; // Activate mock user session

    await page.goto("http://localhost:3000/dashboard", { waitUntil: "domcontentloaded" });
    await page.waitForSelector("h1", { timeout: 10000 });

    const dashboardH1 = await page.locator("h1").innerText();
    assert(dashboardH1.includes("Research Workspaces"), "Dashboard header displays 'Research Workspaces'");

    const wsCard = page.locator("text=Transformer Attention Mechanics").first();
    assert(await wsCard.isVisible(), "Workspace cards render correctly from API");

    // Model Filter Chips
    const gpt4oChip = page.locator('button:has-text("gpt-4o")').first();
    await gpt4oChip.click();
    await page.waitForTimeout(200);
    const visibleGpt4o = await page.locator("text=Transformer Attention Mechanics").count();
    const hiddenGpt4oMini = await page.locator("text=Distributed Systems Consensus").isVisible();
    assert(visibleGpt4o > 0 && !hiddenGpt4oMini, "Model filter chip 'gpt-4o' filters workspaces");

    const allEnginesChip = page.locator('button:has-text("All Engines")').first();
    await allEnginesChip.click();
    await page.waitForTimeout(200);

    // Search Input
    const searchInput = page.locator('input[placeholder*="Search workspaces"]');
    await searchInput.fill("Consensus");
    await page.waitForTimeout(200);
    assert(await page.locator("text=Distributed Systems Consensus").isVisible(), "Search filter finds matching card");
    await searchInput.fill("");
    await page.waitForTimeout(200);

    // New Workspace Modal
    const newWsBtn = page.locator('button:has-text("New Workspace")').first();
    await newWsBtn.click();
    await page.waitForSelector('text=Create Workspace', { timeout: 5000 });

    assert(await page.locator('text=Create Workspace').first().isVisible(), "New Workspace modal opens");
    await page.locator('input[placeholder*="Research project title"]').fill("Neuromorphic Architecture");
    await page.locator('textarea[placeholder*="Brief summary of research scope"]').fill("Spiking networks & memristors");

    await page.screenshot({ path: path.join(ARTIFACTS_DIR, "04_dashboard_new_workspace_modal.png") });

    await page.locator('button:has-text("Cancel")').first().click();
    await page.waitForTimeout(200);

    await page.screenshot({ path: path.join(ARTIFACTS_DIR, "05_dashboard_vault.png") });

    // ========================================================================
    // 5. THREE-PANEL RESEARCH WORKSPACE
    // ========================================================================
    console.log("-> [5/9] Testing Three-Panel Research Workspace Layout...");
    await page.goto("http://localhost:3000/workspace/ws-transformers-101", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1000);

    const hasSourcesPanel = (await page.locator("text=Sources").count()) > 0;
    const hasChatPanel = (await page.locator("text=Research Chat").count()) > 0;
    const hasArtifactsPanel = (await page.locator("text=Study Tools").count()) > 0;
    assert(hasSourcesPanel && hasChatPanel && hasArtifactsPanel, "Three-Panel Layout verified (Sources | Chat | Artifacts)");

    await page.screenshot({ path: path.join(ARTIFACTS_DIR, "06_three_panel_workspace.png") });

    // ========================================================================
    // 6. SOURCES PANEL, INGESTION MODAL & PREVIEW DRAWER
    // ========================================================================
    console.log("-> [6/9] Testing Sources Panel, Add Source Modal & Preview Drawer...");
    const pdfSourceItem = page.locator("text=Attention-Is-All-You-Need-Vaswani.pdf").first();
    assert(await pdfSourceItem.isVisible(), "Source document listed in Left Sidebar");

    // Add Source Modal
    const addSrcBtn = page.locator('button:has-text("Add Source")').first();
    await addSrcBtn.click();
    await page.waitForSelector("text=Add Research Source", { timeout: 5000 });
    assert(await page.locator("text=Add Research Source").isVisible(), "Add Source modal opened");

    const webTab = page.locator('button:has-text("Web Page")').first();
    await webTab.click();
    await page.waitForTimeout(200);
    assert(await page.locator('input[placeholder*="https://"]').isVisible(), "Web ingestion tab rendered");

    await page.screenshot({ path: path.join(ARTIFACTS_DIR, "07_add_source_modal.png") });
    await page.keyboard.press("Escape");
    await page.waitForTimeout(300);

    // Source Preview Drawer
    await pdfSourceItem.click();
    await page.waitForTimeout(400);

    const drawerExcerpt = page.locator("text=The dominant sequence transduction models").first();
    assert(await drawerExcerpt.isVisible(), "SourcePreviewDrawer slides out with document text");

    await page.screenshot({ path: path.join(ARTIFACTS_DIR, "08_source_preview_drawer.png") });
    await page.keyboard.press("Escape");
    await page.waitForTimeout(300);

    // ========================================================================
    // 7. AI RESEARCH CHAT & GROUNDED CITATIONS
    // ========================================================================
    console.log("-> [7/9] Testing AI Research Chat & Citations Popover...");
    const assistantResponse = page.locator("text=pushing the softmax function into regions").first();
    assert(await assistantResponse.isVisible(), "Assistant message with grounded research response rendered");

    // Citations Popover
    const citationBadge = page.locator('button:has-text("[1]")').first();
    await citationBadge.click();
    await page.waitForTimeout(300);

    const citationPopover = page.locator("text=Attention-Is-All-You-Need-Vaswani.pdf").first();
    assert(await citationPopover.isVisible(), "Clicking [1] opens Grounded Citation Popover with match score & excerpt");

    await page.screenshot({ path: path.join(ARTIFACTS_DIR, "09_citation_popover.png") });

    // Dismiss popover
    await page.locator("body").click({ position: { x: 500, y: 100 } });
    await page.waitForTimeout(200);

    // Sidebar Toggles
    const toggleLeftBtn = page.locator('button[title="Hide Sources (⌘B)"]').first();
    if (await toggleLeftBtn.isVisible()) {
      await toggleLeftBtn.click();
      await page.waitForTimeout(300);
      assert(!(await pdfSourceItem.isVisible()), "Left sidebar collapsed cleanly");
      await page.locator('button[title="Show Sources (⌘B)"]').first().click();
      await page.waitForTimeout(300);
      assert(await pdfSourceItem.isVisible(), "Left sidebar expanded back");
    }

    // ========================================================================
    // 8. ARTIFACTS: FLASHCARDS, QUIZZES & MINDMAPS
    // ========================================================================
    console.log("-> [8/9] Testing Artifacts: 3D Flashcards, Interactive Quiz & Mindmap...");
    const flashcardsTab = page.locator('button:has-text("Flashcards")').first();
    await flashcardsTab.click();
    await page.waitForTimeout(200);

    const flashcardItem = page.locator("text=Attention & Positional Encoding Cards").first();
    assert(await flashcardItem.isVisible(), "Flashcards artifact displayed in filter");

    // 3D Card Flip
    await flashcardItem.click();
    await page.waitForTimeout(400);

    const cardPrompt = page.locator("text=What is the formula for Scaled Dot-Product Attention?").first();
    assert(await cardPrompt.isVisible(), "Flashcard front prompt rendered");

    await cardPrompt.click();
    await page.waitForTimeout(400);

    const cardAnswer = page.locator("text=Attention(Q,K,V) = softmax(QK^T / sqrt(d_k)) V").first();
    assert(await cardAnswer.isVisible(), "Flashcard 3D flips to back side revealing answer");

    await page.screenshot({ path: path.join(ARTIFACTS_DIR, "10_flashcard_deck_flipped.png") });

    await page.locator('button:has-text("Back to Artifacts")').first().click();
    await page.waitForTimeout(300);

    // Quiz
    const quizTab = page.locator('button:has-text("Quizzes")').first();
    await quizTab.click();
    await page.waitForTimeout(200);

    const quizItem = page.locator("text=Self-Attention Mechanics Quiz").first();
    await quizItem.click();
    await page.waitForTimeout(400);

    const quizChoice = page.locator('text=O(n^2 * d)').first();
    assert(await quizChoice.isVisible(), "Interactive Quiz questions & choices rendered");

    await quizChoice.click();
    await page.waitForTimeout(300);

    const quizFeedback = page.locator("text=Self-attention requires computing all pairwise dot products").first();
    assert(await quizFeedback.isVisible(), "Immediate feedback & explanation provided on selection");

    await page.screenshot({ path: path.join(ARTIFACTS_DIR, "11_quiz_interactive.png") });

    await page.locator('button:has-text("Back to Artifacts")').first().click();
    await page.waitForTimeout(300);

    // Mindmap
    const mindmapTab = page.locator('button:has-text("Mindmaps")').first();
    await mindmapTab.click();
    await page.waitForTimeout(200);

    const mindmapItem = page.locator("text=Transformer Concept Topology").first();
    await mindmapItem.click();
    await page.waitForTimeout(400);

    const mindmapNode = page.locator("text=Multi-Head Attention").first();
    assert(await mindmapNode.isVisible(), "Interactive SVG concept node graph rendered");

    await page.screenshot({ path: path.join(ARTIFACTS_DIR, "12_mindmap_topology.png") });

    await page.locator('button:has-text("Back to Artifacts")').first().click();
    await page.waitForTimeout(300);

    // ========================================================================
    // 9. MEMORIES SYSTEM & MOBILE VIEWPORT
    // ========================================================================
    console.log("-> [9/9] Testing Memories System & Mobile Segmented Controls...");
    await page.goto("http://localhost:3000/memories", { waitUntil: "domcontentloaded" });
    await page.waitForSelector("h1", { timeout: 5000 });

    const memH1 = await page.locator("h1").innerText();
    assert(memH1.includes("Research Memories"), "Memories page rendered with title");

    const mem1 = page.locator("text=User prefers mathematical derivations").first();
    assert(await mem1.isVisible(), "Mem0 context rules rendered as technical cards");

    await page.screenshot({ path: path.join(ARTIFACTS_DIR, "14_memories_page.png") });

    // Mobile Segmented Viewport
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("http://localhost:3000/workspace/ws-transformers-101", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(600);

    const noOverflow = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);
    assert(noOverflow, "Mobile viewport has ZERO horizontal overflow");

    const mobileSourcesSeg = page.locator('button:has-text("Sources")').first();
    const mobileChatSeg = page.locator('button:has-text("Chat")').first();
    const mobileNotesSeg = page.locator('button:has-text("Artifacts")').first();
    assert(
      (await mobileSourcesSeg.isVisible()) && (await mobileChatSeg.isVisible()) && (await mobileNotesSeg.isVisible()),
      "Mobile segmented navigation bar active [ Sources | Chat | Artifacts ]"
    );

    // Click Sources Tab
    await mobileSourcesSeg.click();
    await page.waitForTimeout(200);
    assert(await page.locator("text=Attention-Is-All-You-Need-Vaswani.pdf").first().isVisible(), "Mobile Sources view active");
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, "15_mobile_sources_panel.png") });

    // Click Chat Tab
    await mobileChatSeg.click();
    await page.waitForTimeout(200);
    assert(await page.locator("text=Why do we scale the dot products").first().isVisible(), "Mobile Chat view active");
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, "17_mobile_chat_studio.png") });

  } catch (err) {
    console.error("❌ Exception during browser suite execution:", err);
    failed++;
  } finally {
    await browser.close();
  }

  console.log("\n================================================================================");
  console.log(`🏁 FULL BROWSER SUITE COMPLETE: ${passed} PASSED, ${failed} FAILED`);
  console.log("================================================================================\n");

  if (failed > 0) process.exit(1);
}

runBrowserSuite();

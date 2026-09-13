// Lumen Note Core TypeScript Data Models & Contracts

export interface User {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Session {
  id: string;
  expiresAt: string;
  token: string;
  userId: string;
  ipAddress?: string | null;
  userAgent?: string | null;
}

export interface AuthSessionResponse {
  user: User;
  session: Session;
}

export type ChatModel = "gpt-4o-mini" | "gpt-4o";

export interface Workspace {
  id: string;
  userId: string;
  title: string;
  description?: string | null;
  icon?: string | null;
  defaultModel: ChatModel;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWorkspaceInput {
  title: string;
  description?: string;
  icon?: string;
  defaultModel?: ChatModel;
}

export type UpdateWorkspaceInput = Partial<CreateWorkspaceInput>;

export type SourceType = "PDF" | "WEBSITE" | "YOUTUBE" | "TEXT" | "MARKDOWN";
export type SourceStatus = "PENDING" | "PROCESSING" | "READY" | "FAILED";

export interface Source {
  id: string;
  workspaceId: string;
  type: SourceType;
  title: string;
  content?: string | null;
  url?: string | null;
  status: SourceStatus;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTextSourceInput {
  type: "TEXT" | "MARKDOWN";
  title: string;
  content: string;
}

export interface ImportWebsiteInput {
  url: string;
  title?: string;
}

export interface ImportYoutubeInput {
  url: string;
  title?: string;
}

export interface BulkDeleteSourcesInput {
  sourceIds: string[];
}

export interface Conversation {
  id: string;
  workspaceId: string;
  title?: string | null;
  summary?: string | null;
  summaryMessageCount: number;
  summarizedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Citation {
  sourceId?: string;
  sourceTitle?: string;
  sourceType?: string;
  chunkId?: string;
  chunkIndex?: number;
  page?: number;
  excerpt?: string;
  score?: number;
  url?: string;
}

export interface Message {
  id: string;
  conversationId: string;
  role: "USER" | "ASSISTANT";
  content: string;
  citations?: Citation[] | null;
  createdAt: string;
}

export type ArtifactType =
  | "SUMMARY"
  | "TAKEAWAYS"
  | "FLASHCARDS"
  | "QUIZ"
  | "MINDMAP"
  | "REPORT";

export type ArtifactStatus = "PENDING" | "PROCESSING" | "READY" | "FAILED";

export interface Flashcard {
  front: string;
  back: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface MindmapNode {
  id: string;
  label: string;
}

export interface MindmapEdge {
  id: string;
  source: string;
  target: string;
}

export interface ReportSection {
  title: string;
  content: string;
}

export interface ArtifactSummaryContent {
  markdown: string;
}

export interface ArtifactTakeawaysContent {
  items: string[];
}

export interface ArtifactFlashcardsContent {
  cards: Flashcard[];
}

export interface ArtifactQuizContent {
  questions: QuizQuestion[];
}

export interface ArtifactMindmapContent {
  nodes: MindmapNode[];
  edges: MindmapEdge[];
}

export interface ArtifactReportContent {
  markdown: string;
  sections: ReportSection[];
}

export type ArtifactContent =
  | ArtifactSummaryContent
  | ArtifactTakeawaysContent
  | ArtifactFlashcardsContent
  | ArtifactQuizContent
  | ArtifactMindmapContent
  | ArtifactReportContent
  | Record<string, unknown>;

export interface LearningArtifact {
  id: string;
  workspaceId: string;
  type: ArtifactType;
  title: string;
  content?: ArtifactContent | null;
  sourceIds: string[];
  status: ArtifactStatus;
  metadata?: {
    generatedAt?: string;
    processingError?: string;
    [key: string]: unknown;
  } | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateArtifactInput {
  type: ArtifactType;
  title?: string;
  sourceIds?: string[];
}

export interface AppMemory {
  id: string;
  memory: string;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, unknown> | null;
  categories?: string[];
  source: "manual" | "learned";
}

export interface CreateMemoryInput {
  memory: string;
}

export interface UpdateMemoryInput {
  memory: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface ApiErrorResponse {
  error?: string;
  message?: string;
  details?: unknown;
}

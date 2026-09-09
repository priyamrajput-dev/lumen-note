import SourceRepository, { type SourceRecord } from "./source.repository.js";
import WorkspaceRepository from "../workspace/workspace.repository.js";
import { NotFoundError, ValidationError } from "../../common/utils/app-error.js";
import type {
  CreateSourceInput,
  ImportWebsiteInput,
  ImportYoutubeInput,
  ListSourcesQuery,
} from "./source.validation.js";
import { uploadPdfToCloudinary } from "../../lib/cloudinary.js";
import { extractPdfFromBuffer } from "../../lib/pdf.js";
import { scrapeWebsite } from "../../lib/firecrawl.js";
import { fetchYoutubeTranscript } from "../../lib/youtube.js";

class SourceService {
  constructor(
    private readonly sourceRepository: SourceRepository,
    private readonly workspaceRepository: WorkspaceRepository,
  ) {}

  private async assertWorkspaceAccess(workspaceId: string, userId: string) {
    const [ws] = await this.workspaceRepository.findWorkspaceByIdAndUserId(
      workspaceId,
      userId,
    );
    if (!ws) {
      throw new NotFoundError("Workspace not found");
    }
    return ws;
  }

  async listSourcesForWorkspace(
    workspaceId: string,
    userId: string,
    filters: ListSourcesQuery = {},
  ): Promise<SourceRecord[]> {
    await this.assertWorkspaceAccess(workspaceId, userId);
    return this.sourceRepository.findSourcesByWorkspaceId(workspaceId, filters);
  }

  async getSourceForWorkspace(
    workspaceId: string,
    sourceId: string,
    userId: string,
  ): Promise<SourceRecord> {
    await this.assertWorkspaceAccess(workspaceId, userId);

    const sourceRecord = await this.sourceRepository.findSourceByIdAndWorkspaceId(
      sourceId,
      workspaceId,
    );

    if (!sourceRecord) {
      throw new NotFoundError("Source not found");
    }

    return sourceRecord;
  }

  async createTextOrMarkdownSource(
    workspaceId: string,
    userId: string,
    input: CreateSourceInput,
  ): Promise<SourceRecord> {
    await this.assertWorkspaceAccess(workspaceId, userId);

    return this.sourceRepository.createSourceRecord({
      workspaceId,
      type: input.type,
      title: input.title,
      content: input.content,
      status: "READY",
    });
  }

  async uploadPdfSource(
    workspaceId: string,
    userId: string,
    file: Express.Multer.File,
    title?: string,
  ): Promise<SourceRecord> {
    await this.assertWorkspaceAccess(workspaceId, userId);

    let secureUrl: string | undefined;
    let originalFilename = file.originalname;
    let fileSize = file.size;
    let publicId: string | undefined;
    let resourceType: "raw" | "image" | undefined;

    try {
      const upload = await uploadPdfToCloudinary(file.buffer, file.originalname);
      secureUrl = upload.secureUrl;
      originalFilename = upload.originalFilename;
      fileSize = upload.bytes;
      publicId = upload.publicId;
      resourceType = upload.resourceType;
    } catch (error) {
      // If Cloudinary is not configured, fall back to local buffer extraction
      if (
        !(
          error instanceof ValidationError &&
          error.message.includes("Cloudinary is not configured")
        )
      ) {
        throw error;
      }
    }

    let content: string | null = null;
    let pageCount: number | undefined;

    try {
      const extracted = await extractPdfFromBuffer(file.buffer);
      content = extracted.text;
      pageCount = extracted.pageCount;
    } catch {
      // Content extraction error caught gracefully
    }

    return this.sourceRepository.createSourceRecord({
      workspaceId,
      type: "PDF",
      title: title?.trim() || file.originalname.replace(/\.pdf$/i, ""),
      content,
      status: content ? "READY" : "PENDING",
      metadata: {
        ...(secureUrl ? { fileUrl: secureUrl } : {}),
        fileName: originalFilename,
        fileSize,
        ...(publicId ? { publicId, resourceType } : {}),
        ...(pageCount !== undefined ? { pageCount } : {}),
      },
    });
  }

  async importWebsiteSource(
    workspaceId: string,
    userId: string,
    input: ImportWebsiteInput,
  ): Promise<SourceRecord> {
    await this.assertWorkspaceAccess(workspaceId, userId);

    const scraped = await scrapeWebsite(input.url);

    return this.sourceRepository.createSourceRecord({
      workspaceId,
      type: "WEBSITE",
      title: input.title || scraped.title || input.url,
      content: scraped.markdown,
      url: scraped.sourceUrl,
      status: "READY",
      metadata: {
        importedFrom: scraped.sourceUrl,
      },
    });
  }

  async importYoutubeSource(
    workspaceId: string,
    userId: string,
    input: ImportYoutubeInput,
  ): Promise<SourceRecord> {
    await this.assertWorkspaceAccess(workspaceId, userId);

    const transcript = await fetchYoutubeTranscript(input.url);

    return this.sourceRepository.createSourceRecord({
      workspaceId,
      type: "YOUTUBE",
      title: input.title || `YouTube: ${transcript.videoId}`,
      content: transcript.content,
      url: input.url,
      status: "READY",
      metadata: {
        videoId: transcript.videoId,
      },
    });
  }

  async deleteSourceForWorkspace(
    workspaceId: string,
    sourceId: string,
    userId: string,
  ): Promise<void> {
    await this.getSourceForWorkspace(workspaceId, sourceId, userId);
    await this.sourceRepository.deleteSourceRecord(sourceId);
  }

  async bulkDeleteSourcesForWorkspace(
    workspaceId: string,
    userId: string,
    sourceIds: string[],
  ): Promise<void> {
    await this.assertWorkspaceAccess(workspaceId, userId);
    await this.sourceRepository.bulkDeleteSourceRecords(sourceIds, workspaceId);
  }
}

export default SourceService;

import type { Request, Response } from "express";
import { deleteUserMemory, listUserMemories } from "../../lib/mem0.js";
import {
  createMemoryForUser,
  updateMemoryForUser,
} from "./memory.service.js";
import { ValidationError } from "../../common/utils/app-error.js";
import { getZodFieldErrors } from "../../common/utils/zod-error.js";
import {
  createMemorySchema,
  memoryIdParamSchema,
  updateMemorySchema,
} from "./memory.validation.js";
import AppResponse from "../../common/utils/app-response.js";

class MemoryController {
  private parseMemoryId(params: Request["params"]) {
    const parsed = memoryIdParamSchema.safeParse(params);
    if (!parsed.success) {
      throw new ValidationError("Invalid memory id", getZodFieldErrors(parsed.error));
    }
    return parsed.data;
  }

  private parseCreateBody(body: unknown) {
    const parsed = createMemorySchema.safeParse(body);
    if (!parsed.success) {
      throw new ValidationError("Invalid memory input", getZodFieldErrors(parsed.error));
    }
    return parsed.data;
  }

  private parseUpdateBody(body: unknown) {
    const parsed = updateMemorySchema.safeParse(body);
    if (!parsed.success) {
      throw new ValidationError("Invalid memory input", getZodFieldErrors(parsed.error));
    }
    return parsed.data;
  }

  async listMemories(req: Request, res: Response) {
    const memories = await listUserMemories(req.session.user.id);
    AppResponse.ok(res, "Memories retrieved successfully", memories);
  }

  async createMemory(req: Request, res: Response) {
    const input = this.parseCreateBody(req.body);
    const memory = await createMemoryForUser(req.session.user.id, input);
    AppResponse.created(res, "Memory created successfully", memory);
  }

  async updateMemory(req: Request, res: Response) {
    const { memoryId } = this.parseMemoryId(req.params);
    const input = this.parseUpdateBody(req.body);
    const memory = await updateMemoryForUser(
      req.session.user.id,
      memoryId,
      input,
    );
    AppResponse.ok(res, "Memory updated successfully", memory);
  }

  async deleteMemory(req: Request, res: Response) {
    const { memoryId } = this.parseMemoryId(req.params);
    await deleteUserMemory(memoryId);
    AppResponse.ok(res, "Memory deleted successfully");
  }
}

export const memoryController = new MemoryController();
export default MemoryController;

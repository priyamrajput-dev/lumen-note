import { generateText, Output } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import { CHAT_MODEL } from "../lib/ai-config.js";
import SourceRepository from "../modules/source/source.repository.js";
import type { ArtifactRecord } from "../modules/artifact/artifact.repository.js";
import { ValidationError } from "../common/utils/app-error.js";

const sourceRepo = new SourceRepository();
const MAX_CONTEXT_CHARS = 120_000;

const flashcardsSchema = z.object({
  cards: z
    .array(
      z.object({
        front: z.string(),
        back: z.string(),
      }),
    )
    .min(3)
    .max(30),
});

const quizSchema = z.object({
  questions: z
    .array(
      z.object({
        question: z.string(),
        options: z.array(z.string()).min(2).max(5),
        correctIndex: z.number().int().min(0),
        explanation: z.string(),
      }),
    )
    .min(3)
    .max(15),
});

const mindmapSchema = z.object({
  nodes: z
    .array(
      z.object({
        id: z.string(),
        label: z.string(),
      }),
    )
    .min(2)
    .max(40),
  edges: z.array(
    z.object({
      id: z.string(),
      source: z.string(),
      target: z.string(),
    }),
  ),
});

const takeawaysSchema = z.object({
  items: z.array(z.string()).min(3).max(20),
});

const reportSchema = z.object({
  markdown: z.string(),
  sections: z.array(
    z.object({
      title: z.string(),
      content: z.string(),
    }),
  ),
});

export async function gatherSourceContext(
  workspaceId: string,
  sourceIds?: string[],
) {
  const sources = await sourceRepo.findSourcesByWorkspaceId(workspaceId, {
    status: "READY",
  });

  const selected = sourceIds?.length
    ? sources.filter((source) => sourceIds.includes(source.id))
    : sources;

  if (selected.length === 0) {
    throw new ValidationError(
      "No ready sources found. Add and process sources before generating learning tools.",
    );
  }

  const withContent = selected.flatMap((source) => {
    const content = source.content?.trim();
    return content ? [{ title: source.title, content }] : [];
  });

  if (withContent.length === 0) {
    throw new ValidationError(
      "Selected sources have no extracted content yet.",
    );
  }

  const text = withContent
    .map((source) => `# ${source.title}\n\n${source.content}`)
    .join("\n\n---\n\n")
    .slice(0, MAX_CONTEXT_CHARS);

  return {
    text,
    sourceIds: selected.map((source) => source.id),
  };
}

export async function generateArtifactContent(
  type: ArtifactRecord["type"],
  sourceText: string,
) {
  const system = [
    `You are Lumen Note, an expert learning assistant generating a ${type.toLowerCase()} from workspace source materials.`,
    "Use ONLY the provided source content. Do not invent facts not supported by the sources.",
    "Be clear, educational, and well-structured.",
  ].join("\n");

  switch (type) {
    case "SUMMARY": {
      const result = await generateText({
        model: openai(CHAT_MODEL),
        system,
        prompt: `Write a comprehensive markdown summary of the following sources:\n\n${sourceText}`,
      });
      return { markdown: result.text };
    }
    case "TAKEAWAYS": {
      const result = await generateText({
        model: openai(CHAT_MODEL),
        system,
        output: Output.object({ schema: takeawaysSchema }),
        prompt: `Extract the most important key takeaways as concise bullet points from:\n\n${sourceText}`,
      });
      return result.output;
    }
    case "FLASHCARDS": {
      const result = await generateText({
        model: openai(CHAT_MODEL),
        system,
        output: Output.object({ schema: flashcardsSchema }),
        prompt: `Create study flashcards (front/back) covering the main concepts from:\n\n${sourceText}`,
      });
      return result.output;
    }
    case "QUIZ": {
      const result = await generateText({
        model: openai(CHAT_MODEL),
        system,
        output: Output.object({ schema: quizSchema }),
        prompt: `Create a multiple-choice quiz with explanations from:\n\n${sourceText}`,
      });
      return result.output;
    }
    case "MINDMAP": {
      const result = await generateText({
        model: openai(CHAT_MODEL),
        system,
        output: Output.object({ schema: mindmapSchema }),
        prompt: `Create a mind map as nodes and edges. Use a central topic node and branch out logically from:\n\n${sourceText}`,
      });
      return result.output;
    }
    case "REPORT": {
      const result = await generateText({
        model: openai(CHAT_MODEL),
        system,
        output: Output.object({ schema: reportSchema }),
        prompt: `Write a structured long-form report with sections and a full markdown version from:\n\n${sourceText}`,
      });
      return result.output;
    }
    default:
      throw new ValidationError(`Unsupported artifact type: ${type}`);
  }
}

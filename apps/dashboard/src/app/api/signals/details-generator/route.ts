import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getPromptGenSignalTitle } from "../ai-builder/prompts";

const SignalDetailsSchema = z.object({
  success: z.literal(true),
  signal: z.object({
    name: z.string().min(1),
  }),
  message: z.string().optional(),
});

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    // Parse JSON-logic from request
    const { jsonLogic } = await req.json();

    // Use aiPrompt as system prompt, and JSON-logic as input
    const { object } = await generateObject({
      model: openai("gpt-4o"),
      system: getPromptGenSignalTitle(jsonLogic),
      prompt: JSON.stringify(jsonLogic, null, 2),
      schema: SignalDetailsSchema,
    });

    return NextResponse.json({ data: object });
  } catch (e) {
    console.log("Error in signal details generation:", e);
    return NextResponse.json({
      success: false,
      message: e,
    });
  }
}

import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getSystemPromptGenSignal } from "./prompts";
import { createSupabaseServerClient } from "@/lib/utils/supabase/server-client";
import { getFeedbackContent } from "@/lib/utils/feedback";
import { GetAiSignalResponseBody } from "@/services/queries/signals/types";

const SignalAISchema = z.object({
  success: z.boolean(),
  signal: z
    .object({
      name: z.string().min(1),
      description: z.string().min(1),
      condition: z.string(),
    })
    .optional(),
  message: z.string().optional(),
});

const AvailableDataSourcesDataSchema = z.object({
  data_sources: z.array(
    z.object({
      prefix: z.string(),
      data_type: z.enum(["int", "decimal", "bool", "percentage"]),
      name: z.string(),
      description: z.string(),
      allowed_operators: z.array(z.string()),
      allowed_topics: z.array(z.string()),
      disabled: z.boolean(),
      suggestions_enabled: z.boolean(),
      group: z.string(),
    }),
  ),
});

async function getAvailableDataSources() {
  const url = process.env.NEXT_PUBLIC_BACKEND_SMART_SIGNALS_BASE + "/data-sources";
  console.info("Fetching available data sources from:", url);
  const resp = await fetch(url);

  if (!resp.ok) {
    console.error("Failed to fetch available data sources:", resp.statusText);
    // console.info("Response body:", await resp.text());
    return null;
  }

  const json = await resp.json().catch((e) => {
    console.error("Failed to parse response from data sources API:", e);
    return null;
  });

  if (!json) {
    return null;
  }

  return AvailableDataSourcesDataSchema.parse(json);
}

export const maxDuration = 30;

export async function POST(req: Request): Promise<NextResponse<GetAiSignalResponseBody>> {
  // Get the AI prompt
  const dataSources = await getAvailableDataSources();

  if (!dataSources) {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch available data sources",
      },
      { status: 500 },
    );
  }

  const systemPrompt = getSystemPromptGenSignal(JSON.stringify(dataSources));

  if (!systemPrompt) {
    return NextResponse.json({
      success: false,
      message: "Failed to fetch AI prompt",
    });
  }

  if (process.env.NODE_ENV === "development") {
    console.info("Using the following system prompt for AI signal generation:");
    console.info(systemPrompt);
  }

  // Parse user request
  let parsedReq: any;

  try {
    parsedReq = await req.json();
  } catch (e) {
    console.error("Failed to parse user request:", e);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to parse user request",
      },
      { status: 400 },
    );
  }

  const userPrompt = parsedReq.prompt;

  if (!userPrompt) {
    return NextResponse.json(
      {
        success: false,
        message: "User prompt is required",
      },
      { status: 400 },
    );
  }

  // Get LLM response
  let resp: Awaited<ReturnType<typeof generateObject>>;

  try {
    resp = await generateObject({
      model: openai("gpt-4"),
      system: systemPrompt,
      prompt: userPrompt,
      schema: SignalAISchema,
    });
  } catch (e) {
    console.log("Error in AI signal generation:", e);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to generate AI signal",
      },
      { status: 500 },
    );
  }

  const obj = resp.object as typeof SignalAISchema._type;

  // Handle no object returned
  if (!obj) {
    console.error("No object returned from AI signal generation");

    return NextResponse.json(
      {
        success: false,
        message: "Failed to generate signal definition",
      },
      { status: 500 },
    );
  }

  // Handle LLM failed to generate signal because of support
  if (!obj.success) {
    // Need to store a record of unsuccessfull LLm generation
    const supabase = await createSupabaseServerClient();

    // Get the authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const content = getFeedbackContent({
      notes: "",
      prompt: userPrompt,
      errorReason: obj.message,
    });

    const { data, error } = await supabase.from("feedback").insert({ content, user_id: user?.id }).select().single();

    if (error) {
      console.error("Failed to store feedback for unsuccessful signal generation:", error);
    }

    return NextResponse.json(
      {
        success: false,
        message: obj.message,
        feedbackId: data?.id,
        error: "cannot-generate",
      },
      { status: 400 },
    );
  }

  const signalCondStr = (obj as any).signal?.condition;

  if (process.env.NODE_ENV === "development") {
    console.info("Generated condition", signalCondStr);
  }

  // Set condition
  let parsedCondition: object;

  try {
    parsedCondition = JSON.parse(signalCondStr);
  } catch (e) {
    console.error("Failed to parse signal condition JSON:", e);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to parse signal condition",
      },
      { status: 500 },
    );
  }

  (obj as any).signal.condition = parsedCondition;

  return NextResponse.json(resp.object as any);
}

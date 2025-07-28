import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { NextResponse } from "next/server";
import { z } from "zod";

const SignalAISchema = z.object({
  success: z.boolean(),
  signal: z.object({
    name: z.string().min(1),
    description: z.string().min(1),
    condition: z.string(),
  }),
  message: z.string(),
});

const AvailableDataSourcesDataSchema = z.object({
  data_sources: z.array(
    z.object({
      prefix: z.string(),
      data_type: z.enum(["int", "decimal", "bool"]),
      name: z.string(),
      description: z.string(),
      allowed_operators: z.array(z.string()),
      allowed_topics: z.array(z.string()),
      disabled: z.boolean(),
      suggestions_enabled: z.boolean(),
      group: z.string(),
      message_field: z.string(),
    }),
  ),
});

async function getAvailableDataSources() {
  const url =
    process.env.NEXT_PUBLIC_BACKEND_SMART_SIGNALS_BASE + "/data-sources";
  console.info("Fetching available data sources from:", url);
  const resp = await fetch(url);

  if (!resp.ok) {
    console.error("Failed to fetch available data sources:", resp.statusText);
    console.info("Response body:", await resp.text());
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

async function getSystemPrompt(): Promise<string | null> {
  const dataSources = await getAvailableDataSources();

  if (!dataSources) {
    return null;
  }

  // System prompt for the LLM
  // todo: add more examples and imprve the prompt
  const aiPrompt = `
You are an expert at creating crypto trading signals using JSON-logic. 
Given a user's request, generate a JSON object with the following structure:

{
  "success": true,
  "signal": {
    "name": "<short descriptive name>",
    "description": "<detailed description>",
    "condition": "<valid JSON-logic object as escaped string>"
  }
}

If the user requests a signal for an unsupported or invalid currency pair, respond with:

{
  "success": false,
  "message": "Invalid currency"
}

You should know the following:
1. The JSON-logic defines wich data sources and topics are gonna be evaluated.
2. A data source is like a type of data, for example price, fear and greed index, volume, streaming status, etc.
3. A topic is a specific instance of a data source, for example ticker-BTCUSD, cfgi-BTC, etc.
4. Use only data sources, which are available. You are given the available data sources below. You must never use data sources that are not available.
5. Data source have specific operators that can be used to compare values, such as ">", "<", "==", etc. You can never use operators that are not available for the data source.
6. In the data structure below, a data source name is defined by the "prefix" field.
7. The conditions inside the generated JSON can only include a topic made of the prefix and the topic name, for example "ticker-BTCUSD", "cfgi-BTC", etc. It can never include just the prefix or just the topic name.
8. You are not supposed to set any reminders or notifications, just output a JSON.
9. The condition field must be a JSON string (escaped), not a JSON object.
10. The condition cannot be just an object with an operator. If it would be like that, you must wrap it in an "and" group.

Available data sources:
${JSON.stringify(dataSources, null, 2)}

===================

Example user prompt #1: "alert me when bitcoin goes above 80000 and btc cfgi goes above 68"

Example response #1:
{
  "success": true,
  "signal": {
    "name": "Bitcoin above 80k and cfgi above 68",
    "description": "Alert when BTC price is above $80,000 and BTC CFGI is above 68.",
    "condition": "{\\"and\\":[{\\">\\": [80000, {\\"topic\\": \\"ticker-BTCUSDT\\"}]},{\\">\\": [66, {\\"topic\\": \\"cfgi-BTC\\"}]}]}"
  }
}

If the user prompt is invalid:
{
  "success": false,
  "message": "Invalid currency"
}
`;

  return aiPrompt;
}

export const maxDuration = 30;

export async function POST(req: Request) {
  // Get the AI prompt
  const systemPrompt = await getSystemPrompt();

  if (!systemPrompt) {
    return NextResponse.json({
      data: {
        success: false,
        message: "Failed to fetch AI prompt",
      },
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
        data: {
          success: false,
          message: "Failed to parse user request",
        },
      },
      { status: 400 },
    );
  }

  const userPrompt = parsedReq.prompt;

  if (!userPrompt) {
    return NextResponse.json(
      {
        data: {
          success: false,
          message: "User prompt is required",
        },
      },
      { status: 400 },
    );
  }

  // Get LLM response
  let resp: Awaited<ReturnType<typeof generateObject>>;

  try {
    resp = await generateObject({
      model: openai("o4-mini"),
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

  // The JSON string inside the "condition" field must be parsed before
  // sending back a response

  const obj = resp.object;

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

  const signalCondStr = (obj as any).signal?.condition;

  if (process.env.NODE_ENV === "development") {
    console.info("Generated condition", signalCondStr);
  }

  if (typeof signalCondStr !== "string") {
    console.error("Signal condition is not a string:", signalCondStr);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to generate signal definition",
      },
      { status: 500 },
    );
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

  if (resp) {
    return NextResponse.json({ data: resp.object });
  }
}

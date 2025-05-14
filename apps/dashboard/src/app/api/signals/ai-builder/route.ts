import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { NextResponse } from "next/server";
import { z } from "zod";

// Recursive JSON-logic schema for signal conditions
// export const JsonLogicSchema: z.ZodType<any> = z.lazy(
//   (): z.ZodType<any> =>
//     z.union([
//       // Logical group: { and: [ ... ] } or { or: [ ... ] }
//       z.object({
//         and: z.array(JsonLogicSchema),
//       }),
//       z.object({
//         or: z.array(JsonLogicSchema),
//       }),
//       // Comparison: { ">": [number|string, { topic: [string, string] }] }
//       z.object({
//         ">": z.tuple([
//           z.union([z.number(), z.string()]),
//           z.object({ topic: z.tuple([z.string(), z.string()]) }),
//         ]),
//       }),
//       z.object({
//         "<": z.tuple([
//           z.union([z.number(), z.string()]),
//           z.object({ topic: z.tuple([z.string(), z.string()]) }),
//         ]),
//       }),
//       z.object({
//         "==": z.tuple([
//           z.union([z.number(), z.string()]),
//           z.object({ topic: z.tuple([z.string(), z.string()]) }),
//         ]),
//       }),
//       z.object({
//         "!=": z.tuple([
//           z.union([z.number(), z.string()]),
//           z.object({ topic: z.tuple([z.string(), z.string()]) }),
//         ]),
//       }),
//       // Optionally allow boolean literals (JSON-logic supports this)
//       z.boolean(),
//     ])
// );

export const SignalAISchema = z.object({
  success: z.literal(true),
  signal: z.object({
    name: z.string().min(1),
    description: z.string().min(1),
    condition: z.record(z.any()), // Accepts any object
  }),
  message: z.string().optional(),
});

// System prompt for the LLM
export const aiPrompt = `
You are an expert at creating crypto trading signals using JSON-logic. 
Given a user's request, generate a JSON object with the following structure:

{
  "success": true,
  "signal": {
    "name": "<short descriptive name>",
    "description": "<detailed description>",
    "condition": "<valid JSON-logic object>"
  }
}

If the user requests a signal for an unsupported or invalid currency pair, respond with:

{
  "success": false,
  "message": "Invalid currency"
}

Supported currency pairs: BTCUSD, ETHUSD, SOLUSD.
Supported data sources: price (e.g., "ticker_BTCUSD"), cfgi (e.g., "cfgi_BTC").

Example user prompt #1: "alert me when bitcoin goes above 80000 and btc cfgi goes above 68"

Example response #1:
{
  "success": true,
  "signal": {
    "name": "Bitcoin above 80k and cfgi above 68",
    "description": "Alert when BTC price is above $80,000 and BTC CFGI is above 68.",
    "condition": {
    "and": [
        {
            ">": [
                80000,
                {
                    "topic": [
                        "ticker_BTCUSD",
                        "price"
                    ]
                }
            ]
        },
        {
            ">": [
                66,
                {
                    "topic": [
                        "cfgi_BTC",
                        "cfgi"
                    ]
                }
            ]
        }
    ]
}
  }
}

If the user prompt is invalid:
{
  "success": false,
  "message": "Invalid currency"
}
  
`;

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    // Parse user prompt from request
    const { prompt } = await req.json();

    console.log("🚀 ~ POST ~ prompt:", prompt);
    // Use aiPrompt as system prompt, and user prompt as input
    const { object } = await generateObject({
      model: openai("gpt-4o"),
      system: aiPrompt,
      prompt: prompt,
      schema: SignalAISchema,
    });
    console.log("🚀 ~ POST ~ object:", object);

    // const parsed = JSON.parse(text);
    const parsed = object;
    // console.log("🚀 ~ POST ~ parsed:", parsed);

    return NextResponse.json({ data: parsed });
  } catch (e) {
    console.log("Error in AI signal generation:", e);
    return NextResponse.json({
      success: false,
      message: e,
    });
  }
}

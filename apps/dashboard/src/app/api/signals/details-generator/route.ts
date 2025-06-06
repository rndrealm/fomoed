import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { NextResponse } from "next/server";
import { z } from "zod";

const SignalDetailsSchema = z.object({
  success: z.literal(true),
  signal: z.object({
    name: z.string().min(1),
    description: z.string().min(1),
  }),
  message: z.string().optional(),
});

// System prompt for the LLM
const aiPrompt = `
You are an expert at analyzing crypto trading signals written in JSON-logic format.
Given a JSON-logic condition, generate a clear and concise name and description for the signal.

Your response should follow this structure:
{
  "success": true,
  "signal": {
    "name": "<short descriptive name>",
    "description": "<detailed description>"
  }
}

The name should be brief but descriptive (max 10 words).
The description should explain the signal's logic in plain English.

Example JSON-logic input:
{
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

Example response:
{
  "success": true,
  "signal": {
    "name": "Bitcoin above 80k and cfgi above 66",
    "description": "Alert when BTC price is above $80,000 and BTC CFGI is above 66."
  }
}

If the JSON-logic is invalid or cannot be understood:
{
  "success": false,
  "message": "Invalid JSON-logic format"
}
`;

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    // Parse JSON-logic from request
    const { jsonLogic } = await req.json();

    // Use aiPrompt as system prompt, and JSON-logic as input
    const { object } = await generateObject({
      model: openai("gpt-4o"),
      system: aiPrompt,
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

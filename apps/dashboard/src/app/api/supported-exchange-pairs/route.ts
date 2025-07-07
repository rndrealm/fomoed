import { fetchCoinglassSupportedPairs } from "@/lib/server/utils/coinglass";
import { NextResponse } from "next/server";

//! REQUEST HANDLER for /api/supported-exchange-pairs
export async function GET() {
  const supportedPairs = await fetchCoinglassSupportedPairs();

  if (!supportedPairs) {
    return NextResponse.json({ error: "Failed to fetch supported pairs" }, { status: 500 });
  }
}

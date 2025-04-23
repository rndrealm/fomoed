import { NextResponse } from "next/server";

//! REQUEST HANDLER for /api/supported-exchange-pairs
export async function GET() {
  try {
    //Todo move this api call to another function
    const url =
      "https://open-api-v3.coinglass.com/api/futures/supported-exchange-pairs";

    const res = await fetch(url, {
      method: "GET",
      headers: {
        accept: "application/json",
        "CG-API-KEY": process.env.PRIVATE_COINGLASS_KEY as string,
      },
      cache: "no-store",
    });
    const data = await res.json();

    if (!res.ok || !data.success) {
      return NextResponse.json(
        { error: "Failed to fetch CFGI data" },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: data.data });
  } catch (error) {
    // Handle errors gracefully
    console.error("Error fetching CFGI data:", error);
    return NextResponse.json(
      { error: "Failed to fetch CFGI data" },
      { status: 500 }
    );
  }
}

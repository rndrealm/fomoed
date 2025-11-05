import { NextRequest, NextResponse } from "next/server";

const API_SOURCES: { [key: string]: string[] } = {
  binance: [
    "https://api.binance.com",
    "https://api1.binance.com",
    "https://api2.binance.com",
    "https://api3.binance.com",
  ],
  binance_us: ["https://api.binance.us"],
};

async function fetchWithRetry(url: string, options: RequestInit, retries = 3, initialDelay = 1000) {
  for (let i = 0; i < retries; i++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const res = await fetch(url, {
        ...options,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (res.ok) {
        return res;
      }

      if (res.status >= 400 && res.status < 500) {
        throw new Error(`Client error: ${res.status}`);
      }
    } catch (error: any) {
      if (i === retries - 1) throw error;

      const delay = initialDelay * 2 ** i;
      console.log(`Attempt ${i + 1} failed for ${url}. Retrying in ${delay}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  throw new Error(`All fetch attempts failed for ${url}.`);
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const source = searchParams.get("source");
    const endpoint = searchParams.get("endpoint");

    if (!source || !endpoint) {
      return NextResponse.json({ error: "Missing source or endpoint parameter." }, { status: 400 });
    }

    const baseUrls = API_SOURCES["binance_us"];

    if (!baseUrls || baseUrls.length === 0) {
      return NextResponse.json({ error: "Invalid source specified" }, { status: 400 });
    }

    const externalParams = new URLSearchParams();
    searchParams.forEach((value, key) => {
      if (key !== "source" && key !== "endpoint" && key !== "isUS") {
        externalParams.append(key, value);
      }
    });

    const queryString = externalParams.toString();

    for (const baseUrl of baseUrls) {
      try {
        const externalUrl = `${baseUrl}${endpoint}${queryString ? `?${queryString}` : ""}`;
        console.log(`Attempting to fetch from: ${externalUrl}`);

        const res = await fetchWithRetry(externalUrl, {
          headers: {
            Accept: "application/json",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          },
        });

        if (res.ok) {
          const data = await res.json();
          return NextResponse.json(data);
        }
      } catch (error) {
        console.error(`Failed to fetch from ${baseUrl}:`, error);
      }
    }

    throw new Error("All API endpoints failed.");
  } catch (error: any) {
    console.error("Error in data proxy after all retries:", error);
    return NextResponse.json(
      {
        error: "Failed to connect to the external API after multiple attempts.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 504 },
    );
  }
}

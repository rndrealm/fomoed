import { NextResponse } from "next/server";

// --- The fetchPriceHistory function is no longer needed for this test ---
// async function fetchPriceHistory(
//   exchange: string,
//   symbol: string,
//   interval: string,
// ) {
//   // ... implementation
// }

async function fetchOrderBookHistory(exchange: string, symbol: string, interval: string, range: string) {
  const url = `https://open-api-v4.coinglass.com/api/futures/orderbook/ask-bids-history?exchange=${exchange}&symbol=${symbol}&interval=${interval}&range=${range}&limit=800`;

  const options = {
    method: "GET",
    headers: {
      accept: "application/json",
      "CG-API-KEY": process.env.PRIVATE_COINGLASS_KEY as string,
    },
  };

  const res = await fetch(url, options);
  if (!res.ok) {
    const errorData = await res.json();
    console.error("Failed to fetch orderbook history: ", errorData);
    throw new Error(errorData.msg || "Failed to fetch orderbook History data");
  }

  return res.json();
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const exchange = searchParams.get("exchange");
    const symbol = searchParams.get("symbol");
    const interval = searchParams.get("interval");
    const range = searchParams.get("range");

    if (!exchange || !symbol || !interval || !range) {
      return NextResponse.json({ error: "Missing required query parameter" }, { status: 400 });
    }

    const orderData = await fetchOrderBookHistory(exchange, symbol, interval, range);

    // --- Price data check is commented out ---
    // if (!priceData.data ) {
    //   return NextResponse.json(
    //     { error: "Price sources returned no data" },
    //     { status: 500 },
    //   );
    // }

    if (!orderData.data) {
      return NextResponse.json({ error: "Order sources returned no data" }, { status: 500 });
    }

    return NextResponse.json({
      // priceData: [], 
      orderBookData: orderData.data,
    });
  } catch (error: any) {
    console.log("Error fetching orderbook delta data: ", error);

    const message = typeof error === "string" ? error : error?.message || "Unknown server error";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { BUNGEE_API_BASE_URL } from "../static";

//! REQUEST HANDLER FOR /api/dex/get-quote
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userAddress = searchParams.get("userAddress");
    const receiverAddress = searchParams.get("receiverAddress");
    const originChainId = searchParams.get("originChainId");
    const destinationChainId = searchParams.get("destinationChainId");
    const inputToken = searchParams.get("inputToken");
    const outputToken = searchParams.get("outputToken");
    const inputAmount = searchParams.get("inputAmount");
    const slippage = searchParams.get("slippage");

    // Ensure required parameters are present
    if (
      !userAddress ||
      !originChainId ||
      !destinationChainId ||
      !inputToken ||
      !outputToken ||
      !inputAmount ||
      !slippage ||
      !receiverAddress
    ) {
      return NextResponse.json(
        { error: "Missing required query parameters" },
        { status: 400 }
      );
    }

    const response = await fetch(
      `${BUNGEE_API_BASE_URL}/bungee/quote?` +
        new URLSearchParams({
          userAddress,
          receiverAddress,
          originChainId,
          destinationChainId,
          inputToken,
          outputToken,
          inputAmount,
          slippage,
          enableManual: "true",
          feeTakerAddress: "0x8eF0ffa6c26607801B87C9f386AeD41aa2cE64f4",
          feeBps: "10",
        }),
      {
        headers: {
          "x-api-key": process.env.BUNGEE_API_KEY!, // Ensure the API key is set in your environment variables
        },
      }
    );

    console.log("Response from Bungee API:", response);

    if (response.status !== 200) {
      return NextResponse.json(
        { error: response.statusText },
        { status: response.status }
      );
    } else {
      const resJson = await response.json();

      return NextResponse.json(resJson);
    }
  } catch (error) {
    // Handle errors gracefully
    console.log("Error fetching chain data:", error);
    return NextResponse.json(
      { error: "Failed to fetch chain data" },
      { status: 500 }
    );
  }
}

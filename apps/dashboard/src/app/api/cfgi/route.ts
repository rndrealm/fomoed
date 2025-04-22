import { CfgiDataResponse, CFGIEnum } from "@/services/queries/charts/types";
import { NextResponse } from "next/server";
import { sortBy, uniqBy } from "lodash-es";

// Helper function to parse and validate CFGI data
const parseCfgiData = (data: CfgiDataResponse[], token: string) =>
  data
    .map((d) => ({
      ...d,
      symbol: token,
      cfgi: parseInt(d.cfgi.toString()),
      date: new Date(d.date).getTime(),
    }))
    .filter((d) => d.date && d.price && d.cfgi && !isNaN(d.cfgi));

// Helper function to fetch and format fallback data
const fetchFallbackData = async (
  token_slug: string,
  token: string,
  period: string
) => {
  // Fallback to Coin Stats API if CFGI API fails
  const token_historical_price = uniqBy(
    await fetch(
      `https://api.coin-stats.com/v2/coin_chart/${token_slug}?type=all`
    )
      .then((res) => res.json())
      .then(
        (res) =>
          (res?.data?.map((d: number[]) => {
            return {
              date: new Date(
                new Date(d[0] * 1000).setHours(0, 0, 0, 0)
              ).getTime(),
              price: d[1],
            };
          }) || []) as { date: number; price: number }[]
      )
      .catch(() => []),
    "date"
  );

  // Summarize history by the day
  const cfgi_data = uniqBy(
    await fetch("https://api.coin-stats.com/v2/fear-greed?type=all")
      .then((res) => res.json())
      .then((res) => {
        const data =
          (res?.data as {
            value: number;
            value_classification: CFGIEnum;
            timestamp: number;
            time_until_update: number;
          }[]) || [];

        return data.map((d) => {
          d.timestamp = new Date(
            new Date(parseInt(d.timestamp.toString()) * 1000).setHours(
              0,
              0,
              0,
              0
            )
          ).getTime();

          return d;
        });
      })
      .catch(() => []),
    "timestamp"
  );

  // History of Tether isn't accurate

  // Combine the data
  const fallBackData = {
    data: sortBy(
      cfgi_data
        .map((d) => {
          const h_price = token_historical_price.find(
            (p) => p.date === d.timestamp
          );

          return {
            cfgi: parseInt(d.value.toString()),
            price:
              d.timestamp && !isNaN(d.timestamp)
                ? h_price?.price || null
                : null,
            date:
              d.timestamp && !isNaN(d.timestamp)
                ? new Date(d.timestamp).getTime()
                : 0,
            symbol: token,
            period,
          };
        })
        .filter((d) => d.price && d.date && d.cfgi && !isNaN(d.cfgi)),
      ["date"]
    ),
    source: "coin-stats",
  };
  return fallBackData;
};

//! REQUEST HANDLER FOR /api/cfgi
export async function GET(request: Request) {
  try {
    // API key is safely stored on server
    const apiKey = process.env.CFGI_API_KEY;
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");
    const period = searchParams.get("period");
    const values = searchParams.get("values");
    const token_slug = searchParams.get("token_slug");

    // Ensure required parameters are present
    if (!token || !token_slug || !period) {
      return NextResponse.json(
        { error: "Missing required query parameters" },
        { status: 400 }
      );
    }

    const response = await fetch(
      `https://cfgi.io/api/api_request.php?api_key=${apiKey}&token=${token}&period=${period}&values=${values}`,
      {
        cache: "no-store",
      }
    );
    const resText = await response.text();

    if (resText.length) {
      const data = JSON.parse(resText) as CfgiDataResponse[];

      // Format the response data, sorting by date and filtering out invalid entries
      const formatData = {
        data: sortBy(parseCfgiData(data, token!), ["date"]),
        source: "cfgi.io",
      };

      return NextResponse.json({ data: formatData.data });
    } else {
      const fallBackData = await fetchFallbackData(token_slug, token, period);
      return NextResponse.json({ data: fallBackData.data });
    }
  } catch (error) {
    // Handle errors gracefully
    console.error("Error fetching CFGI data:", error);
    return NextResponse.json(
      { error: "Failed to fetch CFGI data" },
      { status: 500 }
    );
  }
}

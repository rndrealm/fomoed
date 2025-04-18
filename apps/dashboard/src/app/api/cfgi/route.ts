import { CfgiDataResponse } from "@/services/queries/charts/types";
import { NextResponse } from "next/server";
import { sortBy } from "lodash-es";

export async function GET(request: Request) {
  try {
    // API key is safely stored on server
    const apiKey = process.env.CFGI_API_KEY;
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");
    const period = searchParams.get("period");
    const values = searchParams.get("values");

    const response = await fetch(
      `https://cfgi.io/api/api_request.php?api_key=${apiKey}&token=${token}&period=${period}&values=${values}`,
      {
        cache: "no-store",
      }
    );

    const resText = await response.text();

    if (resText.toString().length) {
      console.log("seend");
      const data = JSON.parse(resText.toString()) as CfgiDataResponse[];
      const retData = data
        .map((d) => ({
          ...d,
          symbol: token,
          cfgi: parseInt(d.cfgi.toString()),
        }))
        .filter((d) => d.cfgi);

      const formatData = {
        data: sortBy(
          retData
            .filter((d) => d?.cfgi)
            .map((d) => ({
              ...d,
              cfgi: parseInt(d.cfgi.toString()),
              date: new Date(d.date).getTime(),
              // period,
              // symbol: token_symbol
            }))
            .filter((d) => d.date && d.price && d.cfgi && !isNaN(d.cfgi)),
          ["date"]
        ),
        source: "cfgi.io",
      };
      return NextResponse.json({ data: formatData.data });
    } else {
      return NextResponse.json(
        { error: "Failed to fetch CFGI data" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error fetching CFGI data:", error);
    return NextResponse.json(
      { error: "Failed to fetch CFGI data" },
      { status: 500 }
    );
  }
}

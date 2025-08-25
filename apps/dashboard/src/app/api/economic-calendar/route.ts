import { NextResponse } from "next/server";

async function fetchEconomicData(startTimestamp: number, endTimestamp: number) {
  const url = `https://open-api-v4.coinglass.com/api/calendar/economic-data?start_time=${startTimestamp}&end_time=${endTimestamp}`;
    
  const options = {
    method: "GET",
    headers: {
      accept: "application/json",
      "CG-API-KEY": process.env.PRIVATE_COINGLASS_KEY as string,
    },
    cache: "no-store" as RequestCache,
  };

  const res = await fetch(url, options);
  if (!res.ok) {
    const errorData = await res.json();
    console.error("Failed to fetch economic data from Coinglass:", errorData);
    throw new Error(errorData.msg || "Failed to fetch economic data");
  }
  return res.json();
}

export async function GET() {
  try {
    const now = new Date();
    const startTime = new Date();
    startTime.setDate(now.getDate() - 30); 

    const endTime = new Date();
    endTime.setDate(now.getDate() + 60); 

    const startTimestamp = startTime.getTime();
    const endTimestamp = endTime.getTime();

    const rawData = await fetchEconomicData(startTimestamp, endTimestamp);

    if (!rawData.data) {
      return NextResponse.json({ error: "No data returned from Coinglass API" }, { status: 500 });
    }

    const filteredAndFormattedData = rawData.data
      .filter((event: any) => {
        const isUS = event.country_code === "USA";
        const isHighImpact = event.importance_level === 3;
        return isUS && isHighImpact;
      })
      .map((event: any) => {
        return {
          name: event.calendar_name,
          country: event.country_name,
          timestamp: event.publish_timestamp,
          publishTime: new Date(event.publish_timestamp).toISOString(),
          forecast: event.forecast_value,
          previous: event.previous_value,
          actual: event.published_value,
          revised: event.revised_previous_value,
        };
      })
      .sort((a: any, b: any) => a.timestamp - b.timestamp);

    return NextResponse.json({ data: filteredAndFormattedData });

  } catch (error: any) {
    console.error("Error in /api/economic-calendar:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch economic data" }, { status: 500 });
  }
}

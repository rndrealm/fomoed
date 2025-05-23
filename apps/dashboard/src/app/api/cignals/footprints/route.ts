import { timeIntervalStringToMs } from "@/charts/helpers";
import { NextResponse } from "next/server";

const CIGNALS_HOST = "https://api.cignals.io";

export const GET = async (request: Request) => {
  const url = new URL(request.url);
  // Param validation
  const instrument_id = url.searchParams.get("instrument_id");
  if (!instrument_id)
    return new Response("Missing instrument_id", { status: 400 });

  const start_range = parseInt(url.searchParams.get("start_range") ?? "");
  if (isNaN(start_range))
    return new Response("Invalid start_range", { status: 400 });

  const end_range = parseInt(url.searchParams.get("end_range") ?? "");
  if (isNaN(end_range))
    return new Response("Invalid end_range", { status: 400 });

  const price_step = parseFloat(url.searchParams.get("price_step") ?? "");
  if (isNaN(price_step))
    return new Response("Invalid price_step", { status: 400 });

  const time_step = url.searchParams.get("time_step");
  if (!time_step) return new Response("Missing time_step", { status: 400 });

  // Generate timestamps of footprints to fetch
  const msStep = timeIntervalStringToMs(time_step);
  const timestampsToFetch = [];

  for (
    let timestamp = start_range;
    timestamp < end_range;
    timestamp += msStep
  ) {
    timestampsToFetch.push(timestamp);
  }

  console.log({ start_range, end_range, time_step });
  console.log(timestampsToFetch);

  // Fetch those footprints from cignals
  const fetchPromises = timestampsToFetch.map((timestamp) => {
    console.log("Fetching footprints for timestamp", timestamp);

    const options: any = {
      instrument_id,
      start_range: timestamp,
      end_range: timestamp + msStep,
      price_step,
      time_step,
    };

    const url = new URL(CIGNALS_HOST + "/v1/footprints");

    url.searchParams.append("instrument_id", options.instrument_id);
    url.searchParams.append("start_range", options.start_range.toString());
    url.searchParams.append("end_range", options.end_range.toString());
    url.searchParams.append("price_step", options.price_step.toString());
    url.searchParams.append("time_step", options.time_step);

    return fetch(url.toString(), {
      method: "GET",
      headers: {
        Authorization: process.env.PRIVATE_CIGNALS_KEY!,
      },
    }).then((response) => {
      if (!response.ok) {
        console.error(
          `Error fetching footprints from cignals: ${response.statusText}`
        );
        return [];
      }

      return response.json();
    });
  });

  const footprints = (await Promise.all(fetchPromises)).flat();

  return NextResponse.json(footprints);
};

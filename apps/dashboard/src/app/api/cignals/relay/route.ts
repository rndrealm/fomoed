import { NextResponse } from "next/server";

export const GET = async (req: Request) => {
  const url = new URL(req.url);
  const pathBase64 = url.searchParams.get("path");

  if (!pathBase64) {
    return new Response("Missing required parameter <path>", { status: 400 });
  }

  const path = atob(pathBase64);
  const apiKey = process.env.PRIVATE_CIGNALS_KEY!;

  const cignalsUrl = new URL(path);

  const res = await fetch(cignalsUrl.toString(), {
    method: "GET",
    headers: {
      Authorization: apiKey,
    },
  });

  const json = await res.json();

  return NextResponse.json(json);
};

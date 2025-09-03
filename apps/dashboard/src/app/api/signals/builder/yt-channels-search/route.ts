import { NextRequest, NextResponse } from "next/server";
import { asNextResponseData, asNextResponseError } from "@/lib/utils/server.utils";

interface Channel {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
}

interface RapidApiYtResponse {
  data: Array<{
    type: string;
    videoId: string;
    channelId: string;
    channelTitle: string;
    description: string;
    channelThumbnail: Array<{
      url: string;
      width: number;
      height: number;
    }>;
  }>;
}

export interface YtChannelSearchResponse {
  channels: Channel[];
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("s");

  if (!query) {
    return asNextResponseError({ message: 'Missing search query parameter "s"', status: 400 });
  }

  const rapidApiKey = process.env.RAPID_API_KEY;
  if (!rapidApiKey) {
    return asNextResponseError({ message: "RapidAPI key not configured", status: 500 });
  }

  const apiUrl = "https://yt-api.p.rapidapi.com/search";
  const reqUrl = `${apiUrl}?query=${encodeURIComponent(query)}`;

  try {
    const response = await fetch(reqUrl, {
      method: "GET",
      headers: {
        "x-rapidapi-key": rapidApiKey,
        "x-rapidapi-host": "yt-api.p.rapidapi.com",
      },
    });

    if (!response.ok) {
      console.error("YouTube API error:", response.status, response.statusText);
      return asNextResponseError({ message: "Could not search channels.", status: 502 });
    }

    const data: RapidApiYtResponse = await response.json();

    // Extract unique channels from the response
    const uniqueChannels = new Map<string, Channel>();

    for (const item of data.data) {
      // Only process video items that have channel information
      if (item.type === "video" && item.channelId) {
        // Skip if we've already added this channel
        if (uniqueChannels.has(item.channelId)) {
          continue;
        }

        // Get thumbnail URL if available
        const thumbnailURL = item.channelThumbnail?.[0]?.url || "";

        // Add to unique channels map
        uniqueChannels.set(item.channelId, {
          id: item.channelId,
          title: item.channelTitle,
          description: item.description,
          thumbnail: thumbnailURL,
        });
      }
    }

    // Convert map to array for JSON response
    const channels = Array.from(uniqueChannels.values());

    return asNextResponseData<YtChannelSearchResponse>({ channels });
  } catch (error) {
    console.error("Failed to fetch from YouTube API:", error);
    return asNextResponseError({ message: "Failed to fetch from YouTube API", status: 500 });
  }
}

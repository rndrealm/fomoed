import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json({ suggestions: [] });
  }

  try {
    const response = await fetch(
      `https://suggestqueries.google.com/complete/search?client=youtube&ds=yt&q=${encodeURIComponent(query)}`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        },
      }
    );

    const text = await response.text();
    
    // Parse JSONP response
    const jsonMatch = text.match(/\[([\s\S]*)\]/);
    if (jsonMatch) {
      const parsed = JSON.parse('[' + jsonMatch[1] + ']');
      if (parsed[1] && Array.isArray(parsed[1])) {
        const suggestions = parsed[1].map((item: any) => item[0]).slice(0, 8);
        return NextResponse.json({ suggestions });
      }
    }

    return NextResponse.json({ suggestions: [] });
  } catch (error) {
    console.error('Failed to fetch suggestions:', error);
    return NextResponse.json({ suggestions: [] });
  }
}
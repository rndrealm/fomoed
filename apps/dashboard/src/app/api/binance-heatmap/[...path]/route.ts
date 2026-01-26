// app/api/binance-heatmap/[...path]/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  // Await params in Next.js 15
  const { path: pathArray } = await params;
  const path = pathArray.join('/');
  const searchParams = request.nextUrl.searchParams;
  
  const binanceUrl = `https://fapi.binance.com/${path}?${searchParams.toString()}`;
  
  try {
    const response = await fetch(binanceUrl, {
      headers: {
        'Accept': 'application/json',
      },
      // Add cache options for better performance
      next: { revalidate: 1 }, // Cache for 1 second
    });
    
    if (!response.ok) {
      return NextResponse.json(
        { error: `Binance API error: ${response.status}` },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=1, stale-while-revalidate=2',
      },
    });
  } catch (error) {
    console.error('Binance API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch from Binance' },
      { status: 500 }
    );
  }
}
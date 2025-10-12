// app/api/cron/process-payouts/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { processEligiblePayouts } from '@/services/payouts/processEligiblePayouts';

export const maxDuration = 60;
export const runtime = 'nodejs'; 
export const dynamic = 'force-dynamic'; 

export async function GET(request: NextRequest) {
  try {
    console.log('Starting payout processing job...');
    const startTime = Date.now();

    const results = await processEligiblePayouts();

    const duration = Date.now() - startTime;

    console.log('Payout processing completed:', {
      duration: `${duration}ms`,
      successCount: results.success.length,
      failedCount: results.failed.length,
      skippedCount: results.skipped.length,
    });

    return NextResponse.json({
      success: true,
      results,
      duration,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Cron job failed:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
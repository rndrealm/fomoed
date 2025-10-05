import { NextRequest, NextResponse } from 'next/server';
import { processEligiblePayouts } from '@/services/payouts/processEligiblePayouts';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Verify authorization
    const authHeader = request.headers.get('authorization');
    const expectedAuth = `Bearer ${process.env.CRON_SECRET}`;

    if (authHeader !== expectedAuth) {
      console.error('Unauthorized cron request');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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
import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient, createSupabaseServiceClient } from "@/lib/utils/supabase/server-client";

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const query = await createSupabaseServiceClient();
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { referral_code } = body;

    // Validation
    if (!referral_code || typeof referral_code !== 'string') {
      return NextResponse.json(
        { message: 'Referral code is required' },
        { status: 400 }
      );
    }

    const trimmedCode = referral_code.trim();

    // Validate format: 3-20 characters, alphanumeric plus dash and underscore
    if (!/^[a-zA-Z0-9_-]{3,20}$/.test(trimmedCode)) {
      return NextResponse.json(
        { message: 'Referral code must be 3-20 characters (letters, numbers, dash, underscore only)' },
        { status: 400 }
      );
    }

    // Check if referral code is already taken by another user
    const { data: existingUser, error: checkError } = await query
      .from('users')
      .select('user_id')
      .eq('referral_code', trimmedCode)
      .neq('user_id', user.id)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      // PGRST116 means no rows found, which is what we want
      console.error('Error checking referral code:', checkError);
      return NextResponse.json(
        { message: 'Failed to validate referral code' },
        { status: 500 }
      );
    }

    if (existingUser) {
      return NextResponse.json(
        { message: 'This referral code is already taken' },
        { status: 409 }
      );
    }

    // Update the user's referral code using service client for the write operation
    const { data: updatedUser, error: updateError } = await query
      .from('users')
      .update({ 
        referral_code: trimmedCode,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id)
      .select('referral_code')
      .single();

    if (updateError) {
      console.error('Error updating referral code:', updateError);
      return NextResponse.json(
        { message: 'Failed to update referral code' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Referral code updated successfully',
      referral_code: updatedUser.referral_code
    });

  } catch (error) {
    console.error('Unexpected error in change-referral-code:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
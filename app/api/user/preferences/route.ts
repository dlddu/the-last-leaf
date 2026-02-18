import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

const VALID_IDLE_THRESHOLDS = [2592000, 5184000, 7776000, 15552000];

export async function GET(request: NextRequest) {
  try {
    // Get auth token from cookie
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify token
    let payload;
    try {
      payload = await verifyToken(token);
    } catch (error) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = payload.userId as string;

    // Fetch user preferences
    const user = await prisma.user.findUnique({
      where: { user_id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const { timer_status, timer_idle_threshold_sec } = user as any;

    return NextResponse.json({
      timer_status,
      timer_idle_threshold_sec,
    });
  } catch (error) {
    console.error('Get preferences error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Get auth token from cookie
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify token
    let payload;
    try {
      payload = await verifyToken(token);
    } catch (error) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = payload.userId as string;

    // Parse request body
    let body;
    try {
      body = await request.json();
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    const { timer_status, timer_idle_threshold_sec } = body;

    // Validate: at least one field must be provided
    if (timer_status === undefined && timer_idle_threshold_sec === undefined) {
      return NextResponse.json(
        { error: 'At least one field (timer_status or timer_idle_threshold_sec) must be provided' },
        { status: 400 }
      );
    }

    // Validate timer_status
    if (timer_status !== undefined) {
      if (!['PAUSED', 'ACTIVE', 'INACTIVE'].includes(timer_status)) {
        return NextResponse.json(
          { error: 'Invalid timer_status. Must be PAUSED, ACTIVE, or INACTIVE' },
          { status: 400 }
        );
      }
    }

    // Validate timer_idle_threshold_sec
    if (timer_idle_threshold_sec !== undefined) {
      if (typeof timer_idle_threshold_sec !== 'number') {
        return NextResponse.json(
          { error: 'timer_idle_threshold_sec must be a number' },
          { status: 400 }
        );
      }
      if (!VALID_IDLE_THRESHOLDS.includes(timer_idle_threshold_sec)) {
        return NextResponse.json(
          { error: 'Invalid timer_idle_threshold_sec. Must be one of: 2592000, 5184000, 7776000, 15552000' },
          { status: 400 }
        );
      }
    }

    // Build update data
    const updateData: Record<string, unknown> = {};
    if (timer_status !== undefined) {
      // Map API values to DB values
      if (timer_status === 'PAUSED') {
        updateData.timer_status = 'paused';
      } else if (timer_status === 'INACTIVE') {
        updateData.timer_status = 'inactive';
      } else {
        updateData.timer_status = 'active';
      }
    }
    if (timer_idle_threshold_sec !== undefined) {
      updateData.timer_idle_threshold_sec = timer_idle_threshold_sec;
    }

    // Update user preferences
    const updatedUser = await prisma.user.update({
      where: { user_id: userId },
      data: updateData,
    });

    const { timer_status: updatedStatus, timer_idle_threshold_sec: updatedThreshold } = updatedUser as any;

    return NextResponse.json({
      timer_status: updatedStatus,
      timer_idle_threshold_sec: updatedThreshold,
    });
  } catch (error) {
    console.error('Update preferences error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

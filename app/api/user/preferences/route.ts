import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateRequest, parseJsonBody } from '@/lib/api-helpers';

const VALID_IDLE_THRESHOLDS = [2592000, 5184000, 7776000, 15552000];

export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth.success) return auth.response;

    const user = await prisma.user.findUnique({
      where: { user_id: auth.userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      timer_status: user.timer_status,
      timer_idle_threshold_sec: user.timer_idle_threshold_sec,
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
    const auth = await authenticateRequest(request);
    if (!auth.success) return auth.response;

    const body = await parseJsonBody<{ timer_status?: string; timer_idle_threshold_sec?: number }>(request);
    if (!body.success) return body.response;

    const { timer_status, timer_idle_threshold_sec } = body.data;

    if (timer_status === undefined && timer_idle_threshold_sec === undefined) {
      return NextResponse.json(
        { error: 'At least one field (timer_status or timer_idle_threshold_sec) must be provided' },
        { status: 400 }
      );
    }

    if (timer_status !== undefined) {
      if (!['PAUSED', 'ACTIVE', 'INACTIVE'].includes(timer_status)) {
        return NextResponse.json(
          { error: 'Invalid timer_status. Must be PAUSED, ACTIVE, or INACTIVE' },
          { status: 400 }
        );
      }
    }

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

    const updateData: Record<string, unknown> = {};
    if (timer_status !== undefined) {
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

    const updatedUser = await prisma.user.update({
      where: { user_id: auth.userId },
      data: updateData,
    });

    return NextResponse.json({
      timer_status: updatedUser.timer_status,
      timer_idle_threshold_sec: updatedUser.timer_idle_threshold_sec,
    });
  } catch (error) {
    console.error('Update preferences error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateRequest, parseJsonBody, withErrorHandler } from '@/lib/api-helpers';
import { VALID_IDLE_THRESHOLDS, VALID_TIMER_STATUSES, TIMER_STATUS_MAP } from '@/lib/constants';

export const GET = withErrorHandler('Get preferences error', async (request: NextRequest) => {
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
});

export const PUT = withErrorHandler('Update preferences error', async (request: NextRequest) => {
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
    if (!(VALID_TIMER_STATUSES as readonly string[]).includes(timer_status)) {
      return NextResponse.json(
        { error: `Invalid timer_status. Must be ${VALID_TIMER_STATUSES.join(', ')}` },
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
    if (!(VALID_IDLE_THRESHOLDS as readonly number[]).includes(timer_idle_threshold_sec)) {
      return NextResponse.json(
        { error: `Invalid timer_idle_threshold_sec. Must be one of: ${VALID_IDLE_THRESHOLDS.join(', ')}` },
        { status: 400 }
      );
    }
  }

  const updateData: Record<string, unknown> = {};
  if (timer_status !== undefined) {
    updateData.timer_status = TIMER_STATUS_MAP[timer_status];
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
});

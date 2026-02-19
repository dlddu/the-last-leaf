import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateRequest, parseJsonBody, withErrorHandler, requireUser } from '@/lib/api-helpers';
import { TIMER_STATUS_MAP } from '@/lib/constants';
import { validatePreferencesInput } from '@/lib/validation';

export const GET = withErrorHandler('Get preferences error', async (request: NextRequest) => {
  const auth = await authenticateRequest(request);
  if (!auth.success) return auth.response;

  const result = await requireUser(auth.userId);
  if ('response' in result) return result.response;

  return NextResponse.json({
    timer_status: result.user.timer_status,
    timer_idle_threshold_sec: result.user.timer_idle_threshold_sec,
  });
});

export const PUT = withErrorHandler('Update preferences error', async (request: NextRequest) => {
  const auth = await authenticateRequest(request);
  if (!auth.success) return auth.response;

  const body = await parseJsonBody<{ timer_status?: string; timer_idle_threshold_sec?: number }>(request);
  if (!body.success) return body.response;

  const validationError = validatePreferencesInput(body.data);
  if (validationError) return validationError;

  const { timer_status, timer_idle_threshold_sec } = body.data;

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

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateRequest, parseJsonBody, withErrorHandler, requireUser } from '@/lib/api-helpers';
import { validateProfileInput } from '@/lib/validation';

export const GET = withErrorHandler('Get profile error', async (request: NextRequest) => {
  const auth = await authenticateRequest(request);
  if (!auth.success) return auth.response;

  const result = await requireUser(auth.userId);
  if ('response' in result) return result.response;

  return NextResponse.json({ user: result.user });
});

export const PUT = withErrorHandler('Update profile error', async (request: NextRequest) => {
  const auth = await authenticateRequest(request);
  if (!auth.success) return auth.response;

  const body = await parseJsonBody<{ nickname?: string; name?: string }>(request);
  if (!body.success) return body.response;

  const validationError = validateProfileInput(body.data);
  if (validationError) return validationError;

  const { nickname, name } = body.data;

  const updateData: Record<string, string> = {};
  if (nickname !== undefined) {
    updateData.nickname = nickname;
  }
  if (name !== undefined) {
    updateData.name = name;
  }

  const updatedUser = await prisma.user.update({
    where: { user_id: auth.userId },
    data: updateData,
  });

  const { password_hash, ...userWithoutPassword } = updatedUser;

  return NextResponse.json({ user: userWithoutPassword });
});

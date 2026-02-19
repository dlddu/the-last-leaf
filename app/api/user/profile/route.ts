import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateRequest, parseJsonBody, withErrorHandler } from '@/lib/api-helpers';

export const GET = withErrorHandler('Get profile error', async (request: NextRequest) => {
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

  const { password_hash, ...userWithoutPassword } = user;

  return NextResponse.json({ user: userWithoutPassword });
});

export const PUT = withErrorHandler('Update profile error', async (request: NextRequest) => {
  const auth = await authenticateRequest(request);
  if (!auth.success) return auth.response;

  const body = await parseJsonBody<{ nickname?: string; name?: string }>(request);
  if (!body.success) return body.response;

  const { nickname, name } = body.data;

  if (nickname === undefined && name === undefined) {
    return NextResponse.json(
      { error: 'At least one field (nickname or name) must be provided' },
      { status: 400 }
    );
  }

  if (nickname !== undefined && (typeof nickname !== 'string' || nickname.trim() === '')) {
    return NextResponse.json(
      { error: 'Nickname cannot be empty' },
      { status: 400 }
    );
  }

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

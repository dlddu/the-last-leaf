import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateRequest, clearAuthCookie, withErrorHandler } from '@/lib/api-helpers';

export const DELETE = withErrorHandler('Delete account error', async (request: NextRequest) => {
  const auth = await authenticateRequest(request);
  if (!auth.success) return auth.response;

  await prisma.user.delete({
    where: { user_id: auth.userId },
  });

  const response = NextResponse.json({
    success: true,
    message: 'Account deleted successfully',
  });

  clearAuthCookie(response);

  return response;
});

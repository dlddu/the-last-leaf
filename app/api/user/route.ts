import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateRequest, clearAuthCookie } from '@/lib/api-helpers';

export async function DELETE(request: NextRequest) {
  try {
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
  } catch (error) {
    console.error('Delete account error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

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

    // Fetch user profile
    const user = await prisma.user.findUnique({
      where: { user_id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Return user without password_hash
    const { password_hash, ...userWithoutPassword } = user as any;

    return NextResponse.json({ user: userWithoutPassword });
  } catch (error) {
    console.error('Get profile error:', error);
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

    const { nickname, name } = body;

    // Validate: at least nickname must be provided and non-empty
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

    // Build update data
    const updateData: Record<string, string> = {};
    if (nickname !== undefined) {
      updateData.nickname = nickname;
    }
    if (name !== undefined) {
      updateData.name = name;
    }

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { user_id: userId },
      data: updateData,
    });

    // Return updated user without password_hash
    const { password_hash, ...userWithoutPassword } = updatedUser as any;

    return NextResponse.json({ user: userWithoutPassword });
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

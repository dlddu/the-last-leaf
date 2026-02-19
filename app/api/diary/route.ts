import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateRequest, parseJsonBody } from '@/lib/api-helpers';
import { PAGINATION_DEFAULT_LIMIT, PAGINATION_MAX_LIMIT } from '@/lib/constants';

export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth.success) return auth.response;

    const { searchParams } = new URL(request.url);
    const cursor = searchParams.get('cursor');
    const limitParam = searchParams.get('limit');

    let limit = PAGINATION_DEFAULT_LIMIT;
    if (limitParam) {
      const parsedLimit = parseInt(limitParam, 10);
      if (!isNaN(parsedLimit) && parsedLimit > 0) {
        limit = Math.min(parsedLimit, PAGINATION_MAX_LIMIT);
      }
    }

    const queryOptions: any = {
      where: { user_id: auth.userId },
      orderBy: { created_at: 'desc' as const },
      take: limit + 1,
    };

    if (cursor && cursor.trim() !== '') {
      queryOptions.cursor = { diary_id: cursor };
      queryOptions.skip = 1;
    }

    const diaries = await prisma.diary.findMany(queryOptions);

    const hasMore = diaries.length > limit;
    const items = hasMore ? diaries.slice(0, limit) : diaries;
    const nextCursor = hasMore ? items[items.length - 1].diary_id : null;

    return NextResponse.json({
      diaries: items,
      nextCursor,
    });
  } catch (error) {
    console.error('Get diaries error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth.success) return auth.response;

    const body = await parseJsonBody<{ content?: string }>(request);
    if (!body.success) return body.response;

    const { content } = body.data;

    if (!content || typeof content !== 'string' || content.trim() === '') {
      return NextResponse.json(
        { error: 'Content is required and cannot be empty' },
        { status: 400 }
      );
    }

    const diary = await prisma.diary.create({
      data: {
        user_id: auth.userId,
        content,
      },
    });

    try {
      await prisma.user.update({
        where: { user_id: auth.userId },
        data: { last_active_at: new Date() },
      });
    } catch (error) {
      console.error('Failed to update last_active_at:', error);
    }

    return NextResponse.json(
      { diary_id: diary.diary_id },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create diary error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

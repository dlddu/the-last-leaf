import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { authenticateRequest, parseJsonBody, withErrorHandler, updateLastActive, validateContent } from '@/lib/api-helpers';
import { PAGINATION_DEFAULT_LIMIT, PAGINATION_MAX_LIMIT } from '@/lib/constants';

export const GET = withErrorHandler('Get diaries error', async (request: NextRequest) => {
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

  const queryOptions: Prisma.DiaryFindManyArgs = {
    where: { user_id: auth.userId },
    orderBy: { created_at: 'desc' },
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
});

export const POST = withErrorHandler('Create diary error', async (request: NextRequest) => {
  const auth = await authenticateRequest(request);
  if (!auth.success) return auth.response;

  const body = await parseJsonBody<{ content?: string }>(request);
  if (!body.success) return body.response;

  const contentError = validateContent(body.data.content);
  if (contentError) return contentError;

  const diary = await prisma.diary.create({
    data: {
      user_id: auth.userId,
      content: body.data.content as string,
    },
  });

  await updateLastActive(auth.userId);

  return NextResponse.json(
    { diary_id: diary.diary_id },
    { status: 201 }
  );
});

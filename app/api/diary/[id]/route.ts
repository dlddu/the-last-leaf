import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateRequest, parseJsonBody, withErrorHandler, updateLastActive, validateContent, requireDiaryOwnership } from '@/lib/api-helpers';

export const PUT = withErrorHandler('Update diary error', async (
  request: NextRequest,
  context?: { params: Promise<Record<string, string>> }
) => {
  const auth = await authenticateRequest(request);
  if (!auth.success) return auth.response;

  const { id } = await context!.params;

  const body = await parseJsonBody<{ content?: string }>(request);
  if (!body.success) return body.response;

  const ownership = await requireDiaryOwnership(id, auth.userId);
  if ('response' in ownership) return ownership.response;

  const contentError = validateContent(body.data.content);
  if (contentError) return contentError;

  const updatedDiary = await prisma.diary.update({
    where: { diary_id: id },
    data: { content: body.data.content as string },
  });

  await updateLastActive(auth.userId);

  return NextResponse.json({
    diary_id: updatedDiary.diary_id,
    content: updatedDiary.content,
    created_at: updatedDiary.created_at,
    updated_at: updatedDiary.updated_at,
  });
});

export const DELETE = withErrorHandler('Delete diary error', async (
  request: NextRequest,
  context?: { params: Promise<Record<string, string>> }
) => {
  const auth = await authenticateRequest(request);
  if (!auth.success) return auth.response;

  const { id } = await context!.params;

  const ownership = await requireDiaryOwnership(id, auth.userId);
  if ('response' in ownership) return ownership.response;

  await prisma.diary.delete({
    where: { diary_id: id },
  });

  return NextResponse.json(
    { message: 'Diary deleted successfully' },
    { status: 200 }
  );
});

export const GET = withErrorHandler('Get diary error', async (
  request: NextRequest,
  context?: { params: Promise<Record<string, string>> }
) => {
  const auth = await authenticateRequest(request);
  if (!auth.success) return auth.response;

  const { id } = await context!.params;

  const diary = await prisma.diary.findUnique({
    where: {
      diary_id: id,
      user_id: auth.userId,
    },
  });

  if (!diary) {
    return NextResponse.json(
      { error: 'Not found' },
      { status: 404 }
    );
  }

  return NextResponse.json({
    diary_id: diary.diary_id,
    content: diary.content,
    created_at: diary.created_at,
    updated_at: diary.updated_at,
  });
});

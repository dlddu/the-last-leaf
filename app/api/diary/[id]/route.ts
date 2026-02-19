import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateRequest, parseJsonBody } from '@/lib/api-helpers';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth.success) return auth.response;

    const { id } = await params;

    const body = await parseJsonBody<{ content?: string }>(request);
    if (!body.success) return body.response;

    const { content } = body.data;

    const diary = await prisma.diary.findUnique({
      where: { diary_id: id },
    });

    if (!diary) {
      return NextResponse.json(
        { error: 'Not found' },
        { status: 404 }
      );
    }

    if (diary.user_id !== auth.userId) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    if (!content || typeof content !== 'string' || content.trim() === '') {
      return NextResponse.json(
        { error: 'Content is required and cannot be empty' },
        { status: 400 }
      );
    }

    const updatedDiary = await prisma.diary.update({
      where: { diary_id: id },
      data: { content },
    });

    try {
      await prisma.user.update({
        where: { user_id: auth.userId },
        data: { last_active_at: new Date() },
      });
    } catch (error) {
      console.error('Failed to update last_active_at:', error);
    }

    return NextResponse.json({
      diary_id: updatedDiary.diary_id,
      content: updatedDiary.content,
      created_at: updatedDiary.created_at,
      updated_at: updatedDiary.updated_at,
    });
  } catch (error) {
    console.error('Update diary error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth.success) return auth.response;

    const { id } = await params;

    const diary = await prisma.diary.findUnique({
      where: { diary_id: id },
    });

    if (!diary) {
      return NextResponse.json(
        { error: 'Not found' },
        { status: 404 }
      );
    }

    if (diary.user_id !== auth.userId) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    await prisma.diary.delete({
      where: { diary_id: id },
    });

    return NextResponse.json(
      { message: 'Diary deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete diary error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth.success) return auth.response;

    const { id } = await params;

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
  } catch (error) {
    console.error('Get diary error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('postId');
    const status = searchParams.get('status');
    const where: any = {};
    if (postId) where.postId = postId;
    if (status) where.status = status;
    const comments = await db.comment.findMany({
      where,
      include: {
        author: { select: { id: true, name: true, avatar: true } },
        post: { select: { id: true, title: true, slug: true } },
        replies: { include: { author: { select: { id: true, name: true, avatar: true } } } }
      },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json({ comments });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, authorId, postId, parentId } = body;
    const comment = await db.comment.create({
      data: { content, authorId, postId, parentId: parentId || null, status: 'pending' },
      include: { author: { select: { id: true, name: true, avatar: true } } }
    });
    return NextResponse.json({ comment });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status } = body;
    const comment = await db.comment.update({ where: { id }, data: { status } });
    return NextResponse.json({ comment });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update comment' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Comment ID required' }, { status: 400 });
    await db.comment.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete comment' }, { status: 500 });
  }
}

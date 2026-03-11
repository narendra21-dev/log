import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const tags = await db.tag.findMany({
      include: { _count: { select: { posts: { where: { post: { published: true } } } } } },
      orderBy: { name: 'asc' }
    });
    return NextResponse.json({ tags: tags.map(t => ({ id: t.id, name: t.name, slug: t.slug, color: t.color, postCount: t._count.posts })) });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch tags' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, slug, color } = body;
    const tagSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const tag = await db.tag.create({ data: { name, slug: tagSlug, color: color || '#6b7280' } });
    return NextResponse.json({ tag });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create tag' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, slug, color } = body;
    const tag = await db.tag.update({ where: { id }, data: { name, slug, color } });
    return NextResponse.json({ tag });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update tag' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Tag ID required' }, { status: 400 });
    await db.postTag.deleteMany({ where: { tagId: id } });
    await db.tag.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete tag' }, { status: 500 });
  }
}

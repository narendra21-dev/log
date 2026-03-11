import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const published = searchParams.get('published');
    const featured = searchParams.get('featured');
    const categoryId = searchParams.get('categoryId');
    const tagId = searchParams.get('tagId');
    const search = searchParams.get('search');
    const slug = searchParams.get('slug');
    const limit = parseInt(searchParams.get('limit') || '1000');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (slug) {
      const post = await db.post.findUnique({
        where: { slug },
        include: {
          author: { select: { id: true, name: true, avatar: true, bio: true } },
          category: true,
          tags: { include: { tag: true } },
          comments: {
            where: { status: 'approved', parentId: null },
            include: {
              author: { select: { id: true, name: true, avatar: true } },
              replies: { include: { author: { select: { id: true, name: true, avatar: true } } } }
            },
            orderBy: { createdAt: 'desc' }
          }
        }
      });
      if (!post) return NextResponse.json({ error: 'Post not found' }, { status: 404 });
      await db.post.update({ where: { id: post.id }, data: { viewCount: { increment: 1 } } });
      return NextResponse.json({ post });
    }

    const where: any = {};
    if (published === 'true') where.published = true;
    if (published === 'false') where.published = false;
    if (featured === 'true') where.featured = true;
    if (categoryId) where.categoryId = categoryId;
    if (tagId) where.tags = { some: { tagId } };
    if (search) where.OR = [{ title: { contains: search } }, { excerpt: { contains: search } }, { content: { contains: search } }];

    const [posts, total] = await Promise.all([
      db.post.findMany({
        where,
        include: {
          author: { select: { id: true, name: true, avatar: true } },
          category: true,
          tags: { include: { tag: true } },
          _count: { select: { comments: { where: { status: 'approved' } } } }
        },
        orderBy: [{ featured: 'desc' }, { publishedAt: 'desc' }, { createdAt: 'desc' }],
        take: limit,
        skip: offset
      }),
      db.post.count({ where })
    ]);

    return NextResponse.json({ posts, total });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, slug, excerpt, content, coverImage, published, featured, authorId, categoryId, readTime } = body;
    const postSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const post = await db.post.create({
      data: {
        title, slug: postSlug, excerpt, content: content || '', coverImage,
        published: published || false, featured: featured || false, readTime: readTime || 5,
        authorId, categoryId: categoryId || null, publishedAt: published ? new Date() : null
      },
      include: { author: { select: { id: true, name: true, avatar: true } }, category: true, tags: { include: { tag: true } } }
    });
    return NextResponse.json({ post });
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, title, slug, excerpt, content, coverImage, published, featured, categoryId, readTime } = body;
    const existingPost = await db.post.findUnique({ where: { id } });
    let publishedAt = existingPost?.publishedAt;
    if (published && !existingPost?.published) publishedAt = new Date();
    const post = await db.post.update({
      where: { id },
      data: { title, slug, excerpt, content, coverImage, published, featured, readTime, categoryId: categoryId || null, publishedAt },
      include: { author: { select: { id: true, name: true, avatar: true } }, category: true, tags: { include: { tag: true } } }
    });
    return NextResponse.json({ post });
  } catch (error) {
    console.error('Error updating post:', error);
    return NextResponse.json({ error: 'Failed to update post' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Post ID required' }, { status: 400 });
    await db.post.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting post:', error);
    return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 });
  }
}

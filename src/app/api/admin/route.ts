import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const [totalPosts, publishedPosts, totalCategories, totalTags, totalComments, pendingComments, totalViews] = await Promise.all([
      db.post.count(),
      db.post.count({ where: { published: true } }),
      db.category.count(),
      db.tag.count(),
      db.comment.count(),
      db.comment.count({ where: { status: 'pending' } }),
      db.post.aggregate({ _sum: { viewCount: true } })
    ]);
    const recentPosts = await db.post.findMany({ take: 5, orderBy: { createdAt: 'desc' }, include: { author: { select: { name: true } }, category: { select: { name: true } } } });
    const popularPosts = await db.post.findMany({ take: 5, where: { published: true }, orderBy: { viewCount: 'desc' }, include: { category: { select: { name: true } } } });
    const postsByCategory = await db.category.findMany({ include: { _count: { select: { posts: true } } } });
    return NextResponse.json({
      stats: { totalPosts, publishedPosts, draftPosts: totalPosts - publishedPosts, totalCategories, totalTags, totalComments, pendingComments, totalViews: totalViews._sum.viewCount || 0 },
      recentPosts, popularPosts,
      postsByCategory: postsByCategory.map(c => ({ name: c.name, count: c._count.posts }))
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}

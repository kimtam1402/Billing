import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Movie from '@/models/Movie';
import { requireAdmin, forbiddenResponse, unauthorizedResponse } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const payload = requireAdmin(request);
  if (!payload) return forbiddenResponse('Chỉ admin mới có quyền truy cập');

  try {
    await connectDB();

    const [totalUsers, totalMovies, users, movies] = await Promise.all([
      User.countDocuments(),
      Movie.countDocuments(),
      User.find().select('-password').sort({ createdAt: -1 }),
      Movie.find().sort({ views: -1 }),
    ]);

    // Revenue: sum of all subscriptions (users with paid plan)
    const planRevenue = users.reduce((sum, u) => {
      const prices: Record<string, number> = { FREE: 0, PLUS: 30000, PRO: 80000, PREMIUM: 200000 };
      return sum + (prices[u.plan] || 0);
    }, 0);

    const totalBalance = users.reduce((sum, u) => sum + (u.balance || 0), 0);

    const planStats = {
      FREE: users.filter(u => u.plan === 'FREE').length,
      PLUS: users.filter(u => u.plan === 'PLUS').length,
      PRO: users.filter(u => u.plan === 'PRO').length,
      PREMIUM: users.filter(u => u.plan === 'PREMIUM').length,
    };

    const totalViews = movies.reduce((sum, m) => sum + (m.views || 0), 0);

    // New users per day (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const newUsersThisWeek = users.filter(u => new Date(u.createdAt) > sevenDaysAgo).length;

    return NextResponse.json({
      stats: {
        totalUsers,
        totalMovies,
        planRevenue,
        totalBalance,
        planStats,
        totalViews,
        newUsersThisWeek,
      },
      topMovies: movies.slice(0, 5).map(m => ({
        _id: m._id.toString(),
        title: m.title,
        views: m.views,
        thumbnail: m.thumbnail,
        requiredPlan: m.requiredPlan,
      })),
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
  }
}

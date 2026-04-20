import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { getUserFromRequest, unauthorizedResponse } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const payload = getUserFromRequest(request);
  if (!payload) return unauthorizedResponse();

  try {
    await connectDB();
    const user = await User.findById(payload.userId).select('-password');
    if (!user) return unauthorizedResponse('Người dùng không tồn tại');

    return NextResponse.json({
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        plan: user.plan,
        subscriptionEnd: user.subscriptionEnd,
        favoriteMovies: user.favoriteMovies,
        balance: user.balance,
        createdAt: user.createdAt,
        isAdmin: user.isAdmin || false,
      },
    });
  } catch (error) {
    console.error('Me error:', error);
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { getUserFromRequest, unauthorizedResponse } from '@/lib/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ movieId: string }> }
) {
  const payload = getUserFromRequest(request);
  if (!payload) return unauthorizedResponse();

  try {
    await connectDB();
    const { movieId } = await params;
    const user = await User.findById(payload.userId);
    if (!user) return NextResponse.json({ error: 'Người dùng không tồn tại' }, { status: 404 });

    const isFav = user.favoriteMovies.includes(movieId);
    if (isFav) {
      user.favoriteMovies = user.favoriteMovies.filter((id: string) => id !== movieId);
    } else {
      user.favoriteMovies.push(movieId);
    }
    await user.save();

    return NextResponse.json({ favoriteMovies: user.favoriteMovies, isFavorite: !isFav });
  } catch (error) {
    console.error('Favorites error:', error);
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
  }
}

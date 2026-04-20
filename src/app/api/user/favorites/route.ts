import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Movie from '@/models/Movie';
import { getUserFromRequest, unauthorizedResponse } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const payload = getUserFromRequest(request);
  if (!payload) return unauthorizedResponse();

  try {
    await connectDB();
    
    // Find user
    const user = await User.findById(payload.userId);
    if (!user) return NextResponse.json({ error: 'Người dùng không tồn tại' }, { status: 404 });

    // Ensure favoriteMovies array exists
    if (!user.favoriteMovies || user.favoriteMovies.length === 0) {
      return NextResponse.json({ favorites: [] });
    }

    // Populate the favorite movies from Movie schema.
    const favoriteMovies = await Movie.find({
      _id: { $in: user.favoriteMovies }
    });

    return NextResponse.json({ favorites: favoriteMovies });
  } catch (error) {
    console.error('Fetch favorites error:', error);
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
  }
}

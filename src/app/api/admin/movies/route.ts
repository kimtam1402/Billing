import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Movie from '@/models/Movie';
import { requireAdmin, forbiddenResponse } from '@/lib/auth';

// GET all movies (admin, no plan check)
export async function GET(request: NextRequest) {
  const payload = requireAdmin(request);
  if (!payload) return forbiddenResponse('Chỉ admin mới có quyền truy cập');

  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = 20;

    const query = search ? { title: { $regex: search, $options: 'i' } } : {};

    const [movies, total] = await Promise.all([
      Movie.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
      Movie.countDocuments(query),
    ]);

    return NextResponse.json({ movies, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    console.error('Admin movies error:', error);
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
  }
}

// POST create new movie
export async function POST(request: NextRequest) {
  const payload = requireAdmin(request);
  if (!payload) return forbiddenResponse('Chỉ admin mới có quyền truy cập');

  try {
    await connectDB();
    const body = await request.json();

    const { title, description, videoUrl, thumbnail, trailerUrl, requiredPlan, genre, rating, year, duration, director, cast, featured } = body;

    if (!title || !description || !videoUrl || !thumbnail) {
      return NextResponse.json({ error: 'Thiếu thông tin bắt buộc' }, { status: 400 });
    }

    const movie = await Movie.create({
      title,
      description,
      videoUrl,
      thumbnail,
      trailerUrl,
      requiredPlan: requiredPlan || 'FREE',
      isFree: requiredPlan === 'FREE',
      genre: Array.isArray(genre) ? genre : (genre ? genre.split(',').map((g: string) => g.trim()) : []),
      rating: Number(rating) || 0,
      year: Number(year) || new Date().getFullYear(),
      duration: duration || '',
      director: director || '',
      cast: Array.isArray(cast) ? cast : (cast ? cast.split(',').map((c: string) => c.trim()) : []),
      featured: Boolean(featured),
      views: 0,
    });

    return NextResponse.json({ success: true, movie }, { status: 201 });
  } catch (error) {
    console.error('Admin create movie error:', error);
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
  }
}

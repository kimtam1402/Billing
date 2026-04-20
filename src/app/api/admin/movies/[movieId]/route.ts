import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Movie from '@/models/Movie';
import { requireAdmin, forbiddenResponse } from '@/lib/auth';

// PATCH update movie
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ movieId: string }> }
) {
  const payload = requireAdmin(request);
  if (!payload) return forbiddenResponse('Chỉ admin mới có quyền truy cập');

  try {
    await connectDB();
    const { movieId } = await params;
    const body = await request.json();

    if (body.genre && typeof body.genre === 'string') {
      body.genre = body.genre.split(',').map((g: string) => g.trim());
    }
    if (body.cast && typeof body.cast === 'string') {
      body.cast = body.cast.split(',').map((c: string) => c.trim());
    }
    if (body.rating !== undefined) body.rating = Number(body.rating);
    if (body.year !== undefined) body.year = Number(body.year);
    if (body.requiredPlan !== undefined) body.isFree = body.requiredPlan === 'FREE';

    const movie = await Movie.findByIdAndUpdate(
      movieId,
      { $set: body },
      { new: true }
    );

    if (!movie) return NextResponse.json({ error: 'Không tìm thấy phim' }, { status: 404 });

    return NextResponse.json({ success: true, movie });
  } catch (error) {
    console.error('Admin update movie error:', error);
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
  }
}

// DELETE movie
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ movieId: string }> }
) {
  const payload = requireAdmin(request);
  if (!payload) return forbiddenResponse('Chỉ admin mới có quyền truy cập');

  try {
    await connectDB();
    const { movieId } = await params;

    const movie = await Movie.findByIdAndDelete(movieId);
    if (!movie) return NextResponse.json({ error: 'Không tìm thấy phim' }, { status: 404 });

    return NextResponse.json({ success: true, message: 'Đã xóa phim' });
  } catch (error) {
    console.error('Admin delete movie error:', error);
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
  }
}

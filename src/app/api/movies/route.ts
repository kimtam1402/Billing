import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Movie from '@/models/Movie';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const genre = searchParams.get('genre');
    const plan = searchParams.get('plan');
    const featured = searchParams.get('featured');
    const search = searchParams.get('search');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = {};

    if (genre && genre !== 'all') query.genre = { $in: [genre] };
    if (plan === 'free') query.isFree = true;
    if (plan === 'premium') query.isFree = false;
    if (featured === 'true') query.featured = true;
    if (search) query.title = { $regex: search, $options: 'i' };

    const movies = await Movie.find(query).sort({ createdAt: -1 }).lean();

    return NextResponse.json({ movies });
  } catch (error) {
    console.error('Get movies error:', error);
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const user = getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    await connectDB();
    const body = await request.json();
    const movie = await Movie.create(body);
    return NextResponse.json({ movie }, { status: 201 });
  } catch (error) {
    console.error('Create movie error:', error);
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
  }
}

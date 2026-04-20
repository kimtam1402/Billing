import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Movie from '@/models/Movie';
import User from '@/models/User';
import { SEED_MOVIES } from '@/lib/seed-data';

export async function POST(request: NextRequest) {
  const secret = request.headers.get('x-seed-secret');
  if (secret !== 'cinestream-seed-2024') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    await connectDB();
    
    // Seed Movies
    await Movie.deleteMany({});
    const movies = await Movie.insertMany(SEED_MOVIES);

    // Seed Test Users (FREE, PLUS, PRO, PREMIUM)
    await User.deleteMany({ email: { $in: ['free@test.com', 'plus@test.com', 'pro@test.com', 'premium@test.com'] } });

    // Note: The pre('save') hook in User model hashes the password automatically.
    // So we must use .create() or .save() to trigger it, not insertMany.
    const testUsers = [
      { name: 'FREE User', email: 'free@test.com', password: 'password123', plan: 'FREE' },
      { name: 'PLUS User', email: 'plus@test.com', password: 'password123', plan: 'PLUS', subscriptionEnd: new Date(Date.now() + 30*24*60*60*1000) },
      { name: 'PRO User', email: 'pro@test.com', password: 'password123', plan: 'PRO', subscriptionEnd: new Date(Date.now() + 30*24*60*60*1000) },
      { name: 'PREMIUM User', email: 'premium@test.com', password: 'password123', plan: 'PREMIUM', subscriptionEnd: new Date(Date.now() + 30*24*60*60*1000) },
    ];

    const createdUsers = [];
    for (const u of testUsers) {
      const newUser = await User.create(u);
      createdUsers.push(newUser);
    }

    return NextResponse.json({ 
      success: true, 
      moviesCount: movies.length, 
      usersCount: createdUsers.length,
      users: testUsers.map(u => ({ email: u.email, password: u.password, plan: u.plan }))
    });
  } catch (error: any) {
    console.error('Seed error:', error);
    return NextResponse.json({ error: error.message || 'Lỗi server' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Movie from '@/models/Movie';
import User from '@/models/User';
import { getUserFromRequest } from '@/lib/auth';
import { PLAN_HIERARCHY } from '@/lib/plans';
import { PlanType } from '@/models/User';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const movie = await Movie.findById(id).lean();
    if (!movie) {
      return NextResponse.json({ error: 'Phim không tồn tại' }, { status: 404 });
    }

    const authUser = getUserFromRequest(request);
    let userPlan: PlanType = 'FREE';

    if (authUser) {
      const dbUser = await User.findById(authUser.userId).select('plan subscriptionEnd');
      if (dbUser) {
        if (dbUser.plan !== 'FREE' && dbUser.subscriptionEnd && new Date(dbUser.subscriptionEnd) < new Date()) {
          userPlan = 'FREE';
        } else {
          userPlan = dbUser.plan;
        }
      }
    }

    const requiredPlan = (movie as { requiredPlan: PlanType }).requiredPlan;
    const canAccess = PLAN_HIERARCHY[userPlan] >= PLAN_HIERARCHY[requiredPlan];

    // Increment view
    await Movie.findByIdAndUpdate(id, { $inc: { views: 1 } });

    // Track watch history
    if (authUser) {
      await User.findByIdAndUpdate(authUser.userId, {
        $push: {
          watchHistory: {
            $each: [{ movieId: id, watchedAt: new Date() }],
            $slice: -50,
          },
        },
      });
    }

    return NextResponse.json({ movie, canAccess, userPlan });
  } catch (error) {
    console.error('Get movie error:', error);
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
  }
}

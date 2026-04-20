import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { getUserFromRequest, unauthorizedResponse } from '@/lib/auth';
import { getSubscriptionEndDate, PLANS } from '@/lib/plans';
import { PlanType } from '@/models/User';

export async function POST(request: NextRequest) {
  const payload = getUserFromRequest(request);
  if (!payload) return unauthorizedResponse();

  try {
    await connectDB();
    const { plan } = await request.json() as { plan: PlanType };

    if (!['FREE', 'PLUS', 'PRO', 'PREMIUM'].includes(plan)) {
      return NextResponse.json({ error: 'Gói không hợp lệ' }, { status: 400 });
    }

    const endDate = plan === 'FREE' ? undefined : getSubscriptionEndDate(plan);
    const planPrice = PLANS[plan].price;

    const user = await User.findById(payload.userId);
    if (!user) return NextResponse.json({ error: 'Người dùng không tồn tại' }, { status: 404 });

    if (plan !== 'FREE') {
      const currentBalance = user.balance || 0;
      if (currentBalance < planPrice) {
        return NextResponse.json({ error: 'Số dư không đủ. Vui lòng nạp thêm tiền.' }, { status: 400 });
      }
      user.balance = currentBalance - planPrice;
    }

    user.plan = plan;
    user.subscriptionStart = plan === 'FREE' ? undefined : new Date();
    user.subscriptionEnd = endDate;

    await user.save();
    
    // Convert to plain object to omit password
    const safeUser = {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        plan: user.plan,
        subscriptionEnd: user.subscriptionEnd,
        favoriteMovies: user.favoriteMovies,
        balance: user.balance,
    };

    return NextResponse.json({
      success: true,
      message: `Nâng cấp lên gói ${plan} thành công!`,
      user: safeUser,
    });
  } catch (error) {
    console.error('Subscribe error:', error);
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
  }
}

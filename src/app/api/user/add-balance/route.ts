import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { getUserFromRequest, unauthorizedResponse } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const payload = getUserFromRequest(request);
  if (!payload) return unauthorizedResponse();

  try {
    await connectDB();
    const { amount } = await request.json();
    const numAmount = Number(amount);
    
    if (isNaN(numAmount) || numAmount <= 0) {
      return NextResponse.json({ error: 'Số tiền không hợp lệ' }, { status: 400 });
    }

    const user = await User.findByIdAndUpdate(
      payload.userId,
      { $inc: { balance: numAmount } },
      { new: true }
    ).select('-password');

    if (!user) {
      return NextResponse.json({ error: 'Người dùng không tồn tại' }, { status: 404 });
    }

    // ✅ GỌI N8N WEBHOOK
    try {
      await fetch('http://localhost:5678/webhook-test/52d0e7bc-9c63-4eb8-af60-47a61d23f029', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: payload.userId,
          amount: numAmount,
          balance: user.balance,
          time: new Date().toISOString(),
        }),
      });
    } catch (err) {
      console.error('n8n webhook error:', err);
      // ❗ không nên fail cả API chỉ vì webhook lỗi
    }

    return NextResponse.json({ 
      success: true, 
      balance: user.balance,
      message: `Đã nạp ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(numAmount)} thành công!`
    });

  } catch (error) {
    console.error('Topup error:', error);
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
  }
}
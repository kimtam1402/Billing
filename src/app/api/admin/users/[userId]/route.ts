import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { requireAdmin, forbiddenResponse } from '@/lib/auth';

// PATCH update user
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const payload = requireAdmin(request);
  if (!payload) return forbiddenResponse('Chỉ admin mới có quyền truy cập');

  try {
    await connectDB();
    const { userId } = await params;
    const body = await request.json();

    // Allowed fields to update
    const allowedFields: Record<string, unknown> = {};
    if (body.plan !== undefined) allowedFields.plan = body.plan;
    if (body.balance !== undefined) allowedFields.balance = Number(body.balance);
    if (body.isAdmin !== undefined) allowedFields.isAdmin = body.isAdmin;
    if (body.name !== undefined) allowedFields.name = body.name;

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: allowedFields },
      { new: true }
    ).select('-password');

    if (!user) return NextResponse.json({ error: 'Không tìm thấy người dùng' }, { status: 404 });

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error('Admin update user error:', error);
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
  }
}

// DELETE user  
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const payload = requireAdmin(request);
  if (!payload) return forbiddenResponse('Chỉ admin mới có quyền truy cập');

  try {
    await connectDB();
    const { userId } = await params;

    // Prevent deleting yourself
    if (userId === payload.userId) {
      return NextResponse.json({ error: 'Không thể xóa chính mình' }, { status: 400 });
    }

    const user = await User.findByIdAndDelete(userId);
    if (!user) return NextResponse.json({ error: 'Không tìm thấy người dùng' }, { status: 404 });

    return NextResponse.json({ success: true, message: 'Đã xóa người dùng' });
  } catch (error) {
    console.error('Admin delete user error:', error);
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
  }
}

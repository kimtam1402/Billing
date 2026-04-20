'use client';

import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { User, Mail } from 'lucide-react';
import Link from 'next/link';
import { PLANS } from '@/lib/plans';

export default function ProfilePage() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login?redirect=/profile');
    }
  }, [user, loading, router]);

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center"><span className="text-white">Đang tải...</span></div>;
  if (!user) return null;

  const planInfo = PLANS[user.plan];
  const joinDate = user.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : 'N/A';
  const subEnd = user.subscriptionEnd ? new Date(user.subscriptionEnd).toLocaleDateString('vi-VN') : null;

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 bg-black">
      <div className="max-w-[800px] mx-auto">
        
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-10">Tài khoản</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="md:col-span-1 space-y-4">
             <div className="bg-zinc-900 border border-zinc-800 rounded px-6 py-8 text-center flex flex-col items-center">
                <div className="w-20 h-20 bg-zinc-800 rounded border border-zinc-700 flex items-center justify-center text-3xl font-bold text-white mb-4">
                   {user.name.charAt(0).toUpperCase()}
                </div>
                <h2 className="text-xl font-bold text-white mb-1">{user.name}</h2>
                <div className="text-sm text-zinc-500 mb-4 tracking-wide text-center">Gia nhập: {joinDate}</div>
             </div>

             <div className="bg-zinc-900 border border-zinc-800 rounded overflow-hidden">
                <button onClick={logout} className="w-full text-left px-6 py-4 text-sm font-medium text-red-500 hover:bg-zinc-800 transition-colors">
                  Đăng xuất tài khoản
                </button>
             </div>
          </div>

          <div className="md:col-span-2 space-y-6">
            
            {/* Plan Info */}
            <div className="border border-zinc-800 rounded p-6">
               <h3 className="text-lg font-semibold text-white mb-6 uppercase tracking-wider text-sm flex items-center justify-between">
                  <span>Gói Dịch Vụ</span>
                  <span className={`badge badge-${user.plan.toLowerCase()}`}>{user.plan}</span>
               </h3>

               <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                  <div>
                    <div className="text-xs text-zinc-500 mb-1">Gói hiện tại</div>
                    <div className="text-zinc-200 font-medium">{planInfo.label}</div>
                  </div>
                  {subEnd && (
                    <div>
                      <div className="text-xs text-zinc-500 mb-1">Ngày hết hạn</div>
                      <div className="text-zinc-200 font-medium">{subEnd}</div>
                    </div>
                  )}
               </div>

               <div className="border-t border-zinc-800 pt-6">
                 {user.plan === 'FREE' ? (
                   <p className="text-sm text-zinc-400 mb-4">Nâng cấp để xem 4K không quảng cáo.</p>
                 ) : null}
                 <Link href="/pricing" className="inline-block bg-white text-black font-semibold px-6 py-2 rounded text-sm hover:bg-zinc-200 transition-colors">
                   {user.plan === 'FREE' ? 'Nâng cấp ngay' : 'Đổi gói dịch vụ'}
                 </Link>
               </div>
            </div>

            {/* User Info */}
            <div className="border border-zinc-800 rounded p-6">
              <h3 className="text-lg font-semibold text-white mb-6 uppercase tracking-wider text-sm">Hồ sơ</h3>
              
              <div className="space-y-6">
                 <div className="flex items-center gap-4">
                   <User className="w-5 h-5 text-zinc-500" />
                   <div>
                     <div className="text-xs text-zinc-500">Tên hiển thị</div>
                     <div className="text-zinc-200 font-medium">{user.name}</div>
                   </div>
                 </div>

                 <div className="flex items-center gap-4">
                   <Mail className="w-5 h-5 text-zinc-500" />
                   <div>
                     <div className="text-xs text-zinc-500">Địa chỉ Email</div>
                     <div className="text-zinc-200 font-medium">{user.email}</div>
                   </div>
                 </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}

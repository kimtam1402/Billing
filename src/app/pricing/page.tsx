'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { PLANS } from '@/lib/plans';
import { PlanType } from '@/models/User';
import { Check, X, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function PricingPage() {
  const { user, token, refreshUser } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [confirmPlan, setConfirmPlan] = useState<PlanType | null>(null);

  const handleSubscribeClick = (plan: PlanType) => {
    if (!user) {
      router.push('/login');
      return;
    }
    if (user.plan === plan) {
      toast('Bạn đang dùng gói này rồi!', { icon: '✅' });
      return;
    }
    
    // Check balance if they need to pay
    const planPrice = PLANS[plan].price;
    const currentBalance = user.balance || 0;
    if (plan !== 'FREE' && currentBalance < planPrice) {
      toast.error('Số dư không đủ. Vui lòng nạp thêm tiền!');
      router.push('/topup');
      return;
    }

    setConfirmPlan(plan);
  };

  const handleConfirmSubscribe = async () => {
    if (!confirmPlan) return;
    
    setLoading(confirmPlan);
    try {
      const res = await fetch('/api/user/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ plan: confirmPlan }),
      });
      const data = await res.json();
      if (res.ok) {
        await refreshUser();
        toast.success(data.message || `Đăng ký gói ${confirmPlan} thành công!`);
      } else {
        toast.error(data.error || 'Có lỗi xảy ra');
      }
    } catch {
      toast.error('Lỗi kết nối');
    } finally {
      setLoading(null);
      setConfirmPlan(null);
    }
  };

  const planList = Object.values(PLANS);

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 bg-black">
      <div className="max-w-[1200px] mx-auto">
        
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
            Chọn gói dịch vụ phù hợp
          </h1>
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
            Không có phí ẩn, không có cam kết phức tạp. Hủy bất cứ lúc nào.
          </p>
        </div>

        {/* User Balance Overview */}
        {user && (
          <div className="bg-zinc-900 border border-zinc-800 rounded mx-auto max-w-2xl px-6 py-6 mb-10 flex flex-col md:flex-row items-center gap-4 justify-between">
             <div className="flex flex-col items-center md:items-start gap-2">
                 <div className="flex items-center gap-3">
                     <span className="text-sm text-zinc-400">Số dư khả dụng:</span>
                     <span className="text-2xl font-bold text-white">
                         {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(user.balance || 0)}
                     </span>
                 </div>
                 <div className="flex items-center gap-2">
                     <span className="text-sm text-zinc-400">Gói hiện tại:</span>
                     <span className={`badge badge-${user.plan.toLowerCase()} text-xs px-2 py-0.5`}>
                        {PLANS[user.plan].label}
                     </span>
                     {user.subscriptionEnd && (
                        <span className="text-xs text-zinc-500">
                          (Đến: {new Date(user.subscriptionEnd).toLocaleDateString('vi-VN')})
                        </span>
                     )}
                 </div>
             </div>
             <button 
                 onClick={() => router.push('/topup')}
                 className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium transition-colors"
             >
                 Nạp Tiền Ngay
             </button>
          </div>
        )}

        {/* Pricing Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-20 items-stretch">
          {planList.map((plan) => {
             const isCurrent = user?.plan === plan.name;
             const isPremium = plan.name === 'PREMIUM';

             return (
               <div 
                 key={plan.name}
                 className={`flex flex-col rounded p-6 transition-all ${
                    isPremium 
                      ? 'bg-zinc-800 border-2 border-[#E50914]' 
                      : 'bg-zinc-900 border border-zinc-800'
                 }`}
               >
                 <div className="mb-4 flex items-center justify-between">
                    <span className="text-xl font-bold text-white">{plan.label}</span>
                    <span className={`badge badge-${plan.name.toLowerCase()}`}>{plan.name}</span>
                 </div>
                 
                 <div className="mb-6">
                    <div className="text-3xl font-bold text-white tracking-tight">
                       {plan.priceLabel}
                    </div>
                    <div className="text-sm text-zinc-400 mt-1">/ {plan.period || 'tháng'}</div>
                 </div>

                 <p className="text-sm text-zinc-400 mb-8 min-h-[40px]">
                    {plan.description}
                 </p>

                 <div className="flex-1 space-y-4 mb-8">
                    {plan.features.map(f => (
                       <div key={f} className="flex gap-3 text-sm text-zinc-300">
                          <Check className="w-5 h-5 text-white shrink-0" />
                          <span>{f}</span>
                       </div>
                    ))}
                    {plan.notIncluded.map(f => (
                       <div key={f} className="flex gap-3 text-sm text-zinc-600">
                          <X className="w-5 h-5 shrink-0" />
                          <span>{f}</span>
                       </div>
                    ))}
                 </div>

                 <button
                    onClick={() => handleSubscribeClick(plan.name as PlanType)}
                    disabled={!!loading || isCurrent}
                    className={`w-full py-3 rounded text-sm font-semibold transition-colors ${
                       isCurrent 
                         ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                         : isPremium
                           ? 'bg-[#E50914] text-white hover:bg-[#f40612]'
                           : 'bg-zinc-700 text-white hover:bg-zinc-600'
                    }`}
                 >
                    {loading === plan.name ? (
                       <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                    ) : isCurrent ? 'Đang sử dụng' : 'Nâng cấp'}
                 </button>
               </div>
             );
          })}
        </div>

        {/* Feature Comparison */}
        <div className="max-w-[1000px] mx-auto border-t border-zinc-800 pt-16 mt-16">
           <h2 className="text-center text-3xl font-bold text-white mb-10">Tính năng chi tiết</h2>
           
           <div className="overflow-x-auto">
             <table className="w-full text-left min-w-[600px] border-collapse bg-transparent">
               <thead>
                 <tr>
                   <th className="py-4 border-b border-zinc-800"></th>
                   {['MIỄN PHÍ', 'PLUS', 'PRO', 'PREMIUM'].map(p => (
                     <th key={p} className="py-4 text-center border-b border-zinc-800 font-semibold text-zinc-300">
                        {p}
                     </th>
                   ))}
                 </tr>
               </thead>
               <tbody className="text-sm">
                 {[
                   { label: 'Chất lượng video', cols: ['SD', 'HD (720p)', 'Full HD (1080p)', '4K + HDR'] },
                   { label: 'Thiết bị xem cùng lúc', cols: ['1', '1', '2', '4'] },
                   { label: 'Tải xuống', cols: ['-', '-', 'Có', 'Có'] },
                   { label: 'Quảng cáo', cols: ['Nhiều', 'Ít', 'Ít', 'Không'] }
                 ].map((row, idx) => (
                   <tr key={idx} className="border-b border-zinc-800/50 hover:bg-zinc-900/50 transition-colors">
                     <td className="py-5 font-medium text-zinc-400">{row.label}</td>
                     {row.cols.map((col, i) => (
                       <td key={i} className={`py-5 text-center font-medium ${col === '-' ? 'text-zinc-700' : 'text-white'}`}>
                         {col}
                       </td>
                     ))}
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
        </div>

      </div>

      {/* Confirmation Popup */}
      {confirmPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
           <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 max-w-md w-full shadow-2xl relative">
              <h3 className="text-xl font-bold text-white mb-2">Xác nhận thanh toán</h3>
              <p className="text-zinc-400 mb-6 text-sm">
                Bạn có chắc chắn muốn nâng cấp lên gói <span className="font-bold text-white">{PLANS[confirmPlan].label}</span> với giá <span className="font-bold text-[#E50914]">{PLANS[confirmPlan].priceLabel}</span> không? Số tiền này sẽ được trừ trực tiếp vào số dư của bạn.
              </p>
              
              <div className="flex gap-3 justify-end">
                 <button 
                   onClick={() => setConfirmPlan(null)}
                   disabled={!!loading}
                   className="px-5 py-2.5 rounded text-sm font-semibold bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors"
                 >
                   Hủy
                 </button>
                 <button 
                   onClick={handleConfirmSubscribe}
                   disabled={!!loading}
                   className="flex items-center gap-2 px-5 py-2.5 rounded text-sm font-semibold bg-[#E50914] text-white hover:bg-[#f40612] transition-colors"
                 >
                   {loading === confirmPlan && <Loader2 className="w-4 h-4 animate-spin" />}
                   Đồng ý nâng cấp
                 </button>
              </div>
           </div>
        </div>
      )}

    </div>
  );
}

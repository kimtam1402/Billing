'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { X, Crown, Check, Loader2 } from 'lucide-react';
import { PLANS } from '@/lib/plans';
import toast from 'react-hot-toast';
import { PlanType } from '@/models/User';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  requiredPlan: PlanType;
  movieTitle?: string;
}

export default function UpgradeModal({ isOpen, onClose, requiredPlan, movieTitle }: UpgradeModalProps) {
  const { user, token, refreshUser } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubscribe = async (plan: PlanType) => {
    if (!user) {
      router.push('/login');
      return;
    }
    setLoading(plan);
    try {
      const res = await fetch('/api/user/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (res.ok) {
        await refreshUser();
        toast.success(data.message || `Đăng ký gói ${plan} thành công!`);
        onClose();
      } else {
        toast.error(data.error || 'Có lỗi xảy ra');
      }
    } catch {
      toast.error('Lỗi kết nối');
    } finally {
      setLoading(null);
    }
  };

  const recommendedPlans = Object.values(PLANS).filter(
    (p) => p.name !== 'FREE'
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fadeIn">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-2xl glass rounded-3xl p-6 border border-white/10 shadow-2xl animate-fadeInUp">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Crown className="w-5 h-5 text-amber-400" />
              <h2 className="text-xl font-bold text-white">Nâng cấp để xem</h2>
            </div>
            {movieTitle && (
              <p className="text-sm text-gray-400">
                &#34;{movieTitle}&#34; yêu cầu gói{' '}
                <span className={`font-bold plan-badge-${requiredPlan} px-2 py-0.5 rounded-full text-xs`}>
                  {requiredPlan}
                </span>{' '}
                hoặc cao hơn
              </p>
            )}
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Plans grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {recommendedPlans.map((plan) => {
            const isPlanSufficient = plan.name === requiredPlan ||
              ['PLUS', 'PRO', 'PREMIUM'].indexOf(plan.name as string) >=
              ['PLUS', 'PRO', 'PREMIUM'].indexOf(requiredPlan as string);

            return (
              <div
                key={plan.name}
                className={`relative rounded-2xl p-4 border transition-all ${
                  plan.badge
                    ? 'border-white/20 bg-white/5'
                    : 'border-white/10 bg-white/3'
                } ${!isPlanSufficient ? 'opacity-40' : ''}`}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="text-xs font-bold bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-1 rounded-full whitespace-nowrap">
                      {plan.badge}
                    </span>
                  </div>
                )}

                <div className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold mb-3 plan-badge-${plan.name}`}>
                  {plan.label}
                </div>

                <div className="mb-1">
                  <span className="text-2xl font-black text-white">{plan.priceLabel}</span>
                  {plan.period && <span className="text-sm text-gray-400">/{plan.period}</span>}
                </div>
                <p className="text-xs text-gray-400 mb-3">{plan.description}</p>

                <ul className="space-y-1 mb-4">
                  {plan.features.slice(0, 3).map((f) => (
                    <li key={f} className="flex items-start gap-1.5 text-xs text-gray-300">
                      <Check className="w-3 h-3 text-green-400 mt-0.5 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleSubscribe(plan.name as PlanType)}
                  disabled={!!loading || !isPlanSufficient}
                  className={`w-full py-2 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                    isPlanSufficient
                      ? `bg-gradient-to-r ${plan.color} text-white hover:opacity-90 hover:scale-105`
                      : 'bg-white/10 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {loading === plan.name ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    'Đăng ký ngay'
                  )}
                </button>
              </div>
            );
          })}
        </div>

        <p className="text-center text-xs text-gray-500 mt-4">
          💳 Thanh toán an toàn • Hủy bất kỳ lúc nào • Không tự gia hạn
        </p>
      </div>
    </div>
  );
}

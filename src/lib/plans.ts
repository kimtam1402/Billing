import { PlanType } from '@/models/User';

export const PLANS = {
  FREE: {
    name: 'FREE',
    label: 'Miễn Phí',
    price: 0,
    priceLabel: 'Miễn phí',
    period: '',
    description: 'Trải nghiệm cơ bản',
    color: 'from-slate-600 to-slate-800',
    badge: null,
    features: [
      'Xem phim miễn phí',
      'Chất lượng SD',
      'Có quảng cáo',
      'Không giới hạn thời gian',
    ],
    notIncluded: [
      'Phim trả phí',
      'Chất lượng HD/4K',
      'Không quảng cáo',
    ],
  },
  PLUS: {
    name: 'PLUS',
    label: 'Plus',
    price: 30000,
    priceLabel: '30.000₫',
    period: 'tháng',
    description: 'Phổ biến nhất',
    color: 'from-blue-600 to-blue-800',
    badge: 'Phổ biến',
    features: [
      'Xem toàn bộ phim',
      'Chất lượng HD',
      'Ít quảng cáo',
      '1 thiết bị đồng thời',
    ],
    notIncluded: [
      'Chất lượng 4K',
      'Hoàn toàn không quảng cáo',
    ],
  },
  PRO: {
    name: 'PRO',
    label: 'Pro',
    price: 80000,
    priceLabel: '80.000₫',
    period: '3 tháng',
    description: 'Tiết kiệm hơn',
    color: 'from-purple-600 to-purple-800',
    badge: 'Tiết kiệm',
    features: [
      'Xem toàn bộ phim',
      'Chất lượng Full HD',
      'Ít quảng cáo',
      '2 thiết bị đồng thời',
      'Tải xuống offline (5 phim)',
    ],
    notIncluded: [
      'Hoàn toàn không quảng cáo',
    ],
  },
  PREMIUM: {
    name: 'PREMIUM',
    label: 'Premium',
    price: 200000,
    priceLabel: '200.000₫',
    period: 'năm',
    description: 'Tốt nhất',
    color: 'from-amber-500 to-orange-600',
    badge: 'Tốt nhất',
    features: [
      'Xem toàn bộ phim',
      'Chất lượng 4K UHD',
      'Hoàn toàn không quảng cáo',
      '4 thiết bị đồng thời',
      'Tải xuống offline (20 phim)',
      'Hỗ trợ ưu tiên 24/7',
    ],
    notIncluded: [],
  },
} as const;

export const PLAN_HIERARCHY: Record<PlanType, number> = {
  FREE: 0,
  PLUS: 1,
  PRO: 2,
  PREMIUM: 3,
};

export function canAccessMovie(userPlan: PlanType, requiredPlan: PlanType): boolean {
  return PLAN_HIERARCHY[userPlan] >= PLAN_HIERARCHY[requiredPlan];
}

export function getSubscriptionEndDate(plan: PlanType): Date {
  const now = new Date();
  switch (plan) {
    case 'PLUS':
      return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    case 'PRO':
      return new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
    case 'PREMIUM':
      return new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
    default:
      return now;
  }
}

'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Wallet, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function TopupPage() {
  const { user, token, refreshUser } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState<number>(50000);

  const amounts = [50000, 100000, 200000, 500000, 1000000];

  if (!user) {
    if (typeof window !== 'undefined') router.push('/login');
    return null;
  }

  const handleTopup = async () => {
    if (amount <= 0) {
      toast.error('Vui lòng chọn số tiền hợp lệ');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/user/add-balance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ amount }),
      });
      const data = await res.json();
      
      if (res.ok) {
        await refreshUser();
        toast.success(data.message || 'Nạp tiền thành công!');
        router.push('/pricing');
      } else {
        toast.error(data.error || 'Có lỗi xảy ra khi nạp tiền');
      }
    } catch {
      toast.error('Lỗi kết nối server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 bg-black">
      <div className="max-w-md mx-auto bg-zinc-900 border border-zinc-800 rounded p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mb-4">
            <Wallet className="w-8 h-8 text-blue-500" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Nạp Tiền Vào Số Dư</h1>
          <p className="text-zinc-400 text-sm">
            Số dư hiện tại:{' '}
            <span className="font-bold text-white text-lg">
              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(user.balance || 0)}
            </span>
          </p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-3">
              Chọn Mệnh Giá
            </label>
            <div className="grid grid-cols-2 gap-3">
              {amounts.map((amt) => (
                <button
                  key={amt}
                  onClick={() => setAmount(amt)}
                  className={`py-3 rounded text-sm font-medium transition-colors border ${
                    amount === amt
                      ? 'bg-blue-600 border-blue-500 text-white'
                      : 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700'
                  }`}
                >
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amt)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">
              Hoặc nhập số tiền rỗng
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              placeholder="Nhập số tiền..."
              className="w-full bg-black border border-zinc-700 text-white rounded px-4 py-3 focus:outline-none focus:border-white transition-colors"
              min="10000"
              step="10000"
            />
          </div>

          <button
            onClick={handleTopup}
            disabled={loading}
            className="w-full py-3 bg-red-600 text-white rounded font-bold hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="w-5 h-5 animate-spin" />}
            XÁC NHẬN NẠP TIỀN
          </button>
        </div>
      </div>
    </div>
  );
}

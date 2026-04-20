'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Shield, Loader2, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminLoginPage() {
  const { user, login, loading: authLoading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loginAttempted, setLoginAttempted] = useState(false);

  // Redirect to admin once user is confirmed as admin
  useEffect(() => {
    if (!authLoading && user?.isAdmin) {
      router.push('/admin');
    }
    // If login was attempted but user is not admin
    if (!authLoading && loginAttempted && user && !user.isAdmin) {
      toast.error('Tài khoản này không có quyền Admin!');
      setLoginAttempted(false);
    }
  }, [user, authLoading, router, loginAttempted]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (result.success) {
      setLoginAttempted(true);
      // Navigation is handled by useEffect above watching user state
    } else {
      toast.error(result.error || 'Đăng nhập thất bại');
    }
  };

  if (authLoading) return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#E50914] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  // Already logged in but not admin
  if (!authLoading && user && !user.isAdmin) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
        <div className="bg-zinc-900 border border-red-900 rounded-xl p-8 max-w-sm w-full text-center">
          <Shield className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-white font-bold text-xl mb-2">Không có quyền truy cập</h1>
          <p className="text-zinc-400 text-sm mb-6">Tài khoản của bạn không có quyền Admin.</p>
          <button
            onClick={() => router.push('/')}
            className="w-full py-2.5 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition-colors text-sm font-medium"
          >
            Về trang chủ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      {/* Background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(229,9,20,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(229,9,20,0.03)_1px,transparent_1px)] bg-[size:64px_64px]" />

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-red-900/30 border border-red-800 mb-4">
            <Shield className="w-8 h-8 text-[#E50914]" />
          </div>
          <h1 className="text-white font-bold text-2xl">
            <span className="text-[#E50914]">Cine</span>Stream Admin
          </h1>
          <p className="text-zinc-500 text-sm mt-1">Đăng nhập vào trang quản trị</p>
        </div>

        {/* Form */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-xs text-zinc-400 mb-1.5 block font-medium">Email Admin</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@cinestream.com"
                required
                className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#E50914] transition-colors placeholder:text-zinc-600"
              />
            </div>

            <div>
              <label className="text-xs text-zinc-400 mb-1.5 block font-medium">Mật khẩu</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-4 py-3 pr-11 text-sm focus:outline-none focus:border-[#E50914] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#E50914] text-white rounded-lg font-semibold hover:bg-[#f40612] transition-colors disabled:opacity-60 flex items-center justify-center gap-2 mt-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Shield className="w-5 h-5" />}
              {loading ? 'Đang xác thực...' : 'Đăng nhập Admin'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-zinc-800 text-center">
            <button
              onClick={() => router.push('/')}
              className="text-zinc-500 hover:text-zinc-300 text-sm transition-colors"
            >
              ← Về trang chủ CineStream
            </button>
          </div>
        </div>

        <p className="text-center text-zinc-600 text-xs mt-4">
          Chỉ dành cho quản trị viên được ủy quyền
        </p>
      </div>
    </div>
  );
}

'use client';

import { useState, Suspense, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

function LoginContent() {
  const { login, user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParams = searchParams.get('redirect') || '/';

  useEffect(() => {
    if (!authLoading && user) {
      router.push(redirectParams);
    }
  }, [user, authLoading, router, redirectParams]);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (result.success) {
      toast.success('Đăng nhập thành công!');
      router.push(redirectParams);
    } else {
      toast.error(result.error || 'Đăng nhập thất bại');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-black relative">
       {/* Cinematic Background Image Note: Next image could go here, or pure black */}
      <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent z-10" />
      </div>

      <div className="w-full max-w-[450px] bg-black/70 border border-zinc-800 p-8 md:p-14 rounded z-20 backdrop-blur-xl">
         <h1 className="text-3xl font-bold text-white mb-8">Đăng nhập</h1>
         
         <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <input
                 type="email"
                 value={email}
                 onChange={e => setEmail(e.target.value)}
                 placeholder="Email hoặc số điện thoại"
                 required
                 className="w-full bg-zinc-800/70 border border-zinc-700 text-white rounded px-4 py-3.5 focus:outline-none focus:bg-zinc-800 focus:border-zinc-500 transition-colors"
              />
              <input
                 type="password"
                 value={password}
                 onChange={e => setPassword(e.target.value)}
                 placeholder="Mật khẩu"
                 required
                 className="w-full bg-zinc-800/70 border border-zinc-700 text-white rounded px-4 py-3.5 focus:outline-none focus:bg-zinc-800 focus:border-zinc-500 transition-colors"
              />
            </div>
            
            <button
               type="submit"
               disabled={loading}
               className="w-full bg-[#E50914] text-white font-bold py-3.5 rounded hover:bg-[#f40612] transition-colors flex justify-center items-center"
            >
               {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Đăng nhập'}
            </button>
            
            <div className="flex items-center justify-between text-sm text-zinc-400 mt-2">
               <label className="flex items-center gap-2 cursor-pointer">
                 <input type="checkbox" className="accent-zinc-500 bg-zinc-800 border-zinc-700" />
                 <span>Ghi nhớ tôi</span>
               </label>
               <Link href="#" className="hover:underline">Bạn cần trợ giúp?</Link>
            </div>
         </form>
         
         <div className="mt-12 text-zinc-500 text-base">
            Mới tham gia CineStream?{' '}
            <Link href="/register" className="text-white hover:underline font-medium">Bảo mật ngay bây giờ.</Link>
         </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <LoginContent />
    </Suspense>
  )
}

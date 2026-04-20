'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const result = await register(name, email, password);
    setLoading(false);
    if (result.success) {
      toast.success('Đăng ký thành công! Chào mừng!');
      router.push('/');
    } else {
      toast.error(result.error || 'Đăng ký thất bại');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-black relative">
      <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent z-10" />
      </div>

      <div className="w-full max-w-[450px] bg-black/70 border border-zinc-800 p-8 md:p-14 rounded z-20 backdrop-blur-xl">
         <h1 className="text-3xl font-bold text-white mb-8">Đăng ký</h1>
         
         <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <input
                 type="text"
                 value={name}
                 onChange={e => setName(e.target.value)}
                 placeholder="Họ và tên"
                 required
                 className="w-full bg-zinc-800/70 border border-zinc-700 text-white rounded px-4 py-3.5 focus:outline-none focus:bg-zinc-800 focus:border-zinc-500 transition-colors"
              />
              <input
                 type="email"
                 value={email}
                 onChange={e => setEmail(e.target.value)}
                 placeholder="Email"
                 required
                 className="w-full bg-zinc-800/70 border border-zinc-700 text-white rounded px-4 py-3.5 focus:outline-none focus:bg-zinc-800 focus:border-zinc-500 transition-colors"
              />
              <input
                 type="password"
                 value={password}
                 onChange={e => setPassword(e.target.value)}
                 placeholder="Mật khẩu"
                 required
                 minLength={6}
                 className="w-full bg-zinc-800/70 border border-zinc-700 text-white rounded px-4 py-3.5 focus:outline-none focus:bg-zinc-800 focus:border-zinc-500 transition-colors"
              />
            </div>
            
            <button
               type="submit"
               disabled={loading}
               className="w-full bg-[#E50914] text-white font-bold py-3.5 rounded hover:bg-[#f40612] transition-colors flex justify-center items-center"
            >
               {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Tạo tài khoản'}
            </button>
            
            <div className="text-sm text-zinc-400 mt-2">
               Bằng việc đăng ký, bạn đồng ý với Điều khoản của chúng tôi.
            </div>
         </form>
         
         <div className="mt-12 text-zinc-500 text-base">
            Đã có tài khoản?{' '}
            <Link href="/login" className="text-white hover:underline font-medium">Đăng nhập.</Link>
         </div>
      </div>
    </div>
  );
}

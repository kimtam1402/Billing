'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Search, User, LogOut, Heart, Menu, X, Shield, MessageCircle } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const navLinks = [
    { href: '/', label: 'Trang chủ' },
    { href: '/movies', label: 'Phim' },
    { href: '/pricing', label: 'Gói thành viên' },
    { href: '/chat', label: 'Chat' },
  ];

  const handleSearch = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      window.location.href = `/movies?search=${encodeURIComponent(searchQuery)}`;
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${
      scrolled ? 'bg-black border-b border-white/10' : 'bg-gradient-to-b from-black/80 to-transparent'
    }`}>
      <div className="max-w-[1400px] mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between h-16">
          
          <div className="flex items-center gap-8">
            {/* Logo */}
            <Link href="/" className="text-xl font-bold tracking-tight text-white flex items-center gap-1">
              <span className="text-[#E50914]">Cine</span>Stream
            </Link>

            {/* Desktop Links */}
            <div className="hidden md:flex items-center gap-6">
              {navLinks.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className={`text-sm font-medium transition-colors ${
                    pathname === href ? 'text-white' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            
            {/* Search Toggle */}
            <div className="flex items-center">
              <div className={`overflow-hidden transition-all duration-300 ${searchOpen ? 'w-48 opacity-100 mr-2' : 'w-0 opacity-0'}`}>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleSearch}
                  placeholder="Tiêu đề, diễn viên..."
                  className="w-full bg-zinc-900 border border-zinc-800 text-white text-sm rounded-sm px-3 py-1.5 focus:outline-none focus:border-zinc-700 placeholder:text-zinc-500"
                  suppressHydrationWarning
                />
              </div>
              <button 
                onClick={() => setSearchOpen(!searchOpen)} 
                className="text-zinc-400 hover:text-white p-1"
                suppressHydrationWarning
              >
                {searchOpen ? <X className="w-5 h-5" /> : <Search className="w-5 h-5" />}
              </button>
            </div>

            {user ? (
              <div className="hidden md:flex items-center gap-4">
                 {user.isAdmin && (
                   <Link href="/admin" className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-red-900/40 border border-red-800 text-red-400 hover:bg-red-900/70 text-xs font-bold transition-colors" title="Admin">
                     <Shield className="w-3.5 h-3.5" />
                     ADMIN
                   </Link>
                 )}
                 <Link href="/favorites" className="text-zinc-400 hover:text-white" title="Yêu thích">
                   <Heart className="w-5 h-5" />
                 </Link>
                 <Link href="/topup" className="bg-zinc-800 text-white border border-zinc-700 hover:bg-zinc-700 text-sm font-medium px-3 py-1.5 rounded-sm flex items-center gap-1 transition-colors" title="Nạp tiền">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(user.balance || 0)}
                 </Link>
                 <Link href="/profile" className="flex items-center gap-2 group">
                    <div className="w-8 h-8 rounded bg-zinc-800 border border-zinc-700 flex items-center justify-center overflow-hidden">
                       <User className="w-4 h-4 text-zinc-400 group-hover:text-white transition-colors" />
                    </div>
                 </Link>
                 <button onClick={logout} className="text-zinc-400 hover:text-white" title="Đăng xuất">
                   <LogOut className="w-5 h-5" />
                 </button>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-4">
                <Link href="/login" className="text-sm font-medium text-zinc-300 hover:text-white transition-colors">
                  Đăng nhập
                </Link>
                <Link href="/register" className="btn-primary text-sm font-medium px-4 py-2 rounded-sm">
                  Đăng ký
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              className="md:hidden text-zinc-400 hover:text-white p-1"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-black border-t border-white/10 absolute top-16 left-0 right-0 p-4 space-y-4">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="block text-sm font-medium text-zinc-300 hover:text-white"
            >
              {label}
            </Link>
          ))}
          <div className="border-t border-zinc-800 my-2" />
          {user ? (
            <>
              <Link href="/favorites" className="block text-sm font-medium text-zinc-300 hover:text-white">Yêu thích</Link>
              <Link href="/profile" className="block text-sm font-medium text-zinc-300 hover:text-white">Tài khoản</Link>
              <button onClick={logout} className="block text-sm font-medium text-red-500 hover:text-red-400">Đăng xuất</button>
            </>
          ) : (
            <>
              <Link href="/login" className="block text-sm font-medium text-zinc-300 hover:text-white">Đăng nhập</Link>
              <Link href="/register" className="block text-sm font-medium text-zinc-300 hover:text-white">Đăng ký</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}

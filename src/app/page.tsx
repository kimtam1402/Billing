'use client';
//test jenkins
import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Play, Info, Star } from 'lucide-react';
import MovieCard from '@/components/MovieCard';
import { IMovie } from '@/models/Movie';

type Movie = IMovie & { _id: string };

export default function HomePage() {
  const [featuredMovies, setFeaturedMovies] = useState<Movie[]>([]);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [heroIndex, setHeroIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchMovies = useCallback(async () => {
    try {
      // Tự động nhận diện môi trường để tránh lỗi sập URL khi chạy production trên VPS
      const isClient = typeof window !== 'undefined';
      const apiUrl = isClient 
        ? '/api/movies' 
        : 'http://127.0.0.1:3000/api/movies';

      const res = await fetch(apiUrl, { cache: 'no-store' });
      const data = await res.json();
      const allMovies = data.movies || [];
      setMovies(allMovies);
      
      const featured = allMovies.filter((m: Movie) => m.featured);
      setFeaturedMovies(featured.length > 0 ? featured : allMovies.slice(0, 3));
    } catch (e) {
      console.error("Lỗi lấy danh sách phim:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { 
    fetchMovies(); 
  }, [fetchMovies]);

  // Tự động chuyển hình bộ phim nổi bật trên Banner (Hero) mỗi 8 giây
  useEffect(() => {
    if (!featuredMovies.length) return;
    const timer = setInterval(() => {
      setHeroIndex((i) => (i + 1) % featuredMovies.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [featuredMovies]);

  if (loading) {
    return <div className="min-h-screen bg-black" />; 
  }

  const hero = featuredMovies[heroIndex] || movies[0];
  if (!hero) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white font-medium">
        Kho phim đang được hệ thống n8n cập nhật, vui lòng quay lại sau...
      </div>
    );
  }

  // Phân loại phim theo các danh mục logic
  const freeMovies = movies.filter(m => m.isFree);
  const trendingMovies = [...movies].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 10);
  const newMovies = [...movies].sort((a, b) => b.year - a.year).slice(0, 10);

  return (
    <div className="min-h-screen bg-[#141414] pb-20 select-none">
      {/* ─── HERO BANNER ─────────────────────────────── */}
      <div className="relative h-[85vh] lg:h-[90vh] min-h-[600px] w-full bg-black">
        <div className="absolute inset-0">
          <Image
             src={hero.thumbnail}
             alt={hero.title}
             fill
             className="object-cover opacity-60 transition-all duration-1000"
             priority
             unoptimized
          />
          {/* Lớp phủ Gradients mượt mà chuẩn Netflix */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/20 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#141414]/90 via-[#141414]/40 to-transparent w-3/4 md:w-1/2" />
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 z-10 max-w-[1400px] mx-auto pb-24 md:pb-32">
           <div className="max-w-2xl">
             <div className="flex items-center gap-3 mb-4 text-xs font-semibold text-zinc-300 tracking-wider uppercase">
               {hero.isFree ? (
                  <span className="text-white bg-white/20 px-2 py-0.5 rounded font-bold">MIỄN PHÍ</span>
               ) : (
                  <span className="text-[#E50914] bg-[#E50914]/20 border border-[#E50914]/30 px-2 py-0.5 rounded font-bold">{hero.requiredPlan}</span>
               )}
               {hero.genre?.[0] && <span className="bg-zinc-800/60 px-2 py-0.5 rounded">{hero.genre[0]}</span>}
               <span>•</span>
               <span>{hero.year}</span>
               {hero.rating > 0 && (
                 <span className="flex items-center gap-1 text-amber-400">
                   <Star className="w-3.5 h-3.5 fill-amber-400" /> {hero.rating.toFixed(1)}
                 </span>
               )}
             </div>

             <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold text-white mb-4 tracking-tight line-clamp-2 drop-shadow-lg">
               {hero.title}
             </h1>

             <p className="text-base sm:text-lg text-zinc-300 line-clamp-3 mb-8 max-w-xl font-medium leading-relaxed drop-shadow">
               {hero.description}
             </p>

             <div className="flex items-center gap-4">
               <Link 
                 href={`/movies/${hero._id}`}
                 className="bg-white text-black hover:bg-zinc-200 px-8 py-3 rounded flex items-center gap-2 font-bold transition-colors shadow-lg"
               >
                 <Play className="w-5 h-5 fill-black" /> Phát
               </Link>
               <Link 
                 href={`/movies/${hero._id}`}
                 className="bg-zinc-500/30 text-white hover:bg-zinc-500/50 transition-colors px-8 py-3 rounded flex items-center gap-2 font-bold backdrop-blur-md border border-zinc-500/20"
               >
                 <Info className="w-5 h-5" /> Chi tiết
               </Link>
             </div>
           </div>
        </div>
      </div>

      {/* ─── ROWS MOVIES LIST ─────────────────────────────── */}
      <div className="max-w-[1400px] mx-auto px-4 md:px-12 space-y-12 -mt-16 relative z-20">
        
        {/* Hàng phim: Trending */}
        {trendingMovies.length > 0 && (
          <section>
            <h2 className="text-xl md:text-2xl font-bold text-zinc-100 mb-4 px-1 tracking-wide">Xu hướng hiện nay</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {trendingMovies.map(m => <MovieCard key={m._id.toString()} movie={m} />)}
            </div>
          </section>
        )}

        {/* Hàng phim: Free Content */}
        {freeMovies.length > 0 && (
           <section>
             <h2 className="text-xl md:text-2xl font-bold text-zinc-100 mb-4 px-1 tracking-wide">Xem miễn phí</h2>
             <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
               {freeMovies.map(m => <MovieCard key={m._id.toString()} movie={m} />)}
             </div>
           </section>
        )}

        {/* Hàng phim: New Releases */}
        {newMovies.length > 0 && (
          <section>
            <h2 className="text-xl md:text-2xl font-bold text-zinc-100 mb-4 px-1 tracking-wide">Mới phát hành</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {newMovies.map(m => <MovieCard key={m._id.toString()} movie={m} />)}
            </div>
          </section>
        )}

      </div>
    </div>
  );
}

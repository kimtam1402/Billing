'use client';

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
      const res = await fetch('/api/movies');
      const data = await res.json();
      const allMovies = data.movies || [];
      setMovies(allMovies);
      
      const featured = allMovies.filter((m: Movie) => m.featured);
      setFeaturedMovies(featured.length > 0 ? featured : allMovies.slice(0, 3));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchMovies(); }, [fetchMovies]);

  // Simple auto-rotate hero
  useEffect(() => {
    if (!featuredMovies.length) return;
    const timer = setInterval(() => {
      setHeroIndex((i) => (i + 1) % featuredMovies.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [featuredMovies]);

  if (loading) {
    return <div className="min-h-screen bg-black" />; // Keep blank or add skeleton
  }

  const hero = featuredMovies[heroIndex] || movies[0];
  if (!hero) return <div className="min-h-screen flex items-center justify-center bg-black text-white">Chưa có phim.</div>;

  // Group movies by genre logic or categories
  const freeMovies = movies.filter(m => m.isFree);
  const trendingMovies = [...movies].sort((a,b) => b.views - a.views).slice(0, 10);
  const newMovies = [...movies].sort((a,b) => b.year - a.year).slice(0, 10);

  return (
    <div className="min-h-screen pb-20">
      {/* ─── HERO ─────────────────────────────── */}
      <div className="relative h-[85vh] lg:h-[90vh] min-h-[600px] w-full bg-black">
        <div className="absolute inset-0">
          <Image
             src={hero.thumbnail}
             alt={hero.title}
             fill
             className="object-cover opacity-60"
             priority
             unoptimized
          />
          {/* Subtle gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent w-3/4 md:w-1/2" />
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 z-10 max-w-[1400px] mx-auto pb-24 md:pb-32">
           <div className="max-w-2xl">
             <div className="flex items-center gap-3 mb-4 text-xs font-semibold text-zinc-300 tracking-wider uppercase">
               {hero.isFree ? (
                  <span className="text-white bg-white/20 px-2 py-0.5 rounded">MIỄN PHÍ</span>
               ) : (
                  <span className="text-[#E50914] bg-[#E50914]/20 border border-[#E50914]/30 px-2 py-0.5 rounded">{hero.requiredPlan}</span>
               )}
               {hero.genre?.[0] && <span>{hero.genre[0]}</span>}
               <span>•</span>
               <span>{hero.year}</span>
             </div>

             <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold text-white mb-4 tracking-tight">
               {hero.title}
             </h1>

             <p className="text-lg text-zinc-300 line-clamp-3 mb-8 max-w-xl font-medium">
               {hero.description}
             </p>

             <div className="flex items-center gap-4">
               <Link 
                 href={`/movies/${hero._id}`}
                 className="bg-white text-black hover:bg-zinc-200 px-8 py-3 rounded flex items-center gap-2 font-bold transition-colors"
               >
                 <Play className="w-5 h-5 fill-black" /> Phát
               </Link>
               <Link 
                 href={`/movies/${hero._id}`}
                 className="bg-zinc-500/40 text-white hover:bg-zinc-500/60 transition-colors px-8 py-3 rounded flex items-center gap-2 font-bold backdrop-blur-sm"
               >
                 <Info className="w-5 h-5" /> Chi tiết
               </Link>
             </div>
           </div>
        </div>
      </div>

      {/* ─── ROWS ─────────────────────────────── */}
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 space-y-12 -mt-16 relative z-20">
        
        {/* Trending */}
        <section>
          <h2 className="text-xl font-semibold text-zinc-100 mb-4 px-1">Đang thịnh hành</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {trendingMovies.map(m => <MovieCard key={m._id.toString()} movie={m} />)}
          </div>
        </section>

        {/* Free Content */}
        {freeMovies.length > 0 && (
           <section>
             <h2 className="text-xl font-semibold text-zinc-100 mb-4 px-1">Xem miễn phí</h2>
             <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
               {freeMovies.map(m => <MovieCard key={m._id.toString()} movie={m} />)}
             </div>
           </section>
        )}

        {/* New Releases */}
        <section>
          <h2 className="text-xl font-semibold text-zinc-100 mb-4 px-1">Mới phát hành</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {newMovies.map(m => <MovieCard key={m._id.toString()} movie={m} />)}
          </div>
        </section>

      </div>
    </div>
  );
}

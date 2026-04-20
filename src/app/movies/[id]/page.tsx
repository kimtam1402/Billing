'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import UpgradeModal from '@/components/UpgradeModal';
import { Play, Lock, Star, ChevronLeft, Plus, Check } from 'lucide-react';
import { IMovie } from '@/models/Movie';

type Movie = IMovie & { _id: string };

export default function MovieDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user, token, toggleFavorite } = useAuth();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [canAccess, setCanAccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [isFavLocal, setIsFavLocal] = useState(false);

  const fetchMovie = useCallback(async () => {
    try {
      const res = await fetch(`/api/movies/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      if (res.ok) {
        setMovie(data.movie);
        setCanAccess(data.canAccess);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [id, token]);

  useEffect(() => { fetchMovie(); }, [fetchMovie]);
  
  useEffect(() => {
    if (user && movie) {
       setIsFavLocal(user.favoriteMovies?.includes(movie._id.toString()) || false);
    }
  }, [user, movie]);

  const handlePlay = () => {
    if (!canAccess) {
      setUpgradeOpen(true);
      return;
    }
    setPlaying(true);
    setTimeout(() => {
      document.getElementById('video-player')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleFavorite = async () => {
    if (!user) { window.location.href = '/login'; return; }
    setIsFavLocal(!isFavLocal); 
    await toggleFavorite(id as string);
  };

  if (loading) {
    return <div className="min-h-screen bg-black" />;
  }

  if (!movie) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black text-zinc-400">
         Phim không tồn tại.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pb-20">
      {/* ─── Hero Trailer/Image Area ────────────────────── */}
      <div className="relative h-[70vh] min-h-[500px] w-full bg-[#111]">
        
        {/* Render either image or video at the top */}
        {playing && canAccess ? (
           <div id="video-player" className="absolute inset-0 z-20">
              <video
                src={movie.videoUrl}
                controls
                autoPlay
                className="w-full h-full object-contain bg-black"
                poster={movie.thumbnail}
              />
              {/* Close video button */}
              <button 
                onClick={() => setPlaying(false)}
                className="absolute top-24 left-8 text-white bg-black/50 p-2 rounded-full hover:bg-black/80 transition-colors z-30"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
           </div>
        ) : (
          <>
            <Image
              src={movie.thumbnail}
              alt={movie.title}
              fill
              className="object-cover opacity-70"
              priority
              unoptimized
            />
            {/* Gradients */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/30 to-transparent w-full md:w-2/3" />
          </>
        )}

        {/* Content overlaid on image */}
        {!playing && (
          <div className="absolute bottom-0 left-0 right-0 z-10 p-6 md:p-12 max-w-[1400px] mx-auto pb-12">
            <div className="max-w-3xl">
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 tracking-tight shadow-black drop-shadow-xl">{movie.title}</h1>
              
              <div className="flex items-center gap-4 text-sm font-medium text-zinc-300 mb-6 drop-shadow-md">
                 <span className="text-green-500 font-bold">Độ chập 98%</span>
                 <span>{movie.year}</span>
                 {movie.duration && <span>{movie.duration}</span>}
                 <span className="border border-zinc-500 px-1 text-xs text-zinc-400 rounded">16+</span>
              </div>

              <p className="text-base text-zinc-200 mb-8 max-w-2xl font-medium leading-relaxed drop-shadow-md">
                 {movie.description}
              </p>

              <div className="flex items-center gap-4">
                 <button
                   onClick={handlePlay}
                   className="bg-white text-black hover:bg-zinc-200 px-8 py-3.5 rounded flex items-center gap-2 font-bold transition-colors"
                 >
                   {canAccess ? (
                     <><Play className="w-5 h-5 fill-black" /> Phát</>
                   ) : (
                     <><Lock className="w-5 h-5" /> Nâng cấp để xem</>
                   )}
                 </button>

                 <button
                   onClick={handleFavorite}
                   className="flex items-center justify-center w-12 h-12 rounded-full border border-zinc-400 bg-transparent text-white hover:border-white transition-colors"
                   title="Thêm vào danh sách"
                 >
                   {isFavLocal ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                 </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ─── Movie Details Block ────────────────────────────── */}
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 py-8 grid grid-cols-1 md:grid-cols-3 gap-8">
         <div className="md:col-span-2 space-y-8">
            <div className="flex items-center gap-4">
               <div className="flex items-center gap-2 text-zinc-300">
                  <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                  <span className="text-lg font-bold text-white">{movie.rating.toFixed(1)}</span>
                  <span className="text-sm">/ 10</span>
               </div>
               <span className="text-zinc-600">|</span>
               <div className="text-zinc-300 text-sm">
                  {movie.views?.toLocaleString()} lượt xem
               </div>
            </div>

            <div className="border-t border-zinc-800 pt-8 mt-8">
               <h3 className="text-2xl text-white font-semibold mb-4">Giới thiệu</h3>
               <p className="text-zinc-400 leading-relaxed text-lg">
                 {movie.description}
               </p>
            </div>
         </div>

         <div className="space-y-4 text-sm">
            {movie.cast && movie.cast.length > 0 && (
              <div>
                <span className="text-zinc-500 block mb-1">Diễn viên:</span>
                <span className="text-zinc-300 leading-relaxed">
                  {movie.cast.join(', ')}
                </span>
              </div>
            )}
            
            {movie.director && (
              <div>
                <span className="text-zinc-500 block mb-1">Đạo diễn:</span>
                <span className="text-zinc-300">{movie.director}</span>
              </div>
            )}

            {movie.genre && movie.genre.length > 0 && (
              <div>
                <span className="text-zinc-500 block mb-1">Thể loại:</span>
                <span className="text-zinc-300">{movie.genre.join(', ')}</span>
              </div>
            )}
         </div>
      </div>

      <UpgradeModal
        isOpen={upgradeOpen}
        onClose={() => setUpgradeOpen(false)}
        requiredPlan={movie.requiredPlan}
        movieTitle={movie.title}
      />
    </div>
  );
}

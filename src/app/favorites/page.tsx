'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import MovieCard from '@/components/MovieCard';
import { IMovie } from '@/models/Movie';
import { Heart, Loader2 } from 'lucide-react';
import Link from 'next/link';

type Movie = IMovie & { _id: string };

export default function FavoritesPage() {
  const { user, token, loading: authLoading } = useAuth();
  const router = useRouter();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  const fetchFav = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/user/favorites', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setMovies(data.favorites || []);
    } catch (e) {
      console.error(e);
    } finally {
      setDataLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/favorites');
      return;
    }
    if (user) {
      fetchFav();
    }
  }, [user, authLoading, router, fetchFav]);

  if (authLoading) return <div className="min-h-screen bg-black" />;
  if (!user) return null;

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 bg-black">
      <div className="max-w-[1400px] mx-auto">
        <div className="flex items-center gap-3 mb-10">
          <Heart className="w-8 h-8 text-white" />
          <h1 className="text-3xl font-bold text-white tracking-tight">Danh sách của tôi</h1>
        </div>

        {dataLoading ? (
          <div className="flex justify-center items-center py-32">
            <Loader2 className="w-8 h-8 text-zinc-500 animate-spin" />
          </div>
        ) : movies.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <Heart className="w-16 h-16 text-zinc-800 mb-6" />
            <h3 className="text-xl font-medium text-white mb-2">Chưa có phim nào</h3>
            <p className="text-zinc-500 mb-8 max-w-md">
              Bạn chưa lưu tựa phim nào. Khám phá các nội dung và lưu lại để xem sau.
            </p>
            <Link href="/movies" className="bg-white text-black font-bold px-6 py-3 rounded">
              Khám phá phim
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {movies.map((m) => (
              <MovieCard key={m._id.toString()} movie={m} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';
import MovieCard from '@/components/MovieCard';
import { IMovie } from '@/models/Movie';

type Movie = IMovie & { _id: string };

const GENRES = ['Tất cả', 'Hành động', 'Khoa học viễn tưởng', 'Tội phạm', 'Kịch tính', 'Phiêu lưu', 'Hài kịch', 'Ly kỳ'];
const PLANS_FILTER = [
  { value: 'all', label: 'Tất cả' },
  { value: 'free', label: 'Miễn phí' },
  { value: 'premium', label: 'Trả phí' },
];

function MoviesContent() {
  const searchParams = useSearchParams();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  
  const initialSearch = searchParams.get('search') || '';
  const [search, setSearch] = useState(initialSearch);
  const [searchInput, setSearchInput] = useState(initialSearch);
  
  const [selectedGenre, setSelectedGenre] = useState('Tất cả');
  const [planFilter, setPlanFilter] = useState(searchParams.get('plan') || 'all');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    const fetchMovies = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (planFilter !== 'all') params.append('plan', planFilter);
        const res = await fetch(`/api/movies?${params}`);
        const data = await res.json();
        setMovies(data.movies || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchMovies();
  }, [search, planFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
  };

  const filtered = movies
    .filter((m) => selectedGenre === 'Tất cả' || m.genre?.includes(selectedGenre))
    .sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'views') return b.views - a.views;
      if (sortBy === 'year') return b.year - a.year;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8">
        
        {/* Header Options area */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <h1 className="text-3xl font-bold text-white">Phim</h1>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
            {/* Search Box */}
            <form onSubmit={handleSearch} className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Tìm kiếm phim..."
                className="w-full bg-zinc-900 border border-zinc-800 rounded px-10 py-2 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-zinc-600 transition-colors"
              />
            </form>

            <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0 scroll-row">
               <select
                 value={planFilter}
                 onChange={(e) => setPlanFilter(e.target.value)}
                 className="bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-sm text-zinc-300 outline-none"
               >
                 <option value="all">Tất cả gói</option>
                 <option value="free">Miễn phí</option>
                 <option value="premium">Trả phí</option>
               </select>

               <select
                 value={selectedGenre}
                 onChange={(e) => setSelectedGenre(e.target.value)}
                 className="bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-sm text-zinc-300 outline-none"
               >
                 {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
               </select>

               <select
                 value={sortBy}
                 onChange={(e) => setSortBy(e.target.value)}
                 className="bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-sm text-zinc-300 outline-none"
               >
                 <option value="newest">Mới nhất</option>
                 <option value="rating">Đánh giá cao</option>
                 <option value="views">Lượt xem</option>
               </select>
            </div>
          </div>
        </div>

        {/* Status Line */}
        {!loading && search && (
           <div className="mb-6 text-zinc-400 text-sm">
             Kết quả tìm kiếm cho: <span className="text-white font-medium">"{search}"</span> ({filtered.length} phim)
           </div>
        )}

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="aspect-[2/3] bg-zinc-900 rounded animate-pulse" />
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {filtered.map((m) => (
              <MovieCard key={m._id.toString()} movie={m} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-zinc-500">
             <p>Không tìm thấy phim phù hợp.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function MoviesPage() {
  return (
    <Suspense fallback={
       <div className="min-h-screen bg-black" />
    }>
      <MoviesContent />
    </Suspense>
  );
}

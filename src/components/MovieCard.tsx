'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Star, Play, Lock } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { IMovie } from '@/models/Movie';

interface MovieCardProps {
  movie: IMovie & { _id: string };
}

export default function MovieCard({ movie }: MovieCardProps) {
  const { user } = useAuth();
  const canAccess = movie.isFree || (user && user.plan !== 'FREE');
  const badgeClass = `badge badge-${movie.requiredPlan.toLowerCase()}`;

  return (
    <Link href={`/movies/${movie._id}`} className="group relative block overflow-hidden rounded-md transition-all hover:z-10">
      
      {/* Poster Aspect Ratio */}
      <div className="relative aspect-[2/3] w-full bg-[#18181b] overflow-hidden">
        <Image
          src={movie.thumbnail}
          alt={movie.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          unoptimized
        />
        
        {/* Subtle bottom gradient for readability if needed */}
        <div className="absolute inset-0 card-gradient opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        
        {/* Hover overlay content */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
           <div className={`w-12 h-12 rounded-full flex items-center justify-center ${canAccess ? 'bg-[#e50914]' : 'bg-zinc-800'}`}>
              {canAccess ? <Play className="w-5 h-5 text-white ml-1 fill-white" /> : <Lock className="w-5 h-5 text-zinc-400" />}
           </div>
        </div>

        {/* Plan Badge */}
        {!movie.isFree && (
          <div className="absolute top-2 left-2 z-10">
             <span className={badgeClass}>{movie.requiredPlan}</span>
          </div>
        )}
      </div>

      {/* Info minimal text */}
      <div className="pt-2">
        <div className="flex items-center justify-between gap-2 mb-1">
          <h3 className="text-sm font-medium text-zinc-100 line-clamp-1 flex-1">{movie.title}</h3>
          <div className="flex items-center gap-1 text-xs text-zinc-400 shrink-0">
             <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
             <span>{movie.rating.toFixed(1)}</span>
          </div>
        </div>
        <div className="text-xs text-zinc-500 flex items-center gap-2">
           <span>{movie.year}</span>
           {movie.genre && movie.genre[0] && (
             <>
               <span className="w-1 h-1 bg-zinc-700 rounded-full" />
               <span className="line-clamp-1">{movie.genre[0]}</span>
             </>
           )}
        </div>
      </div>
    </Link>
  );
}

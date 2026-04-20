import mongoose, { Document, Schema } from 'mongoose';
import { PlanType } from './User';

export interface IMovie extends Document {
  _id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnail: string;
  trailerUrl?: string;
  isFree: boolean;
  requiredPlan: PlanType;
  genre: string[];
  rating: number;
  year: number;
  duration: string;
  director?: string;
  cast?: string[];
  featured: boolean;
  views: number;
  createdAt: Date;
}

const MovieSchema = new Schema<IMovie>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    videoUrl: { type: String, required: true },
    thumbnail: { type: String, required: true },
    trailerUrl: { type: String },
    isFree: { type: Boolean, default: true },
    requiredPlan: { type: String, enum: ['FREE', 'PLUS', 'PRO', 'PREMIUM'], default: 'FREE' },
    genre: [{ type: String }],
    rating: { type: Number, default: 0, min: 0, max: 10 },
    year: { type: Number },
    duration: { type: String },
    director: { type: String },
    cast: [{ type: String }],
    featured: { type: Boolean, default: false },
    views: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.models.Movie || mongoose.model<IMovie>('Movie', MovieSchema);

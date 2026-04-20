import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export type PlanType = 'FREE' | 'PLUS' | 'PRO' | 'PREMIUM';

export interface IUser extends Document {
  _id: string;
  name: string;
  email: string;
  password: string;
  plan: PlanType;
  subscriptionStart?: Date;
  subscriptionEnd?: Date;
  favoriteMovies: string[];
  watchHistory: { movieId: string; watchedAt: Date }[];
  createdAt: Date;
  balance: number;
  isAdmin: boolean;
  comparePassword(password: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    plan: { type: String, enum: ['FREE', 'PLUS', 'PRO', 'PREMIUM'], default: 'FREE' },
    balance: { type: Number, default: 500000 },
    isAdmin: { type: Boolean, default: false },
    subscriptionStart: { type: Date },
    subscriptionEnd: { type: Date },
    favoriteMovies: [{ type: String }],
    watchHistory: [
      {
        movieId: { type: String },
        watchedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

UserSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

UserSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
  return bcrypt.compare(password, this.password);
};

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

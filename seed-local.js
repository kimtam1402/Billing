const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGODB_URI = "mongodb+srv://trinh:trinh%402604@cluster0.b9tpxws.mongodb.net/cinestream?retryWrites=true&w=majority&appName=Cluster0";

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    plan: { type: String, enum: ['FREE', 'PLUS', 'PRO', 'PREMIUM'], default: 'FREE' },
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

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to DB');

    await User.deleteMany({ email: { $in: ['free@test.com', 'plus@test.com', 'pro@test.com', 'premium@test.com'] } });

    const testUsers = [
      { name: 'FREE User', email: 'free@test.com', password: 'password123', plan: 'FREE' },
      { name: 'PLUS User', email: 'plus@test.com', password: 'password123', plan: 'PLUS', subscriptionEnd: new Date(Date.now() + 30*24*60*60*1000) },
      { name: 'PRO User', email: 'pro@test.com', password: 'password123', plan: 'PRO', subscriptionEnd: new Date(Date.now() + 30*24*60*60*1000) },
      { name: 'PREMIUM User', email: 'premium@test.com', password: 'password123', plan: 'PREMIUM', subscriptionEnd: new Date(Date.now() + 30*24*60*60*1000) },
    ];

    for (const u of testUsers) {
      await User.create(u);
    }
    console.log('Seeded users successfully!');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seed();

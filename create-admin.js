const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGODB_URI = "mongodb+srv://trinh:trinh%402604@cluster0.b9tpxws.mongodb.net/cinestream?retryWrites=true&w=majority&appName=Cluster0";

async function createAdmin() {
  try {
    await mongoose.connect(MONGODB_URI);
    const db = mongoose.connection.useDb('cinestream');

    const existing = await db.collection('users').findOne({ email: 'admin@cinestream.com' });
    if (existing) {
      // Update existing to ensure isAdmin = true
      await db.collection('users').updateOne(
        { email: 'admin@cinestream.com' },
        { $set: { isAdmin: true, plan: 'PREMIUM', balance: 99999999 } }
      );
      console.log('✅ Admin account already exists, updated to ensure isAdmin=true');
      console.log('📧 Email   : admin@cinestream.com');
      console.log('🔑 Password: Admin@2024');
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash('Admin@2024', 12);

    await db.collection('users').insertOne({
      name: 'Administrator',
      email: 'admin@cinestream.com',
      password: hashedPassword,
      plan: 'PREMIUM',
      balance: 99999999,
      isAdmin: true,
      favoriteMovies: [],
      watchHistory: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    console.log('✅ Đã tạo tài khoản Admin thành công!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 Email   : admin@cinestream.com');
    console.log('🔑 Password: Admin@2024');
    console.log('🛡️  Role     : ADMIN + PREMIUM');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━');
    process.exit(0);
  } catch (err) {
    console.error('Lỗi:', err);
    process.exit(1);
  }
}

createAdmin();

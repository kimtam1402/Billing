const mongoose = require('mongoose');

const MONGODB_URI = "mongodb+srv://trinh:trinh%402604@cluster0.b9tpxws.mongodb.net/cinestream?retryWrites=true&w=majority&appName=Cluster0";

async function check() {
  try {
    await mongoose.connect(MONGODB_URI);
    const db = mongoose.connection.useDb('cinestream');
    const admin = await db.collection('users').findOne({ email: 'admin@cinestream.com' });
    console.log('Admin account:', JSON.stringify({
      email: admin?.email,
      isAdmin: admin?.isAdmin,
      plan: admin?.plan,
      balance: admin?.balance,
    }, null, 2));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

check();

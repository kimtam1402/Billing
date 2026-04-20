const mongoose = require('mongoose');

const MONGODB_URI = "mongodb+srv://trinh:trinh%402604@cluster0.b9tpxws.mongodb.net/cinestream?retryWrites=true&w=majority&appName=Cluster0";

const adminEmail = process.argv[2];

if (!adminEmail) {
  console.error('Usage: node set-admin.js <email>');
  process.exit(1);
}

async function setAdmin() {
  try {
    await mongoose.connect(MONGODB_URI);
    const db = mongoose.connection.useDb('cinestream');
    const result = await db.collection('users').updateOne(
      { email: adminEmail.toLowerCase() },
      { $set: { isAdmin: true } }
    );
    if (result.matchedCount === 0) {
      console.error(`Không tìm thấy tài khoản: ${adminEmail}`);
    } else {
      console.log(`✅ Đã cấp quyền Admin cho: ${adminEmail}`);
    }
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

setAdmin();

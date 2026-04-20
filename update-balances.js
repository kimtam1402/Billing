const mongoose = require('mongoose');

const MONGODB_URI = "mongodb+srv://trinh:trinh%402604@cluster0.b9tpxws.mongodb.net/cinestream?retryWrites=true&w=majority&appName=Cluster0";

async function updateBalances() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to DB');

    const db = mongoose.connection.useDb('cinestream');
    const result = await db.collection('users').updateMany(
      { email: { $regex: '@test.com$' } },
      { $set: { balance: 500000 } }
    );

    console.log(`Updated ${result.modifiedCount} @test.com users to have 500000 balance!`);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

updateBalances();

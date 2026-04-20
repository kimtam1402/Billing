const mongoose = require('mongoose');

const MONGODB_URI = "mongodb+srv://trinh:trinh%402604@cluster0.b9tpxws.mongodb.net/cinestream?retryWrites=true&w=majority&appName=Cluster0";

async function cleanBalances() {
  try {
    await mongoose.connect(MONGODB_URI);
    const db = mongoose.connection.useDb('cinestream');
    
    const result = await db.collection('users').updateMany(
      {},
      { $set: { balance: 500000 } }
    );
    
    console.log(`Cleaned up ${result.modifiedCount} users back to exactly 500000.`);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

cleanBalances();

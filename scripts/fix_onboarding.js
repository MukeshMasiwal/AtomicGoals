const mongoose = require('mongoose');
async function fix() {
  require('dotenv').config({ path: '.env.local' });
  await mongoose.connect(process.env.MONGODB_URI);
  try {
    const db = mongoose.connection.db;
    const users = db.collection('users');
    const result = await users.updateMany(
      { isSeedUser: true }, 
      { $set: { onboardingCompleted: true } }
    );
    console.log('Fixed onboarding status in db:', result.modifiedCount);
  } catch (e) {
    console.error(e);
  }
  process.exit(0);
}
fix();

const mongoose = require('mongoose');

async function fix() {
  require('dotenv').config({ path: '.env.local' });
  await mongoose.connect(process.env.MONGODB_URI);
  try {
    const db = mongoose.connection.db;
    const users = db.collection('users');
    
    // update all users where team is an empty string
    await users.updateMany({ team: '' }, { $unset: { team: 1 } });
    await users.updateMany({ manager: '' }, { $unset: { manager: 1 } });
    await users.updateMany({ assignedManager: '' }, { $unset: { assignedManager: 1 } });
    console.log('Fixed users in db');
  } catch (e) {
    console.error(e);
  }
  process.exit(0);
}
fix();

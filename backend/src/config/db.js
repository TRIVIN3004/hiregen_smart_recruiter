const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/hiregen');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.warn('\n================================================================');
    console.warn('WARNING: Could not connect to MongoDB database.');
    console.warn(`Error details: ${error.message}`);
    console.warn('Backend will run, but database actions will fail or require a running MongoDB instance.');
    console.warn('Please make sure MongoDB is installed and running locally, or update MONGO_URI in backend/.env.');
    console.warn('================================================================\n');
    return false;
  }
};

module.exports = connectDB;

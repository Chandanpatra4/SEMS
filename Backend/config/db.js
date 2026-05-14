import mongoose from 'mongoose';
import Result from '../models/Result.js';

const connectDB = async () => {
  try {
    const connection = await mongoose.connect(process.env.MONGO_URI);

    // Keep Result collection indexes aligned with schema to avoid stale unique-index conflicts.
    await Result.syncIndexes();

    console.log(`MongoDB connected: ${connection.connection.host}`);
    return connection;
  } catch (error) {
    console.error(`Database connection error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;

import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import User from '../models/User.js';

dotenv.config();

const createAdmin = async () => {
  try {
    await connectDB();

    const existingAdmin = await User.findOne({ email: 'admin@sems.com' });

    if (existingAdmin) {
      console.log('Admin already exists');
      await mongoose.connection.close();
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash('admin123', 10);

    await User.create({
      name: 'System Admin',
      email: 'admin@sems.com',
      password: hashedPassword,
      role: 'admin',
    });

    console.log('Admin created successfully');
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error(`Error creating admin: ${error.message}`);
    await mongoose.connection.close();
    process.exit(1);
  }
};

createAdmin();

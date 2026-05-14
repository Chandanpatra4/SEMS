import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    const sessionId = randomUUID();
    user.activeSessionId = sessionId;
    await user.save();

    const token = generateToken(user._id, user.role, sessionId);

    return res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        enrollmentId: user.enrollmentId,
        branch: user.branch,
        year: user.year,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const logoutUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (user) {
      user.activeSessionId = null;
      await user.save();
    }

    return res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export { loginUser, logoutUser };

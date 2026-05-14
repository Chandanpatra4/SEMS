import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Token missing',
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const tokenUserId = decoded.userId || decoded.id;
    const tokenSessionId = decoded.sessionId;

    if (!tokenUserId || !tokenSessionId) {
      return res.status(401).json({
        success: false,
        message: 'Token invalid',
      });
    }

    const user = await User.findById(tokenUserId).select('role activeSessionId');

    if (!user || user.activeSessionId !== tokenSessionId) {
      return res.status(401).json({
        success: false,
        message: 'Session expired. Please login again.',
      });
    }

    req.user = {
      id: tokenUserId,
      role: decoded.role || user.role,
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired',
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Token invalid',
    });
  }
};

export { protect };

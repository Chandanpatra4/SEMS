import jwt from 'jsonwebtoken';

const generateToken = (userId, role, sessionId) =>
  jwt.sign(
    {
      userId,
      role,
      sessionId,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRE,
    }
  );

export default generateToken;

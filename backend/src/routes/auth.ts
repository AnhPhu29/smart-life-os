import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'smartlifeossecretkeyforproduction2024';
const JWT_EXPIRES_IN = '24h';

router.post('/register', async (req, res) => {
  try {
    const { username, email, password, fullName } = req.body;
    
    // Check existing
    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ username }, { email }] }
    });
    if (existingUser) {
      return res.status(400).json({ message: 'Username or Email already in use' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { username, email, passwordHash, fullName }
    });

    const accessToken = jwt.sign({ sub: user.username }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    const refreshToken = jwt.sign({ sub: user.username }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      accessToken,
      refreshToken,
      user: {
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) {
      return res.status(401).json({ message: 'Bad credentials' });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ message: 'Bad credentials' });
    }

    const accessToken = jwt.sign({ sub: user.username }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    const refreshToken = jwt.sign({ sub: user.username }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      accessToken,
      refreshToken,
      user: {
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/refresh', async (req, res) => {
  try {
    const refreshToken = req.headers['refresh-token'] as string;
    if (!refreshToken) return res.status(401).json({ message: 'No refresh token provided' });

    const payload = jwt.verify(refreshToken, JWT_SECRET) as any;
    const user = await prisma.user.findUnique({ where: { username: payload.sub } });
    if (!user) return res.status(401).json({ message: 'Invalid token' });

    const newAccessToken = jwt.sign({ sub: user.username }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    const newRefreshToken = jwt.sign({ sub: user.username }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      user: {
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role
      }
    });
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired refresh token' });
  }
});

export default router;

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth.js';
import roomRoutes from './routes/rooms.js';
import userRoutes from './routes/users.js';
import adminRoutes from './routes/admin.js';
import aiRoutes from './routes/ai.js';
import bookingRoutes from './routes/bookings.js';
import reportRoutes from './routes/reports.js';
import favoriteRoutes from './routes/favorites.js';
import uploadRoutes from './routes/upload.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Static file serving for uploads
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/upload', uploadRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'YouRoom AI Server is running',
    aiProvider: process.env.GEMINI_API_KEY ? 'Google Gemini AI (Live)' : 'Mock AI Mode',
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Endpoint không tồn tại' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Lỗi máy chủ nội bộ',
  });
});

app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`🚀 YouRoom AI Server running on http://localhost:${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🤖 AI Status: ${process.env.GEMINI_API_KEY ? 'Google Gemini AI (Configured)' : 'Mock Mode (Ready)'}`);
  console.log(`📁 Uploads dir: /uploads`);
  console.log(`===============================================`);
});

export default app;

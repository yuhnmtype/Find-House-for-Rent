const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes    = require('./routes/auth');
const houseRoutes   = require('./routes/houses');
const bookingRoutes = require('./routes/bookings');
const contractRoutes = require('./routes/contracts');
const paymentRoutes = require('./routes/payments');
const userRoutes      = require('./routes/users');
const favoriteRoutes  = require('./routes/favorites');
const historyRoutes   = require('./routes/history');
const aiRoutes        = require('./routes/ai');

const app = express();

// ── CORS ─────────────────────────────────────────────────────────────────────
// Support a comma-separated list of origins so dev (Live Server on 5500) and
// prod (deployed domain) can both work without code changes.
//   FRONTEND_URL=http://127.0.0.1:5500,https://yourprodsite.com
const rawOrigins = process.env.FRONTEND_URL || '*';
const allowedOrigins =
  rawOrigins === '*'
    ? '*'
    : rawOrigins.split(',').map((o) => o.trim());

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

// ── Body parsers ─────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Static uploads ───────────────────────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ── Health check ─────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    message: '🏠 Find House for Rent API – HCMC',
    version: '1.0.0',
    status: 'running',
  });
});

// ── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth',      authRoutes);
app.use('/api/houses',    houseRoutes);
app.use('/api/bookings',  bookingRoutes);
app.use('/api/contracts', contractRoutes);
app.use('/api/payments',  paymentRoutes);
app.use('/api/users',      userRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/history',   historyRoutes);
app.use('/api/ai',        aiRoutes);

// ── 404 handler ──────────────────────────────────────────────────────────────
// Catches any unmatched route and returns the same {success, message} shape
// that the rest of the API uses, instead of Express's default HTML 404 page.
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
});

// ── Global error handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
  });
});

module.exports = app;
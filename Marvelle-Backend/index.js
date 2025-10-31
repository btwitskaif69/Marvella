require('dotenv').config();
const express = require('express');
const cors = require('cors');

const userRoutes = require('./src/routes/user.routes');

const app = express();
const port = process.env.PORT || 5000;

// Only allow real, explicit origins (never "*") when using credentials
const allowedOrigins = [
  process.env.FRONTEND_URL,       // e.g. https://marvella-wine.vercel.app
  'http://localhost:5173',        // Vite dev
].filter(Boolean);                 // drop undefineds

const corsOptions = {
  origin(origin, callback) {
    // allow non-browser tools (Postman, curl) with no Origin
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('CORS: Origin not allowed: ' + origin), false);
  },
  credentials: true, // REQUIRED for Access-Control-Allow-Credentials: true
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

// Apply CORS globally; this also handles preflight automatically in Express 5
app.use(cors(corsOptions));

app.use(express.json());

// Health/root
app.get('/', (_req, res) => {
  res.status(200).json({ message: 'Marvelle API is running successfully.' });
});

// API routes
app.use('/api/users', userRoutes);

// Optional: turn CORS origin rejections into JSON (helps in dev)
app.use((err, _req, res, _next) => {
  if (err && String(err.message || '').startsWith('CORS:')) {
    return res.status(403).json({ error: err.message });
  }
  return res.status(500).json({ error: 'Server error' });
});

// Local development server (Vercel will import the handler and not call listen)
if (process.env.NODE_ENV !== 'production') {
  app.listen(port, () => {
    console.log(`🚀 Server is running on http://localhost:${port}`);
  });
}

module.exports = app;

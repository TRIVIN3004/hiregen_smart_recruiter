const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const supabase = require('./config/supabase');
const apiRoutes = require('./routes/api');

const app = express();

// Verify Supabase Connection URL
if (process.env.SUPABASE_URL) {
  console.log('Supabase client initialized: ' + process.env.SUPABASE_URL);
} else {
  console.warn('WARNING: Supabase connection parameters are missing. Ensure SUPABASE_URL and SUPABASE_KEY are in backend/.env.');
}

// Security and Logging middlewares
// Customize Helmet content security policy to allow local dev assets
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: false
}));
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ensure upload folders exist and are static
const uploadsPath = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}
app.use('/uploads', express.static(uploadsPath));

// API Routes
app.use('/api', apiRoutes);

// Base route
app.get('/', (req, res) => {
  res.json({
    name: 'HireGen AI API Service',
    version: '1.0.0',
    status: 'Running'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err.stack || err.message);
  res.status(500).json({
    success: false,
    error: err.message || 'Internal Server Error'
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`HireGen API running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});

module.exports = app;

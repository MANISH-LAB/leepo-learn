import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Import routes
import profileRoutes from './routes/profiles.js';
import statsRoutes from './routes/stats.js';
import purchaseRoutes from './routes/purchases.js';
import hierarchyRoutes from './routes/hierarchy.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Initialize Supabase with service role key (bypasses RLS)
export const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/profiles', profileRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/purchases', purchaseRoutes);
app.use('/api/hierarchy', hierarchyRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Check if service role key is set
if (!process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY === 'YOUR_SERVICE_ROLE_KEY_HERE') {
  console.error('❌ ERROR: SUPABASE_SERVICE_ROLE_KEY not found in .env file!');
  console.error('Please add your service role key to .env file.');
  console.error('Get it from: Supabase Dashboard > Settings > API > service_role key');
  process.exit(1);
}

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 API endpoints:`);
  console.log(`   - GET  /health`);
  console.log(`   - GET  /api/profiles/:userId`);
  console.log(`   - POST /api/profiles`);
  console.log(`   - PUT  /api/profiles/:userId`);
  console.log(`   - GET  /api/stats/:userId`);
  console.log(`   - PUT  /api/stats/:userId`);
  console.log(`   - GET  /api/purchases/:userId`);
  console.log(`   - POST /api/purchases`);
  console.log(`   - GET  /api/hierarchy`);
  console.log('\n✅ Server is ready! Keep this terminal open.\n');
});

// Handle server errors
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use!`);
    console.error('Try a different port or close the application using that port.');
  } else {
    console.error('❌ Server error:', error);
  }
  process.exit(1);
});

// Keep the process alive
process.on('SIGINT', () => {
  console.log('\n\n👋 Shutting down server...');
  server.close(() => {
    console.log('Server stopped.');
    process.exit(0);
  });
});

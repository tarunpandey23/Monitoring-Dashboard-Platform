// Simple proxy server for frontend
// This proxies /api requests to backend service
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');

const app = express();

// Proxy API requests to backend
app.use('/api', createProxyMiddleware({
  target: process.env.BACKEND_URL || 'http://backend:8080',
  changeOrigin: true,
  pathRewrite: {
    '^/api': '', // remove /api prefix
  },
  logLevel: 'debug',
}));

// Serve static files
app.use(express.static(path.join(__dirname, 'build')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).send('healthy');
});

// Handle React routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

const PORT = process.env.PORT || 80;
app.listen(PORT, () => {
  console.log(`Frontend server running on port ${PORT}`);
  console.log(`Backend URL: ${process.env.BACKEND_URL || 'http://backend:8080'}`);
});


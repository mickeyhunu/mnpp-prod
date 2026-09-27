const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');

const app = express();
const frontendRoot = path.resolve(__dirname, '../../frontend');

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(express.json({ limit: '100kb' }));
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api', (req, res) => res.status(404).json({ message: '존재하지 않는 API입니다.' }));
app.use(express.static(frontendRoot));
app.get('*', (req, res) => res.sendFile(path.join(frontendRoot, 'index.html')));
app.use((error, req, res, next) => {
  console.error(error);
  if (res.headersSent) return next(error);
  return res.status(500).json({ message: '서버 오류가 발생했습니다.' });
});

module.exports = app;

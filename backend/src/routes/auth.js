const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const authenticate = require('../middleware/auth');

const router = express.Router();
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

router.post('/register', async (req, res, next) => {
  try {
    const { email, password, nickname, realName, verifiedGender, identityToken } = req.body;
    if (!emailPattern.test(email || '') || !password || password.length < 8 || !nickname?.trim()) {
      return res.status(400).json({ message: '이메일, 닉네임, 8자 이상 비밀번호를 확인해 주세요.' });
    }
    if (!['male', 'female'].includes(verifiedGender) || !identityToken) {
      return res.status(400).json({ message: '본인인증을 먼저 완료해 주세요.' });
    }

    // In production, verify identityToken with the identity provider on the server.
    const passwordHash = await bcrypt.hash(password, 12);
    const [result] = await db.execute(
      `INSERT INTO users (email, password_hash, nickname, real_name, gender, identity_verified_at)
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [email.toLowerCase(), passwordHash, nickname.trim(), realName?.trim() || nickname.trim(), verifiedGender],
    );
    return res.status(201).json({ id: result.insertId, message: '가입이 완료되었습니다.' });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: '이미 사용 중인 이메일 또는 닉네임입니다.' });
    return next(error);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const [rows] = await db.execute('SELECT * FROM users WHERE email = ? LIMIT 1', [String(req.body.email || '').toLowerCase()]);
    const user = rows[0];
    if (!user || !(await bcrypt.compare(req.body.password || '', user.password_hash))) {
      return res.status(401).json({ message: '이메일 또는 비밀번호가 올바르지 않습니다.' });
    }
    const payload = { id: user.id, nickname: user.nickname, gender: user.gender };
    const token = jwt.sign(payload, process.env.JWT_SECRET || 'development-only-secret', { expiresIn: '7d' });
    return res.json({ token, user: payload });
  } catch (error) { return next(error); }
});

router.get('/me', authenticate, async (req, res, next) => {
  try {
    const [rows] = await db.execute(
      'SELECT id, email, nickname, gender, created_at AS createdAt FROM users WHERE id = ?',
      [req.user.id],
    );
    if (!rows[0]) return res.status(404).json({ message: '회원을 찾을 수 없습니다.' });
    return res.json(rows[0]);
  } catch (error) { return next(error); }
});

module.exports = router;

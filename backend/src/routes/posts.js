const express = require('express');
const db = require('../db');
const authenticate = require('../middleware/auth');
const { BOARDS, canAccessBoard } = require('../access');

const router = express.Router();
router.use(authenticate);

router.get('/', async (req, res, next) => {
  const board = req.query.board || 'common';
  if (!BOARDS[board]) return res.status(400).json({ message: '존재하지 않는 게시판입니다.' });
  if (!canAccessBoard(req.user.gender, board)) return res.status(403).json({ message: '접근할 수 없는 전용 게시판입니다.' });
  try {
    const [rows] = await db.execute(
      `SELECT p.id, p.title, p.content, p.board, p.view_count AS views, p.created_at AS createdAt,
              u.nickname, u.gender
       FROM posts p JOIN users u ON u.id = p.user_id
       WHERE p.board = ? ORDER BY p.created_at DESC LIMIT 50`,
      [board],
    );
    return res.json(rows);
  } catch (error) { return next(error); }
});

router.post('/', async (req, res, next) => {
  const { board, title, content } = req.body;
  if (!canAccessBoard(req.user.gender, board)) return res.status(403).json({ message: '이 게시판에는 글을 쓸 수 없습니다.' });
  if (!title?.trim() || !content?.trim()) return res.status(400).json({ message: '제목과 내용을 입력해 주세요.' });
  try {
    const [result] = await db.execute(
      'INSERT INTO posts (user_id, board, title, content) VALUES (?, ?, ?, ?)',
      [req.user.id, board, title.trim().slice(0, 120), content.trim()],
    );
    return res.status(201).json({ id: result.insertId, message: '게시글을 등록했습니다.' });
  } catch (error) { return next(error); }
});

module.exports = router;

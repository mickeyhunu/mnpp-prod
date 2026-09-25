const test = require('node:test');
const assert = require('node:assert/strict');
const { canAccessBoard } = require('../src/access');

test('공동경비구역은 모든 성별이 접근한다', () => {
  assert.equal(canAccessBoard('male', 'common'), true);
  assert.equal(canAccessBoard('female', 'common'), true);
});

test('성별 전용 갤러리는 인증 성별과 일치해야 한다', () => {
  assert.equal(canAccessBoard('male', 'male'), true);
  assert.equal(canAccessBoard('male', 'female'), false);
  assert.equal(canAccessBoard('female', 'female'), true);
  assert.equal(canAccessBoard('female', 'male'), false);
});

test('알 수 없는 게시판은 거부한다', () => assert.equal(canAccessBoard('male', 'unknown'), false));

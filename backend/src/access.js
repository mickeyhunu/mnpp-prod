const BOARDS = Object.freeze({
  male: { label: '남성전용 갤러리', gender: 'male' },
  female: { label: '여성전용 갤러리', gender: 'female' },
  common: { label: '공동경비구역', gender: null },
});

function canAccessBoard(gender, board) {
  const policy = BOARDS[board];
  return Boolean(policy && (!policy.gender || policy.gender === gender));
}

module.exports = { BOARDS, canAccessBoard };

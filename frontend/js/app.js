const previewPosts = [
  { id: 1, title: '이번 주말 성수 분위기 좋은 라운지 추천해요', nickname: '밤산책러', gender: 'female', createdAt: '방금 전', views: 248, comments: 18, hot: true },
  { id: 2, title: '처음 가는 분들을 위한 기본 에티켓 정리', nickname: '네온사인', gender: 'male', createdAt: '12분 전', views: 186, comments: 12 },
  { id: 3, title: '금요일 이태원, 오랜만에 제대로 즐겼네요', nickname: '문라이트', gender: 'female', createdAt: '25분 전', views: 421, comments: 31, hot: true },
  { id: 4, title: '혼자 가도 편안했던 재즈바 리스트 공유', nickname: '새벽두시', gender: 'male', createdAt: '41분 전', views: 119, comments: 8 },
  { id: 5, title: '요즘 듣기 좋은 플레이리스트 같이 나눠요', nickname: '보랏빛밤', gender: 'female', createdAt: '1시간 전', views: 97, comments: 16 },
];

const state = { token: localStorage.getItem('nightwave_token'), user: JSON.parse(localStorage.getItem('nightwave_user') || 'null'), board: 'common', posts: previewPosts };
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

function renderPosts(posts = state.posts) {
  $('#postList').innerHTML = posts.map((post) => `<article class="post">
    <div class="post-gender ${post.gender}">${post.gender === 'male' ? '♂' : '♀'}</div>
    <div class="post-main"><h3>${post.hot ? '<span class="hot">HOT</span>' : ''}${escapeHtml(post.title)}</h3><div class="post-meta"><b>${escapeHtml(post.nickname)}</b><span>${formatDate(post.createdAt)}</span><span>조회 ${post.views || 0}</span></div></div>
    <div class="post-stats"><span>♡ ${post.views || 0}</span><span>◯ ${post.comments || 0}</span></div>
  </article>`).join('') || '<p class="modal-copy">아직 첫 이야기가 없어요. 새로운 이야기를 남겨주세요.</p>';
}

function escapeHtml(value) { const el = document.createElement('div'); el.textContent = value || ''; return el.innerHTML; }
function formatDate(value) { if (!value || /전$/.test(value)) return value || ''; return new Intl.DateTimeFormat('ko-KR', { month: 'short', day: 'numeric' }).format(new Date(value)); }
function toast(message) { const el = $('#toast'); el.textContent = message; el.classList.add('show'); setTimeout(() => el.classList.remove('show'), 2400); }

async function api(url, options = {}) {
  const response = await fetch(url, { ...options, headers: { 'Content-Type': 'application/json', ...(state.token ? { Authorization: `Bearer ${state.token}` } : {}), ...options.headers } });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || '요청을 처리하지 못했습니다.');
  return data;
}

function updateSession() {
  $('#guestActions').classList.toggle('hidden', Boolean(state.user));
  $('#memberActions').classList.toggle('hidden', !state.user);
  if (state.user) $('#avatarButton').textContent = state.user.nickname.slice(0, 1).toUpperCase();
  $$('.board-tab').forEach((tab) => {
    const restricted = tab.dataset.board !== 'common';
    tab.classList.toggle('locked', restricted && (!state.user || state.user.gender !== tab.dataset.board));
  });
}

function openAuth(panel = 'login') {
  $('#loginPanel').classList.toggle('hidden', panel !== 'login');
  $('#registerPanel').classList.toggle('hidden', panel !== 'register');
  $('#formMessage').textContent = '';
  $('#authModal').showModal();
}

async function selectBoard(board) {
  if (board !== 'common' && (!state.user || state.user.gender !== board)) {
    toast(state.user ? '본인인증 성별에 맞는 전용 갤러리만 이용할 수 있어요.' : '로그인 후 전용 갤러리를 이용할 수 있어요.');
    if (!state.user) openAuth('login');
    return;
  }
  state.board = board;
  $$('.board-tab').forEach((tab) => tab.classList.toggle('active', tab.dataset.board === board));
  const names = { common: ['공동경비구역', '성별에 관계없이 모두가 나누는 이야기'], male: ['남성전용 갤러리', '남성 인증 멤버만 나누는 이야기'], female: ['여성전용 갤러리', '여성 인증 멤버만 나누는 이야기'] };
  [$('#boardTitle').textContent, $('#boardDescription').textContent] = names[board];
  if (!state.token) { renderPosts(board === 'common' ? previewPosts : []); return; }
  try { state.posts = await api(`/api/posts?board=${board}`); renderPosts(); } catch (error) { toast(error.message); }
}

$$('[data-modal]').forEach((button) => button.addEventListener('click', () => openAuth(button.dataset.modal)));
$$('.modal-close').forEach((button) => button.addEventListener('click', () => button.closest('dialog').close()));
$$('[data-switch]').forEach((button) => button.addEventListener('click', () => openAuth(button.dataset.switch)));
$$('.board-tab').forEach((button) => button.addEventListener('click', () => selectBoard(button.dataset.board)));

$('#loginForm').addEventListener('submit', async (event) => {
  event.preventDefault(); const values = Object.fromEntries(new FormData(event.currentTarget));
  try { const data = await api('/api/auth/login', { method: 'POST', body: JSON.stringify(values) }); state.token = data.token; state.user = data.user; localStorage.setItem('nightwave_token', data.token); localStorage.setItem('nightwave_user', JSON.stringify(data.user)); updateSession(); $('#authModal').close(); toast(`${data.user.nickname}님, 좋은 밤이에요.`); selectBoard('common'); } catch (error) { $('#formMessage').textContent = error.message; }
});

$('#registerForm').addEventListener('submit', async (event) => {
  event.preventDefault(); const values = Object.fromEntries(new FormData(event.currentTarget));
  try { await api('/api/auth/register', { method: 'POST', body: JSON.stringify(values) }); event.currentTarget.reset(); openAuth('login'); $('#formMessage').textContent = '가입 완료! 이제 로그인해 주세요.'; } catch (error) { $('#formMessage').textContent = error.message; }
});

$('#writeButton').addEventListener('click', () => state.user ? $('#writeModal').showModal() : openAuth('login'));
$('#mobileWriteButton').addEventListener('click', () => $('#writeButton').click());
$('#mobileSearchButton').addEventListener('click', () => { $('#boards').scrollIntoView(); setTimeout(() => $('#searchInput').focus(), 350); });
$('#mobileProfileButton').addEventListener('click', () => state.user ? $('#myPageButton').click() : openAuth('login'));
$('#writeForm').addEventListener('submit', async (event) => { event.preventDefault(); const values = Object.fromEntries(new FormData(event.currentTarget)); try { await api('/api/posts', { method: 'POST', body: JSON.stringify({ ...values, board: state.board }) }); event.currentTarget.reset(); $('#writeModal').close(); toast('새 이야기를 등록했어요.'); selectBoard(state.board); } catch (error) { $('.form-message', $('#writeModal')).textContent = error.message; } });
$('#searchInput').addEventListener('input', (event) => renderPosts(state.posts.filter((post) => post.title.toLowerCase().includes(event.target.value.toLowerCase()))));
$('#loadMore').addEventListener('click', () => toast('모든 최신 이야기를 확인했어요.'));
$('#myPageButton').addEventListener('click', () => toast(`${state.user?.nickname} · ${state.user?.gender === 'male' ? '남성' : '여성'} 인증 멤버`));

renderPosts(); updateSession();

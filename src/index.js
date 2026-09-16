// ==========================================
// 🔐 HELPERS & AUTH
// ==========================================
async function getSession(request) {
  const cookie = request.headers.get('cookie') || '';
  const match = cookie.match(/session=([^;]+)/);
  if (!match) return null;
  try { return JSON.parse(atob(match[1])); } catch (e) { return null; }
}

function setSessionCookie(userId, role, username) {
  const payload = btoa(JSON.stringify({ userId, role, username }));
  return `session=${payload}; Path=/; HttpOnly; Secure; Max-Age=86400; SameSite=Lax`;
}

function clearSessionCookie() {
  return 'session=; Path=/; HttpOnly; Secure; Max-Age=0';
}

// ==========================================
// 🎨 HTML LAYOUT (Mobile Responsive + Collapsing Sidebar)
// ==========================================
function htmlLayout(title, content, user = null) {
  let sidebarLinks = '';
  if (user) {
    sidebarLinks = `
      <a href="/dashboard" class="flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 font-medium mb-1 text-slate-600 hover:bg-white/50 hover:text-emerald-700">
        <i class="bi bi-speedometer2 text-lg w-6 text-center"></i> Dashboard
      </a>
      <a href="/generate" class="flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 font-medium mb-1 text-slate-600 hover:bg-white/50 hover:text-emerald-700">
        <i class="bi bi-key-fill text-lg w-6 text-center"></i> Generate SDK
      </a>
      <a href="/keys" class="flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 font-medium mb-1 text-slate-600 hover:bg-white/50 hover:text-emerald-700">
        <i class="bi bi-view-list text-lg w-6 text-center"></i> SDK Keys
      </a>
    `;
    if (user.role === 'OWNER') {
      sidebarLinks += `
        <a href="/server" class="flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 font-medium mb-1 text-slate-600 hover:bg-white/50 hover:text-emerald-700">
          <i class="bi bi-hdd-network-fill text-lg w-6 text-center"></i> Server Control
        </a>
        <a href="/referral" class="flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 font-medium mb-1 text-slate-600 hover:bg-white/50 hover:text-emerald-700">
          <i class="bi bi-person-plus-fill text-lg w-6 text-center"></i> Referral
        </a>
      `;
    }
  }

  const userMenu = user ? `
    <div class="flex items-center gap-3">
      <div class="hidden sm:flex flex-col items-end">
        <span class="text-sm font-bold text-slate-700">${user.username}</span>
        <span class="text-[10px] font-extrabold tracking-widest bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent uppercase">${user.role}</span>
      </div>
      <a href="/logout" class="w-10 h-10 rounded-2xl bg-gradient-to-br from-red-500 to-pink-500 text-white flex items-center justify-center font-bold text-lg border-2 border-white/80 cursor-pointer transition-all duration-300 hover:scale-110">
        <i class="bi bi-box-arrow-right"></i>
      </a>
    </div>
  ` : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - SDK Panel</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css">
  <style>
    body { background: linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 25%, #CCFBF1 50%, #E0F2FE 75%, #F0FDFA 100%); background-attachment: fixed; min-height: 100vh; }
    .glass-card { background: linear-gradient(135deg, rgba(255, 255, 255, 0.85), rgba(255, 255, 255, 0.6)); backdrop-filter: blur(24px); border-radius: 24px; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.8); border: 1px solid rgba(255, 255, 255, 0.7); }
    .glass-sidebar { background: linear-gradient(180deg, rgba(255, 255, 255, 0.75), rgba(255, 255, 255, 0.55)); backdrop-filter: blur(28px); border-right: 1px solid rgba(255, 255, 255, 0.6); }
    .glass-header { background: linear-gradient(180deg, rgba(255, 255, 255, 0.85), rgba(255, 255, 255, 0.65)); backdrop-filter: blur(24px); border-bottom: 1px solid rgba(255, 255, 255, 0.6); }
    .btn-premium { background: linear-gradient(135deg, #10B981, #14B8A6, #06B6D4); color: white !important; transition: all 0.4s ease; box-shadow: 0 8px 20px rgba(16, 185, 129, 0.3); border: none; cursor: pointer; }
    .btn-premium:hover { transform: translateY(-2px); box-shadow: 0 12px 28px rgba(16, 185, 129, 0.5); }
    input, select { border-radius: 14px !important; }
    .tab-btn { padding: 8px 20px; border-radius: 12px; font-weight: 600; font-size: 14px; color: #64748B; transition: all 0.3s; cursor: pointer; border: none; background: rgba(255,255,255,0.5); }
    .tab-btn.active { background: linear-gradient(135deg, #8B5CF6, #6366F1); color: white; box-shadow: 0 6px 16px rgba(139, 92, 246, 0.4); }
    .tab-btn.active-bcore { background: linear-gradient(135deg, #F59E0B, #EF4444); color: white; box-shadow: 0 6px 16px rgba(245, 158, 11, 0.4); }
  </style>
</head>
<body class="text-slate-800 flex h-screen overflow-hidden selection:bg-emerald-500/20">
  ${user ? `
  <div id="sidebar-overlay" onclick="toggleSidebar()" class="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 hidden md:hidden"></div>
  <aside id="sidebar" class="w-72 glass-sidebar flex flex-col absolute inset-y-0 left-0 transform -translate-x-full md:relative md:translate-x-0 transition-transform duration-300 ease-in-out z-50">
    <div class="h-20 flex items-center justify-between px-6 border-b border-white/50">
      <h1 class="text-lg font-extrabold text-slate-800 tracking-tight flex items-center gap-3">
        <div class="w-10 h-10 shrink-0 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-lg"><i class="bi bi-boxes text-lg"></i></div>
        <span class="uppercase bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">SDK PANEL</span>
      </h1>
      <button onclick="toggleSidebar()" class="md:hidden text-slate-400 hover:text-slate-600 text-2xl"><i class="bi bi-x-lg"></i></button>
    </div>
    <nav class="flex-1 py-6 px-4 overflow-y-auto space-y-1">${sidebarLinks}</nav>
  </aside>` : ''}
  
  <div class="flex-1 flex flex-col h-screen overflow-y-auto relative w-full">
    <header class="h-16 md:h-20 glass-header sticky top-0 z-30 flex items-center justify-between px-4 lg:px-10">
      <div class="flex items-center gap-3 w-1/4">
        ${user ? `<button onclick="toggleSidebar()" class="md:hidden text-slate-600 hover:text-emerald-600 transition-all bg-white/70 backdrop-blur p-2.5 rounded-xl border border-white shadow-sm"><i class="bi bi-list text-2xl"></i></button>` : ''}
        <div class="hidden md:flex flex-col">
          <span class="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">SDK Workspace</span>
          <h2 class="font-bold text-slate-700 text-[15px]">Welcome</h2>
        </div>
      </div>
      <div class="flex items-center justify-end gap-3 z-10 w-1/4 md:w-auto">${userMenu}</div>
    </header>
    <main class="p-4 md:p-8 lg:p-10 pb-20 relative z-10 flex-1 overflow-y-auto">${content}</main>
  </div>
  <script>
    function toggleSidebar() {
      document.getElementById('sidebar').classList.toggle('-translate-x-full');
      document.getElementById('sidebar-overlay').classList.toggle('hidden');
    }
    function switchTab(wrapperId, tabName) {
      const wrapper = document.getElementById(wrapperId);
      if(!wrapper) return;
      wrapper.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
      wrapper.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active', 'active-bcore'));
      wrapper.querySelector('#tab-' + tabName).classList.remove('hidden');
      const btn = wrapper.querySelector('[data-tab="' + tabName + '"]');
      btn.classList.add(tabName === 'bcore' ? 'active-bcore' : 'active');
    }
  </script>
</body>
</html>`;
}

// ==========================================
// 🚦 ROUTE HANDLERS
// ==========================================
async function handleLoginGet(req, env) {
  const session = await getSession(req);
  if (session) return Response.redirect(new URL('/dashboard', req.url), 302);
  const content = `
    <div class="max-w-md mx-auto glass-card p-8 mt-10">
      <h2 class="text-2xl font-black text-slate-800 mb-6 text-center">Login to SDK Panel</h2>
      <form method="POST" action="/login" class="space-y-4">
        <div><label class="block text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-2">Username</label>
        <input type="text" name="username" required class="w-full bg-white/50 border border-white/60 px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-400"></div>
        <div><label class="block text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-2">Password</label>
        <input type="password" name="password" required class="w-full bg-white/50 border border-white/60 px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-400"></div>
        <button type="submit" class="btn-premium w-full py-3.5 rounded-2xl font-extrabold text-sm uppercase tracking-wider">Login</button>
      </form>
      <p class="text-center text-sm text-slate-500 mt-6">No account? <a href="/register" class="text-emerald-600 font-bold hover:underline">Register via Referral</a></p>
    </div>`;
  return new Response(htmlLayout('Login', content), { headers: { 'Content-Type': 'text/html' } });
}

async function handleLoginPost(req, env) {
  const formData = await req.formData();
  const username = formData.get('username');
  const password = formData.get('password');
  const user = await env.DB.prepare('SELECT id, username, role, password_hash FROM users WHERE username = ?').bind(username).first();
  if (user && password === user.password_hash) { 
    const cookie = setSessionCookie(user.id, user.role, user.username);
    return new Response(null, { status: 302, headers: { 'Location': '/dashboard', 'Set-Cookie': cookie } });
  }
  return new Response(htmlLayout('Login', `<div class="max-w-md mx-auto glass-card p-8 mt-10 text-center text-red-600 font-bold">Invalid credentials</div>`), { headers: { 'Content-Type': 'text/html' } });
}

async function handleRegisterGet(req, env) {
  const content = `
    <div class="max-w-md mx-auto glass-card p-8 mt-10">
      <h2 class="text-2xl font-black text-slate-800 mb-2 text-center">Register</h2>
      <p class="text-center text-slate-500 text-sm mb-6">You need a valid referral code to register.</p>
      <form method="POST" action="/register" class="space-y-4">
        <div><label class="block text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-2">Referral Code</label>
        <input type="text" name="referral_code" required class="w-full bg-white/50 border border-white/60 px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-400 uppercase"></div>
        <div><label class="block text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-2">Username</label>
        <input type="text" name="username" required class="w-full bg-white/50 border border-white/60 px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-400"></div>
        <div><label class="block text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-2">Password</label>
        <input type="password" name="password" required class="w-full bg-white/50 border border-white/60 px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-400"></div>
        <button type="submit" class="btn-premium w-full py-3.5 rounded-2xl font-extrabold text-sm uppercase tracking-wider">Register</button>
      </form>
    </div>`;
  return new Response(htmlLayout('Register', content), { headers: { 'Content-Type': 'text/html' } });
}

async function handleRegisterPost(req, env) {
  const formData = await req.formData();
  const refCode = formData.get('referral_code').toUpperCase();
  const username = formData.get('username');
  const password = formData.get('password');

  const ref = await env.DB.prepare('SELECT * FROM referrals WHERE code = ? AND is_used = 0').bind(refCode).first();
  if (!ref) return new Response(htmlLayout('Register', `<div class="max-w-md mx-auto glass-card p-8 mt-10 text-center text-red-600 font-bold">Invalid or used referral code.</div>`), { headers: { 'Content-Type': 'text/html' } });

  try {
    await env.DB.prepare('INSERT INTO users (username, password_hash, role, created_by) VALUES (?, ?, ?, ?)').bind(username, password, ref.role_granted, ref.created_by).run();
    await env.DB.prepare('UPDATE referrals SET is_used = 1 WHERE code = ?').bind(refCode).run();
    return Response.redirect(new URL('/login', req.url), 302);
  } catch (e) {
    return new Response(htmlLayout('Register', `<div class="max-w-md mx-auto glass-card p-8 mt-10 text-center text-red-600 font-bold">Username already exists.</div>`), { headers: { 'Content-Type': 'text/html' } });
  }
}

async function handleDashboard(req, env) {
  const session = await getSession(req);
  if (!session) return Response.redirect(new URL('/login', req.url), 302);
  const stats = await env.DB.prepare(`SELECT (SELECT COUNT(*) FROM sdk_keys WHERE user_id = ?) as total_keys, (SELECT COUNT(*) FROM sdk_keys WHERE user_id = ? AND is_blocked = 0) as active_keys`).bind(session.userId, session.userId).first();
  
  const content = `
    <div class="max-w-6xl mx-auto">
      <h1 class="text-2xl md:text-3xl font-black text-slate-800 mb-6 flex items-center gap-3"><i class="bi bi-speedometer2 text-emerald-500"></i> Dashboard</h1>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div class="glass-card p-6"><p class="text-3xl font-black text-slate-800">${stats.total_keys}</p><p class="text-xs text-slate-500 font-medium mt-1">Total SDK Keys</p></div>
        <div class="glass-card p-6"><p class="text-3xl font-black text-slate-800">${stats.active_keys}</p><p class="text-xs text-slate-500 font-medium mt-1">Active Keys</p></div>
        <div class="glass-card p-6"><p class="text-3xl font-black text-slate-800">${session.role}</p><p class="text-xs text-slate-500 font-medium mt-1">Your Access Level</p></div>
      </div>
    </div>`;
  return new Response(htmlLayout('Dashboard', content, session), { headers: { 'Content-Type': 'text/html' } });
}

async function handleGenerateGet(req, env) {
  const session = await getSession(req);
  if (!session) return Response.redirect(new URL('/login', req.url), 302);
  const formHtml = (engine, color) => `
    <form method="POST" class="space-y-5">
      <input type="hidden" name="engine" value="${engine}">
      <div><label class="block text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-2">Duration</label>
      <select name="duration" class="w-full bg-white/50 border border-white/60 px-4 py-3 text-sm font-semibold"><option value="7">7 Days</option><option value="15">15 Days</option><option value="30" selected>30 Days</option><option value="60">60 Days</option></select></div>
      <div class="grid grid-cols-2 gap-4">
        <div><label class="block text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-2">Pkg Limit</label><input type="number" name="pkg_limit" min="1" max="10" value="1" class="w-full bg-white/50 border border-white/60 px-4 py-3 text-sm font-bold text-center"></div>
        <div><label class="block text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-2">App Limit</label><input type="number" name="app_limit" min="1" max="20" value="1" class="w-full bg-white/50 border border-white/60 px-4 py-3 text-sm font-bold text-center"></div>
      </div>
      <div class="flex gap-4">
        <label class="flex items-center gap-2 bg-white/50 px-4 py-3 rounded-2xl border border-white/60 cursor-pointer"><input type="checkbox" name="feature1" checked class="w-5 h-5 rounded accent-emerald-500"><span class="text-sm font-bold text-slate-700">Feature 1</span></label>
        <label class="flex items-center gap-2 bg-white/50 px-4 py-3 rounded-2xl border border-white/60 cursor-pointer"><input type="checkbox" name="feature2" checked class="w-5 h-5 rounded accent-emerald-500"><span class="text-sm font-bold text-slate-700">Feature 2</span></label>
      </div>
      <button type="submit" class="btn-premium w-full py-3.5 rounded-2xl font-extrabold text-sm uppercase tracking-wider">Generate ${engine} Key</button>
    </form>`;

  const content = `
    <div class="max-w-2xl mx-auto">
      <h1 class="text-2xl md:text-3xl font-black text-slate-800 mb-6 flex items-center gap-3"><i class="bi bi-key-fill text-emerald-500"></i> Generate SDK</h1>
      <div id="generateWrapper" class="glass-card p-6 md:p-8">
        <div class="flex gap-2 mb-6">
          <button class="tab-btn active" data-tab="mundo" onclick="switchTab('generateWrapper', 'mundo')">MUNDO</button>
          <button class="tab-btn" data-tab="bcore" onclick="switchTab('generateWrapper', 'bcore')">BCORE</button>
        </div>
        <div id="tab-mundo" class="tab-content">${formHtml('MUNDO', 'purple')}</div>
        <div id="tab-bcore" class="tab-content hidden">${formHtml('BCORE', 'amber')}</div>
      </div>
    </div>`;
  return new Response(htmlLayout('Generate Key', content, session), { headers: { 'Content-Type': 'text/html' } });
}

async function handleGeneratePost(req, env) {
  const session = await getSession(req);
  if (!session) return Response.redirect(new URL('/login', req.url), 302);
  const formData = await req.formData();
  const sdk_key = Math.random().toString(36).substring(2, 10).toUpperCase() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase();
  await env.DB.prepare(`INSERT INTO sdk_keys (user_id, engine, sdk_key, duration_days, pkg_limit, app_limit, feature1, feature2) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`).bind(session.userId, formData.get('engine'), sdk_key, parseInt(formData.get('duration')), parseInt(formData.get('pkg_limit')), parseInt(formData.get('app_limit')), formData.has('feature1')?1:0, formData.has('feature2')?1:0).run();
  return Response.redirect(new URL('/keys', req.url), 302);
}

async function handleKeysGet(req, env) {
  const session = await getSession(req);
  if (!session) return Response.redirect(new URL('/login', req.url), 302);
  const keys = await env.DB.prepare('SELECT * FROM sdk_keys WHERE user_id = ? ORDER BY id DESC').bind(session.userId).all();
  
  const renderKeys = (engine, color) => {
    const filtered = keys.results.filter(k => k.engine === engine);
    if (filtered.length === 0) return `<p class="text-center text-slate-400 py-10">No ${engine} keys found.</p>`;
    return filtered.map(k => `
      <div class="glass-card p-4 mb-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div class="flex-1 min-w-0">
          <p class="font-mono text-sm font-bold text-slate-700 truncate">${k.sdk_key}</p>
          <p class="text-[10px] text-slate-400 mt-1">${k.duration_days} Days • ${k.pkg_limit} Pkg • ${k.app_limit} App</p>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-[10px] font-extrabold px-2 py-1 rounded-lg ${k.is_blocked ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-500'}">${k.is_blocked ? 'BLOCKED' : 'ACTIVE'}</span>
          <form method="POST" class="inline">
            <input type="hidden" name="key_id" value="${k.id}">
            <input type="hidden" name="action" value="${k.is_blocked ? 'unblock' : 'block'}">
            <button class="px-3 py-1.5 text-xs font-bold rounded-xl bg-white/60 hover:bg-white text-slate-600">${k.is_blocked ? 'Unlock' : 'Lock'}</button>
          </form>
          <form method="POST" class="inline" onsubmit="return confirm('Delete this key?')">
            <input type="hidden" name="key_id" value="${k.id}">
            <input type="hidden" name="action" value="delete">
            <button class="px-3 py-1.5 text-xs font-bold rounded-xl bg-red-50 text-red-500 hover:bg-red-100">Delete</button>
          </form>
        </div>
      </div>
    `).join('');
  };

  const content = `
    <div class="max-w-4xl mx-auto">
      <h1 class="text-2xl md:text-3xl font-black text-slate-800 mb-6 flex items-center gap-3"><i class="bi bi-view-list text-emerald-500"></i> SDK Keys</h1>
      <div id="keysWrapper" class="glass-card p-6">
        <div class="flex gap-2 mb-6">
          <button class="tab-btn active" data-tab="mundo" onclick="switchTab('keysWrapper', 'mundo')">MUNDO</button>
          <button class="tab-btn" data-tab="bcore" onclick="switchTab('keysWrapper', 'bcore')">BCORE</button>
        </div>
        <div id="tab-mundo" class="tab-content">${renderKeys('MUNDO')}</div>
        <div id="tab-bcore" class="tab-content hidden">${renderKeys('BCORE')}</div>
      </div>
    </div>`;
  return new Response(htmlLayout('SDK Keys', content, session), { headers: { 'Content-Type': 'text/html' } });
}

async function handleKeysPost(req, env) {
  const session = await getSession(req);
  if (!session) return Response.redirect(new URL('/login', req.url), 302);
  const formData = await req.formData();
  const action = formData.get('action');
  const keyId = formData.get('key_id');
  if (action === 'block') await env.DB.prepare('UPDATE sdk_keys SET is_blocked = 1 WHERE id = ? AND user_id = ?').bind(keyId, session.userId).run();
  if (action === 'unblock') await env.DB.prepare('UPDATE sdk_keys SET is_blocked = 0 WHERE id = ? AND user_id = ?').bind(keyId, session.userId).run();
  if (action === 'delete') await env.DB.prepare('DELETE FROM sdk_keys WHERE id = ? AND user_id = ?').bind(keyId, session.userId).run();
  return Response.redirect(new URL('/keys', req.url), 302);
}

async function handleServerGet(req, env) {
  const session = await getSession(req);
  if (!session || session.role !== 'OWNER') return Response.redirect(new URL('/dashboard', req.url), 302);
  const status = await env.DB.prepare('SELECT * FROM server_status').all();
  const getStat = (engine) => status.results.find(s => s.engine === engine) || { maintenance_mode: 0, maintenance_message: '' };
  const m = getStat('MUNDO'), b = getStat('BCORE');

  const renderServer = (engine, data, color) => `
    <div class="glass-card p-6 mb-6">
      <h3 class="text-xl font-black text-slate-800 mb-4">${engine} Engine</h3>
      <form method="POST" class="space-y-4">
        <input type="hidden" name="engine" value="${engine}">
        <div class="flex items-center justify-between bg-white/50 p-4 rounded-2xl border border-white/60">
          <span class="font-bold text-slate-700">Maintenance Mode</span>
          <label class="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" name="maintenance_mode" value="1" ${data.maintenance_mode ? 'checked' : ''} class="sr-only peer">
            <div class="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
          </label>
        </div>
        <div><label class="block text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-2">Maintenance Message</label>
        <input type="text" name="maintenance_message" value="${data.maintenance_message}" class="w-full bg-white/50 border border-white/60 px-4 py-3 text-sm font-semibold"></div>
        <button type="submit" class="btn-premium w-full py-3 rounded-2xl font-extrabold text-sm uppercase tracking-wider">Save ${engine} Status</button>
      </form>
    </div>`;

  const content = `
    <div class="max-w-3xl mx-auto">
      <h1 class="text-2xl md:text-3xl font-black text-slate-800 mb-6 flex items-center gap-3"><i class="bi bi-hdd-network-fill text-emerald-500"></i> Server Control</h1>
      ${renderServer('MUNDO', m)}
      ${renderServer('BCORE', b)}
    </div>`;
  return new Response(htmlLayout('Server Control', content, session), { headers: { 'Content-Type': 'text/html' } });
}

async function handleServerPost(req, env) {
  const session = await getSession(req);
  if (!session || session.role !== 'OWNER') return Response.redirect(new URL('/dashboard', req.url), 302);
  const formData = await req.formData();
  const engine = formData.get('engine');
  const mode = formData.get('maintenance_mode') === '1' ? 1 : 0;
  const msg = formData.get('maintenance_message') || '';
  await env.DB.prepare('INSERT OR REPLACE INTO server_status (engine, maintenance_mode, maintenance_message) VALUES (?, ?, ?)').bind(engine, mode, msg).run();
  return Response.redirect(new URL('/server', req.url), 302);
}

async function handleReferralGet(req, env) {
  const session = await getSession(req);
  if (!session || session.role !== 'OWNER') return Response.redirect(new URL('/dashboard', req.url), 302);
  const refs = await env.DB.prepare('SELECT * FROM referrals WHERE created_by = ? ORDER BY id DESC').bind(session.userId).all();

  const refList = refs.results.map(r => `
    <div class="glass-card p-4 mb-3 flex items-center justify-between">
      <div>
        <p class="font-mono font-bold text-slate-700">${r.code}</p>
        <p class="text-[10px] text-slate-400 mt-1">Grants Role: <span class="font-bold text-emerald-600">${r.role_granted}</span></p>
      </div>
      <span class="text-[10px] font-extrabold px-2 py-1 rounded-lg ${r.is_used ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-500'}">${r.is_used ? 'USED' : 'ACTIVE'}</span>
    </div>
  `).join('');

  const content = `
    <div class="max-w-2xl mx-auto">
      <h1 class="text-2xl md:text-3xl font-black text-slate-800 mb-6 flex items-center gap-3"><i class="bi bi-person-plus-fill text-emerald-500"></i> Generate Referral</h1>
      <div class="glass-card p-6 mb-8">
        <form method="POST" class="space-y-5">
          <div><label class="block text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-2">Select Role for New User</label>
          <select name="role" class="w-full bg-white/50 border border-white/60 px-4 py-3 text-sm font-semibold"><option value="ADMIN">Admin (Can generate keys)</option><option value="OWNER">Owner (Full access)</option></select></div>
          <button type="submit" class="btn-premium w-full py-3.5 rounded-2xl font-extrabold text-sm uppercase tracking-wider">Generate Referral Code</button>
        </form>
      </div>
      <h3 class="text-xl font-black text-slate-800 mb-4">Your Referral Codes</h3>
      ${refList || '<p class="text-center text-slate-400">No codes generated yet.</p>'}
    </div>`;
  return new Response(htmlLayout('Referral', content, session), { headers: { 'Content-Type': 'text/html' } });
}

async function handleReferralPost(req, env) {
  const session = await getSession(req);
  if (!session || session.role !== 'OWNER') return Response.redirect(new URL('/dashboard', req.url), 302);
  const formData = await req.formData();
  const code = Math.random().toString(36).substring(2, 10).toUpperCase();
  await env.DB.prepare('INSERT INTO referrals (code, role_granted, created_by) VALUES (?, ?, ?)').bind(code, formData.get('role'), session.userId).run();
  return Response.redirect(new URL('/referral', req.url), 302);
}

async function handleLogout(req, env) {
  return new Response(null, { status: 302, headers: { 'Location': '/login', 'Set-Cookie': clearSessionCookie() } });
}

// ==========================================
// 🚦 MAIN WORKER ENTRY POINT
// ==========================================
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const routes = [
      { method: 'GET', path: '/', handler: (req) => Response.redirect(new URL('/login', req.url), 302) },
      { method: 'GET', path: '/login', handler: handleLoginGet },
      { method: 'POST', path: '/login', handler: handleLoginPost },
      { method: 'GET', path: '/register', handler: handleRegisterGet },
      { method: 'POST', path: '/register', handler: handleRegisterPost },
      { method: 'GET', path: '/dashboard', handler: handleDashboard },
      { method: 'GET', path: '/generate', handler: handleGenerateGet },
      { method: 'POST', path: '/generate', handler: handleGeneratePost },
      { method: 'GET', path: '/keys', handler: handleKeysGet },
      { method: 'POST', path: '/keys', handler: handleKeysPost },
      { method: 'GET', path: '/server', handler: handleServerGet },
      { method: 'POST', path: '/server', handler: handleServerPost },
      { method: 'GET', path: '/referral', handler: handleReferralGet },
      { method: 'POST', path: '/referral', handler: handleReferralPost },
      { method: 'GET', path: '/logout', handler: handleLogout }
    ];

    for (const route of routes) {
      if (request.method === route.method && url.pathname === route.path) {
        return await route.handler(request, env, ctx);
      }
    }
    return new Response('Not Found', { status: 404 });
  }
};

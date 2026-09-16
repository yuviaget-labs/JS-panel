// ==========================================
// 🔐 HELPERS & AUTH
// ==========================================
async function getSession(request) {
  const cookie = request.headers.get('cookie') || '';
  const match = cookie.match(/session=([^;]+)/);
  if (!match) return null;
  try {
    return JSON.parse(atob(match[1])); // In production, add HMAC signature verification
  } catch (e) { return null; }
}

function setSessionCookie(userId, role, username) {
  const payload = btoa(JSON.stringify({ userId, role, username }));
  return `session=${payload}; Path=/; HttpOnly; Secure; Max-Age=86400; SameSite=Lax`;
}

// ==========================================
// 🎨 HTML LAYOUT (Mobile Responsive + Collapsing Sidebar)
// ==========================================
function htmlLayout(title, content, user = null) {
  const sidebarLinks = user ? `
    <a href="/dashboard" class="flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 font-medium mb-1 text-slate-600 hover:bg-white/50 hover:text-emerald-700">
      <i class="bi bi-speedometer2 text-lg w-6 text-center"></i> Dashboard
    </a>
    <a href="/generate" class="flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 font-medium mb-1 text-slate-600 hover:bg-white/50 hover:text-emerald-700">
      <i class="bi bi-key-fill text-lg w-6 text-center"></i> Generate SDK
    </a>
    ${user.role === 'OWNER' ? `
    <a href="/referral" class="flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 font-medium mb-1 text-slate-600 hover:bg-white/50 hover:text-emerald-700">
      <i class="bi bi-person-plus-fill text-lg w-6 text-center"></i> Referral
    </a>` : ''}
  ` : '';

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
    body { background: linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 25%, #CCFBF1 50%, #E0F2FE 75%, #F0FDFA 100%); background-attachment: fixed; }
    .glass-card { background: linear-gradient(135deg, rgba(255, 255, 255, 0.85), rgba(255, 255, 255, 0.6)); backdrop-filter: blur(24px); border-radius: 24px; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.8); border: 1px solid rgba(255, 255, 255, 0.7); }
    .glass-sidebar { background: linear-gradient(180deg, rgba(255, 255, 255, 0.75), rgba(255, 255, 255, 0.55)); backdrop-filter: blur(28px); border-right: 1px solid rgba(255, 255, 255, 0.6); }
    .glass-header { background: linear-gradient(180deg, rgba(255, 255, 255, 0.85), rgba(255, 255, 255, 0.65)); backdrop-filter: blur(24px); border-bottom: 1px solid rgba(255, 255, 255, 0.6); }
    .btn-premium { background: linear-gradient(135deg, #10B981, #14B8A6, #06B6D4); color: white !important; transition: all 0.4s ease; box-shadow: 0 8px 20px rgba(16, 185, 129, 0.3); border: none; cursor: pointer; }
    .btn-premium:hover { transform: translateY(-2px); box-shadow: 0 12px 28px rgba(16, 185, 129, 0.5); }
    input, select { border-radius: 14px !important; }
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
    <nav class="flex-1 py-6 px-4 overflow-y-auto space-y-1">
      ${sidebarLinks}
    </nav>
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
      <div class="flex items-center justify-end gap-3 z-10 w-1/4 md:w-auto">
        ${userMenu}
      </div>
    </header>
    <main class="p-4 md:p-8 lg:p-10 pb-20 relative z-10 flex-1 overflow-y-auto">
      ${content}
    </main>
  </div>
  <script>
    function toggleSidebar() {
      document.getElementById('sidebar').classList.toggle('-translate-x-full');
      document.getElementById('sidebar-overlay').classList.toggle('hidden');
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
  const password = formData.get('password'); // Note: Use crypto.subtle.digest for hashing in production
  
  const user = await env.DB.prepare('SELECT id, username, role, password_hash FROM users WHERE username = ?').bind(username).first();
  if (user && password === user.password_hash) { // Simplified check
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

async function handleReferralGet(req, env) {
  const session = await getSession(req);
  if (!session || session.role !== 'OWNER') return Response.redirect(new URL('/dashboard', req.url), 302);

  const content = `
    <div class="max-w-2xl mx-auto">
      <h1 class="text-2xl md:text-3xl font-black text-slate-800 mb-6 flex items-center gap-3"><i class="bi bi-person-plus-fill text-emerald-500"></i> Generate Referral</h1>
      <div class="glass-card p-6 md:p-8 mb-8">
        <form method="POST" action="/referral" class="space-y-5">
          <div>
            <label class="block text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-2">Select Role for New User</label>
            <select name="role" class="w-full bg-white/50 border border-white/60 px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-400">
              <option value="ADMIN">Admin (Can generate keys, no server control)</option>
              <option value="OWNER">Owner (Full access)</option>
            </select>
          </div>
          <button type="submit" class="btn-premium w-full py-3.5 rounded-2xl font-extrabold text-sm uppercase tracking-wider">Generate Referral Code</button>
        </form>
      </div>
      <h3 class="text-xl font-black text-slate-800 mb-4">Active Referral Codes</h3>
      <div class="glass-card overflow-hidden">
        <table class="w-full text-sm text-left">
          <thead class="text-xs text-slate-500 uppercase bg-white/40"><tr><th class="px-6 py-3">Code</th><th class="px-6 py-3">Role</th><th class="px-6 py-3">Status</th></tr></thead>
          <tbody id="referral-list"></tbody>
        </table>
      </div>
    </div>
    <script>
      fetch('/api/referrals').then(r => r.json()).then(data => {
        document.getElementById('referral-list').innerHTML = data.map(r => \`
          <tr class="border-b border-white/40 hover:bg-white/30">
            <td class="px-6 py-3 font-mono font-bold text-slate-700">\${r.code}</td>
            <td class="px-6 py-3"><span class="px-2 py-1 rounded-lg text-[10px] font-extrabold \${r.role_granted === 'OWNER' ? 'bg-purple-50 text-purple-500' : 'bg-amber-50 text-amber-500'}">\${r.role_granted}</span></td>
            <td class="px-6 py-3">\${r.is_used ? '<span class="text-red-500 font-bold">Used</span>' : '<span class="text-emerald-500 font-bold">Active</span>'}</td>
          </tr>
        \`).join('');
      });
    </script>`;
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

async function handleApiReferrals(req, env) {
  const session = await getSession(req);
  if (!session || session.role !== 'OWNER') return new Response('Unauthorized', { status: 403 });
  const refs = await env.DB.prepare('SELECT code, role_granted, is_used FROM referrals WHERE created_by = ? ORDER BY id DESC').bind(session.userId).all();
  return new Response(JSON.stringify(refs.results), { headers: { 'Content-Type': 'application/json' } });
}

async function handleDashboard(req, env) {
  const session = await getSession(req);
  if (!session) return Response.redirect(new URL('/login', req.url), 302);
  const stats = await env.DB.prepare(`SELECT (SELECT COUNT(*) FROM sdk_keys WHERE user_id = ?) as total_keys, (SELECT COUNT(*) FROM sdk_keys WHERE user_id = ? AND is_blocked = 0) as active_keys`).bind(session.userId, session.userId).first();
  
  const content = `
    <div class="max-w-6xl mx-auto">
      <h1 class="text-2xl md:text-3xl font-black text-slate-800 mb-6 flex items-center gap-3"><i class="bi bi-speedometer2 text-emerald-500"></i> Dashboard</h1>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div class="glass-card p-6">
          <div class="flex items-center justify-between mb-3"><div class="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white shadow-lg"><i class="bi bi-key-fill"></i></div><span class="text-[10px] font-extrabold text-purple-500 bg-purple-50 px-2 py-1 rounded-lg uppercase">Total</span></div>
          <p class="text-3xl font-black text-slate-800">${stats.total_keys}</p><p class="text-xs text-slate-500 font-medium mt-1">Total SDK Keys</p>
        </div>
        <div class="glass-card p-6">
          <div class="flex items-center justify-between mb-3"><div class="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white shadow-lg"><i class="bi bi-check-circle-fill"></i></div><span class="text-[10px] font-extrabold text-emerald-500 bg-emerald-50 px-2 py-1 rounded-lg uppercase">Active</span></div>
          <p class="text-3xl font-black text-slate-800">${stats.active_keys}</p><p class="text-xs text-slate-500 font-medium mt-1">Active Keys</p>
        </div>
        <div class="glass-card p-6">
          <div class="flex items-center justify-between mb-3"><div class="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-lg"><i class="bi bi-shield-check"></i></div><span class="text-[10px] font-extrabold text-amber-500 bg-amber-50 px-2 py-1 rounded-lg uppercase">Role</span></div>
          <p class="text-3xl font-black text-slate-800">${session.role}</p><p class="text-xs text-slate-500 font-medium mt-1">Your Access Level</p>
        </div>
      </div>
      <div class="glass-card p-6 border-l-4 ${session.role === 'OWNER' ? 'border-emerald-500' : 'border-amber-500'}">
        <h3 class="font-bold text-slate-800 mb-2">${session.role} Privileges Active</h3>
        <p class="text-sm text-slate-600">${session.role === 'OWNER' ? 'You have full access to generate referrals, manage server status, and create SDK keys.' : 'You can generate and manage SDK keys. Server control and referral generation are restricted to Owners.'}</p>
      </div>
    </div>`;
  return new Response(htmlLayout('Dashboard', content, session), { headers: { 'Content-Type': 'text/html' } });
}

async function handleGenerateGet(req, env) {
  const session = await getSession(req);
  if (!session) return Response.redirect(new URL('/login', req.url), 302);
  const content = `
    <div class="max-w-2xl mx-auto">
      <h1 class="text-2xl md:text-3xl font-black text-slate-800 mb-6 flex items-center gap-3"><i class="bi bi-key-fill text-emerald-500"></i> Generate SDK Key</h1>
      <div class="glass-card p-6 md:p-8">
        <form method="POST" action="/generate" class="space-y-5">
          <div><label class="block text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-2">Engine</label>
          <select name="engine" class="w-full bg-white/50 border border-white/60 px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-400"><option value="MUNDO">MUNDO Engine</option><option value="BCORE">BCORE Engine</option></select></div>
          <div><label class="block text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-2">Duration</label>
          <select name="duration" class="w-full bg-white/50 border border-white/60 px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-400"><option value="7">7 Days</option><option value="15">15 Days</option><option value="30" selected>30 Days</option><option value="60">60 Days</option></select></div>
          <div class="grid grid-cols-2 gap-4">
            <div><label class="block text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-2">Pkg Limit</label><input type="number" name="pkg_limit" min="1" max="10" value="1" class="w-full bg-white/50 border border-white/60 px-4 py-3 text-sm font-bold text-center focus:outline-none focus:ring-2 focus:ring-emerald-400"></div>
            <div><label class="block text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-2">App Limit</label><input type="number" name="app_limit" min="1" max="20" value="1" class="w-full bg-white/50 border border-white/60 px-4 py-3 text-sm font-bold text-center focus:outline-none focus:ring-2 focus:ring-emerald-400"></div>
          </div>
          <div class="flex gap-4">
            <label class="flex items-center gap-2 bg-white/50 px-4 py-3 rounded-2xl border border-white/60 cursor-pointer"><input type="checkbox" name="feature1" checked class="w-5 h-5 rounded accent-emerald-500"><span class="text-sm font-bold text-slate-700">Feature 1</span></label>
            <label class="flex items-center gap-2 bg-white/50 px-4 py-3 rounded-2xl border border-white/60 cursor-pointer"><input type="checkbox" name="feature2" checked class="w-5 h-5 rounded accent-emerald-500"><span class="text-sm font-bold text-slate-700">Feature 2</span></label>
          </div>
          <button type="submit" class="btn-premium w-full py-3.5 rounded-2xl font-extrabold text-sm uppercase tracking-wider">Generate Key</button>
        </form>
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
  return Response.redirect(new URL('/dashboard', req.url), 302);
}

async function handleLogout(req, env) {
  return new Response(null, { status: 302, headers: { 'Location': '/login', 'Set-Cookie': 'session=; Path=/; HttpOnly; Secure; Max-Age=0' } });
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
      { method: 'GET', path: '/referral', handler: handleReferralGet },
      { method: 'POST', path: '/referral', handler: handleReferralPost },
      { method: 'GET', path: '/api/referrals', handler: handleApiReferrals },
      { method: 'GET', path: '/dashboard', handler: handleDashboard },
      { method: 'GET', path: '/generate', handler: handleGenerateGet },
      { method: 'POST', path: '/generate', handler: handleGeneratePost },
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

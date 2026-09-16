// ==========================================
// 🔐 AUTH & HELPERS
// ==========================================
async function getSession(req) {
  const c = req.headers.get('cookie') || '';
  const m = c.match(/session=([^;]+)/);
  if (!m) return null;
  try { return JSON.parse(atob(m[1])); } catch { return null; }
}
function setSession(u) { return `session=${btoa(JSON.stringify(u))}; Path=/; HttpOnly; Secure; Max-Age=86400; SameSite=Lax`; }
function clearSession() { return 'session=; Path=/; HttpOnly; Secure; Max-Age=0'; }

// ==========================================
// 🎨 UI LAYOUT (Sidebar Logic)
// ==========================================
function layout(title, content, user) {
  let nav = '';
  if (user) {
    // 1. Common Links (Dashboard, Generate, Keys) - For BOTH Owner & Admin
    nav = `
      <a href="/dashboard" class="flex items-center gap-3 px-4 py-3 rounded-2xl text-slate-600 hover:bg-white/50 hover:text-emerald-700 font-medium"><i class="bi bi-speedometer2 w-6 text-center"></i> Dashboard</a>
      <a href="/generate" class="flex items-center gap-3 px-4 py-3 rounded-2xl text-slate-600 hover:bg-white/50 hover:text-emerald-700 font-medium"><i class="bi bi-key-fill w-6 text-center"></i> Generate SDK</a>
      <a href="/keys" class="flex items-center gap-3 px-4 py-3 rounded-2xl text-slate-600 hover:bg-white/50 hover:text-emerald-700 font-medium"><i class="bi bi-view-list w-6 text-center"></i> SDK Keys</a>
    `;
    
    // 2. Owner Only Links (Server, Referral)
    if (user.role === 'OWNER') {
      nav += `
        <a href="/server" class="flex items-center gap-3 px-4 py-3 rounded-2xl text-slate-600 hover:bg-white/50 hover:text-emerald-700 font-medium"><i class="bi bi-hdd-network-fill w-6 text-center"></i> Server Control</a>
        <a href="/referral" class="flex items-center gap-3 px-4 py-3 rounded-2xl text-slate-600 hover:bg-white/50 hover:text-emerald-700 font-medium"><i class="bi bi-person-plus-fill w-6 text-center"></i> Referral</a>
      `;
    }
  }

  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title}</title><script src="https://cdn.tailwindcss.com"></script>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css">
<style>
body{background:linear-gradient(135deg,#ECFDF5,#D1FAE5,#CCFBF1);background-attachment:fixed;min-height:100vh}
.glass{background:rgba(255,255,255,0.7);backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,0.6);border-radius:24px;box-shadow:0 8px 32px rgba(0,0,0,0.05)}
.btn-premium{background:linear-gradient(135deg,#10B981,#14B8A6);color:#fff;border:none;padding:12px 24px;border-radius:16px;font-weight:bold;cursor:pointer;box-shadow:0 8px 20px rgba(16,185,129,0.3)}
.btn-premium:hover{transform:translateY(-2px);box-shadow:0 12px 28px rgba(16,185,129,0.5)}
.tab-btn{padding:10px 24px;border-radius:12px;font-weight:600;color:#64748B;cursor:pointer;border:none;background:rgba(255,255,255,0.5)}
.tab-btn.active-m{background:linear-gradient(135deg,#8B5CF6,#6366F1);color:#fff;box-shadow:0 6px 16px rgba(139,92,246,0.4)}
.tab-btn.active-b{background:linear-gradient(135deg,#F59E0B,#EF4444);color:#fff;box-shadow:0 6px 16px rgba(245,158,11,0.4)}
.tab-content{display:none}.tab-content.active{display:block}
input,select{border-radius:14px!important}
</style></head>
<body class="text-slate-800 flex h-screen overflow-hidden">
${user ? `<div id="overlay" onclick="toggleSB()" class="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 hidden md:hidden"></div>
<aside id="sb" class="w-72 glass flex flex-col absolute inset-y-0 left-0 transform -translate-x-full md:relative md:translate-x-0 transition-transform z-50">
<div class="h-20 flex items-center justify-between px-6 border-b border-white/50">
<h1 class="text-lg font-black text-emerald-600 uppercase">SDK Panel</h1>
<button onclick="toggleSB()" class="md:hidden text-2xl"><i class="bi bi-x-lg"></i></button>
</div>
<nav class="flex-1 py-6 px-4 overflow-y-auto space-y-1">${nav}</nav>
</aside>` : ''}
<div class="flex-1 flex flex-col h-screen overflow-y-auto">
<header class="h-16 glass sticky top-0 z-30 flex items-center justify-between px-6">
<div class="flex items-center gap-3">
${user ? `<button onclick="toggleSB()" class="md:hidden text-2xl text-slate-600"><i class="bi bi-list"></i></button>` : ''}
<h2 class="font-bold text-slate-700 hidden md:block">SDK Workspace</h2>
</div>
${user ? `<div class="flex items-center gap-3">
<div class="hidden sm:flex flex-col items-end"><span class="text-sm font-bold">${user.username}</span><span class="text-[10px] font-black text-emerald-600 uppercase">${user.role}</span></div>
<a href="/logout" class="w-10 h-10 rounded-2xl bg-red-500 text-white flex items-center justify-center"><i class="bi bi-box-arrow-right"></i></a>
</div>` : ''}
</header>
<main class="p-4 md:p-8 flex-1 overflow-y-auto">${content}</main>
</div>
<script>
function toggleSB(){document.getElementById('sb').classList.toggle('-translate-x-full');document.getElementById('overlay').classList.toggle('hidden')}
function switchTab(id,tab){
  const w=document.getElementById(id);if(!w)return;
  w.querySelectorAll('.tab-content').forEach(e=>e.classList.remove('active'));
  w.querySelectorAll('.tab-btn').forEach(e=>{e.classList.remove('active-m','active-b')});
  w.querySelector('#tc-'+tab).classList.add('active');
  const b=w.querySelector('[data-tab="'+tab+'"]');
  b.classList.add(tab==='mundo'?'active-m':'active-b');
}
function toggleBlur(id){const e=document.getElementById('k-'+id);e.classList.toggle('blur-sm');e.classList.toggle('select-none')}
function copyKey(t,b){navigator.clipboard.writeText(t);b.innerHTML='<i class="bi bi-check2"></i> Copied';setTimeout(()=>b.innerHTML='<i class="bi bi-clipboard"></i> Copy',1500)}
</script></body></html>`;
}

// ==========================================
// 🚦 ROUTES
// ==========================================
async function handleLogin(req, env) {
  if (req.method === 'GET') {
    return new Response(layout('Login', `<div class="max-w-md mx-auto glass p-8 mt-10">
      <h2 class="text-2xl font-black text-center mb-6">Login</h2>
      <form method="POST" class="space-y-4">
        <input type="text" name="username" placeholder="Username" required class="w-full bg-white/50 border px-4 py-3">
        <input type="password" name="password" placeholder="Password" required class="w-full bg-white/50 border px-4 py-3">
        <button class="btn-premium w-full">Login</button>
      </form>
      <p class="text-center mt-4 text-sm">No account? <a href="/register" class="text-emerald-600 font-bold">Register</a></p>
    </div>`), { headers: { 'Content-Type': 'text/html' } });
  }
  const f = await req.formData();
  const u = await env.DB.prepare('SELECT * FROM users WHERE username=? AND password=?').bind(f.get('username'), f.get('password')).first();
  if (u) {
    // FIX: Role ko automatically UPPERCASE kar rahe hain taaki sidebar mein Owner wale options aa jayein
    const role = (u.role || '').toUpperCase(); 
    return new Response(null, { status: 302, headers: { 'Location': '/dashboard', 'Set-Cookie': setSession({ id: u.id, username: u.username, role: role }) } });
  }
  return new Response(layout('Login', `<div class="max-w-md mx-auto glass p-8 text-center text-red-600 font-bold">Invalid Credentials</div>`), { headers: { 'Content-Type': 'text/html' } });
}

async function handleRegister(req, env) {
  if (req.method === 'GET') {
    return new Response(layout('Register', `<div class="max-w-md mx-auto glass p-8 mt-10">
      <h2 class="text-2xl font-black text-center mb-6">Register</h2>
      <form method="POST" class="space-y-4">
        <input type="text" name="code" placeholder="Referral Code" required class="w-full bg-white/50 border px-4 py-3 uppercase">
        <input type="text" name="username" placeholder="Username" required class="w-full bg-white/50 border px-4 py-3">
        <input type="password" name="password" placeholder="Password" required class="w-full bg-white/50 border px-4 py-3">
        <button class="btn-premium w-full">Register</button>
      </form>
    </div>`), { headers: { 'Content-Type': 'text/html' } });
  }
  const f = await req.formData();
  const ref = await env.DB.prepare('SELECT * FROM referrals WHERE code=? AND is_used=0').bind(f.get('code').toUpperCase()).first();
  if (!ref) return new Response(layout('Register', `<div class="max-w-md mx-auto glass p-8 text-center text-red-600">Invalid Code</div>`), { headers: { 'Content-Type': 'text/html' } });
  try {
    await env.DB.prepare('INSERT INTO users (username,password,role) VALUES(?,?,?)').bind(f.get('username'), f.get('password'), ref.role_granted).run();
    await env.DB.prepare('UPDATE referrals SET is_used=1 WHERE id=?').bind(ref.id).run();
    return Response.redirect(new URL('/login', req.url), 302);
  } catch { return new Response(layout('Register', `<div class="max-w-md mx-auto glass p-8 text-center text-red-600">Username exists</div>`), { headers: { 'Content-Type': 'text/html' } }); }
}

async function handleDashboard(req, env) {
  const s = await getSession(req); if (!s) return Response.redirect(new URL('/login', req.url), 302);
  const stats = await env.DB.prepare(`SELECT engine, COUNT(*) as total, SUM(CASE WHEN is_blocked=0 THEN 1 ELSE 0 END) as active FROM sdk_keys WHERE user_id=? GROUP BY engine`).bind(s.id).all();
  const getStat = (e) => stats.results.find(x => x.engine === e) || { total: 0, active: 0 };
  const m = getStat('MUNDO'), b = getStat('BCORE');

  const renderTab = (engine, data) => `
    <div id="tc-${engine.toLowerCase()}" class="tab-content ${engine==='MUNDO'?'active':''}">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div class="glass p-4"><p class="text-2xl font-black">${data.total}</p><p class="text-xs text-slate-500">Total Keys</p></div>
        <div class="glass p-4"><p class="text-2xl font-black text-emerald-600">${data.active}</p><p class="text-xs text-slate-500">Active</p></div>
        <div class="glass p-4"><p class="text-2xl font-black text-red-600">${data.total - data.active}</p><p class="text-xs text-slate-500">Blocked</p></div>
        <div class="glass p-4"><p class="text-2xl font-black text-amber-600">0</p><p class="text-xs text-slate-500">Bindings</p></div>
      </div>
    </div>`;

  const content = `
    <h1 class="text-2xl font-black mb-6">SDK Dashboard</h1>
    <div id="dashWrap" class="mb-6">
      <div class="flex gap-2 mb-4">
        <button class="tab-btn active-m" data-tab="mundo" onclick="switchTab('dashWrap','mundo')">MUNDO</button>
        <button class="tab-btn" data-tab="bcore" onclick="switchTab('dashWrap','bcore')">BCORE</button>
      </div>
      ${renderTab('MUNDO', m)}
      ${renderTab('BCORE', b)}
    </div>`;
  return new Response(layout('Dashboard', content, s), { headers: { 'Content-Type': 'text/html' } });
}

async function handleGenerate(req, env) {
  const s = await getSession(req); if (!s) return Response.redirect(new URL('/login', req.url), 302);
  const url = new URL(req.url);
  let flash = '';
  if (url.searchParams.get('success') === '1') {
    flash = `<div class="glass p-4 mb-6 border-l-4 border-emerald-500"><p class="font-bold text-emerald-700">Generated Successfully!</p><p class="text-sm">Engine: ${url.searchParams.get('engine')} | Key: ${url.searchParams.get('key')}</p></div>`;
  }

  const form = (engine) => `
    <form method="POST" class="glass p-6 space-y-4">
      <input type="hidden" name="engine" value="${engine}">
      <input type="text" name="sdk_key" placeholder="Custom Key (Empty = Auto 16 char)" class="w-full bg-white/50 border px-4 py-3">
      <select name="duration" class="w-full bg-white/50 border px-4 py-3">
        <option value="7">7 Days</option><option value="15">15 Days</option><option value="30" selected>30 Days</option><option value="60">60 Days</option>
      </select>
      <div class="grid grid-cols-2 gap-4">
        <input type="number" name="pkg_limit" min="1" max="10" value="1" placeholder="Pkg Limit" class="bg-white/50 border px-4 py-3 text-center">
        <input type="number" name="app_limit" min="1" max="20" value="1" placeholder="App Limit" class="bg-white/50 border px-4 py-3 text-center">
      </div>
      <div class="flex gap-4">
        <label class="flex items-center gap-2 bg-white/50 px-4 py-3 rounded-xl border cursor-pointer"><input type="checkbox" name="f1" checked> Feature 1</label>
        <label class="flex items-center gap-2 bg-white/50 px-4 py-3 rounded-xl border cursor-pointer"><input type="checkbox" name="f2" checked> Feature 2</label>
      </div>
      <button class="btn-premium w-full">Generate ${engine} Key</button>
    </form>`;

  const content = `
    <h1 class="text-2xl font-black mb-6">Generate SDK</h1>
    ${flash}
    <div id="genWrap">
      <div class="flex gap-2 mb-4">
        <button class="tab-btn active-m" data-tab="mundo" onclick="switchTab('genWrap','mundo')">MUNDO</button>
        <button class="tab-btn" data-tab="bcore" onclick="switchTab('genWrap','bcore')">BCORE</button>
      </div>
      <div id="tc-mundo" class="tab-content active">${form('MUNDO')}</div>
      <div id="tc-bcore" class="tab-content">${form('BCORE')}</div>
    </div>`;
  return new Response(layout('Generate', content, s), { headers: { 'Content-Type': 'text/html' } });
}

async function handleGeneratePost(req, env) {
  const s = await getSession(req); if (!s) return Response.redirect(new URL('/login', req.url), 302);
  const f = await req.formData();
  let key = f.get('sdk_key').trim();
  if (!key) key = Array.from(crypto.getRandomValues(new Uint8Array(8))).map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
  
  await env.DB.prepare('INSERT INTO sdk_keys (user_id,engine,sdk_key,duration_days,pkg_limit,app_limit,feature1,feature2) VALUES(?,?,?,?,?,?,?,?)')
    .bind(s.id, f.get('engine'), key, f.get('duration'), f.get('pkg_limit'), f.get('app_limit'), f.has('f1')?1:0, f.has('f2')?1:0).run();
  
  return Response.redirect(new URL(`/generate?success=1&engine=${f.get('engine')}&key=${key}`, req.url), 302);
}

async function handleKeys(req, env) {
  const s = await getSession(req); if (!s) return Response.redirect(new URL('/login', req.url), 302);
  
  if (req.method === 'POST') {
    const f = await req.formData();
    const act = f.get('action'), kid = f.get('key_id'), bid = f.get('bind_id');
    if (act === 'block_key') await env.DB.prepare('UPDATE sdk_keys SET is_blocked=1 WHERE id=? AND user_id=?').bind(kid, s.id).run();
    if (act === 'unblock_key') await env.DB.prepare('UPDATE sdk_keys SET is_blocked=0 WHERE id=? AND user_id=?').bind(kid, s.id).run();
    if (act === 'delete_key') await env.DB.prepare('DELETE FROM sdk_keys WHERE id=? AND user_id=?').bind(kid, s.id).run();
    
    if (act === 'add_bind') await env.DB.prepare('INSERT INTO sdk_bindings (key_id,pkg_name,app_name) VALUES(?,?,?)').bind(kid, f.get('pkg'), f.get('app')).run();
    if (act === 'save_bind') await env.DB.prepare('UPDATE sdk_bindings SET pkg_name=?, app_name=? WHERE id=?').bind(f.get('pkg'), f.get('app'), bid).run();
    if (act === 'block_bind') await env.DB.prepare('UPDATE sdk_bindings SET is_blocked=1 WHERE id=?').bind(bid).run();
    if (act === 'unblock_bind') await env.DB.prepare('UPDATE sdk_bindings SET is_blocked=0 WHERE id=?').bind(bid).run();
    if (act === 'delete_bind') await env.DB.prepare('DELETE FROM sdk_bindings WHERE id=?').bind(bid).run();
    return Response.redirect(new URL('/keys', req.url), 302);
  }

  const keys = await env.DB.prepare('SELECT * FROM sdk_keys WHERE user_id=? ORDER BY id DESC').bind(s.id).all();
  const binds = await env.DB.prepare('SELECT * FROM sdk_bindings ORDER BY key_id DESC').all();
  const bindMap = {};
  binds.results.forEach(b => { if (!bindMap[b.key_id]) bindMap[b.key_id] = []; bindMap[b.key_id].push(b); });

  const renderKeys = (engine) => {
    const list = keys.results.filter(k => k.engine === engine);
    if (!list.length) return `<p class="text-center text-slate-400 py-10">No keys found</p>`;
    return list.map(k => {
      const kbinds = bindMap[k.id] || [];
      const bindsHtml = kbinds.map(b => `
        <div class="glass p-3 mt-2 flex flex-wrap gap-2 items-center">
          <form method="POST" class="flex flex-wrap gap-2 items-center flex-1">
            <input type="hidden" name="action" value="save_bind">
            <input type="hidden" name="bind_id" value="${b.id}">
            <input type="text" name="pkg" value="${b.pkg_name}" class="flex-1 min-w-[100px] bg-white/50 border px-3 py-1.5 text-xs font-mono">
            <input type="text" name="app" value="${b.app_name}" class="flex-1 min-w-[100px] bg-white/50 border px-3 py-1.5 text-xs font-mono">
            <button class="px-2 py-1 text-xs font-bold rounded-lg bg-emerald-50 text-emerald-600"><i class="bi bi-check2"></i></button>
          </form>
          <span class="text-[10px] font-bold px-2 py-0.5 rounded-lg ${b.is_blocked?'bg-red-50 text-red-500':'bg-emerald-50 text-emerald-500'}">${b.is_blocked?'BLOCKED':'ACTIVE'}</span>
          <form method="POST" class="inline"><input type="hidden" name="action" value="${b.is_blocked?'unblock_bind':'block_bind'}"><input type="hidden" name="bind_id" value="${b.id}"><button class="text-[10px] font-bold ${b.is_blocked?'text-emerald-600':'text-amber-600'}">${b.is_blocked?'Unlock':'Lock'}</button></form>
          <form method="POST" class="inline" onsubmit="return confirm('Delete?')"><input type="hidden" name="action" value="delete_bind"><input type="hidden" name="bind_id" value="${b.id}"><button class="text-[10px] font-bold text-red-600">Delete</button></form>
        </div>
      `).join('');

      return `
      <div class="glass p-4 mb-4">
        <div class="flex justify-between items-start mb-3">
          <div class="flex-1 min-w-0">
            <div class="flex gap-2 mb-1">
              <span class="text-[10px] font-bold px-2 py-0.5 rounded-lg ${k.is_blocked?'bg-red-50 text-red-500':'bg-emerald-50 text-emerald-500'}">${k.is_blocked?'BLOCKED':'ACTIVE'}</span>
              <span class="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-purple-50 text-purple-500">${k.duration_days}D</span>
            </div>
            <p id="k-${k.id}" class="font-mono text-sm font-bold break-all blur-sm select-none">${k.sdk_key}</p>
          </div>
        </div>
        <div class="flex flex-wrap gap-2 mb-3">
          <button onclick="toggleBlur(${k.id})" class="px-3 py-1.5 text-xs font-bold rounded-xl bg-white/60 hover:bg-white"><i class="bi bi-eye"></i> Show</button>
          <button onclick="copyKey('${k.sdk_key}',this)" class="px-3 py-1.5 text-xs font-bold rounded-xl bg-white/60 hover:bg-white"><i class="bi bi-clipboard"></i> Copy</button>
          <form method="POST" class="inline"><input type="hidden" name="key_id" value="${k.id}"><input type="hidden" name="action" value="${k.is_blocked?'unblock_key':'block_key'}"><button class="px-3 py-1.5 text-xs font-bold rounded-xl ${k.is_blocked?'bg-emerald-50 text-emerald-600':'bg-amber-50 text-amber-600'}">${k.is_blocked?'Unlock':'Lock'}</button></form>
          <form method="POST" class="inline" onsubmit="return confirm('Delete?')"><input type="hidden" name="key_id" value="${k.id}"><input type="hidden" name="action" value="delete_key"><button class="px-3 py-1.5 text-xs font-bold rounded-xl bg-red-50 text-red-600">Delete</button></form>
        </div>
        <div class="border-t pt-3">
          <p class="text-xs font-bold text-slate-500 mb-2">Bindings (Pkg/App)</p>
          ${bindsHtml}
          <form method="POST" class="flex gap-2 mt-3">
            <input type="hidden" name="key_id" value="${k.id}"><input type="hidden" name="action" value="add_bind">
            <input type="text" name="pkg" placeholder="pkg_name" required class="flex-1 bg-white/50 border px-3 py-1.5 text-xs">
            <input type="text" name="app" placeholder="app_name" required class="flex-1 bg-white/50 border px-3 py-1.5 text-xs">
            <button class="btn-premium !py-1.5 !px-3 text-xs">Add</button>
          </form>
        </div>
      </div>`;
    }).join('');
  };

  const content = `
    <h1 class="text-2xl font-black mb-6">SDK Keys</h1>
    <div id="keysWrap">
      <div class="flex gap-2 mb-4">
        <button class="tab-btn active-m" data-tab="mundo" onclick="switchTab('keysWrap','mundo')">MUNDO</button>
        <button class="tab-btn" data-tab="bcore" onclick="switchTab('keysWrap','bcore')">BCORE</button>
      </div>
      <div id="tc-mundo" class="tab-content active">${renderKeys('MUNDO')}</div>
      <div id="tc-bcore" class="tab-content">${renderKeys('BCORE')}</div>
    </div>`;
  return new Response(layout('Keys', content, s), { headers: { 'Content-Type': 'text/html' } });
}

async function handleServer(req, env) {
  const s = await getSession(req); 
  if (!s || s.role !== 'OWNER') return Response.redirect(new URL('/dashboard', req.url), 302); // Admin blocked

  if (req.method === 'POST') {
    const f = await req.formData();
    const eng = f.get('engine'), mode = f.has('maint') ? 1 : 0, msg = f.get('msg') || '';
    await env.DB.prepare('INSERT OR REPLACE INTO server_status (engine,maintenance_mode,maintenance_message) VALUES(?,?,?)').bind(eng, mode, msg).run();
    return Response.redirect(new URL('/server', req.url), 302);
  }

  const status = await env.DB.prepare('SELECT * FROM server_status').all();
  const get = (e) => status.results.find(x => x.engine === e) || { maintenance_mode: 0, maintenance_message: '' };
  const m = get('MUNDO'), b = get('BCORE');

  const renderServer = (engine, data) => `
    <div id="tc-${engine.toLowerCase()}" class="tab-content ${engine==='MUNDO'?'active':''}">
      <div class="glass p-6 mb-6">
        <h3 class="font-black text-xl mb-4">${engine} Server Control</h3>
        <form method="POST" class="space-y-4">
          <input type="hidden" name="engine" value="${engine}">
          <label class="flex items-center justify-between bg-white/50 p-4 rounded-2xl border cursor-pointer">
            <span class="font-bold">Maintenance Mode</span>
            <input type="checkbox" name="maint" ${data.maintenance_mode?'checked':''} class="w-5 h-5 accent-red-500">
          </label>
          <input type="text" name="msg" value="${data.maintenance_message}" placeholder="Maintenance Message" class="w-full bg-white/50 border px-4 py-3">
          <button class="btn-premium w-full">Save Status</button>
        </form>
      </div>
    </div>`;

  const content = `
    <h1 class="text-2xl font-black mb-6">Server & API</h1>
    <div id="srvWrap">
      <div class="flex gap-2 mb-4">
        <button class="tab-btn active-m" data-tab="mundo" onclick="switchTab('srvWrap','mundo')">MUNDO</button>
        <button class="tab-btn" data-tab="bcore" onclick="switchTab('srvWrap','bcore')">BCORE</button>
      </div>
      ${renderServer('MUNDO', m)}
      ${renderServer('BCORE', b)}
    </div>`;
  return new Response(layout('Server', content, s), { headers: { 'Content-Type': 'text/html' } });
}

async function handleReferral(req, env) {
  const s = await getSession(req);
  if (!s || s.role !== 'OWNER') return Response.redirect(new URL('/dashboard', req.url), 302);

  if (req.method === 'POST') {
    const f = await req.formData();
    const code = Math.random().toString(36).substring(2, 10).toUpperCase();
    await env.DB.prepare('INSERT INTO referrals (code,role_granted,created_by) VALUES(?,?,?)').bind(code, f.get('role'), s.id).run();
    return Response.redirect(new URL('/referral', req.url), 302);
  }

  const refs = await env.DB.prepare('SELECT * FROM referrals WHERE created_by=? ORDER BY id DESC').bind(s.id).all();
  const list = refs.results.map(r => `
    <div class="glass p-4 mb-2 flex justify-between items-center">
      <div><p class="font-mono font-bold">${r.code}</p><p class="text-[10px] text-slate-500">Role: ${r.role_granted}</p></div>
      <span class="text-[10px] font-bold px-2 py-1 rounded-lg ${r.is_used?'bg-red-50 text-red-500':'bg-emerald-50 text-emerald-500'}">${r.is_used?'USED':'ACTIVE'}</span>
    </div>`).join('');

  const content = `
    <h1 class="text-2xl font-black mb-6">Referral System</h1>
    <div class="glass p-6 mb-6">
      <form method="POST" class="space-y-4">
        <select name="role" class="w-full bg-white/50 border px-4 py-3">
          <option value="ADMIN">Admin (Keys Only)</option>
          <option value="OWNER">Owner (Full Access)</option>
        </select>
        <button class="btn-premium w-full">Generate Code</button>
      </form>
    </div>
    <h3 class="font-black text-xl mb-4">Your Codes</h3>
    ${list || '<p class="text-slate-400">No codes yet</p>'}`;
  return new Response(layout('Referral', content, s), { headers: { 'Content-Type': 'text/html' } });
}

async function handleLogout() {
  return new Response(null, { status: 302, headers: { 'Location': '/login', 'Set-Cookie': clearSession() } });
}

// ==========================================
// 🚦 ROUTER
// ==========================================
export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    const path = url.pathname;
    const method = req.method;

    if (path === '/' || path === '/login') return handleLogin(req, env);
    if (path === '/register') return handleRegister(req, env);
    if (path === '/logout') return handleLogout();
    if (path === '/dashboard') return handleDashboard(req, env);
    if (path === '/generate') return method === 'GET' ? handleGenerate(req, env) : handleGeneratePost(req, env);
    if (path === '/keys') return handleKeys(req, env);
    if (path === '/server') return handleServer(req, env);
    if (path === '/referral') return handleReferral(req, env);

    return new Response('404 Not Found', { status: 404 });
  }
};

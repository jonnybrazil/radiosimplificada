const CONFIG_FILE_ID = '1Ug4Zz_1kXFu7Lk9DAZD_BZfqhyIKIfKi';
const AUTHORIZED_ADMIN_EMAIL = 'jon1444@gmail.com';
const ADMIN_PAGE_URL = 'https://jonnybrazil.github.io/radiosimplificada/admin.html';

function doGet(e) {
  const params = (e && e.parameter) || {};
  if (params.admin === '1') return adminGateway_();
  if (params.adminToken && !isValidAdminToken_(params.adminToken)) return jsonOutput_({ ok: false, error: 'Sessão administrativa expirada.' });
  const config = readConfig_();
  if (params.meta === '1') return jsonOutput_({ version: Number(config.version) || 1 });
  return jsonOutput_(config);
}

function adminGateway_() {
  const email = String(Session.getActiveUser().getEmail() || '').toLowerCase();
  if (email !== AUTHORIZED_ADMIN_EMAIL) {
    return HtmlService.createHtmlOutput('<!doctype html><meta charset="utf-8"><title>Acesso restrito</title><style>body{font:16px Arial;padding:40px;max-width:560px;margin:auto;color:#333}h1{font-size:24px}</style><h1>Acesso restrito</h1><p>Esta área é exclusiva para a conta Google autorizada.</p><p>Entre no Google com <strong>' + AUTHORIZED_ADMIN_EMAIL + '</strong> e tente novamente.</p>');
  }
  const token = Utilities.getUuid();
  CacheService.getScriptCache().put('admin:' + token, email, 1800);
  const target = ADMIN_PAGE_URL + '?auth=' + encodeURIComponent(token);
  return HtmlService.createHtmlOutput(`<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><title>Abrir administração</title><style>body{font:16px Arial,sans-serif;margin:0;padding:28px;display:grid;place-items:center;min-height:100vh;background:#fff;color:#222;text-align:center}main{max-width:420px}a{display:inline-block;margin-top:18px;padding:14px 22px;border-radius:6px;background:#4b4d50;color:#fff;text-decoration:none;font-weight:700}p{line-height:1.5;color:#666}</style><main><h1>Abrir administração</h1><p>Toque no botão abaixo para abrir o painel em uma página própria.</p><a href="${target}" target="_top" rel="noopener">Abrir painel</a></main>`);
}

function isValidAdminToken_(token) {
  return !!token && CacheService.getScriptCache().get('admin:' + token) === AUTHORIZED_ADMIN_EMAIL;
}

function doPost(e) {
  try {
    const body = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    if (body.action === 'contact') return saveContact_(body.contact || {});
    if (body.action === 'event') return saveEvent_(body.event || {});
    const submittedToken = String(body._adminToken || '');
    if (body.action === 'logout') { if (isValidAdminToken_(submittedToken)) CacheService.getScriptCache().remove('admin:' + submittedToken); return jsonOutput_({ ok: true }); }
    if (body.action === 'restore') return restoreConfig_(body.backup || {}, submittedToken);
    if (body.action === 'clearReports') return clearReports_(body.fields || [], submittedToken);
    if (body.action === 'clearContactMessages') return clearContactMessages_(submittedToken);
    delete body._adminToken;
    if (!isValidAdminToken_(submittedToken)) throw new Error('Sessão administrativa inválida ou expirada. Abra o painel novamente.');
    validateConfig_(body);
    const current = readConfig_();
    body.reports = Array.isArray(current.reports) ? current.reports : [];
    body.contactMessages = Array.isArray(current.contactMessages) ? current.contactMessages : [];
    body.version = (Number(current.version) || 0) + 1;
    DriveApp.getFileById(CONFIG_FILE_ID).setContent(JSON.stringify(body, null, 2));
    return jsonOutput_({ ok: true, data: body });
  } catch (error) {
    return jsonOutput_({ ok: false, error: String(error.message || error) });
  }
  }

function restoreConfig_(backup, token) {
  if (!isValidAdminToken_(token)) throw new Error('Sessão administrativa inválida ou expirada. Abra o painel novamente.');
  validateConfig_(backup);
  const current = readConfig_();
  backup.reports = Array.isArray(current.reports) ? current.reports : [];
  backup.contactMessages = Array.isArray(current.contactMessages) ? current.contactMessages : [];
  backup.version = (Number(current.version) || 0) + 1;
  DriveApp.getFileById(CONFIG_FILE_ID).setContent(JSON.stringify(backup, null, 2));
  return jsonOutput_({ ok: true, data: backup });
}

function clearReports_(fields, token) {
  if (!isValidAdminToken_(token)) throw new Error('Sessão administrativa inválida ou expirada. Abra o painel novamente.');
  const allowed = ['accesses', 'plays', 'listeningMinutes', 'peakListeners'];
  const selected = [...new Set((Array.isArray(fields) ? fields : []).filter(field => allowed.includes(field)))];
  if (!selected.length) throw new Error('Selecione pelo menos um item para apagar.');
  const lock = LockService.getScriptLock();
  lock.waitLock(5000);
  try {
    const config = readConfig_();
    const reports = Array.isArray(config.reports) ? config.reports : [];
    reports.forEach(row => selected.forEach(field => { row[field] = 0; }));
    config.reports = reports;
    config.version = (Number(config.version) || 0) + 1;
    DriveApp.getFileById(CONFIG_FILE_ID).setContent(JSON.stringify(config, null, 2));
    return jsonOutput_({ok: true, data: config});
  } finally {
    lock.releaseLock();
  }
}

function clearContactMessages_(token) {
  if (!isValidAdminToken_(token)) throw new Error('Sessão administrativa inválida ou expirada. Abra o painel novamente.');
  const lock = LockService.getScriptLock();
  lock.waitLock(5000);
  try {
    const config = readConfig_();
    config.contactMessages = [];
    config.version = (Number(config.version) || 0) + 1;
    DriveApp.getFileById(CONFIG_FILE_ID).setContent(JSON.stringify(config, null, 2));
    return jsonOutput_({ok: true, data: config});
  } finally {
    lock.releaseLock();
  }
}

function saveEvent_(event) {
  const type = String(event.type || '').trim();
  const sessionId = String(event.sessionId || '').trim().slice(0, 80);
  if (!sessionId || !['visit', 'play', 'heartbeat', 'stop'].includes(type)) throw new Error('Evento inválido.');
  const lock = LockService.getScriptLock();
  lock.waitLock(5000);
  try {
    const now = new Date();
    const zone = 'America/Sao_Paulo';
    const day = Utilities.formatDate(now, zone, 'yyyy-MM-dd');
    const config = readConfig_();
    const reports = Array.isArray(config.reports) ? config.reports : [];
    let row = reports.find(item => item.date === day);
    if (!row) { row = {date: day, accesses: 0, peakListeners: 0, listeningMinutes: 0, plays: 0}; reports.push(row); }
    row.accesses = Number(row.accesses || row.visits || 0);
    row.peakListeners = Number(row.peakListeners || 0);
    row.listeningMinutes = Number(row.listeningMinutes || 0);
    row.plays = Number(row.plays || 0);
    const active = getActiveListeners_();
    const nowMs = Date.now();
    Object.keys(active).forEach(id => { if (nowMs - Number(active[id]) > 90000) delete active[id]; });
    if (type === 'visit') row.accesses += 1;
    if (type === 'play') { row.plays += 1; active[sessionId] = nowMs; }
    if (type === 'heartbeat') { row.listeningMinutes += 1; active[sessionId] = nowMs; }
    if (type === 'stop') delete active[sessionId];
    row.peakListeners = Math.max(row.peakListeners, Object.keys(active).length);
    row.updatedAt = now.toISOString();
    config.reports = reports.sort((a, b) => String(a.date).localeCompare(String(b.date))).slice(-90);
    config.version = Number(config.version) || 1;
    saveActiveListeners_(active);
    DriveApp.getFileById(CONFIG_FILE_ID).setContent(JSON.stringify(config, null, 2));
    return jsonOutput_({ok: true, peakListeners: row.peakListeners});
  } finally {
    lock.releaseLock();
  }
}

function getActiveListeners_() {
  try { return JSON.parse(PropertiesService.getScriptProperties().getProperty('activeListeners') || '{}'); }
  catch (_) { return {}; }
}

function saveActiveListeners_(active) {
  PropertiesService.getScriptProperties().setProperty('activeListeners', JSON.stringify(active));
}

function saveContact_(contact) {
  const clean = {
    name: String(contact.name || '').trim().slice(0, 80),
    city: String(contact.city || '').trim().slice(0, 80),
    state: String(contact.state || '').trim().slice(0, 40),
    message: String(contact.message || '').trim().slice(0, 1000),
    createdAt: String(contact.createdAt || new Date().toISOString()).slice(0, 40)
  };
  if (!clean.name || !clean.city || !clean.state || !clean.message) throw new Error('Preencha todos os campos.');
  const config = readConfig_();
  const messages = Array.isArray(config.contactMessages) ? config.contactMessages : [];
  messages.push(clean);
  config.contactMessages = messages.slice(-500);
  config.version = (Number(config.version) || 0) + 1;
  DriveApp.getFileById(CONFIG_FILE_ID).setContent(JSON.stringify(config, null, 2));
  return jsonOutput_({ ok: true });
}

function readConfig_() {
  const text = DriveApp.getFileById(CONFIG_FILE_ID).getBlob().getDataAsString('UTF-8');
  return JSON.parse(text || '{}');
}

function validateConfig_(data) {
  if (!data || typeof data !== 'object') throw new Error('JSON inválido.');
  if (!data.radio || typeof data.radio.name !== 'string') throw new Error('Campo radio.name ausente.');
  if (!Array.isArray(data.tracks)) throw new Error('Campo tracks deve ser uma lista.');
  if (!data.sequences || typeof data.sequences !== 'object') throw new Error('Campo sequences ausente.');
}

function jsonOutput_(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}

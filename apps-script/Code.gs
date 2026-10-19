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

function saveEvent_(event) {
  const type = String(event.type || '').trim();
  if (type !== 'visit' && type !== 'play') throw new Error('Evento inválido.');
  const now = new Date();
  const day = Utilities.formatDate(now, Session.getScriptTimeZone() || 'America/Sao_Paulo', 'yyyy-MM-dd');
  const config = readConfig_();
  const reports = Array.isArray(config.reports) ? config.reports : [];
  let row = reports.find(item => item.date === day);
  if (!row) { row = {date: day, visits: 0, plays: 0}; reports.push(row); }
  if (type === 'visit') row.visits = Number(row.visits || 0) + 1;
  if (type === 'play') row.plays = Number(row.plays || 0) + 1;
  row.updatedAt = now.toISOString();
  config.reports = reports.sort((a, b) => String(a.date).localeCompare(String(b.date))).slice(-90);
  config.version = Number(config.version) || 1;
  DriveApp.getFileById(CONFIG_FILE_ID).setContent(JSON.stringify(config, null, 2));
  return jsonOutput_({ok: true});
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

const CONFIG_FILE_ID = '1Ug4Zz_1kXFu7Lk9DAZD_BZfqhyIKIfKi';
const AUTHORIZED_ADMIN_EMAIL = 'jon1444@gmail.com';
const ADMIN_PAGE_URL = 'https://8795-im69166xf9e57eet2eldu-5424a055.us1.manus.computer/admin.html';

function doGet(e) {
  const params = (e && e.parameter) || {};
  if (params.admin === '1') return adminGateway_();
  if (params.adminToken && !isValidAdminToken_(params.adminToken)) return jsonOutput_({ ok: false, error: 'Sessão administrativa expirada.' });
  return jsonOutput_(readConfig_());
}

function adminGateway_() {
  const email = String(Session.getActiveUser().getEmail() || '').toLowerCase();
  if (email !== AUTHORIZED_ADMIN_EMAIL) {
    return HtmlService.createHtmlOutput('<!doctype html><meta charset="utf-8"><title>Acesso restrito</title><style>body{font:16px Arial;padding:40px;max-width:560px;margin:auto;color:#333}h1{font-size:24px}</style><h1>Acesso restrito</h1><p>Esta área é exclusiva para a conta Google autorizada.</p><p>Entre no Google com <strong>' + AUTHORIZED_ADMIN_EMAIL + '</strong> e tente novamente.</p>');
  }
  const token = Utilities.getUuid();
  CacheService.getScriptCache().put('admin:' + token, email, 1800);
  const target = ADMIN_PAGE_URL + '?auth=' + encodeURIComponent(token);
  return HtmlService.createHtmlOutput(`<!doctype html><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=${target}"><title>Autenticando…</title><p>Autenticando…</p><p><a href="${target}">Clique aqui para abrir o painel</a>, caso o redirecionamento não aconteça.</p>`);
}

function isValidAdminToken_(token) {
  return !!token && CacheService.getScriptCache().get('admin:' + token) === AUTHORIZED_ADMIN_EMAIL;
}

function doPost(e) {
  try {
    const body = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    if (body.action === 'contact') return saveContact_(body.contact || {});
    const submittedToken = String(body._adminToken || '');
    delete body._adminToken;
    if (!isValidAdminToken_(submittedToken)) throw new Error('Sessão administrativa inválida ou expirada. Abra o painel novamente.');
    validateConfig_(body);
    DriveApp.getFileById(CONFIG_FILE_ID).setContent(JSON.stringify(body, null, 2));
    return jsonOutput_({ ok: true, data: body });
  } catch (error) {
    return jsonOutput_({ ok: false, error: String(error.message || error) });
  }
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

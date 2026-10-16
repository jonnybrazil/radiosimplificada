const CONFIG_FILE_ID = '1Ug4Zz_1kXFu7Lk9DAZD_BZfqhyIKIfKi';

function doGet() {
  return jsonOutput_(readConfig_());
}

function doPost(e) {
  try {
    const body = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    if (body.action === 'contact') return saveContact_(body.contact || {});
    const submittedKey = String(body._adminKey || '');
    delete body._adminKey;
    const expectedKey = PropertiesService.getScriptProperties().getProperty('ADMIN_KEY');
    if (!expectedKey) throw new Error('ADMIN_KEY ainda não configurada no Apps Script.');
    if (!submittedKey || submittedKey !== expectedKey) throw new Error('Chave administrativa inválida.');
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

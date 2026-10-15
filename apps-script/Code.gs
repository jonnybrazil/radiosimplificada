const CONFIG_FILE_ID = '1Ug4Zz_1kXFu7Lk9DAZD_BZfqhyIKIfKi';

function doGet() {
  return jsonOutput_(readConfig_());
}

function doPost(e) {
  try {
    const body = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    if (!body || typeof body !== 'object') throw new Error('JSON inválido.');
    validateConfig_(body);
    DriveApp.getFileById(CONFIG_FILE_ID).setContent(JSON.stringify(body, null, 2));
    return jsonOutput_({ ok: true, data: body });
  } catch (error) {
    return jsonOutput_({ ok: false, error: String(error.message || error) });
  }
}

function readConfig_() {
  const text = DriveApp.getFileById(CONFIG_FILE_ID).getBlob().getDataAsString('UTF-8');
  return JSON.parse(text || '{}');
}

function validateConfig_(data) {
  if (typeof data.name !== 'string') throw new Error('Campo name ausente.');
  if (!Array.isArray(data.tracks)) throw new Error('Campo tracks deve ser uma lista.');
  if (!Array.isArray(data.sequence)) throw new Error('Campo sequence deve ser uma lista.');
  if (data.priorityTrack !== null && data.priorityTrack !== undefined && String(data.priorityTrack).length > 80) {
    throw new Error('priorityTrack inválido.');
  }
}

function jsonOutput_(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}

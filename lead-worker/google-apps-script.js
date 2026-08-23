н/**
 * RUSH Detailing — приём заявок в существующую CRM Google Sheets.
 *
 * Откройте таблицу → «Расширения» → Apps Script и вставьте этот код вместо
 * Code.gs. Секрет должен совпадать с GOOGLE_SHEETS_SECRET в Cloudflare Worker.
 */

const SHEET_NAME = 'CRM';
const SECRET_TOKEN = '62b9679d2d08a1e1ad4db7b334eac5eff6c1d178fc6cb6d0';
const FIRST_LEAD_ROW = 7;

function reply(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}

function getLeadsSheet() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = spreadsheet.getSheetByName(SHEET_NAME) || spreadsheet.getActiveSheet();
  if (!sheet) throw new Error('CRM sheet was not found.');
  return sheet;
}

function doPost(event) {
  try {
    const lead = JSON.parse((event.postData && event.postData.contents) || '{}');
    if (!lead.token || lead.token !== SECRET_TOKEN) return reply({ ok: false, error: 'Unauthorized' });

    const sheet = getLeadsSheet();
    // Existing CRM headers are in row 6 and data occupies B:J.
    // Reuse the first empty row based on the name column C.
    const maxRows = Math.max(sheet.getMaxRows() - FIRST_LEAD_ROW + 1, 1);
    const names = sheet.getRange(FIRST_LEAD_ROW, 3, maxRows, 1).getValues();
    const emptyOffset = names.findIndex(([name]) => !name);
    const row = emptyOffset === -1 ? sheet.getLastRow() + 1 : FIRST_LEAD_ROW + emptyOffset;

    sheet.getRange(row, 2, 1, 9).setValues([[
      lead.timestamp || Utilities.formatDate(new Date(), 'Europe/Moscow', 'dd.MM.yyyy HH:mm'),
      lead.name || 'Не указано',
      lead.phone || 'Не указано',
      lead.email || '',
      lead.car || '',
      lead.service || 'Консультация',
      'Новая',
      '',
      [lead.source || '', lead.leadType || ''].filter(Boolean).join(' · '),
    ]]);
    return reply({ ok: true });
  } catch (error) {
    return reply({ ok: false, error: String(error) });
  }
}

function doGet() {
  return reply({ ok: true, service: 'RUSH Detailing Google Sheets webhook' });
}

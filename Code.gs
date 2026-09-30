// Google Apps Script. Sheet row 1 headers: timestamp | name | email | message
function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  const d = JSON.parse(e.postData.contents);
  sheet.appendRow([d.timestamp, d.name, d.email, d.message]);
  return ContentService.createTextOutput("ok");
}
function doGet() {
  const rows = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0].getDataRange().getValues();
  const keys = rows.shift();
  const data = rows.map(r => Object.fromEntries(keys.map((k, i) => [k, String(r[i])])));
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

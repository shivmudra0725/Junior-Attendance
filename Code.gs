/**
 * Attendance Web‑app
 * Expects query‑string parameters:
 *   rollno – student roll number
 *   lat    – latitude
 *   lng    – longitude
 *   addr   – human‑readable address
 *
 * Example call:
 *   https://script.google.com/macros/s/…/exec?rollno=23&lat=18.52&lng=73.85&addr=Pune
 */
function doGet(e) {
  // ── 1. Parameters ──────────────────────────────────────────
  const rollNo = e.parameter.rollno || "";
  const lat    = e.parameter.lat    || "";
  const lng    = e.parameter.lng    || "";
  const addr   = e.parameter.addr   || "";

  // ── 2. Sheet for today (yyyy‑MM‑dd) ─────────────────────────
  const tz   = Session.getScriptTimeZone();               // set project TZ to Asia/Kolkata
  const dateStr = Utilities.formatDate(new Date(), tz, "yyyy-MM-dd");

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let todaySheet = ss.getSheetByName(dateStr);

  if (!todaySheet) {                                      // create the sheet once per day
    todaySheet = ss.insertSheet(dateStr);
    todaySheet.appendRow(["Timestamp", "Email", "Roll No",
                          "Latitude", "Longitude", "Address"]);
    todaySheet.setFrozenRows(1);
  }

  // ── 3. Find the matching Google‑Form response row ──────────
  // Assumes the form responses are in the first sheet
  const formSheet = ss.getSheets()[0];
  const data      = formSheet.getDataRange().getValues();

  for (let r = data.length - 1; r >= 1; r--) {            // bottom‑up search
    if (data[r][2] === rollNo && !data[r][3]) {           // col C = Roll No; col D empty?
      const timestamp = data[r][0];                       // col A
      const email     = data[r][1];                       // col B

      // ── 4. Append to today’s sheet ────────────────────────
      todaySheet.appendRow([timestamp, email, rollNo, lat, lng, addr]);

      // ── 5. (Optional) write GPS back into form sheet ─────
      formSheet.getRange(r + 1, 4).setValue(lat);
      formSheet.getRange(r + 1, 5).setValue(lng);
      formSheet.getRange(r + 1, 6).setValue(addr);
      break;
    }
  }

  return ContentService.createTextOutput("OK");
}

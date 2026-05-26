/**
 * Google Apps Script — Webapp de resgate de cupom [Floripa]
 *
 * ABAS DA GOOGLE SHEET:
 * - "Whitelist" → colunas: phone_normalized, cupom
 * - "Resgates"  → criada automaticamente pelo script
 */
const SHEET_ID = "1OheSy15dqFwuzkRDJMmd5EID8yDXIVMj1DtrX5otmJc";

// ---------------------------------------------------------------------------

function normalizePhone(raw) {
  var digits = String(raw).replace(/\D/g, "");
  if (!digits.startsWith("55")) digits = "55" + digits;
  return digits;
}

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    var data      = JSON.parse(e.postData.contents);
    var phoneNorm = normalizePhone(data.telefone || "");

    if (phoneNorm.length < 12) {
      return jsonResponse({ status: "error", message: "Telefone inválido." });
    }

    var ss      = SpreadsheetApp.openById(SHEET_ID);
    var wlSheet = ss.getSheetByName("Whitelist");
    var rgSheet = ss.getSheetByName("Resgates");

    if (!rgSheet) rgSheet = ss.insertSheet("Resgates");

    // ── Carregar whitelist (phone_normalized → cupom) ─────────────────────
    var wlData   = wlSheet.getRange(2, 1, wlSheet.getLastRow() - 1, 2).getValues();
    var phoneMap = {};
    for (var i = 0; i < wlData.length; i++) {
      phoneMap[String(wlData[i][0])] = String(wlData[i][1]).trim();
    }

    var cupom = phoneMap[phoneNorm];
    if (!cupom) {
      return jsonResponse({ status: "not_eligible" });
    }

    // ── Verificar duplicata ───────────────────────────────────────────────
    // Resgates: col 1 = timestamp, col 2 = telefone, col 3 = cupom
    var rgLastRow = rgSheet.getLastRow();
    if (rgLastRow > 1) {
      var rgPhones = rgSheet.getRange(2, 2, rgLastRow - 1, 1).getValues().flat();
      for (var j = 0; j < rgPhones.length; j++) {
        if (normalizePhone(rgPhones[j]) === phoneNorm) {
          return jsonResponse({ status: "already_redeemed", cupom: cupom });
        }
      }
    }

    // ── Cabeçalho na primeira execução ───────────────────────────────────
    if (rgLastRow === 0) {
      rgSheet.appendRow(["timestamp", "telefone", "cupom"]);
    }

    // ── Gravar e retornar ─────────────────────────────────────────────────
    rgSheet.appendRow([
      new Date().toISOString(),
      data.telefone || "",
      cupom,
    ]);

    return jsonResponse({ status: "ok", cupom: cupom });

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet() {
  return ContentService
    .createTextOutput("Webhook ativo.")
    .setMimeType(ContentService.MimeType.TEXT);
}

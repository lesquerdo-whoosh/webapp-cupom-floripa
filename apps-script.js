/**
 * Google Apps Script — Webapp de resgate de cupom [Floripa]
 *
 * ABAS DA GOOGLE SHEET:
 * - "Whitelist" → importar whitelist.csv (colunas: phone_normalized, segment, cupom)
 *                 Coluna "cupom" preenchida pela Whoosh Russia com códigos únicos por usuário.
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

    // ── Carregar whitelist (phone_normalized → {segment, cupom}) ─────────
    var wlData   = wlSheet.getRange(2, 1, wlSheet.getLastRow() - 1, 3).getValues();
    var phoneMap = {};
    for (var i = 0; i < wlData.length; i++) {
      phoneMap[String(wlData[i][0])] = { segment: wlData[i][1], cupom: wlData[i][2] };
    }

    var entry = phoneMap[phoneNorm];
    if (!entry || !entry.cupom) {
      return jsonResponse({ status: "not_eligible" });
    }

    var segment = entry.segment;
    var cupom   = String(entry.cupom).trim();

    // ── Verificar duplicata ───────────────────────────────────────────────
    var rgLastRow = rgSheet.getLastRow();
    if (rgLastRow > 1) {
      var rgPhones = rgSheet.getRange(2, 3, rgLastRow - 1, 1).getValues().flat();
      for (var j = 0; j < rgPhones.length; j++) {
        if (normalizePhone(rgPhones[j]) === phoneNorm) {
          return jsonResponse({ status: "already_redeemed", cupom: cupom });
        }
      }
    }

    // ── Cabeçalho na primeira execução ───────────────────────────────────
    if (rgLastRow === 0) {
      rgSheet.appendRow(["timestamp", "telefone", "segmento", "cupom"]);
    }

    // ── Gravar e retornar ─────────────────────────────────────────────────
    rgSheet.appendRow([
      new Date().toISOString(),
      data.telefone || "",
      segment,
      cupom,
    ]);

    return jsonResponse({ status: "ok", cupom: cupom, segment: segment });

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

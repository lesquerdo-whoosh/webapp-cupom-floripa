/**
 * Google Apps Script — Webhook para webapp de resgate de cupom [Floripa]
 *
 * COMO CONFIGURAR (via Sheet — caminho mais simples):
 * 1. Abra a planilha → Extensões → Apps Script
 * 2. Apague o código existente e cole este aqui
 * 3. Salve (Ctrl+S)
 * 4. Clique em "Implantar" → "Nova implantação" → tipo: "App da Web"
 *    - Executar como: "Eu"
 *    - Quem tem acesso: "Qualquer pessoa"
 * 5. Autorize o acesso quando solicitado
 * 6. Copie a URL gerada e cole em index.html (WEBHOOK_URL)
 */
const SHEET_ID = "1OheSy15dqFwuzkRDJMmd5EID8yDXIVMj1DtrX5otmJc";
const SHEET_NAME = "Resgates"; // nome da aba — será criada automaticamente se não existir

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);

    const ss = SpreadsheetApp.openById(SHEET_ID);
    let sheet = ss.getSheetByName(SHEET_NAME);

    // Cria a aba "Resgates" se ainda não existir
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
    }

    if (sheet.getLastRow() === 0) {
      sheet.appendRow(["Timestamp", "Nome", "Telefone", "Cupom"]);
    }

    sheet.appendRow([
      data.timestamp || new Date().toISOString(),
      data.nome || "",
      data.telefone || "",
      data.cupom || "",
      // PLACEHOLDER: adicionar colunas conforme campos adicionais definidos pela Vic
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ status: "ok" }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Permite testar via GET no browser
function doGet() {
  return ContentService
    .createTextOutput("Webhook ativo.")
    .setMimeType(ContentService.MimeType.TEXT);
}

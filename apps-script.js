/**
 * Google Apps Script — Webhook para webapp de resgate de cupom [Floripa]
 *
 * COMO CONFIGURAR:
 * 1. Acesse script.google.com → Novo projeto
 * 2. Cole este código e salve
 * 3. Clique em "Implantar" → "Nova implantação" → tipo: "App da Web"
 *    - Executar como: "Eu"
 *    - Quem tem acesso: "Qualquer pessoa"
 * 4. Copie a URL gerada e cole em index.html (WEBHOOK_URL)
 * 5. Vincule ao Google Sheet copiando o ID da planilha em SHEET_ID abaixo
 *
 * PLACEHOLDER: substituir pelo ID real da planilha
 * (encontrado na URL: docs.google.com/spreadsheets/d/SEU_ID_AQUI/edit)
 */
const SHEET_ID = "SUBSTITUIR_PELO_ID_DA_PLANILHA";
const SHEET_NAME = "Resgates"; // nome da aba

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);

    const sheet = SpreadsheetApp
      .openById(SHEET_ID)
      .getSheetByName(SHEET_NAME);

    // Cria cabeçalho se a planilha estiver vazia
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

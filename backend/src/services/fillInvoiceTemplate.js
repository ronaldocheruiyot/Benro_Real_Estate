import fs from "fs";
import path from "path";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { uploadRoot } from "../middleware/upload.js";

function resolveUploadPath(fileUrl) {
  if (!fileUrl) return null;
  const cleaned = String(fileUrl).replace(/^\/+/, "").replace(/^uploads\/?/, "");
  return path.join(uploadRoot, cleaned);
}

function money(amount, symbol = "KSh") {
  return `${symbol} ${Number(amount || 0).toLocaleString("en-KE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Tailored to AMON-style portrait invoices (~618×800).
 * Keeps top branding strip from the uploaded PDF, ignores old filled text,
 * then draws a clean invoice body that matches the Settings preview.
 */
export async function fillInvoiceTemplatePdf(invoice, company) {
  const templatePath = resolveUploadPath(company.invoiceTemplateUrl);
  if (!templatePath || !fs.existsSync(templatePath)) {
    return null;
  }

  const bytes = fs.readFileSync(templatePath);
  const pdfDoc = await PDFDocument.load(bytes, { ignoreEncryption: true });
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const page = pdfDoc.getPages()[0];
  const { width, height } = page.getSize();

  const white = rgb(1, 1, 1);
  const black = rgb(0.1, 0.12, 0.16);
  const navy = rgb(0.043, 0.165, 0.29);
  const muted = rgb(0.35, 0.4, 0.48);
  const soft = rgb(0.957, 0.969, 0.984);
  const line = rgb(0.84, 0.87, 0.9);

  // Scale spacing for AMON-like pages (~618 wide) and larger A4 pages
  const scale = Math.min(1.15, Math.max(0.85, width / 618));
  const m = 36 * scale;
  const brandStrip = Math.min(95 * scale, height * 0.12);
  const contentTop = height - brandStrip - 4;

  // Ignore previous filled details — keep only header branding strip
  page.drawRectangle({ x: 0, y: 0, width, height: contentTop, color: white });
  page.drawRectangle({
    x: width * 0.52,
    y: contentTop,
    width: width * 0.48,
    height: brandStrip + 6,
    color: white,
  });

  const draw = (text, x, y, size = 10, opts = {}) => {
    const { bold = false, color = black, maxChars = 88 } = opts;
    const value = String(text ?? "").slice(0, maxChars);
    if (!value) return;
    page.drawText(value, {
      x,
      y,
      size: size * scale,
      font: bold ? fontBold : font,
      color,
    });
  };

  let y = contentTop - 18 * scale;

  // Title row (matches Settings live preview)
  draw("INVOICE", m, y, 16, { bold: true, color: navy });
  const rightX = width - 200 * scale;
  draw(String(invoice.invoiceNumber || ""), rightX, y + 2 * scale, 11, { bold: true });
  y -= 14 * scale;
  draw(company.companyName || "", m, y, 9, { color: muted, maxChars: 48 });
  draw(`Date: ${invoice.issueDate || "-"}`, rightX, y, 9);
  y -= 12 * scale;
  if (invoice.periodLabel) draw(`Period: ${invoice.periodLabel}`, m, y, 9, { color: muted });
  if (invoice.dueDate) draw(`Due: ${invoice.dueDate}`, rightX, y, 9);

  // Company contact under brand if present
  y -= 16 * scale;
  const addr = [company.addressLine1, company.addressLine2, company.city, company.country]
    .filter(Boolean)
    .join(", ");
  if (addr) {
    draw(addr, m, y, 8, { color: muted, maxChars: 95 });
    y -= 11 * scale;
  }
  const contactCo = [company.phone, company.email].filter(Boolean).join("  ·  ");
  if (contactCo) {
    draw(contactCo, m, y, 8, { color: muted, maxChars: 95 });
    y -= 14 * scale;
  } else {
    y -= 4 * scale;
  }

  // Bill To + Account boxes
  const boxH = 78 * scale;
  const gap = 10 * scale;
  const boxW = (width - m * 2 - gap) / 2;
  page.drawRectangle({
    x: m,
    y: y - boxH,
    width: boxW,
    height: boxH,
    color: soft,
    borderColor: line,
    borderWidth: 1,
  });
  page.drawRectangle({
    x: m + boxW + gap,
    y: y - boxH,
    width: boxW,
    height: boxH,
    color: soft,
    borderColor: line,
    borderWidth: 1,
  });

  draw("BILL TO", m + 10 * scale, y - 14 * scale, 8, { bold: true, color: muted });
  draw(invoice.tenantName || "-", m + 10 * scale, y - 30 * scale, 11, { bold: true, maxChars: 36 });
  if (invoice.tenantEmail) {
    draw(invoice.tenantEmail, m + 10 * scale, y - 46 * scale, 8, { color: muted, maxChars: 40 });
  }
  if (invoice.tenantPhone) {
    draw(invoice.tenantPhone, m + 10 * scale, y - 60 * scale, 8, { color: muted, maxChars: 40 });
  }

  const ax = m + boxW + gap + 10 * scale;
  draw("ACCOUNT", ax, y - 14 * scale, 8, { bold: true, color: muted });
  draw("Customer ID (Unit):", ax, y - 30 * scale, 8, { color: muted });
  draw(invoice.customerId || invoice.unit || "-", ax, y - 44 * scale, 12, { bold: true });
  draw(`Status: ${invoice.status || "draft"}`, ax, y - 60 * scale, 8, { color: muted });

  y -= boxH + 18 * scale;

  // Table header
  const tableLeft = m;
  const tableRight = width - m;
  const colQty = tableRight - 150 * scale;
  const colAmt = tableRight - 70 * scale;

  page.drawRectangle({
    x: tableLeft,
    y: y - 4 * scale,
    width: tableRight - tableLeft,
    height: 16 * scale,
    color: navy,
  });
  page.drawText("#", { x: tableLeft + 6 * scale, y: y, size: 8 * scale, font: fontBold, color: white });
  page.drawText("Description", {
    x: tableLeft + 28 * scale,
    y: y,
    size: 8 * scale,
    font: fontBold,
    color: white,
  });
  page.drawText("Qty", { x: colQty, y: y, size: 8 * scale, font: fontBold, color: white });
  page.drawText("Amount", { x: colAmt - 10 * scale, y: y, size: 8 * scale, font: fontBold, color: white });
  y -= 18 * scale;

  const symbol = company.currencySymbol || "KSh";
  const items = invoice.items?.length
    ? invoice.items
    : [{ description: "Charges", quantity: 1, amount: invoice.total || 0 }];

  let idx = 1;
  for (const item of items) {
    if (y < 150 * scale) break;
    draw(String(idx), tableLeft + 6 * scale, y, 9);
    draw(item.description || "Item", tableLeft + 28 * scale, y, 9, { maxChars: 42 });
    draw(String(item.quantity ?? 1), colQty, y, 9);
    draw(money(item.amount, symbol), colAmt - 20 * scale, y, 9);
    y -= 14 * scale;
    idx += 1;
  }

  y -= 6 * scale;
  page.drawLine({
    start: { x: tableLeft, y: y + 8 * scale },
    end: { x: tableRight, y: y + 8 * scale },
    thickness: 1,
    color: navy,
  });

  // Totals block
  const totW = 190 * scale;
  const totX = tableRight - totW;
  page.drawRectangle({
    x: totX,
    y: y - 34 * scale,
    width: totW,
    height: 18 * scale,
    color: soft,
    borderColor: line,
    borderWidth: 1,
  });
  draw("Subtotal", totX + 8 * scale, y - 22 * scale, 9, { color: muted });
  draw(money(invoice.subtotal ?? invoice.total, symbol), totX + 90 * scale, y - 22 * scale, 9);

  page.drawRectangle({
    x: totX,
    y: y - 56 * scale,
    width: totW,
    height: 22 * scale,
    color: navy,
  });
  page.drawText("TOTAL DUE", {
    x: totX + 8 * scale,
    y: y - 42 * scale,
    size: 9 * scale,
    font: fontBold,
    color: white,
  });
  page.drawText(money(invoice.total, symbol), {
    x: totX + 90 * scale,
    y: y - 42 * scale,
    size: 10 * scale,
    font: fontBold,
    color: white,
  });

  y -= 78 * scale;
  draw("Payment details", m, y, 10, { bold: true, color: navy });
  y -= 12 * scale;
  if (company.bankName) {
    draw(
      `Bank: ${company.bankName}${company.bankBranch ? ` — ${company.bankBranch}` : ""}`,
      m,
      y,
      8,
      { color: muted, maxChars: 100 }
    );
    y -= 11 * scale;
  }
  if (company.bankAccountName) {
    draw(`Account name: ${company.bankAccountName}`, m, y, 8, { color: muted, maxChars: 100 });
    y -= 11 * scale;
  }
  if (company.bankAccountNumber) {
    draw(`Account no: ${company.bankAccountNumber}`, m, y, 8, { color: muted, maxChars: 100 });
    y -= 11 * scale;
  }
  draw(`Use invoice number ${invoice.invoiceNumber} as payment reference.`, m, y, 8, {
    bold: true,
    maxChars: 100,
  });
  y -= 11 * scale;
  if (company.paymentInstructions) {
    draw(company.paymentInstructions, m, y, 8, { color: muted, maxChars: 110 });
  }

  draw(
    "Sample/old details on template were ignored · filled to match invoice preview layout",
    m,
    22 * scale,
    6.5,
    { color: muted, maxChars: 120 }
  );

  const pageCount = pdfDoc.getPageCount();
  for (let i = pageCount - 1; i >= 1; i -= 1) {
    pdfDoc.removePage(i);
  }

  return Buffer.from(await pdfDoc.save());
}

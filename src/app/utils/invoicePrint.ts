import { assetUrl, getToken } from "../api/client";
import type { CompanySettings, InvoiceRecord } from "../api/services";
import { invoicesApi } from "../api/services";

function money(amount: number, symbol = "KSh") {
  return `${symbol} ${Number(amount || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function escapeHtml(value: string) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function buildInvoiceHtml(invoice: InvoiceRecord, company: CompanySettings) {
  const symbol = company.currencySymbol || "KSh";
  const logo = company.logoUrl ? assetUrl(company.logoUrl) : "";
  const addressBits = [
    company.addressLine1,
    company.addressLine2,
    [company.city, company.country].filter(Boolean).join(", "),
  ].filter(Boolean);

  const rows = (invoice.items || [])
    .map(
      (item, idx) => `
      <tr>
        <td>${idx + 1}</td>
        <td>${escapeHtml(item.description)}</td>
        <td class="num">${item.quantity}</td>
        <td class="num">${money(item.unitPrice, symbol)}</td>
        <td class="num">${money(item.amount, symbol)}</td>
      </tr>`
    )
    .join("");

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Invoice ${escapeHtml(invoice.invoiceNumber)}</title>
  <style>
    :root {
      --navy: #0b2a4a;
      --line: #d7dee7;
      --muted: #5b6b7c;
      --soft: #f4f7fb;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 28px;
      font-family: "Segoe UI", Arial, sans-serif;
      color: #1a2430;
      background: #fff;
    }
    .sheet { max-width: 820px; margin: 0 auto; }
    .top {
      display: flex;
      justify-content: space-between;
      gap: 24px;
      border-bottom: 3px solid var(--navy);
      padding-bottom: 18px;
      margin-bottom: 22px;
    }
    .brand { display: flex; gap: 14px; align-items: flex-start; }
    .brand img {
      width: 72px; height: 72px; object-fit: contain;
      border: 1px solid var(--line); border-radius: 8px; background: #fff;
    }
    .brand h1 { margin: 0 0 4px; font-size: 22px; color: var(--navy); }
    .brand p { margin: 0; color: var(--muted); font-size: 13px; line-height: 1.45; }
    .meta { text-align: right; min-width: 220px; }
    .meta .title {
      display: inline-block;
      background: var(--navy);
      color: #fff;
      padding: 6px 14px;
      border-radius: 4px;
      font-weight: 700;
      letter-spacing: 0.08em;
      margin-bottom: 10px;
    }
    .meta div { margin: 4px 0; font-size: 13px; }
    .meta strong { color: var(--navy); }
    .grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 20px;
    }
    .box {
      border: 1px solid var(--line);
      border-radius: 8px;
      padding: 14px 16px;
      background: var(--soft);
    }
    .box h3 {
      margin: 0 0 8px;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--muted);
    }
    .box p { margin: 3px 0; font-size: 14px; }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 8px 0 18px;
    }
    th, td {
      border-bottom: 1px solid var(--line);
      padding: 10px 8px;
      font-size: 13px;
      text-align: left;
    }
    th {
      background: var(--navy);
      color: #fff;
      font-weight: 600;
    }
    td.num, th.num { text-align: right; }
    .totals {
      margin-left: auto;
      width: 280px;
      border: 1px solid var(--line);
      border-radius: 8px;
      overflow: hidden;
    }
    .totals .row {
      display: flex;
      justify-content: space-between;
      padding: 10px 14px;
      font-size: 14px;
    }
    .totals .grand {
      background: var(--navy);
      color: #fff;
      font-weight: 700;
      font-size: 16px;
    }
    .pay {
      margin-top: 22px;
      border-top: 1px dashed var(--line);
      padding-top: 16px;
      font-size: 13px;
      color: var(--muted);
    }
    .pay strong { color: #1a2430; }
    .actions { margin-top: 24px; text-align: center; }
    .actions button {
      padding: 10px 18px;
      margin: 0 6px;
      cursor: pointer;
      border-radius: 6px;
      border: 1px solid var(--line);
      background: #fff;
    }
    .actions .primary {
      background: var(--navy);
      color: #fff;
      border-color: var(--navy);
    }
    @media print {
      body { padding: 0; }
      .actions { display: none; }
    }
  </style>
</head>
<body>
  <div class="sheet">
    <div class="top">
      <div class="brand">
        ${logo ? `<img src="${escapeHtml(logo)}" alt="Logo" />` : ""}
        <div>
          <h1>${escapeHtml(company.companyName || "Company")}</h1>
          ${addressBits.map((l) => `<p>${escapeHtml(l)}</p>`).join("")}
          ${company.phone ? `<p>Tel: ${escapeHtml(company.phone)}</p>` : ""}
          ${company.email ? `<p>${escapeHtml(company.email)}</p>` : ""}
          ${company.taxId ? `<p>Tax ID: ${escapeHtml(company.taxId)}</p>` : ""}
        </div>
      </div>
      <div class="meta">
        <div class="title">INVOICE</div>
        <div><strong>Invoice No:</strong> ${escapeHtml(invoice.invoiceNumber)}</div>
        <div><strong>Issue Date:</strong> ${escapeHtml(invoice.issueDate)}</div>
        ${invoice.dueDate ? `<div><strong>Due Date:</strong> ${escapeHtml(invoice.dueDate)}</div>` : ""}
        ${invoice.periodLabel ? `<div><strong>Period:</strong> ${escapeHtml(invoice.periodLabel)}</div>` : ""}
      </div>
    </div>

    <div class="grid">
      <div class="box">
        <h3>Bill To</h3>
        <p><strong>${escapeHtml(invoice.tenantName)}</strong></p>
        ${invoice.tenantEmail ? `<p>${escapeHtml(invoice.tenantEmail)}</p>` : ""}
        ${invoice.tenantPhone ? `<p>${escapeHtml(invoice.tenantPhone)}</p>` : ""}
      </div>
      <div class="box">
        <h3>Account</h3>
        <p><strong>Customer ID (Unit):</strong> ${escapeHtml(invoice.customerId || invoice.unit)}</p>
        <p><strong>Unit:</strong> ${escapeHtml(invoice.unit)}</p>
        <p><strong>Status:</strong> ${escapeHtml(invoice.status)}</p>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th style="width:40px">#</th>
          <th>Description</th>
          <th class="num" style="width:70px">Qty</th>
          <th class="num" style="width:120px">Rate</th>
          <th class="num" style="width:120px">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${rows || `<tr><td colspan="5">No line items</td></tr>`}
      </tbody>
    </table>

    <div class="totals">
      <div class="row"><span>Subtotal</span><span>${money(invoice.subtotal, symbol)}</span></div>
      <div class="row grand"><span>Total Due</span><span>${money(invoice.total, symbol)}</span></div>
    </div>

    <div class="pay">
      <p><strong>Payment details</strong></p>
      ${company.bankName ? `<p>Bank: ${escapeHtml(company.bankName)}${company.bankBranch ? ` — ${escapeHtml(company.bankBranch)}` : ""}</p>` : ""}
      ${company.bankAccountName ? `<p>Account name: ${escapeHtml(company.bankAccountName)}</p>` : ""}
      ${company.bankAccountNumber ? `<p>Account number: ${escapeHtml(company.bankAccountNumber)}</p>` : ""}
      <p>Use invoice number <strong>${escapeHtml(invoice.invoiceNumber)}</strong> as payment reference.</p>
      ${company.paymentInstructions ? `<p>${escapeHtml(company.paymentInstructions)}</p>` : ""}
      ${invoice.notes ? `<p>Notes: ${escapeHtml(invoice.notes)}</p>` : ""}
    </div>

    <div class="actions">
      <button class="primary" onclick="window.print()">Print / Save PDF</button>
      <button onclick="window.close()">Close</button>
    </div>
  </div>
</body>
</html>`;
}

export function openInvoicePrint(invoice: InvoiceRecord, company: CompanySettings) {
  const win = window.open("", "_blank");
  if (!win) return;
  win.document.write(buildInvoiceHtml(invoice, company));
  win.document.close();
}

export function invoiceMessageText(invoice: InvoiceRecord, company: CompanySettings) {
  const symbol = company.currencySymbol || "KSh";
  return [
    `Dear ${invoice.tenantName},`,
    "",
    `Please find your invoice details below.`,
    "",
    `Invoice No: ${invoice.invoiceNumber}`,
    `Customer ID (Unit): ${invoice.customerId || invoice.unit}`,
    `Period: ${invoice.periodLabel || "-"}`,
    `Issue Date: ${invoice.issueDate}`,
    invoice.dueDate ? `Due Date: ${invoice.dueDate}` : "",
    `Total Due: ${symbol} ${Number(invoice.total || 0).toLocaleString()}`,
    "",
    "Line items:",
    ...(invoice.items || []).map(
      (i) => `- ${i.description}: ${symbol} ${Number(i.amount).toLocaleString()}`
    ),
    "",
    company.paymentInstructions || "Please pay using the invoice number as reference.",
    "",
    "You can also request the PDF from the property office / check your email attachment.",
    "",
    company.companyName || "",
    company.phone || "",
    company.email || "",
  ]
    .filter(Boolean)
    .join("\n");
}

export function emailInvoice(invoice: InvoiceRecord, company: CompanySettings) {
  if (!invoice.tenantEmail) return false;
  const subject = encodeURIComponent(
    `Invoice ${invoice.invoiceNumber} — ${company.companyName || "Property Invoice"}`
  );
  const body = encodeURIComponent(invoiceMessageText(invoice, company));
  window.location.href = `mailto:${invoice.tenantEmail}?subject=${subject}&body=${body}`;
  return true;
}

export function whatsappInvoiceUrl(invoice: InvoiceRecord, company: CompanySettings) {
  const phone = String(invoice.tenantPhone || "").replace(/[^\d+]/g, "");
  const text = encodeURIComponent(invoiceMessageText(invoice, company));
  if (phone) {
    const digits = phone.replace(/^\+/, "");
    return `https://wa.me/${digits}?text=${text}`;
  }
  return `https://wa.me/?text=${text}`;
}

/** Download PDF stamped onto the uploaded draft invoice template. */
export async function downloadFilledTemplatePdf(invoice: InvoiceRecord) {
  const token = getToken();
  const res = await fetch(invoicesApi.filledPdfUrl(invoice.id), {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) {
    let message = "Could not fill draft template";
    try {
      const data = await res.json();
      message = data.message || message;
    } catch {
      /* ignore */
    }
    throw new Error(message);
  }
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${invoice.invoiceNumber || "invoice"}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function emailInvoicesBulk(invoices: InvoiceRecord[], company: CompanySettings) {
  const withEmail = invoices.filter((i) => i.tenantEmail);
  if (!withEmail.length) return false;
  const bcc = withEmail.map((i) => i.tenantEmail).join(",");
  const subject = encodeURIComponent(
    `${company.companyName || "Property"} invoices — ${withEmail[0].periodLabel || "billing"}`
  );
  const body = encodeURIComponent(
    [
      "Dear Tenant,",
      "",
      "Your rent / utility invoice is ready.",
      "Please check your individual invoice details (invoice number and unit/customer ID) with the property office if needed,",
      "or reply to this email for your personal copy.",
      "",
      company.paymentInstructions || "Use your invoice number as the payment reference.",
      "",
      company.companyName || "",
      company.phone || "",
    ].join("\n")
  );
  window.location.href = `mailto:?bcc=${encodeURIComponent(bcc)}&subject=${subject}&body=${body}`;
  return true;
}

import { assetUrl } from "../api/client";
import type { CompanySettings } from "../api/services";

type PreviewProps = {
  company: CompanySettings;
};

/** Live preview tailored to the uploaded draft format (AMON-style portrait invoice). */
export function InvoiceTemplatePreview({ company }: PreviewProps) {
  const symbol = company.currencySymbol || "KSh";
  const logo = company.logoUrl ? assetUrl(company.logoUrl) : "";
  const address = [
    company.addressLine1,
    company.addressLine2,
    [company.city, company.country].filter(Boolean).join(", "),
  ]
    .filter(Boolean)
    .join(" · ");

  const sampleItems = [
    { description: "Monthly Rent", qty: 1, amount: 8500 },
    { description: "Water charge", qty: 12, amount: 600 },
  ];
  const total = sampleItems.reduce((s, i) => s + i.amount, 0);
  const prefix = (company.invoicePrefix || "INV").toUpperCase();
  const invoiceNo = `${prefix}-202611-0001`;
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="overflow-hidden rounded-lg border bg-neutral-100 shadow-sm">
      <div className="flex items-center justify-between border-b bg-white px-3 py-2">
        <p className="text-sm font-medium text-brand-navy">Invoice preview</p>
        <p className="text-xs text-muted-foreground">Updates as you edit details below</p>
      </div>

      {/* Portrait sheet matching uploaded AMON PDF proportions (~618×800) */}
      <div className="flex justify-center p-3 sm:p-4">
        <div
          className="w-full max-w-[420px] origin-top bg-white text-[10px] text-[#1a2430] shadow-md sm:text-[11px]"
          style={{ aspectRatio: "618 / 800" }}
        >
          <div className="flex h-full flex-col p-3 sm:p-4">
            {/* Header / brand strip */}
            <div className="mb-2 flex items-start justify-between gap-2 border-b-2 border-[#0b2a4a] pb-2">
              <div className="flex min-w-0 items-start gap-2">
                {logo ? (
                  <img
                    src={logo}
                    alt=""
                    className="size-10 shrink-0 rounded border object-contain sm:size-12"
                  />
                ) : (
                  <div className="flex size-10 shrink-0 items-center justify-center rounded border bg-neutral-50 text-[8px] text-muted-foreground sm:size-12">
                    Logo
                  </div>
                )}
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-[#0b2a4a] sm:text-base">
                    {company.companyName || "Company Name"}
                  </p>
                  {address ? (
                    <p className="line-clamp-2 text-[9px] leading-snug text-neutral-500 sm:text-[10px]">
                      {address}
                    </p>
                  ) : (
                    <p className="text-[9px] italic text-neutral-400">Address appears here</p>
                  )}
                  {(company.phone || company.email) && (
                    <p className="truncate text-[9px] text-neutral-500">
                      {[company.phone, company.email].filter(Boolean).join(" · ")}
                    </p>
                  )}
                </div>
              </div>
              <div className="shrink-0 text-right">
                <span className="inline-block rounded bg-[#0b2a4a] px-2 py-0.5 text-[9px] font-bold tracking-wider text-white">
                  INVOICE
                </span>
                <p className="mt-1 font-semibold">{invoiceNo}</p>
                <p className="text-neutral-500">Date: {today}</p>
                <p className="text-neutral-500">Period: Nov 2026</p>
              </div>
            </div>

            {/* Bill to / Customer ID */}
            <div className="mb-2 grid grid-cols-2 gap-2">
              <div className="rounded border border-neutral-200 bg-[#f4f7fb] p-2">
                <p className="mb-0.5 text-[8px] font-semibold uppercase tracking-wide text-neutral-500">
                  Bill To
                </p>
                <p className="font-semibold">Sample Tenant</p>
                <p className="text-neutral-500">tenant@example.com</p>
              </div>
              <div className="rounded border border-neutral-200 bg-[#f4f7fb] p-2">
                <p className="mb-0.5 text-[8px] font-semibold uppercase tracking-wide text-neutral-500">
                  Account
                </p>
                <p>
                  <span className="text-neutral-500">Customer ID (Unit): </span>
                  <span className="font-semibold">Unit 850</span>
                </p>
                <p className="text-neutral-500">Status: draft</p>
              </div>
            </div>

            {/* Line items */}
            <div className="mb-2 min-h-0 flex-1">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-[#0b2a4a] text-left text-white">
                    <th className="px-1.5 py-1 font-medium">#</th>
                    <th className="px-1.5 py-1 font-medium">Description</th>
                    <th className="px-1.5 py-1 text-right font-medium">Qty</th>
                    <th className="px-1.5 py-1 text-right font-medium">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {sampleItems.map((item, i) => (
                    <tr key={item.description} className="border-b border-neutral-200">
                      <td className="px-1.5 py-1">{i + 1}</td>
                      <td className="px-1.5 py-1">{item.description}</td>
                      <td className="px-1.5 py-1 text-right">{item.qty}</td>
                      <td className="px-1.5 py-1 text-right">
                        {symbol} {item.amount.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="ml-auto mb-2 w-[55%] overflow-hidden rounded border border-neutral-200">
              <div className="flex justify-between bg-neutral-50 px-2 py-1">
                <span>Subtotal</span>
                <span>
                  {symbol} {total.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between bg-[#0b2a4a] px-2 py-1.5 font-bold text-white">
                <span>Total Due</span>
                <span>
                  {symbol} {total.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="mt-auto border-t border-dashed border-neutral-300 pt-2 text-[9px] text-neutral-500">
              <p className="font-semibold text-[#0b2a4a]">Payment details</p>
              {company.bankName ? (
                <p>
                  Bank: {company.bankName}
                  {company.bankBranch ? ` — ${company.bankBranch}` : ""}
                </p>
              ) : (
                <p className="italic">Bank details appear here when filled</p>
              )}
              {company.bankAccountName && <p>Account name: {company.bankAccountName}</p>}
              {company.bankAccountNumber && <p>Account no: {company.bankAccountNumber}</p>}
              <p className="mt-1 font-medium text-[#1a2430]">
                Use invoice number {invoiceNo} as payment reference.
              </p>
              {company.paymentInstructions && (
                <p className="mt-0.5 line-clamp-2">{company.paymentInstructions}</p>
              )}
              {company.taxId && <p className="mt-0.5">Tax / PIN: {company.taxId}</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

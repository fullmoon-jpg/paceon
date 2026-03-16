// lib/utils/tnt2-invoice-pdf.ts
//
// pnpm add pdf-lib
//

import { PDFDocument, rgb, StandardFonts, PDFPage } from 'pdf-lib';

export interface TNT2InvoiceData {
  name: string;
  email: string;
  invoiceNumber: string;
  amount: string;   // e.g. "IDR 199.000"
  dueDate: string;  // e.g. "30 March 2026"
}

// ─── Colors ───────────────────────────────────────────────────────────────────

const C = {
  blue:   rgb(0.169, 0.243, 0.749),  // #2B3EBF
  yellow: rgb(0.910, 0.757, 0.165),  // #E8C12A
  red:    rgb(0.910, 0.071, 0.102),  // #E8121A
  white:  rgb(1, 1, 1),
  black:  rgb(0.102, 0.102, 0.102),  // #1a1a1a
  offwhite: rgb(0.976, 0.976, 0.976), // #f9f9f9
  grey:   rgb(0.600, 0.600, 0.600),
  lgrey:  rgb(0.820, 0.820, 0.820),
  divider: rgb(0.878, 0.878, 0.878), // #e0e0e0
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

type Font = Awaited<ReturnType<PDFDocument['embedFont']>>;

function rect(
  page: PDFPage,
  x: number, y: number, w: number, h: number,
  fill: ReturnType<typeof rgb>,
) {
  page.drawRectangle({ x, y, width: w, height: h, color: fill });
}

function line(
  page: PDFPage,
  x1: number, y1: number, x2: number, y2: number,
  color: ReturnType<typeof rgb>,
  thickness = 1,
) {
  page.drawLine({ start: { x: x1, y: y1 }, end: { x: x2, y: y2 }, color, thickness });
}

function txt(
  page: PDFPage,
  str: string,
  x: number, y: number,
  size: number,
  color: ReturnType<typeof rgb>,
  font: Font,
  maxWidth?: number,
) {
  if (!str) return;
  if (maxWidth) {
    let s = str;
    while (s.length > 4 && font.widthOfTextAtSize(s, size) > maxWidth) {
      s = s.slice(0, -1);
    }
    str = s;
  }
  page.drawText(str, { x, y, size, color, font });
}

// ─── PDF generator ────────────────────────────────────────────────────────────

export async function generateTNT2InvoicePDF(data: TNT2InvoiceData): Promise<Buffer> {
  const { name, email, invoiceNumber, amount, dueDate } = data;

  const doc  = await PDFDocument.create();
  const page = doc.addPage([595, 720]); // A4 width, shorter since invoice only
  const { width, height } = page.getSize();

  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const reg  = await doc.embedFont(StandardFonts.Helvetica);

  const PL = 52;
  const PR = 52;
  const CW = width - PL - PR;

  // ── BACKGROUND ─────────────────────────────────────────────────────────────
  rect(page, 0, 0, width, height, C.white);

  // ── TOP ACCENT BAR ─────────────────────────────────────────────────────────
  rect(page, 0, height - 6, width, 6, C.yellow);

  // ── HEADER ─────────────────────────────────────────────────────────────────
  rect(page, 0, height - 80, width, 74, C.blue);

  // PACE ON
  txt(page, 'PACE ON', PL, height - 38, 14, C.yellow, bold);
  txt(page, 'Talk N Tales Vol. 2', PL, height - 56, 9, C.lgrey, reg);

  // INVOICE label top right
  txt(page, 'INVOICE', width - PR - bold.widthOfTextAtSize('INVOICE', 20), height - 42, 20, C.white, bold);
  txt(page, `#${invoiceNumber}`, width - PR - reg.widthOfTextAtSize(`#${invoiceNumber}`, 8.5), height - 56, 8.5, C.lgrey, reg);

  // ── BODY ───────────────────────────────────────────────────────────────────
  rect(page, 0, 0, width, height - 80, C.offwhite);
  rect(page, 0, 0, 6, height - 80, C.blue); // left accent

  let y = height - 104;

  // ── BILLED TO / INVOICE META ───────────────────────────────────────────────
  // Left: Billed To
  txt(page, 'BILLED TO', PL, y, 7, C.grey, bold);
  txt(page, name,        PL, y - 16, 11, C.black, bold, CW / 2 - 10);
  txt(page, email,       PL, y - 30, 8.5, C.grey, reg, CW / 2 - 10);

  // Right: Invoice meta
  const metaX = width - PR - 180;
  txt(page, 'INVOICE NUMBER', metaX, y,      7,   C.grey,  bold);
  txt(page, invoiceNumber,    metaX, y - 16, 9.5, C.black, bold);

  txt(page, 'PAYMENT DEADLINE', metaX, y - 36,  7,   C.grey,  bold);
  txt(page, dueDate,            metaX, y - 52,  9.5, C.black, bold);

  y -= 72;
  line(page, PL, y, width - PR, y, C.divider, 1);
  y -= 20;

  // ── ITEM TABLE HEADER ──────────────────────────────────────────────────────
  txt(page, 'DESCRIPTION',  PL,              y, 7, C.grey, bold);
  txt(page, 'QTY',          width - PR - 160, y, 7, C.grey, bold);
  txt(page, 'AMOUNT',       width - PR - 80,  y, 7, C.grey, bold);

  y -= 10;
  line(page, PL, y, width - PR, y, C.divider, 1);
  y -= 20;

  // ── ITEM ROW ───────────────────────────────────────────────────────────────
  txt(page, 'Talk N Tales Vol. 2 — Event Ticket', PL,              y, 10, C.black, bold);
  txt(page, 'Saturday, 9 May 2026',               PL,              y - 14, 8, C.grey,  reg);
  txt(page, '1',                                  width - PR - 155, y, 10, C.black, reg);
  txt(page, amount,                               width - PR - 80,  y, 10, C.blue,  bold);

  y -= 38;
  line(page, PL, y, width - PR, y, C.divider, 1);
  y -= 24;

  // ── TOTAL ──────────────────────────────────────────────────────────────────
  txt(page, 'TOTAL',  width - PR - 130, y, 8,  C.grey,  bold);
  txt(page, amount,   width - PR - 80,  y, 14, C.blue,  bold);

  // Early Bird badge
  rect(page, PL, y - 6, 60, 16, C.yellow);
  txt(page, 'EARLY BIRD', PL + 5, y - 2, 6.5, C.blue, bold);

  y -= 36;
  line(page, PL, y, width - PR, y, C.divider, 1);
  y -= 28;

  // ── PAYMENT OPTIONS ────────────────────────────────────────────────────────
  txt(page, 'PAYMENT OPTIONS', PL, y, 7, C.red, bold);
  y -= 18;

  // Sea Bank
  rect(page, PL, y - 32, 3, 40, C.yellow);
  txt(page, 'Sea Bank',           PL + 12, y,       9,   C.blue,  bold);
  txt(page, '9012 8311 7886',     PL + 12, y - 14,  10,  C.black, bold);
  txt(page, 'a/n M Rifki Ramdhani S', PL + 12, y - 26, 8, C.grey, reg);

  // BCA
  const bcaX = width / 2 + 10;
  rect(page, bcaX, y - 32, 3, 40, C.yellow);
  txt(page, 'BCA',                bcaX + 12, y,       9,   C.blue,  bold);
  txt(page, '5735 326 594',       bcaX + 12, y - 14,  10,  C.black, bold);
  txt(page, 'a/n M Rifki Ramdhani S', bcaX + 12, y - 26, 8, C.grey, reg);

  y -= 52;
  line(page, PL, y, width - PR, y, C.divider, 1);
  y -= 20;

  // ── DEADLINE NOTE ──────────────────────────────────────────────────────────
  txt(page, `Payment deadline: ${dueDate} 23:59 WIB`, PL, y, 8, C.grey, reg);

  // ── FOOTER BAR ─────────────────────────────────────────────────────────────
  rect(page, 0, 0, width, 36, C.black);
  txt(page, 'PACE ON  ·  hi@paceon.id  ·  @paceon.id', PL, 13, 8, C.lgrey, reg);
  txt(page, invoiceNumber, width - PR - bold.widthOfTextAtSize(invoiceNumber, 8), 13, 8, C.grey, reg);

  // ── Serialize ──────────────────────────────────────────────────────────────
  const bytes = await doc.save();
  return Buffer.from(bytes);
}

export async function getTNT2InvoiceBase64(data: TNT2InvoiceData): Promise<string> {
  const buf = await generateTNT2InvoicePDF(data);
  return buf.toString('base64');
}
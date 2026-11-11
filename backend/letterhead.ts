import {rgb, type PDFFont, type PDFImage, type PDFPage} from 'pdf-lib';

const teal = rgb(.04, .38, .39);
const muted = rgb(.32, .47, .50);
const gold = rgb(.94, .77, .13);

export function drawLetterhead(page: PDFPage, font: PDFFont, bold: PDFFont, logo: PDFImage | null,
  brand: {phone: string; email: string; area: string}, left: number, right: number) {
  const top = page.getHeight();
  if (logo) {
    const size = logo.scaleToFit(162, 72);
    page.drawImage(logo, {x: left, y: top - 53 - size.height / 2, ...size});
  } else {
    page.drawText('FINCH NETWORKS LTD', {x: left, y: top - 50, font: bold, size: 13, color: teal});
  }
  const phone = brand.phone.replace(/[^+\d]/g, '').replace(/^(\+254)(\d{3})(\d{3})(\d{3})$/, '$1 $2 $3 $4');
  const contacts = [['Phone', phone], ['Email', brand.email], ['Website', 'finchnetworksltd.com'], ['Location', brand.area]];
  contacts.forEach(([label, raw], i) => {
    const value = raw.replace(/[^\x20-\xff]/g, ' ').trim();
    const valueFont = i === 0 ? bold : font;
    const size = 9;
    const y = top - 30 - i * 13;
    const prefix = label + ':';
    const labelWidth = bold.widthOfTextAtSize(prefix, size);
    const available = (right - left) * .48 - labelWidth - 5;
    let fitted = value;
    while (valueFont.widthOfTextAtSize(fitted, size) > available) {
      fitted = fitted.replace(/\.{3}$/, '').slice(0, -1) + '...';
    }
    const x = right - valueFont.widthOfTextAtSize(fitted, size);
    page.drawText(prefix, {x: x - labelWidth - 5, y, size, font: bold, color: muted});
    page.drawText(fitted, {x, y, size, font: valueFont, color: teal});
  });
  const center = (left + right) / 2;
  const slogan = 'SECURE. CONNECT. EMPOWER.';
  page.drawRectangle({x: center - 9, y: top - 84, width: 18, height: 1.5, color: gold});
  page.drawText(slogan, {x: center - bold.widthOfTextAtSize(slogan, 7) / 2, y: top - 94, size: 7, font: bold, color: teal});
  page.drawRectangle({x: left, y: top - 108, width: right - left, height: 1, color: teal});
  page.drawRectangle({x: left, y: top - 108, width: 62, height: 2.5, color: gold});
  return top - 131;
}

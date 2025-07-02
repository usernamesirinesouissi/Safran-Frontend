import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

function wrapText(text: string, maxLength: number): string[] {
  const words = text.split(' ');
  const lines = [];
  let currentLine = '';

  for (const word of words) {
    if ((currentLine + ' ' + word).length <= maxLength) {
      currentLine += (currentLine ? ' ' : '') + word;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
}

export async function generateCustomPdf(demandes: any[]) {
  const [coverPdfBytes, sommairePdfBytes, slidePdfBytes, endPdfBytes] = await Promise.all([
    fetch('/assets/template/pagegarde.pdf').then(res => res.arrayBuffer()),
    fetch('/assets/template/sommaire.pdf').then(res => res.arrayBuffer()),
    fetch('/assets/template/template-slide.pdf').then(res => res.arrayBuffer()),
    fetch('/assets/template/ending.pdf').then(res => res.arrayBuffer()),
  ]);

  const finalPdf = await PDFDocument.create();
  const font = await finalPdf.embedFont(StandardFonts.Helvetica);

  // Cover page
  const coverDoc = await PDFDocument.load(coverPdfBytes);
  const [coverPage] = await finalPdf.copyPages(coverDoc, [0]);
  finalPdf.addPage(coverPage);

  // Sommaire page
  const sommaireDoc = await PDFDocument.load(sommairePdfBytes);
  const [sommairePage] = await finalPdf.copyPages(sommaireDoc, [0]);

  const sommaireYStart = 600;
  let y = sommaireYStart;
  const lineHeight = 20;

  demandes.forEach((d, i) => {
    sommairePage.drawText(`${i + 1}. ${d.intituleProjet}`, {
      x: 60,
      y: y,
      size: 12,
      font,
      color: rgb(0, 0, 0)
    });
    y -= lineHeight;
  });
  finalPdf.addPage(sommairePage);

  // Slide template for each subject
  const slideDoc = await PDFDocument.load(slidePdfBytes);

  for (let i = 0; i < demandes.length; i++) {
    const demande = demandes[i];
    const [slidePage] = await finalPdf.copyPages(slideDoc, [0]);

    // Title
    slidePage.drawText(demande.intituleProjet, { x: 50, y: 700, font, size: 14 });

    // Description (wrap text)
    const descriptionLines = wrapText(demande.descriptionProjet, 90);
    descriptionLines.forEach((line, idx) => {
      slidePage.drawText(line, { x: 50, y: 670 - (idx * 12), font, size: 10 });
    });

    // Right-side details (adjust positions to match your design)
    slidePage.drawText(`Référence: ${demande.reference || '-'}`, { x: 400, y: 700, font, size: 10 });
    slidePage.drawText(`Diplôme: ${demande.diplome || 'Cycle ingénieur'}`, { x: 400, y: 680, font, size: 10 });
    slidePage.drawText(`Spécialité: ${demande.specialite || 'Non défini'}`, { x: 400, y: 660, font, size: 10 });
    slidePage.drawText(`Nombre de stagiaires: ${demande.nombreStagiaires || 1}`, { x: 400, y: 640, font, size: 10 });
    slidePage.drawText(`Durée: ${demande.duree || '4 à 6 mois'}`, { x: 400, y: 620, font, size: 10 });
    slidePage.drawText(`Localisation: ${demande.localisation || 'Site Dhari'}`, { x: 400, y: 600, font, size: 10 });

    finalPdf.addPage(slidePage);
  }

  // End page
  const endDoc = await PDFDocument.load(endPdfBytes);
  const [endPage] = await finalPdf.copyPages(endDoc, [0]);
  finalPdf.addPage(endPage);

  // Finalize and open the PDF
  const pdfBytes = await finalPdf.save();
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  window.open(url);
}
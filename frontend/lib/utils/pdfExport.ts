import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface PDFExportOptions {
  filename?: string;
  title?: string;
  orientation?: 'portrait' | 'landscape';
  format?: 'a4' | 'letter';
  quality?: number;
  margin?: number;
}

/**
 * Exporte un élément HTML en PDF
 * @param elementId - ID de l'élément HTML à exporter
 * @param options - Options d'export
 */
export async function exportToPDF(
  elementId: string,
  options: PDFExportOptions = {}
): Promise<void> {
  const {
    filename = 'rapport.pdf',
    title = 'Rapport',
    orientation = 'portrait',
    format = 'a4',
    quality = 2,
    margin = 10,
  } = options;

  try {
    // Récupérer l'élément à exporter
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error(`Élément avec l'ID "${elementId}" introuvable`);
    }

    // Créer une copie de l'élément pour manipulation
    const clone = element.cloneNode(true) as HTMLElement;
    clone.style.width = element.scrollWidth + 'px';

    // Masquer les éléments non imprimables
    const nonPrintableElements = clone.querySelectorAll('.print\\:hidden, [class*="print:hidden"]');
    nonPrintableElements.forEach((el) => {
      (el as HTMLElement).style.display = 'none';
    });

    // Ajouter le clone temporairement au document
    document.body.appendChild(clone);
    clone.style.position = 'absolute';
    clone.style.left = '-9999px';

    // Capturer le canvas avec une meilleure qualité
    const canvas = await html2canvas(clone, {
      scale: quality,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
    });

    // Supprimer le clone
    document.body.removeChild(clone);

    // Dimensions du PDF
    const imgWidth = orientation === 'portrait' ? 210 - (2 * margin) : 297 - (2 * margin); // A4 en mm
    const pageHeight = orientation === 'portrait' ? 297 : 210; // A4 en mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;

    // Créer le PDF
    const pdf = new jsPDF({
      orientation,
      unit: 'mm',
      format,
    });

    // Ajouter le titre
    pdf.setFontSize(16);
    pdf.text(title, margin, margin + 5);

    // Position de départ du contenu
    let position = margin + 15;

    // Convertir le canvas en image
    const imgData = canvas.toDataURL('image/png');

    // Ajouter l'image au PDF avec gestion des pages multiples
    pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight);
    heightLeft -= (pageHeight - position);

    while (heightLeft > 0) {
      position = heightLeft - imgHeight + margin;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', margin, position, imgWidth, imgHeight);
      heightLeft -= (pageHeight - margin);
    }

    // Ajouter pied de page sur chaque page
    const pageCount = pdf.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i);
      pdf.setFontSize(8);
      pdf.setTextColor(150);
      
      // Date et heure
      const now = new Date();
      const dateStr = now.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
      const timeStr = now.toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
      });
      
      pdf.text(
        `Généré le ${dateStr} à ${timeStr}`,
        margin,
        pageHeight - 5
      );
      
      // Numéro de page
      pdf.text(
        `Page ${i} / ${pageCount}`,
        imgWidth + margin - 20,
        pageHeight - 5
      );
    }

    // Sauvegarder le PDF
    pdf.save(filename);

    return Promise.resolve();
  } catch (error) {
    console.error('Erreur lors de l\'export PDF:', error);
    return Promise.reject(error);
  }
}

/**
 * Exporte plusieurs éléments HTML en un seul PDF
 * @param elementIds - IDs des éléments HTML à exporter
 * @param options - Options d'export
 */
export async function exportMultipleToPDF(
  elementIds: string[],
  options: PDFExportOptions = {}
): Promise<void> {
  const {
    filename = 'rapport.pdf',
    title = 'Rapport',
    orientation = 'portrait',
    format = 'a4',
    quality = 2,
    margin = 10,
  } = options;

  try {
    const pdf = new jsPDF({
      orientation,
      unit: 'mm',
      format,
    });

    // Dimensions
    const imgWidth = orientation === 'portrait' ? 210 - (2 * margin) : 297 - (2 * margin);
    const pageHeight = orientation === 'portrait' ? 297 : 210;

    // Ajouter le titre sur la première page
    pdf.setFontSize(16);
    pdf.text(title, margin, margin + 5);

    let isFirstElement = true;
    let currentY = margin + 15;

    for (const elementId of elementIds) {
      const element = document.getElementById(elementId);
      if (!element) {
        console.warn(`Élément avec l'ID "${elementId}" introuvable`);
        continue;
      }

      if (!isFirstElement) {
        pdf.addPage();
        currentY = margin;
      }

      // Capturer le canvas
      const canvas = await html2canvas(element, {
        scale: quality,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });

      // Dimensions
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const imgData = canvas.toDataURL('image/png');

      // Ajouter l'image
      pdf.addImage(imgData, 'PNG', margin, currentY, imgWidth, imgHeight);

      isFirstElement = false;
    }

    // Ajouter pied de page
    const pageCount = pdf.getNumberOfPages();
    
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i);
      pdf.setFontSize(8);
      pdf.setTextColor(150);
      
      const now = new Date();
      const dateStr = now.toLocaleDateString('fr-FR');
      const timeStr = now.toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
      });
      
      pdf.text(
        `Généré le ${dateStr} à ${timeStr}`,
        margin,
        pageHeight - 5
      );
      
      pdf.text(
        `Page ${i} / ${pageCount}`,
        imgWidth + margin - 20,
        pageHeight - 5
      );
    }

    // Sauvegarder le PDF
    pdf.save(filename);

    return Promise.resolve();
  } catch (error) {
    console.error('Erreur lors de l\'export PDF:', error);
    return Promise.reject(error);
  }
}

/**
 * Génère un nom de fichier avec la date actuelle
 * @param prefix - Préfixe du nom de fichier
 * @returns Nom de fichier avec date
 */
export function generateFilename(prefix: string = 'rapport'): string {
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
  const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-'); // HH-MM-SS
  return `${prefix}_${dateStr}_${timeStr}.pdf`;
}

import { PDFDocument } from 'pdf-lib';

/**
 * Splits a single large PDF file into multiple smaller PDF files
 * based on a maximum page count per chunk.
 */
export const splitPdf = async (file: File, maxPagesPerChunk: number = 10): Promise<File[]> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const sourcePdfDoc = await PDFDocument.load(arrayBuffer);
    const totalPages = sourcePdfDoc.getPageCount();
    const chunks: File[] = [];
    const baseName = file.name.replace('.pdf', '');

    // If the file is small enough, return it as is (wrapped in array)
    if (totalPages <= maxPagesPerChunk) {
      return [file];
    }

    // Split logic
    for (let i = 0; i < totalPages; i += maxPagesPerChunk) {
      const subDocument = await PDFDocument.create();
      
      // Calculate start and end indices
      const end = Math.min(i + maxPagesPerChunk, totalPages);
      
      // Copy pages
      const pageIndices = Array.from({ length: end - i }, (_, k) => i + k);
      const copiedPages = await subDocument.copyPages(sourcePdfDoc, pageIndices);
      
      copiedPages.forEach((page) => subDocument.addPage(page));

      // Save chunk
      const pdfBytes = await subDocument.save();
      
      // Create a sensible name like "Manual_Part_1_Pages_1-10.pdf"
      const chunkName = `${baseName}_Part_${Math.floor(i / maxPagesPerChunk) + 1}_Pages_${i + 1}-${end}.pdf`;
      
      chunks.push(new File([pdfBytes], chunkName, { type: 'application/pdf' }));
    }

    return chunks;
  } catch (error) {
    console.error("Error splitting PDF:", error);
    throw new Error("Nepodarilo sa automaticky rozdeliť PDF súbor. Skúste ho rozdeliť manuálne alebo skontrolujte, či nie je poškodený.");
  }
};

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Captures a DOM element and downloads it as a PDF.
 * Optimized for Scout Pro Analysis Reports.
 */
export async function downloadAnalysisReport(elementId: string, playerName: string) {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error('Target element for PDF not found');
    return;
  }

  // 1. Prepare for capture (e.g. handle dark mode colors if needed)
  const originalStyle = element.style.cssText;
  
  try {
    const canvas = await html2canvas(element, {
      scale: 2, // High quality
      useCORS: true,
      backgroundColor: '#09090b', // Zinc-950 (Scout Pro background)
      logging: false,
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const imgWidth = 210; // A4 width
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
    
    // Add Branding Footer
    pdf.setFontSize(10);
    pdf.setTextColor(150);
    pdf.text(`Scout Pro | AI-Driven Compatibility Report | ${playerName}`, 10, 290);

    pdf.save(`ScoutPro_Report_${playerName.replace(/\s+/g, '_')}.pdf`);
  } catch (error) {
    console.error('PDF Generation Failed:', error);
  } finally {
    element.style.cssText = originalStyle;
  }
}

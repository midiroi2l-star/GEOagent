const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;

/**
 * Renders every `.report-page` child of `containerEl` onto its own A4 page of a PDF.
 * Each `.report-page` element must be authored at a fixed 210mm width (see .report-page in index.css)
 * so the captured canvas aspect ratio maps cleanly onto an A4 sheet.
 *
 * jsPDF/html2canvas are dynamically imported so their ~400kB combined weight only loads
 * when a user actually clicks a "Download PDF" button, keeping the initial bundle small.
 */
export async function exportReportToPdf(containerEl: HTMLElement, filename: string): Promise<void> {
  const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
    import("jspdf"),
    import("html2canvas"),
  ]);

  const pages = Array.from(containerEl.querySelectorAll<HTMLElement>(".report-page"));
  if (pages.length === 0) throw new Error("No .report-page elements found to export");

  const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait", compress: true });

  for (let i = 0; i < pages.length; i++) {
    const canvas = await html2canvas(pages[i], {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
      windowWidth: pages[i].scrollWidth,
    });
    const imgData = canvas.toDataURL("image/jpeg", 0.95);
    const imgHeightMm = (canvas.height * A4_WIDTH_MM) / canvas.width;

    if (i > 0) pdf.addPage();
    pdf.addImage(imgData, "JPEG", 0, 0, A4_WIDTH_MM, Math.min(imgHeightMm, A4_HEIGHT_MM));
  }

  pdf.save(filename);
}

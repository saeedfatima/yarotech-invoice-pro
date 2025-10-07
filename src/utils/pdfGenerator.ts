import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";

interface SaleData {
  id: string;
  sale_date: string;
  total: number;
  issuer_name: string;
  customers: {
    name: string;
    email?: string;
    phone?: string;
    address?: string;
  };
  sale_items: Array<{
    product_name: string;
    quantity: number;
    price: number;
    total: number;
  }>;
}

export const generateInvoicePDF = async (sale: SaleData) => {
  const doc = new jsPDF();

  try {
    const logoImg = await fetch('/yarotech logo copy.png');
    const logoBlob = await logoImg.blob();
    const logoDataUrl = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(logoBlob);
    });

    doc.addImage(logoDataUrl, 'PNG', 15, 15, 40, 40);
  } catch (error) {
    console.error('Error loading logo:', error);
  }

  // Centered Company Information
  const centerX = 105;
  doc.setFontSize(22);
  doc.setTextColor(33, 150, 243);
  doc.setFont("helvetica", "bold");
  doc.text("YAROTECH NETWORK LIMITED", centerX, 22, { align: "center" });

  // Company address and contact - centered
  doc.setFontSize(9);
  doc.setTextColor(60, 60, 60);
  doc.setFont("helvetica", "normal");
  doc.text("No. 122 Lukoro Plaza A, Farm Center, Kano State", centerX, 30, { align: "center" });

  doc.setFontSize(9);
  doc.setTextColor(33, 150, 243);
  doc.setFont("helvetica", "normal");
  doc.text("Phone: +234 XXX XXX XXXX", centerX, 36, { align: "center" });
  doc.text("Email: info@yarotech.com.ng", centerX, 42, { align: "center" });

  // Decorative line separator with gradient effect
  doc.setDrawColor(33, 150, 243);
  doc.setLineWidth(0.8);
  doc.line(15, 50, 195, 50);
  doc.setDrawColor(33, 150, 243);
  doc.setLineWidth(0.3);
  doc.line(15, 51.5, 195, 51.5);

  // INVOICE title with background accent
  doc.setFillColor(33, 150, 243);
  doc.roundedRect(140, 58, 55, 18, 2, 2, 'F');

  doc.setFontSize(28);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  doc.text("INVOICE", 167.5, 70, { align: "center" });

  // Enhanced invoice details section with border
  doc.setDrawColor(33, 150, 243);
  doc.setLineWidth(0.5);
  doc.setFillColor(250, 252, 255);
  doc.roundedRect(15, 85, 180, 42, 3, 3, 'FD');

  // Invoice ID with accent background
  doc.setFillColor(33, 150, 243);
  doc.roundedRect(20, 90, 55, 10, 2, 2, 'F');
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  doc.text("INVOICE ID", 47.5, 96.5, { align: "center" });

  const invoiceId = `INV-${sale.id.substring(0, 8).toUpperCase()}`;
  doc.setFontSize(12);
  doc.setTextColor(33, 150, 243);
  doc.setFont("helvetica", "bold");
  doc.text(invoiceId, 47.5, 105, { align: "center" });

  // Customer section
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(60, 60, 60);
  doc.text("BILL TO:", 20, 116);

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text(sale.customers?.name || "N/A", 20, 122);

  // Date section
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(60, 60, 60);
  doc.text("DATE:", 145, 116);

  const invoiceDate = format(new Date(sale.sale_date), "MMM dd, yyyy HH:mm");
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(0, 0, 0);
  doc.text(invoiceDate, 145, 122);
  
  // Items table with blue header
  const tableData = sale.sale_items.map(item => [
    item.product_name,
    item.quantity.toString(),
    item.price.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    item.total.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
  ]);
  
  autoTable(doc, {
    startY: 140,
    head: [["PRODUCT", "QUANTITY", "PRICE (₦)", "TOTAL (₦)"]],
    body: tableData,
    theme: "grid",
    headStyles: {
      fillColor: [33, 150, 243],
      textColor: [255, 255, 255],
      fontSize: 11,
      fontStyle: "bold",
      halign: "left",
      cellPadding: { top: 8, right: 6, bottom: 8, left: 6 },
      lineWidth: 0,
      lineColor: [33, 150, 243],
    },
    bodyStyles: {
      fontSize: 10,
      cellPadding: { top: 6, right: 6, bottom: 6, left: 6 },
      textColor: [40, 40, 40],
      lineWidth: 0.3,
      lineColor: [200, 200, 200],
    },
    alternateRowStyles: {
      fillColor: [250, 252, 255],
    },
    columnStyles: {
      0: { cellWidth: 80, fontStyle: "normal" },
      1: { halign: "center", cellWidth: 30 },
      2: { halign: "right", cellWidth: 40 },
      3: { halign: "right", cellWidth: 40, fontStyle: "bold", textColor: [33, 150, 243] },
    },
    foot: [[
      { content: "", colSpan: 2 },
      { content: "GRAND TOTAL", styles: { halign: "right", fontStyle: "bold", fontSize: 13, fillColor: [33, 150, 243], textColor: [255, 255, 255], cellPadding: 10 } },
      { content: `₦ ${sale.total.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, styles: { fontStyle: "bold", fontSize: 13, halign: "right", fillColor: [20, 100, 180], textColor: [255, 255, 255], cellPadding: 10 } }
    ]],
    footStyles: {
      fillColor: [33, 150, 243],
      textColor: [255, 255, 255],
      lineWidth: 0,
    },
    margin: { left: 15, right: 15 },
  });
  
  // Issuer information with enhanced styling
  const finalY = (doc as any).lastAutoTable.finalY || 140;

  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  doc.line(15, finalY + 12, 195, finalY + 12);

  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(60, 60, 60);
  doc.text("INVOICE ISSUED BY:", 15, finalY + 20);

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(33, 150, 243);
  doc.text(sale.issuer_name, 15, finalY + 27);

  // Enhanced footer with gradient-like appearance
  doc.setFillColor(33, 150, 243);
  doc.roundedRect(15, finalY + 38, 180, 18, 3, 3, 'F');

  doc.setDrawColor(20, 100, 180);
  doc.setLineWidth(2);
  doc.line(15, finalY + 47, 195, finalY + 47);

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  doc.text("Thank you for your business with YAROTECH Network Limited!", 105, finalY + 49, { align: "center" });

  // Professional footer information
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.setFont("helvetica", "normal");
  doc.text("This is a computer-generated invoice and requires no signature.", 105, finalY + 66, { align: "center" });
  doc.text("Page 1 of 1", 105, 285, { align: "center" });

  // Save the PDF
  doc.save(`invoice-${invoiceId}.pdf`);
};
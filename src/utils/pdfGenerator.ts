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

  // Add logo at the top
  try {
    const logoImg = await fetch('/yarotech logo copy.png');
    const logoBlob = await logoImg.blob();
    const logoDataUrl = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(logoBlob);
    });

    // Logo positioned at top left
    doc.addImage(logoDataUrl, 'PNG', 20, 15, 40, 40);
  } catch (error) {
    console.error('Error loading logo:', error);
  }

  // Company name positioned to the right of logo
  doc.setFontSize(20);
  doc.setTextColor(33, 150, 243);
  doc.setFont("helvetica", "bold");
  doc.text("YAROTECH NETWORK LIMITED", 70, 30);

  // Company address and contact info below company name
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "normal");
  doc.text("No. 122 Lukoro Plaza A, Farm Center, Kano State", 70, 40);

  doc.setFontSize(10);
  doc.setTextColor(33, 150, 243);
  doc.text("Phone: +234 XXX XXX XXXX", 70, 47);
  doc.text("Email: info@yarotech.com.ng", 70, 54);

  // Decorative line separator
  doc.setDrawColor(33, 150, 243);
  doc.setLineWidth(1);
  doc.line(20, 65, 190, 65);
  doc.setLineWidth(0.5);
  doc.line(20, 67, 190, 67);

  // INVOICE title with blue background
  doc.setFillColor(33, 150, 243);
  doc.roundedRect(140, 75, 50, 15, 3, 3, 'F');

  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  doc.text("INVOICE", 165, 85, { align: "center" });

  // Invoice details section with border
  doc.setDrawColor(33, 150, 243);
  doc.setLineWidth(1);
  doc.setFillColor(248, 250, 255);
  doc.roundedRect(20, 100, 170, 35, 3, 3, 'FD');

  // Invoice ID section
  doc.setFillColor(33, 150, 243);
  doc.roundedRect(25, 105, 50, 8, 2, 2, 'F');
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  doc.text("INVOICE ID", 50, 110, { align: "center" });

  const invoiceId = `INV-${sale.id.substring(0, 8).toUpperCase()}`;
  doc.setFontSize(12);
  doc.setTextColor(33, 150, 243);
  doc.setFont("helvetica", "bold");
  doc.text(invoiceId, 50, 118, { align: "center" });

  // Bill To section
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text("BILL TO:", 25, 128);

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text(sale.customers?.name || "N/A", 25, 135);

  // Date section
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text("DATE:", 140, 128);

  const invoiceDate = format(new Date(sale.sale_date), "MMM dd, yyyy HH:mm");
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(0, 0, 0);
  doc.text(invoiceDate, 140, 135);
  
  // Items table
  const tableData = sale.sale_items.map(item => [
    item.product_name,
    item.quantity.toString(),
    item.price.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    item.total.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
  ]);
  
  autoTable(doc, {
    startY: 150,
    head: [["PRODUCT", "QUANTITY", "PRICE (₦)", "TOTAL (₦)"]],
    body: tableData,
    theme: "grid",
    headStyles: {
      fillColor: [33, 150, 243],
      textColor: [255, 255, 255],
      fontSize: 11,
      fontStyle: "bold",
      halign: "left",
      cellPadding: 8,
      lineWidth: 0,
    },
    bodyStyles: {
      fontSize: 10,
      cellPadding: 6,
      textColor: [0, 0, 0],
      lineWidth: 0.3,
      lineColor: [200, 200, 200],
    },
    alternateRowStyles: {
      fillColor: [248, 250, 255],
    },
    columnStyles: {
      0: { cellWidth: 75 },
      1: { halign: "center", cellWidth: 35 },
      2: { halign: "right", cellWidth: 40 },
      3: { halign: "right", cellWidth: 40, fontStyle: "bold", textColor: [33, 150, 243] },
    },
    foot: [[
      { content: "", colSpan: 2 },
      { content: "GRAND TOTAL", styles: { halign: "right", fontStyle: "bold", fontSize: 12, fillColor: [33, 150, 243], textColor: [255, 255, 255], cellPadding: 8 } },
      { content: `₦ ${sale.total.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, styles: { fontStyle: "bold", fontSize: 12, halign: "right", fillColor: [20, 100, 180], textColor: [255, 255, 255], cellPadding: 8 } }
    ]],
    footStyles: {
      fillColor: [33, 150, 243],
      textColor: [255, 255, 255],
      lineWidth: 0,
    },
    margin: { left: 20, right: 20 },
  });
  
  // Issuer information
  const finalY = (doc as any).lastAutoTable.finalY || 140;

  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  doc.line(20, finalY + 15, 190, finalY + 15);

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text("INVOICE ISSUED BY:", 20, finalY + 25);

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(33, 150, 243);
  doc.text(sale.issuer_name, 20, finalY + 32);

  // Footer with blue background
  doc.setFillColor(33, 150, 243);
  doc.roundedRect(20, finalY + 42, 170, 15, 3, 3, 'F');

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  doc.text("Thank you for your business with YAROTECH Network Limited!", 105, finalY + 51, { align: "center" });

  // Page number
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  doc.setFont("helvetica", "normal");
  doc.text("Page 1 of 1", 105, 285, { align: "center" });

  // Save the PDF
  doc.save(`invoice-${invoiceId}.pdf`);
};
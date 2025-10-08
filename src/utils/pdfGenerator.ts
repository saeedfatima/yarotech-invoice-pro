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
    const logoImg = await fetch('/IMG-20251004-WA0030.jpg');
    const logoBlob = await logoImg.blob();
    const logoDataUrl = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(logoBlob);
    });

    doc.addImage(logoDataUrl, 'JPEG', 20, 15, 35, 35);
  } catch (error) {
    console.error('Error loading logo:', error);
  }

  // Company name
  doc.setFontSize(24);
  doc.setTextColor(33, 150, 243);
  doc.setFont("helvetica", "bold");
  doc.text("YAROTECH", 60, 28);
  doc.setFontSize(20);
  doc.text("NETWORK LIMITED", 60, 38);
  
  // Company address and contact
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "normal");
  doc.text("No. 122 Lukoro Plaza A, Farm Center, Kano State", 20, 52);
  doc.setTextColor(33, 150, 243);
  doc.text("Email: info@yarotech.com.ng", 20, 59);
  
  // Horizontal line separator
  doc.setDrawColor(33, 150, 243);
  doc.setLineWidth(1);
  doc.line(20, 65, 190, 65);

  // INVOICE title (right-aligned)
  doc.setFontSize(36);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(33, 150, 243);
  doc.text("INVOICE", 200, 85, { align: "right" });

  // Light background box for invoice details
  doc.setFillColor(248, 249, 250);
  doc.roundedRect(20, 92, 170, 38, 3, 3, 'F');

  // Customer and Date section
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text("Customer:", 25, 102);
  doc.text("Date:", 115, 102);

  doc.setFont("helvetica", "normal");
  doc.text(sale.customers?.name || "N/A", 25, 109);
  const invoiceDate = format(new Date(sale.sale_date), "MMM dd, yyyy HH:mm");
  doc.text(invoiceDate, 115, 109);

  // Invoice ID
  doc.setFont("helvetica", "bold");
  doc.text("Invoice ID:", 25, 120);
  doc.setFont("helvetica", "normal");
  const invoiceId = `INV-${sale.id.substring(0, 8).toUpperCase()}`;
  doc.text(invoiceId, 25, 127);
  
  // Items table with blue header
  const tableData = sale.sale_items.map(item => [
    item.product_name,
    item.quantity.toString(),
    item.price.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    item.total.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
  ]);
  
  autoTable(doc, {
    startY: 145,
    head: [["PRODUCT", "QUANTITY", "PRICE (₦)", "TOTAL (₦)"]],
    body: tableData,
    theme: "striped",
    headStyles: {
      fillColor: [33, 150, 243],
      textColor: [255, 255, 255],
      fontSize: 12,
      fontStyle: "bold",
      halign: "left",
      cellPadding: 8,
      lineWidth: 0,
    },
    bodyStyles: {
      fontSize: 10,
      cellPadding: 7,
      textColor: [0, 0, 0],
      lineWidth: 0.1,
      lineColor: [224, 224, 224],
    },
    alternateRowStyles: {
      fillColor: [248, 249, 250],
    },
    columnStyles: {
      0: { cellWidth: 75 },
      1: { halign: "center", cellWidth: 35 },
      2: { halign: "right", cellWidth: 40 },
      3: { halign: "right", cellWidth: 40 },
    },
    foot: [[
      { content: "", colSpan: 2 },
      { content: "Grand Total", styles: { halign: "right", fontStyle: "bold", fontSize: 12, fillColor: [33, 150, 243], textColor: [255, 255, 255], cellPadding: 8 } },
      { content: `₦ ${sale.total.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, styles: { fontStyle: "bold", fontSize: 12, halign: "right", fillColor: [33, 150, 243], textColor: [255, 255, 255], cellPadding: 8 } }
    ]],
    footStyles: {
      fillColor: [33, 150, 243],
      textColor: [255, 255, 255],
      lineWidth: 0,
    },
  });
  
  // Issuer information
  const finalY = (doc as any).lastAutoTable.finalY || 140;

  doc.setDrawColor(224, 224, 224);
  doc.setLineWidth(0.5);
  doc.line(20, finalY + 15, 190, finalY + 15);

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text("Invoice Issued By:", 20, finalY + 25);
  doc.setFont("helvetica", "normal");
  doc.text(sale.issuer_name, 20, finalY + 32);

  // Footer message with background
  doc.setFillColor(33, 150, 243);
  doc.roundedRect(20, finalY + 42, 170, 15, 3, 3, 'F');

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  doc.text("Thank you for your business with YAROTECH Network Limited!", 105, finalY + 51, { align: "center" });

  // Page number at bottom
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  doc.text("Page 1 of 1", 105, 285, { align: "center" });

  // Save the PDF
  doc.save(`invoice-${invoiceId}.pdf`);
};
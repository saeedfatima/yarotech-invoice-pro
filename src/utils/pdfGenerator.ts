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
  
  // Add YAROTECH logo placeholder (blue rounded square)
  doc.setFillColor(33, 150, 243);
  doc.roundedRect(20, 15, 30, 30, 5, 5, 'F');
  
  // Add WiFi icon representation in white
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.text(")", 30, 33); // Simple WiFi representation
  
  // Company name
  doc.setFontSize(24);
  doc.setTextColor(33, 150, 243);
  doc.setFont("helvetica", "bold");
  doc.text("YAROTECH", 55, 28);
  doc.setFontSize(20);
  doc.text("NETWORK LIMITED", 55, 38);
  
  // Company address
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "normal");
  doc.text("No. 122 Lukoro Plaza A, Farm Center,", 20, 52);
  doc.text("Kano State", 20, 59);
  
  // INVOICE title (right-aligned)
  doc.setFontSize(32);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text("INVOICE", 200, 85, { align: "right" });
  
  // Customer and Date section
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Customer", 20, 100);
  doc.text("Date", 200, 100, { align: "right" });
  
  doc.setFont("helvetica", "normal");
  doc.text(sale.customers?.name || "N/A", 20, 107);
  const invoiceDate = format(new Date(sale.sale_date), "yyyy-MM-dd HH:mm");
  doc.text(invoiceDate, 200, 107, { align: "right" });
  
  // Invoice ID
  doc.setFont("helvetica", "bold");
  doc.text("Invoice ID", 20, 120);
  doc.setFont("helvetica", "normal");
  const invoiceId = `INV-${sale.id.substring(0, 4).toUpperCase()}`;
  doc.text(invoiceId, 20, 127);
  
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
    theme: "plain",
    headStyles: {
      fillColor: [33, 150, 243],
      textColor: [255, 255, 255],
      fontSize: 11,
      fontStyle: "bold",
      halign: "left",
      cellPadding: 5,
    },
    bodyStyles: {
      fontSize: 10,
      cellPadding: 5,
      textColor: [0, 0, 0],
    },
    alternateRowStyles: {
      fillColor: [255, 255, 255],
    },
    columnStyles: {
      0: { cellWidth: 70 },
      1: { halign: "center", cellWidth: 35 },
      2: { halign: "right", cellWidth: 40 },
      3: { halign: "right", cellWidth: 45 },
    },
    foot: [[
      { content: "", colSpan: 2 },
      { content: "Grand Total", styles: { halign: "right", fontStyle: "bold", fontSize: 11 } },
      { content: sale.total.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 }), styles: { fontStyle: "bold", fontSize: 11, halign: "right" } }
    ]],
    footStyles: {
      fillColor: [255, 255, 255],
      textColor: [0, 0, 0],
      lineWidth: 0.5,
      lineColor: [33, 150, 243],
    },
  });
  
  // Issuer information
  const finalY = (doc as any).lastAutoTable.finalY || 140;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Invoice Issuer: ${sale.issuer_name}`, 20, finalY + 20);
  
  // Footer message
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Thank you for your business with YAROTECH Network Limited!", 20, finalY + 35);
  
  // Save the PDF
  doc.save(`invoice-${invoiceId}.pdf`);
};
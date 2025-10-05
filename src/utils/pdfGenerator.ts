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
  
  // Company header
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("YAROTECH NETWORK LIMITED", 105, 20, { align: "center" });
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("No. 122 Lukoro Plaza A, Farm Center, Kano State", 105, 28, { align: "center" });
  
  // Invoice title
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("INVOICE", 105, 45, { align: "center" });
  
  // Invoice details
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const invoiceY = 55;
  
  doc.text(`Invoice ID: ${sale.id.substring(0, 8).toUpperCase()}`, 20, invoiceY);
  doc.text(`Date: ${format(new Date(sale.sale_date), "MMM dd, yyyy HH:mm")}`, 20, invoiceY + 6);
  doc.text(`Issued by: ${sale.issuer_name}`, 20, invoiceY + 12);
  
  // Customer details
  doc.setFont("helvetica", "bold");
  doc.text("Bill To:", 20, invoiceY + 22);
  doc.setFont("helvetica", "normal");
  doc.text(sale.customers.name, 20, invoiceY + 28);
  if (sale.customers.email) {
    doc.text(sale.customers.email, 20, invoiceY + 34);
  }
  if (sale.customers.phone) {
    doc.text(sale.customers.phone, 20, invoiceY + 40);
  }
  if (sale.customers.address) {
    doc.text(sale.customers.address, 20, invoiceY + 46);
  }
  
  // Items table
  const tableData = sale.sale_items.map(item => [
    item.product_name,
    item.quantity.toString(),
    `₦${item.price.toLocaleString()}`,
    `₦${item.total.toLocaleString()}`
  ]);
  
  autoTable(doc, {
    startY: invoiceY + 55,
    head: [["Product", "Quantity", "Price", "Total"]],
    body: tableData,
    theme: "grid",
    headStyles: {
      fillColor: [66, 66, 66],
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    styles: {
      fontSize: 10,
    },
    columnStyles: {
      0: { cellWidth: 80 },
      1: { cellWidth: 30, halign: "center" },
      2: { cellWidth: 40, halign: "right" },
      3: { cellWidth: 40, halign: "right" },
    },
  });
  
  // Grand Total
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Grand Total:", 130, finalY);
  doc.text(`₦${sale.total.toLocaleString()}`, 190, finalY, { align: "right" });
  
  // Footer
  doc.setFontSize(10);
  doc.setFont("helvetica", "italic");
  const pageHeight = doc.internal.pageSize.height;
  doc.text("Thank you for your business!", 105, pageHeight - 20, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.text("YAROTECH NETWORK LIMITED - Your Trusted Technology Partner", 105, pageHeight - 15, { align: "center" });
  
  // Save the PDF
  doc.save(`Invoice-${sale.id.substring(0, 8)}.pdf`);
};
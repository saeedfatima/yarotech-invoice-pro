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
  const doc = new jsPDF({ unit: "pt", format: "a4" });

  const primaryColor = [33, 150, 243];
  const accentColor = [20, 100, 180];
  const marginX = 40;

  // ---- LOGO ----
  try {
    const logo = await fetch("/yarotech logo copy.png");
    const blob = await logo.blob();
    const reader = new FileReader();
    const logoUrl: string = await new Promise((resolve) => {
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });
    doc.addImage(logoUrl, "PNG", marginX, 40, 60, 60);
  } catch {
    console.warn("Logo not found");
  }

  // ---- COMPANY HEADER ----
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(...primaryColor);
  doc.text("YAROTECH NETWORK LIMITED", marginX + 80, 60);

  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "normal");
  doc.text("No. 122 Lukoro Plaza A, Farm Center, Kano State", marginX + 80, 75);
  doc.text("Phone: +234 8140244774 | Email: info@yarotech.com.ng", marginX + 80, 88);

  // ---- LINE SEPARATOR ----
  doc.setDrawColor(...primaryColor);
  doc.setLineWidth(1);
  doc.line(marginX, 110, 555, 110);

  // ---- INVOICE TITLE ----
  doc.setFillColor(...primaryColor);
  doc.roundedRect(430, 130, 100, 25, 4, 4, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("INVOICE", 480, 147, { align: "center" });

  // ---- INFO SECTION ----
  const sectionTop = 175;
  doc.setDrawColor(...primaryColor);
  doc.setLineWidth(0.7);
  doc.roundedRect(marginX, sectionTop, 515, 65, 5, 5);

  // Invoice ID
  const invoiceId = `INV-${sale.id.substring(0, 8).toUpperCase()}`;
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text("INVOICE ID:", marginX + 15, sectionTop + 20);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...primaryColor);
  doc.text(invoiceId, marginX + 90, sectionTop + 20);

  // Date
  const invoiceDate = format(new Date(sale.sale_date), "MMM dd, yyyy HH:mm");
  doc.setFont("helvetica", "normal");
  doc.setTextColor(0, 0, 0);
  doc.text("DATE:", 400, sectionTop + 20);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...primaryColor);
  doc.text(invoiceDate, 450, sectionTop + 20);

  // Bill To
  doc.setFont("helvetica", "normal");
  doc.setTextColor(0, 0, 0);
  doc.text("BILL TO:", marginX + 15, sectionTop + 45);
  doc.setFont("helvetica", "bold");
  doc.text(sale.customers?.name || "N/A", marginX + 80, sectionTop + 45);

  // ---- ITEMS TABLE ----
  const tableY = sectionTop + 100;
  const tableBody = sale.sale_items.map((item) => [
    item.product_name,
    item.quantity.toString(),
    item.price.toLocaleString("en-NG", { minimumFractionDigits: 2 }),
    item.total.toLocaleString("en-NG", { minimumFractionDigits: 2 }),
  ]);

  autoTable(doc, {
    startY: tableY,
    head: [["PRODUCT", "QTY", "PRICE (₦)", "TOTAL (₦)"]],
    body: tableBody,
    theme: "striped",
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontSize: 11,
      halign: "center",
      fontStyle: "bold",
    },
    bodyStyles: {
      fontSize: 10,
      textColor: [0, 0, 0],
      cellPadding: 6,
    },
    columnStyles: {
      0: { cellWidth: 240, halign: "left" },
      1: { cellWidth: 60, halign: "center" },
      2: { cellWidth: 100, halign: "right" },
      3: { cellWidth: 100, halign: "right" },
    },
    margin: { left: marginX, right: marginX },
  });

  const finalY = (doc as any).lastAutoTable.finalY + 20;

  // ---- TOTAL SECTION ----
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text("GRAND TOTAL:", 380, finalY);
  doc.setTextColor(...primaryColor);
  doc.text(
    `₦ ${sale.total.toLocaleString("en-NG", { minimumFractionDigits: 2 })}`,
    490,
    finalY
  );

  // ---- ISSUER ----
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "bold");
  doc.text("INVOICE ISSUED BY:", marginX, finalY + 40);
  doc.setTextColor(...primaryColor);
  doc.text(sale.issuer_name, marginX + 120, finalY + 40);

  // ---- FOOTER ----
  doc.setFillColor(...primaryColor);
  doc.roundedRect(marginX, finalY + 70, 515, 25, 4, 4, "F");
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  doc.text(
    "Thank you for your business with YAROTECH Network Limited!",
    297.5,
    finalY + 87,
    { align: "center" }
  );

  // ---- PAGE FOOTNOTE ----
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  doc.text("Page 1 of 1", 297.5, 820, { align: "center" });

  // ---- SAVE ----
  doc.save(`invoice-${invoiceId}.pdf`);
};

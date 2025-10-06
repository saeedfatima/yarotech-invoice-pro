import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileDown, Mail } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { generateInvoicePDF } from "@/utils/pdfGenerator";
import { sendInvoiceEmail } from "@/utils/emailInvoice";

interface Sale {
  id: string;
  sale_date: string;
  total: number;
  issuer_name: string;
  customers: {
    name: string;
    email: string;
    phone: string;
    address: string;
  } | null;
}

export const SalesHistory = ({ refreshTrigger }: { refreshTrigger: number }) => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSales();
  }, [refreshTrigger]);

  const loadSales = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("sales")
      .select(`
        id,
        sale_date,
        total,
        issuer_name,
        customers (
          name,
          email,
          phone,
          address
        )
      `)
      .order("sale_date", { ascending: false });

    if (error) {
      toast({ title: "Error loading sales", variant: "destructive" });
      console.error(error);
    } else {
      setSales(data || []);
    }
    setLoading(false);
  };

  const handleDownloadInvoice = async (saleId: string) => {
    try {
      const { data: sale, error: saleError } = await supabase
        .from("sales")
        .select(`
          *,
          customers (*),
          sale_items (*)
        `)
        .eq("id", saleId)
        .single();

      if (saleError) throw saleError;

      await generateInvoicePDF(sale);

      toast({ title: "Invoice downloaded successfully!" });
    } catch (error) {
      console.error("Error downloading invoice:", error);
      toast({
        title: "Error downloading invoice",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleEmailInvoice = async (saleId: string) => {
    try {
      toast({
        title: "Sending email...",
        description: "Please wait while we send the invoice."
      });

      const { data: sale, error: saleError } = await supabase
        .from("sales")
        .select(`
          *,
          customers (*),
          sale_items (*)
        `)
        .eq("id", saleId)
        .single();

      if (saleError) throw saleError;

      await sendInvoiceEmail(sale);

      toast({
        title: "Email sent successfully!",
        description: "Invoice has been sent to info@yarotech.com.ng"
      });
    } catch (error) {
      console.error("Error emailing invoice:", error);
      toast({
        title: "Error sending email",
        description: error.message || "Failed to send invoice email",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading sales history...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sales History</CardTitle>
      </CardHeader>
      <CardContent>
        {sales.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No sales recorded yet</p>
        ) : (
          <div className="space-y-4">
            {sales.map((sale) => (
              <div 
                key={sale.id} 
                className="border rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-center">
                  <div>
                    <p className="text-sm text-muted-foreground">Date</p>
                    <p className="font-medium">
                      {format(new Date(sale.sale_date), "MMM dd, yyyy HH:mm")}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground">Customer</p>
                    <p className="font-medium">{sale.customers?.name || "N/A"}</p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground">Issuer</p>
                    <p className="font-medium">{sale.issuer_name}</p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground">Total</p>
                    <p className="font-bold text-lg">₦{sale.total.toLocaleString()}</p>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleDownloadInvoice(sale.id)}
                      size="sm"
                      variant="outline"
                    >
                      <FileDown className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                    <Button
                      onClick={() => handleEmailInvoice(sale.id)}
                      size="sm"
                      variant="outline"
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      Email
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
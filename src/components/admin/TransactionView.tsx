import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface Sale {
  id: string;
  sale_date: string;
  total: number;
  issuer_name: string;
  customers: {
    name: string;
    email: string | null;
    phone: string | null;
  } | null;
}

export const TransactionView = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSales();
  }, []);

  const loadSales = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("sales")
      .select(`
        *,
        customers (
          name,
          email,
          phone
        )
      `)
      .order("sale_date", { ascending: false });

    if (error) {
      toast({
        title: "Error loading transactions",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setSales(data || []);
    }
    setLoading(false);
  };

  if (loading) {
    return <div className="text-center py-8">Loading transactions...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Transactions</CardTitle>
      </CardHeader>
      <CardContent>
        {sales.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No transactions yet</p>
        ) : (
          <div className="space-y-4">
            {sales.map((sale) => (
              <div
                key={sale.id}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Date</p>
                    <p className="font-medium">
                      {format(new Date(sale.sale_date), "MMM dd, yyyy HH:mm")}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground">Customer</p>
                    <p className="font-medium">{sale.customers?.name || "N/A"}</p>
                    {sale.customers?.email && (
                      <p className="text-xs text-muted-foreground">
                        {sale.customers.email}
                      </p>
                    )}
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground">Issuer</p>
                    <p className="font-medium">{sale.issuer_name}</p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground">Total</p>
                    <p className="font-bold text-lg">₦{sale.total.toLocaleString()}</p>
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

export default TransactionView;

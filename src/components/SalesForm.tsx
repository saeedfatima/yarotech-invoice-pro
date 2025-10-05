import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Customer {
  id: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
}

interface SaleItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  total: number;
}

export const SalesForm = ({ onSaleCreated }: { onSaleCreated: () => void }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [issuerName, setIssuerName] = useState("");
  const [saleItems, setSaleItems] = useState<SaleItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCustomers();
    loadProducts();
  }, []);

  const loadCustomers = async () => {
    const { data, error } = await supabase
      .from("customers")
      .select("id, name")
      .order("name");

    if (error) {
      toast({ title: "Error loading customers", variant: "destructive" });
      return;
    }
    setCustomers(data || []);
  };

  const loadProducts = async () => {
    const { data, error } = await supabase
      .from("products")
      .select("id, name, price")
      .order("name");

    if (error) {
      toast({ title: "Error loading products", variant: "destructive" });
      return;
    }
    setProducts(data || []);
  };

  const addSaleItem = () => {
    setSaleItems([...saleItems, {
      productId: "",
      productName: "",
      quantity: 1,
      price: 0,
      total: 0,
    }]);
  };

  const removeSaleItem = (index: number) => {
    setSaleItems(saleItems.filter((_, i) => i !== index));
  };

  const updateSaleItem = (index: number, field: string, value: any) => {
    const newItems = [...saleItems];
    const item = newItems[index];

    if (field === "productId") {
      const product = products.find(p => p.id === value);
      if (product) {
        item.productId = value;
        item.productName = product.name;
        item.price = product.price;
        item.total = item.quantity * product.price;
      }
    } else if (field === "quantity") {
      item.quantity = parseInt(value) || 1;
      item.total = item.quantity * item.price;
    }

    setSaleItems(newItems);
  };

  const calculateGrandTotal = () => {
    return saleItems.reduce((sum, item) => sum + item.total, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCustomer || !issuerName || saleItems.length === 0) {
      toast({ 
        title: "Validation Error", 
        description: "Please fill all required fields and add at least one product",
        variant: "destructive" 
      });
      return;
    }

    if (saleItems.some(item => !item.productId || item.quantity < 1)) {
      toast({ 
        title: "Validation Error", 
        description: "Please select products and enter valid quantities",
        variant: "destructive" 
      });
      return;
    }

    setLoading(true);

    try {
      const grandTotal = calculateGrandTotal();

      // Insert sale
      const { data: sale, error: saleError } = await supabase
        .from("sales")
        .insert({
          customer_id: selectedCustomer,
          issuer_name: issuerName,
          total: grandTotal,
        })
        .select()
        .single();

      if (saleError) throw saleError;

      // Insert sale items
      const itemsToInsert = saleItems.map(item => ({
        sale_id: sale.id,
        product_id: item.productId,
        product_name: item.productName,
        quantity: item.quantity,
        price: item.price,
      }));

      const { error: itemsError } = await supabase
        .from("sale_items")
        .insert(itemsToInsert);

      if (itemsError) throw itemsError;

      toast({ title: "Sale created successfully!" });
      
      // Reset form
      setSelectedCustomer("");
      setIssuerName("");
      setSaleItems([]);
      onSaleCreated();
    } catch (error) {
      console.error("Error creating sale:", error);
      toast({ 
        title: "Error creating sale", 
        description: error.message,
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>New Sale</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customer">Customer *</Label>
              <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                <SelectTrigger>
                  <SelectValue placeholder="Select customer" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map(customer => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="issuer">Issuer Name *</Label>
              <Input
                id="issuer"
                value={issuerName}
                onChange={(e) => setIssuerName(e.target.value)}
                placeholder="Your name"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Products *</Label>
              <Button type="button" onClick={addSaleItem} size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            </div>

            {saleItems.map((item, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end p-4 border rounded-lg">
                <div className="md:col-span-5 space-y-2">
                  <Label>Product</Label>
                  <Select 
                    value={item.productId} 
                    onValueChange={(value) => updateSaleItem(index, "productId", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select product" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map(product => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name} - ₦{product.price.toLocaleString()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="md:col-span-2 space-y-2">
                  <Label>Quantity</Label>
                  <Input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateSaleItem(index, "quantity", e.target.value)}
                  />
                </div>

                <div className="md:col-span-2 space-y-2">
                  <Label>Price</Label>
                  <Input
                    value={`₦${item.price.toLocaleString()}`}
                    disabled
                  />
                </div>

                <div className="md:col-span-2 space-y-2">
                  <Label>Total</Label>
                  <Input
                    value={`₦${item.total.toLocaleString()}`}
                    disabled
                  />
                </div>

                <div className="md:col-span-1">
                  <Button 
                    type="button" 
                    onClick={() => removeSaleItem(index)} 
                    variant="destructive"
                    size="icon"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {saleItems.length > 0 && (
            <div className="flex justify-end">
              <div className="text-right">
                <Label className="text-lg">Grand Total</Label>
                <p className="text-2xl font-bold">₦{calculateGrandTotal().toLocaleString()}</p>
              </div>
            </div>
          )}

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Creating Sale..." : "Create Sale"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
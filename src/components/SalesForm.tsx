import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";

interface SaleItem {
  id: string;
  product_id: string;
  product_name: string;
  price: number;
  quantity: number;
}


interface Product {
  id: string;
  name: string;
  price: number;
}

interface SalesFormProps {
  onSaleCreated?: () => void;
}

export const SalesForm = ({ onSaleCreated }: SalesFormProps) => {
  const [saleItems, setSaleItems] = useState<SaleItem[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [issuerName, setIssuerName] = useState("");
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    const response = await apiClient.getProducts();
    if (response.data) {
      setProducts(response.data as Product[]);
    }
  };

  const addSaleItem = () => {
    setSaleItems([
      ...saleItems,
      {
        id: Date.now().toString(),
        product_id: "",
        product_name: "",
        price: 0,
        quantity: 1,
      },
    ]);
  };

  const updateSaleItem = (id: string, field: keyof SaleItem, value: any) => {
    setSaleItems(
      saleItems.map((item) => {
        if (item.id === id) {
          if (field === "product_id") {
            const product = products.find((p) => p.id === value);
            return {
              ...item,
              product_id: value,
              product_name: product?.name || "",
              price: product?.price || 0,
            };
          }
          return { ...item, [field]: value };
        }
        return item;
      })
    );
  };

  const removeSaleItem = (id: string) => {
    setSaleItems(saleItems.filter((item) => item.id !== id));
  };

  const calculateTotal = (item: SaleItem) => item.price * item.quantity;
  const grandTotal = saleItems.reduce((sum, item) => sum + calculateTotal(item), 0);

  const handleSubmit = async () => {
    if (!customerName.trim() || !issuerName.trim() || saleItems.length === 0) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields and add at least one product.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const response = await apiClient.createSale({
        customer_name: customerName.trim(),
        issuer_name: issuerName,
        sale_items: saleItems.map((item) => ({
          product_id: item.product_id || undefined,
          product_name: item.product_name,
          quantity: item.quantity,
          price: item.price,
        })),
      });

      if (response.error) {
        throw new Error(response.error);
      }

      toast({ title: "Sale created successfully!" });
      setSaleItems([]);
      setCustomerName("");
      setIssuerName("");
      onSaleCreated?.();
    } catch (err) {
      console.error(err);
      toast({
        title: "Failed to create sale",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Sale</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="customer">Customer Name *</Label>
            <Input
              id="customer"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Enter customer name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="issuer">Issuer Name *</Label>
            <Input
              id="issuer"
              value={issuerName}
              onChange={(e) => setIssuerName(e.target.value)}
              placeholder="Enter your name"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-lg">Products</Label>
            <Button onClick={addSaleItem} size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </div>

          {saleItems.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No products added yet. Click "Add Product" to start.
            </p>
          ) : (
            <div className="space-y-3">
              {saleItems.map((item) => (
                <div
                  key={item.id}
                  className="grid grid-cols-1 md:grid-cols-5 gap-3 p-4 border rounded-lg"
                >
                  <div className="md:col-span-2">
                    <Label>Product</Label>
                    <Select
                      value={item.product_id}
                      onValueChange={(value) =>
                        updateSaleItem(item.id, "product_id", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select product" />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map((product) => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.name} - ₦{product.price.toLocaleString()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Quantity</Label>
                    <Input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) =>
                        updateSaleItem(item.id, "quantity", Number(e.target.value))
                      }
                    />
                  </div>

                  <div>
                    <Label>Total</Label>
                    <div className="font-semibold text-lg pt-2">
                      ₦{calculateTotal(item).toLocaleString()}
                    </div>
                  </div>

                  <div className="flex items-end">
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => removeSaleItem(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {saleItems.length > 0 && (
          <div className="flex justify-between items-center pt-4 border-t">
            <span className="text-lg font-semibold">Grand Total:</span>
            <span className="text-2xl font-bold">
              ₦{grandTotal.toLocaleString()}
            </span>
          </div>
        )}

        <Button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full"
          size="lg"
        >
          {loading ? "Creating Sale..." : "Create Sale"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default SalesForm;
"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface Product {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export default function CreateSale() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [issuerName, setIssuerName] = useState("");
  const [loading, setLoading] = useState(false);

  // Add a product line
  const addProduct = () => {
    setProducts([...products, { id: Date.now().toString(), name: "", price: 0, quantity: 1 }]);
  };

  // Update product fields
  const updateProduct = (id: string, field: keyof Product, value: any) => {
    setProducts(products.map((p) => (p.id === id ? { ...p, [field]: value } : p)));
  };

  // Remove product line
  const removeProduct = (id: string) => {
    setProducts(products.filter((p) => p.id !== id));
  };

  // Calculate totals
  const calculateTotal = (p: Product) => p.price * p.quantity;
  const grandTotal = products.reduce((sum, p) => sum + calculateTotal(p), 0);

  // Handle form submission
  const handleSubmit = async () => {
    if (!selectedCustomer || !issuerName || products.length === 0) {
      alert("Please fill in all fields and add at least one product.");
      return;
    }

    setLoading(true);

    try {
      // Insert sale into DB
      const { data: sale, error: saleError } = await supabase
        .from("sales")
        .insert({
          customer_name: selectedCustomer, // switched to text input
          issuer_name: issuerName,
          total: grandTotal,
        })
        .select()
        .single();

      if (saleError) throw saleError;

      // Insert sale items
      const { error: itemsError } = await supabase.from("sale_items").insert(
        products.map((p) => ({
          sale_id: sale.id,
          product_name: p.name,
          quantity: p.quantity,
          price: p.price,
          total: calculateTotal(p),
        }))
      );

      if (itemsError) throw itemsError;

      alert("Sale created successfully!");
      setProducts([]);
      setSelectedCustomer("");
      setIssuerName("");
    } catch (err) {
      console.error(err);
      alert("Failed to create sale.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Create Sale</h1>

      <div className="space-y-4">
        {/* Customer Name */}
        <div className="space-y-2">
          <Label htmlFor="customer">Customer Name *</Label>
          <Input
            id="customer"
            value={selectedCustomer}
            onChange={(e) => setSelectedCustomer(e.target.value)}
            placeholder="Enter customer name"
          />
        </div>

        {/* Issuer Name */}
        <div className="space-y-2">
          <Label htmlFor="issuer">Issuer Name *</Label>
          <Input
            id="issuer"
            value={issuerName}
            onChange={(e) => setIssuerName(e.target.value)}
            placeholder="Enter your name"
          />
        </div>

        {/* Product List */}
        <div>
          <h2 className="text-lg font-semibold mb-2">Products</h2>
          {products.map((product) => (
            <div key={product.id} className="flex items-center gap-2 mb-2">
              <Input
                placeholder="Product name"
                value={product.name}
                onChange={(e) => updateProduct(product.id, "name", e.target.value)}
              />
              <Input
                type="number"
                placeholder="Price"
                value={product.price}
                onChange={(e) => updateProduct(product.id, "price", Number(e.target.value))}
              />
              <Input
                type="number"
                placeholder="Qty"
                value={product.quantity}
                onChange={(e) => updateProduct(product.id, "quantity", Number(e.target.value))}
              />
              <span className="font-medium">₦{calculateTotal(product).toFixed(2)}</span>
              <Button variant="destructive" onClick={() => removeProduct(product.id)}>
                Remove
              </Button>
            </div>
          ))}

          <Button variant="outline" onClick={addProduct}>
            + Add Product
          </Button>
        </div>

        {/* Grand Total */}
        <div className="text-right font-bold text-lg">Grand Total: ₦{grandTotal.toFixed(2)}</div>

        {/* Submit Button */}
        <Button onClick={handleSubmit} disabled={loading}>
          {loading ? "Saving..." : "Save Sale"}
        </Button>
      </div>
    </div>
  );
}
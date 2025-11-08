import { ProductManagement } from "@/components/admin/ProductManagement";

const Products = () => {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-foreground">Products</h1>
        <ProductManagement />
      </div>
    </div>
  );
};

export default Products;

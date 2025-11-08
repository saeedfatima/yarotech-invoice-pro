import { useState } from "react";
import { SalesForm } from "@/components/SalesForm";
import { SalesHistory } from "@/components/SalesHistory";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Sale = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleSaleCreated = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-foreground">Sales</h1>
        
        <Tabs defaultValue="new-sale" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2 mb-8">
            <TabsTrigger value="new-sale">New Sale</TabsTrigger>
            <TabsTrigger value="history">Sales History</TabsTrigger>
          </TabsList>
          
          <TabsContent value="new-sale">
            <SalesForm onSaleCreated={handleSaleCreated} />
          </TabsContent>
          
          <TabsContent value="history">
            <SalesHistory refreshTrigger={refreshTrigger} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Sale;

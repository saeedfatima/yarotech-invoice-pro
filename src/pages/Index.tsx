import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SalesForm } from "@/components/SalesForm";
import { SalesHistory } from "@/components/SalesHistory";
import { FileText, History } from "lucide-react";

const Index = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleSaleCreated = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <header className="mb-8 text-center">
            <h1 className="text-4xl font-bold mb-2">YAROTECH Invoice Pro</h1>
            <p className="text-muted-foreground">Transaction Processing System</p>
          </header>

          <Tabs defaultValue="new-sale" className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
              <TabsTrigger value="new-sale" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                New Sale
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center gap-2">
                <History className="h-4 w-4" />
                Sales History
              </TabsTrigger>
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
    </div>
  );
};

export default Index;

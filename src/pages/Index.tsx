import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { SalesForm } from "@/components/SalesForm";
import { SalesHistory } from "@/components/SalesHistory";
import { FileText, History, LogOut } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const Index = () => {
  const navigate = useNavigate();
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleSaleCreated = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast({
          title: "Error signing out",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({ title: "Signed out successfully" });
        navigate("/auth");
      }
    } catch (error) {
      console.error("Sign out error:", error);
      toast({
        title: "Error signing out",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <header className="mb-8">
            <div className="flex items-center justify-between">
              <div className="text-center flex-1">
                <h1 className="text-4xl font-bold mb-2">YAROTECH Invoice Pro</h1>
                <p className="text-muted-foreground">Transaction Processing System</p>
              </div>
              <Button
                onClick={handleSignOut}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </div>
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

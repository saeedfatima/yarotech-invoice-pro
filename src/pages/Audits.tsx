import { TransactionView } from "@/components/admin/TransactionView";

const Audits = () => {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-foreground">Audits</h1>
        <TransactionView />
      </div>
    </div>
  );
};

export default Audits;

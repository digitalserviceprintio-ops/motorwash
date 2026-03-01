import { useState } from "react";
import { motion } from "framer-motion";
import { Receipt, CheckCircle2, Clock, CreditCard, Printer } from "lucide-react";
import { mockTransactions } from "@/data/mockData";
import { Badge } from "@/components/ui/badge";
import ReceiptDialog from "@/components/ReceiptDialog";

const TransactionsPage = () => {
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [selectedTx, setSelectedTx] = useState<any>(null);

  const filtered =
    filterStatus === "all"
      ? mockTransactions
      : mockTransactions.filter((t) => t.status === filterStatus);

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(val);

  const totalPaid = mockTransactions.filter(t => t.status === "paid").reduce((a, b) => a + b.amount, 0);

  const handlePrint = (tx: typeof mockTransactions[0]) => {
    setSelectedTx({
      id: tx.id,
      customer: tx.customer,
      service: tx.service,
      amount: tx.amount,
      method: tx.method,
      date: tx.date,
    });
    setReceiptOpen(true);
  };

  return (
    <div className="page-container">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="flex items-center gap-2 mb-2">
          <Receipt className="w-5 h-5 text-primary" />
          <h1 className="text-xl font-bold text-foreground">Transaksi</h1>
        </div>

        {/* Summary */}
        <div className="bg-card rounded-2xl p-4 border border-border/50 shadow-sm mb-4">
          <p className="text-xs text-muted-foreground mb-1">Total Pendapatan Hari Ini</p>
          <p className="text-2xl font-bold text-foreground">{formatCurrency(totalPaid)}</p>
          <p className="text-xs text-success font-medium mt-1">
            {mockTransactions.filter(t => t.status === "paid").length} transaksi lunas
          </p>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-4">
          {[
            { key: "all", label: "Semua" },
            { key: "paid", label: "Lunas" },
            { key: "unpaid", label: "Belum Lunas" },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFilterStatus(f.key)}
              className={`text-xs font-medium px-4 py-2 rounded-full transition-colors ${
                filterStatus === f.key
                  ? "bg-primary text-primary-foreground"
                  : "bg-card text-muted-foreground border border-border/50"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Transaction List */}
        <div className="space-y-3">
          {filtered.map((tx, i) => (
            <motion.div
              key={tx.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-card rounded-2xl p-4 border border-border/50 shadow-sm"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-sm font-semibold text-foreground">{tx.customer}</p>
                  <p className="text-xs text-muted-foreground">{tx.service}</p>
                </div>
                <p className="text-sm font-bold text-foreground">{formatCurrency(tx.amount)}</p>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-3 h-3 text-muted-foreground" />
                  <span className="text-[11px] text-muted-foreground">{tx.method}</span>
                </div>
                <div className="flex items-center gap-2">
                  {tx.status === "paid" && (
                    <button
                      onClick={() => handlePrint(tx)}
                      className="p-1.5 rounded-lg bg-primary/10 text-primary"
                    >
                      <Printer className="w-3 h-3" />
                    </button>
                  )}
                  <Badge
                    variant="outline"
                    className={`text-[10px] font-semibold border ${
                      tx.status === "paid"
                        ? "bg-success/15 text-success border-success/30"
                        : "bg-warning/15 text-warning border-warning/30"
                    }`}
                  >
                    {tx.status === "paid" ? (
                      <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Lunas</span>
                    ) : (
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Belum Lunas</span>
                    )}
                  </Badge>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <ReceiptDialog open={receiptOpen} onOpenChange={setReceiptOpen} data={selectedTx} />
    </div>
  );
};

export default TransactionsPage;

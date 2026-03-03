import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Receipt, CheckCircle2, Clock, CreditCard, Printer } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import ReceiptDialog from "@/components/ReceiptDialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const db = supabase as any;

const TransactionsPage = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [selectedTx, setSelectedTx] = useState<any>(null);
  const [businessSettings, setBusinessSettings] = useState<any>(null);

  useEffect(() => {
    if (user) {
      loadTransactions();
      loadBusinessSettings();
    }
  }, [user]);

  const loadTransactions = async () => {
    if (!user) return;
    const { data } = await db.from("transactions").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
    if (data) setTransactions(data);
  };

  const loadBusinessSettings = async () => {
    if (!user) return;
    const { data } = await db.from("business_settings").select("*").eq("user_id", user.id).maybeSingle();
    if (data) setBusinessSettings(data);
  };

  const filtered =
    filterStatus === "all"
      ? transactions
      : transactions.filter((t: any) => t.status === filterStatus);

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(val);

  const totalPaid = transactions.filter((t: any) => t.status === "paid").reduce((a: number, b: any) => a + b.amount, 0);

  const handlePrint = (tx: any) => {
    setSelectedTx({
      id: tx.id,
      customer: tx.customer,
      service: tx.service,
      amount: tx.amount,
      method: tx.method,
      date: tx.date,
      businessName: businessSettings?.business_name || "CuciKu Motor Wash",
      address: businessSettings?.address || "Jl. Merdeka No. 123, Jakarta",
      phone: businessSettings?.phone || "0812-3456-7890",
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

        <div className="bg-card rounded-2xl p-4 border border-border/50 shadow-sm mb-4">
          <p className="text-xs text-muted-foreground mb-1">Total Pendapatan Hari Ini</p>
          <p className="text-2xl font-bold text-foreground">{formatCurrency(totalPaid)}</p>
          <p className="text-xs text-success font-medium mt-1">
            {transactions.filter((t: any) => t.status === "paid").length} transaksi lunas
          </p>
        </div>

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

        <div className="space-y-3">
          {filtered.map((tx: any, i: number) => (
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
          {filtered.length === 0 && (
            <div className="text-center py-12 text-muted-foreground text-sm">Tidak ada transaksi</div>
          )}
        </div>
      </motion.div>

      <ReceiptDialog open={receiptOpen} onOpenChange={setReceiptOpen} data={selectedTx} />
    </div>
  );
};

export default TransactionsPage;

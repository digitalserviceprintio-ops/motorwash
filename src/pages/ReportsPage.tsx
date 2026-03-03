import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BarChart3, TrendingUp, ArrowUpRight, FileDown, FileSpreadsheet } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, PieChart, Pie, Cell } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const db = supabase as any;

const COLORS = ["hsl(217 91% 60%)", "hsl(187 72% 48%)", "hsl(142 71% 45%)", "hsl(38 92% 50%)", "hsl(0 84% 60%)"];

const ReportsPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) loadData();
  }, [user]);

  const loadData = async () => {
    const [txRes, svcRes] = await Promise.all([
      db.from("transactions").select("*").eq("user_id", user!.id),
      db.from("services").select("*").eq("user_id", user!.id),
    ]);
    setTransactions(txRes.data || []);
    setServices(svcRes.data || []);
    setLoading(false);
  };

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(val);

  const paidTx = transactions.filter((t) => t.status === "paid");
  const totalRevenue = paidTx.reduce((a: number, b: any) => a + b.amount, 0);

  // Group by date for daily chart
  const dailyMap: Record<string, number> = {};
  paidTx.forEach((t: any) => {
    const day = t.date || t.created_at?.split("T")[0];
    if (day) dailyMap[day] = (dailyMap[day] || 0) + t.amount;
  });
  const dailyRevenue = Object.entries(dailyMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-7)
    .map(([day, revenue]) => ({
      day: new Date(day).toLocaleDateString("id-ID", { weekday: "short" }),
      revenue,
    }));

  // Revenue per service
  const serviceRevenue = services
    .map((s: any) => {
      const total = paidTx.filter((t: any) => t.service === s.name).reduce((a: number, b: any) => a + b.amount, 0);
      return { name: s.name, value: total };
    })
    .filter((s) => s.value > 0);

  const handleExportPDF = async () => {
    const { default: jsPDF } = await import("jspdf");
    await import("jspdf-autotable");
    const doc = new jsPDF() as any;

    doc.setFontSize(18);
    doc.text("Laporan Keuangan CuciKu", 14, 22);
    doc.setFontSize(10);
    doc.text(`Dicetak: ${new Date().toLocaleDateString("id-ID")}`, 14, 30);
    doc.text(`Total Pendapatan: ${formatCurrency(totalRevenue)}`, 14, 36);

    const tableData = paidTx.map((t: any, i: number) => [
      i + 1,
      t.customer,
      t.service,
      formatCurrency(t.amount),
      t.method || "-",
      t.date || "-",
    ]);

    doc.autoTable({
      startY: 42,
      head: [["#", "Pelanggan", "Layanan", "Jumlah", "Metode", "Tanggal"]],
      body: tableData,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [59, 130, 246] },
    });

    doc.save("laporan-cuciku.pdf");
    toast({ title: "PDF berhasil diunduh" });
  };

  const handleExportExcel = async () => {
    const XLSX = await import("xlsx");
    const wsData = [
      ["#", "Pelanggan", "Layanan", "Jumlah", "Metode", "Tanggal", "Status"],
      ...transactions.map((t: any, i: number) => [
        i + 1,
        t.customer,
        t.service,
        t.amount,
        t.method || "-",
        t.date || "-",
        t.status,
      ]),
    ];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Transaksi");

    // Service summary sheet
    const svcData = [
      ["Layanan", "Total Pendapatan", "Jumlah Transaksi"],
      ...services.map((s: any) => {
        const stx = paidTx.filter((t: any) => t.service === s.name);
        return [s.name, stx.reduce((a: number, b: any) => a + b.amount, 0), stx.length];
      }),
    ];
    const ws2 = XLSX.utils.aoa_to_sheet(svcData);
    XLSX.utils.book_append_sheet(wb, ws2, "Per Layanan");

    XLSX.writeFile(wb, "laporan-cuciku.xlsx");
    toast({ title: "Excel berhasil diunduh" });
  };

  if (loading) {
    return <div className="page-container flex items-center justify-center min-h-[50vh] text-muted-foreground">Memuat...</div>;
  }

  return (
    <div className="page-container">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            <h1 className="text-xl font-bold text-foreground">Laporan</h1>
          </div>
          <div className="flex gap-2">
            <button onClick={handleExportPDF} className="flex items-center gap-1 bg-destructive/10 text-destructive text-[11px] font-semibold px-3 py-1.5 rounded-lg">
              <FileDown className="w-3.5 h-3.5" /> PDF
            </button>
            <button onClick={handleExportExcel} className="flex items-center gap-1 bg-success/10 text-success text-[11px] font-semibold px-3 py-1.5 rounded-lg">
              <FileSpreadsheet className="w-3.5 h-3.5" /> Excel
            </button>
          </div>
        </div>

        {/* Weekly Summary */}
        <div className="bg-card rounded-2xl p-4 border border-border/50 shadow-sm mb-4">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs text-muted-foreground">Total Pendapatan</p>
            <span className="flex items-center gap-0.5 text-xs text-success font-medium">
              <ArrowUpRight className="w-3 h-3" /> {paidTx.length} transaksi
            </span>
          </div>
          <p className="text-2xl font-bold text-foreground">{formatCurrency(totalRevenue)}</p>
        </div>

        {/* Bar Chart */}
        <div className="bg-card rounded-2xl p-4 border border-border/50 shadow-sm mb-4">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-bold text-foreground">Pendapatan Harian</h2>
          </div>
          {dailyRevenue.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={dailyRevenue}>
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "hsl(215 16% 47%)" }} />
                <YAxis hide />
                <Tooltip formatter={(value: number) => [formatCurrency(value), "Pendapatan"]}
                  contentStyle={{ borderRadius: 12, border: "1px solid hsl(214 32% 91%)", fontSize: 12 }} />
                <Bar dataKey="revenue" fill="hsl(217 91% 60%)" radius={[6, 6, 0, 0]} barSize={28} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-sm text-muted-foreground py-8">Belum ada data transaksi</p>
          )}
        </div>

        {/* Pie Chart - Revenue per Service */}
        <div className="bg-card rounded-2xl p-4 border border-border/50 shadow-sm">
          <h2 className="text-sm font-bold text-foreground mb-4">Pendapatan per Paket</h2>
          {serviceRevenue.length > 0 ? (
            <div className="flex items-center">
              <ResponsiveContainer width="50%" height={160}>
                <PieChart>
                  <Pie data={serviceRevenue} dataKey="value" cx="50%" cy="50%" outerRadius={60} innerRadius={35}>
                    {serviceRevenue.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2">
                {serviceRevenue.map((s, i) => (
                  <div key={s.name} className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-medium text-foreground truncate">{s.name}</p>
                      <p className="text-[10px] text-muted-foreground">{formatCurrency(s.value)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-center text-sm text-muted-foreground py-8">Belum ada data</p>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ReportsPage;

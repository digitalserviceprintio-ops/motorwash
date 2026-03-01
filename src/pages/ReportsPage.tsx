import { motion } from "framer-motion";
import { BarChart3, TrendingUp, ArrowUpRight } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, PieChart, Pie, Cell } from "recharts";
import { weeklyRevenue, mockTransactions, mockServices } from "@/data/mockData";

const COLORS = ["hsl(217 91% 60%)", "hsl(187 72% 48%)", "hsl(142 71% 45%)", "hsl(38 92% 50%)", "hsl(0 84% 60%)"];

const ReportsPage = () => {
  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(val);

  const totalWeekly = weeklyRevenue.reduce((a, b) => a + b.revenue, 0);

  // Revenue per service
  const serviceRevenue = mockServices.map((s) => {
    const total = mockTransactions
      .filter((t) => t.service === s.name && t.status === "paid")
      .reduce((a, b) => a + b.amount, 0);
    return { name: s.name, value: total };
  }).filter((s) => s.value > 0);

  return (
    <div className="page-container">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="flex items-center gap-2 mb-6">
          <BarChart3 className="w-5 h-5 text-primary" />
          <h1 className="text-xl font-bold text-foreground">Laporan</h1>
        </div>

        {/* Weekly Summary */}
        <div className="bg-card rounded-2xl p-4 border border-border/50 shadow-sm mb-4">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs text-muted-foreground">Total Mingguan</p>
            <span className="flex items-center gap-0.5 text-xs text-success font-medium">
              <ArrowUpRight className="w-3 h-3" /> +12%
            </span>
          </div>
          <p className="text-2xl font-bold text-foreground">{formatCurrency(totalWeekly)}</p>
        </div>

        {/* Bar Chart */}
        <div className="bg-card rounded-2xl p-4 border border-border/50 shadow-sm mb-4">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-bold text-foreground">Pendapatan Harian</h2>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={weeklyRevenue}>
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "hsl(215 16% 47%)" }} />
              <YAxis hide />
              <Tooltip formatter={(value: number) => [formatCurrency(value), "Pendapatan"]}
                contentStyle={{ borderRadius: 12, border: "1px solid hsl(214 32% 91%)", fontSize: 12 }} />
              <Bar dataKey="revenue" fill="hsl(217 91% 60%)" radius={[6, 6, 0, 0]} barSize={28} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart - Revenue per Service */}
        <div className="bg-card rounded-2xl p-4 border border-border/50 shadow-sm">
          <h2 className="text-sm font-bold text-foreground mb-4">Pendapatan per Paket</h2>
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
        </div>
      </motion.div>
    </div>
  );
};

export default ReportsPage;

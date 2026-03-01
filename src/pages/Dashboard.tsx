import { motion } from "framer-motion";
import { Receipt, Wallet, ListOrdered, CheckCircle2, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import StatCard from "@/components/StatCard";
import { weeklyRevenue } from "@/data/mockData";

const Dashboard = () => {
  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(val);

  return (
    <div className="page-container">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-6"
      >
        <div>
          <p className="text-sm text-muted-foreground">Selamat datang 👋</p>
          <h1 className="text-xl font-bold text-foreground">Admin CuciKu</h1>
        </div>
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <span className="text-primary font-bold text-sm">A</span>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <StatCard
          icon={Receipt}
          label="Transaksi Hari Ini"
          value="12"
          subtitle="+3 dari kemarin"
          variant="gradient"
        />
        <StatCard
          icon={Wallet}
          label="Pendapatan"
          value="Rp 850rb"
          subtitle="Hari ini"
        />
        <StatCard
          icon={ListOrdered}
          label="Antrian Aktif"
          value="3"
          subtitle="2 menunggu"
        />
        <StatCard
          icon={CheckCircle2}
          label="Motor Selesai"
          value="9"
          subtitle="Hari ini"
        />
      </div>

      {/* Revenue Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-card rounded-2xl p-4 border border-border/50 shadow-sm"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            <h2 className="section-title text-sm">Pendapatan Mingguan</h2>
          </div>
          <span className="text-xs text-muted-foreground">Minggu ini</span>
        </div>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={weeklyRevenue}>
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "hsl(215 16% 47%)" }}
            />
            <YAxis hide />
            <Tooltip
              formatter={(value: number) => [formatCurrency(value), "Pendapatan"]}
              contentStyle={{
                borderRadius: 12,
                border: "1px solid hsl(214 32% 91%)",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                fontSize: 12,
              }}
            />
            <Bar
              dataKey="revenue"
              fill="hsl(217 91% 60%)"
              radius={[6, 6, 0, 0]}
              barSize={28}
            />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-6"
      >
        <h2 className="section-title text-sm mb-3">Antrian Terbaru</h2>
        <div className="space-y-2">
          {[
            { name: "Budi Santoso", service: "Cuci + Wax", status: "Diproses" },
            { name: "Andi Pratama", service: "Cuci Biasa", status: "Menunggu" },
            { name: "Sari Dewi", service: "Paket Premium", status: "Menunggu" },
          ].map((q, i) => (
            <div key={i} className="flex items-center justify-between bg-card rounded-xl p-3 border border-border/50">
              <div>
                <p className="text-sm font-semibold text-foreground">{q.name}</p>
                <p className="text-xs text-muted-foreground">{q.service}</p>
              </div>
              <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${
                q.status === "Diproses"
                  ? "bg-info/15 text-info"
                  : "bg-warning/15 text-warning"
              }`}>
                {q.status}
              </span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Receipt, Wallet, ListOrdered, CheckCircle2, TrendingUp, ChevronLeft, ChevronRight, Plus, ShoppingCart, Droplets } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import StatCard from "@/components/StatCard";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { ensureBusinessSettings } from "@/lib/supabase-helpers";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const db = supabase as any;

const promoSlides = [
  { title: "Diskon 20% Cuci Premium!", desc: "Berlaku hingga akhir bulan", bg: "from-primary to-accent" },
  { title: "Gratis Wax untuk 10 Pelanggan", desc: "Setiap hari Sabtu", bg: "from-accent to-success" },
  { title: "Paket Hemat Cuci Motor", desc: "Mulai dari Rp 20.000", bg: "from-warning to-destructive" },
];

const Dashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [businessName, setBusinessName] = useState("CuciKu Motor Wash");
  const [stats, setStats] = useState({ txCount: 0, revenue: 0, activeQueue: 0, doneToday: 0, waitingQueue: 0 });
  const [recentQueue, setRecentQueue] = useState<any[]>([]);
  const [weeklyRevenue, setWeeklyRevenue] = useState<any[]>([]);
  const [quickTxOpen, setQuickTxOpen] = useState(false);
  const [services, setServices] = useState<any[]>([]);
  const [qtxCustomer, setQtxCustomer] = useState("");
  const [qtxService, setQtxService] = useState("");
  const [qtxMethod, setQtxMethod] = useState("Cash");

  useEffect(() => {
    const timer = setInterval(() => setCurrentSlide((prev) => (prev + 1) % promoSlides.length), 4000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (user) {
      loadDashboardData();
      loadServices();
      loadBusinessName();
    }
  }, [user]);

  const loadBusinessName = async () => {
    if (!user) return;
    const data = await ensureBusinessSettings(user.id);
    if (data?.business_name) setBusinessName(data.business_name);
  };

  const loadServices = async () => {
    if (!user) return;
    const { data } = await db.from("services").select("*").eq("user_id", user.id).eq("active", true);
    if (data) setServices(data);
  };

  const loadDashboardData = async () => {
    if (!user) return;
    const today = new Date().toISOString().split("T")[0];

    const [txRes, queueRes, queueAllRes] = await Promise.all([
      db.from("transactions").select("*").eq("user_id", user.id).eq("date", today),
      db.from("queues").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(3),
      db.from("queues").select("*").eq("user_id", user.id),
    ]);

    const txData = txRes.data || [];
    const paidTx = txData.filter((t: any) => t.status === "paid");
    const queueData = queueAllRes.data || [];
    const todayQueues = queueData.filter((q: any) => q.created_at?.startsWith(today));

    setStats({
      txCount: txData.length,
      revenue: paidTx.reduce((a: number, b: any) => a + b.amount, 0),
      activeQueue: todayQueues.filter((q: any) => q.status === "waiting" || q.status === "processing").length,
      waitingQueue: todayQueues.filter((q: any) => q.status === "waiting").length,
      doneToday: todayQueues.filter((q: any) => q.status === "done").length,
    });

    setRecentQueue((queueRes.data || []).map((q: any) => ({
      name: q.name,
      service: q.service,
      status: q.status === "processing" ? "Diproses" : q.status === "waiting" ? "Menunggu" : "Selesai",
    })));

    // Weekly revenue
    const days = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    const weekData = days.map((day, i) => {
      const d = new Date(weekStart);
      d.setDate(weekStart.getDate() + i);
      const dateStr = d.toISOString().split("T")[0];
      const dayRevenue = txData
        .filter((t: any) => t.status === "paid" && t.date === dateStr)
        .reduce((a: number, b: any) => a + b.amount, 0);
      return { day, revenue: dayRevenue };
    });
    setWeeklyRevenue(weekData);
  };

  const handleQuickTx = async () => {
    if (!qtxCustomer || !qtxService || !user) return;
    const service = services.find((s: any) => s.id === qtxService);
    if (!service) return;
    const { error } = await db.from("transactions").insert({
      user_id: user.id,
      customer: qtxCustomer,
      service: service.name,
      amount: service.price,
      method: qtxMethod,
      status: "paid",
    });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Transaksi berhasil!", description: `${qtxCustomer} - ${service.name}` });
    setQtxCustomer(""); setQtxService(""); setQtxMethod("Cash");
    setQuickTxOpen(false);
    loadDashboardData();
  };

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(val);

  const formatShortCurrency = (val: number) => {
    if (val >= 1000000) return `Rp ${(val / 1000000).toFixed(1)}jt`;
    if (val >= 1000) return `Rp ${Math.round(val / 1000)}rb`;
    return `Rp ${val}`;
  };

  return (
    <div className="page-container">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6">
        <div>
          <p className="text-sm text-muted-foreground">Selamat datang 👋</p>
          <h1 className="text-xl font-bold text-foreground">{businessName}</h1>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => navigate("/pembelian")} className="flex items-center gap-1.5 bg-card text-foreground text-xs font-semibold px-3 py-2 rounded-xl border border-border/50">
            <ShoppingCart className="w-4 h-4" />
          </button>
          <button onClick={() => setQuickTxOpen(true)} className="flex items-center gap-1.5 bg-primary text-primary-foreground text-xs font-semibold px-3 py-2 rounded-xl">
            <Plus className="w-4 h-4" /> Transaksi
          </button>
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-primary font-bold text-sm">{user?.email?.[0]?.toUpperCase() || "A"}</span>
          </div>
        </div>
      </motion.div>

      {/* Carousel */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="relative mb-6 overflow-hidden rounded-2xl">
        <div className="flex transition-transform duration-500 ease-out" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
          {promoSlides.map((slide, i) => (
            <div key={i} className={`min-w-full bg-gradient-to-r ${slide.bg} rounded-2xl p-5 text-primary-foreground`}>
              <h3 className="font-bold text-lg">{slide.title}</h3>
              <p className="text-sm opacity-80 mt-1">{slide.desc}</p>
            </div>
          ))}
        </div>
        <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
          {promoSlides.map((_, i) => (
            <button key={i} onClick={() => setCurrentSlide(i)} className={`w-2 h-2 rounded-full transition-colors ${i === currentSlide ? "bg-primary-foreground" : "bg-primary-foreground/40"}`} />
          ))}
        </div>
        <button onClick={() => setCurrentSlide((prev) => (prev - 1 + promoSlides.length) % promoSlides.length)} className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-primary-foreground/20 flex items-center justify-center">
          <ChevronLeft className="w-4 h-4 text-primary-foreground" />
        </button>
        <button onClick={() => setCurrentSlide((prev) => (prev + 1) % promoSlides.length)} className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-primary-foreground/20 flex items-center justify-center">
          <ChevronRight className="w-4 h-4 text-primary-foreground" />
        </button>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <StatCard icon={Receipt} label="Transaksi Hari Ini" value={String(stats.txCount)} subtitle={`${stats.txCount} transaksi`} variant="gradient" />
        <StatCard icon={Wallet} label="Pendapatan" value={formatShortCurrency(stats.revenue)} subtitle="Hari ini" />
        <StatCard icon={ListOrdered} label="Antrian Aktif" value={String(stats.activeQueue)} subtitle={`${stats.waitingQueue} menunggu`} />
        <StatCard icon={CheckCircle2} label="Motor Selesai" value={String(stats.doneToday)} subtitle="Hari ini" />
      </div>

      {/* Services */}
      {services.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="section-title text-sm flex items-center gap-2"><Droplets className="w-4 h-4 text-primary" />Paket Layanan</h2>
            <button onClick={() => navigate("/layanan")} className="text-xs text-primary font-medium">Kelola</button>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
            {services.slice(0, 5).map((s: any) => (
              <div key={s.id} className="min-w-[120px] bg-card rounded-xl p-3 border border-border/50 text-center shrink-0">
                <p className="text-xs font-semibold text-foreground truncate">{s.name}</p>
                <p className="text-sm font-bold text-primary mt-1">Rp {s.price.toLocaleString("id-ID")}</p>
                <p className="text-[10px] text-muted-foreground">{s.duration}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Recent Queue */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="mb-6">
        <h2 className="section-title text-sm mb-3">Antrian Terbaru</h2>
        <div className="space-y-2">
          {recentQueue.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">Belum ada antrian</p>}
          {recentQueue.map((q: any, i: number) => (
            <div key={i} className="flex items-center justify-between bg-card rounded-xl p-3 border border-border/50">
              <div>
                <p className="text-sm font-semibold text-foreground">{q.name}</p>
                <p className="text-xs text-muted-foreground">{q.service}</p>
              </div>
              <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${
                q.status === "Diproses" ? "bg-info/15 text-info" : q.status === "Menunggu" ? "bg-warning/15 text-warning" : "bg-success/15 text-success"
              }`}>
                {q.status}
              </span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Revenue Chart */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-card rounded-2xl p-4 border border-border/50 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            <h2 className="section-title text-sm">Pendapatan Mingguan</h2>
          </div>
          <span className="text-xs text-muted-foreground">Minggu ini</span>
        </div>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={weeklyRevenue}>
            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "hsl(215 16% 47%)" }} />
            <YAxis hide />
            <Tooltip formatter={(value: number) => [formatCurrency(value), "Pendapatan"]} contentStyle={{ borderRadius: 12, border: "1px solid hsl(214 32% 91%)", boxShadow: "0 4px 12px rgba(0,0,0,0.08)", fontSize: 12 }} />
            <Bar dataKey="revenue" fill="hsl(217 91% 60%)" radius={[6, 6, 0, 0]} barSize={28} />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Quick Transaction Dialog */}
      <Dialog open={quickTxOpen} onOpenChange={setQuickTxOpen}>
        <DialogContent className="max-w-sm mx-4">
          <DialogHeader>
            <DialogTitle>Transaksi Cepat</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            <div>
              <Label className="text-xs">Nama Pelanggan</Label>
              <Input placeholder="Masukkan nama" value={qtxCustomer} onChange={(e) => setQtxCustomer(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">Paket Layanan</Label>
              <Select value={qtxService} onValueChange={setQtxService}>
                <SelectTrigger><SelectValue placeholder="Pilih paket" /></SelectTrigger>
                <SelectContent>
                  {services.map((s: any) => (
                    <SelectItem key={s.id} value={s.id}>{s.name} - Rp {s.price.toLocaleString("id-ID")}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Metode Pembayaran</Label>
              <Select value={qtxMethod} onValueChange={setQtxMethod}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["Cash", "Transfer", "QRIS", "E-wallet"].map((m) => (
                    <SelectItem key={m} value={m}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <button onClick={handleQuickTx} className="w-full bg-primary text-primary-foreground font-semibold py-2.5 rounded-xl text-sm">
              Simpan Transaksi
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;

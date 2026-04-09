import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ListOrdered, Plus } from "lucide-react";
import QueueCard, { QueueItem } from "@/components/QueueCard";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const db = supabase as any;

const QueuePage = () => {
  const { user } = useAuth();
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newPlate, setNewPlate] = useState("");
  const [newService, setNewService] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      loadQueue();
      loadServices();
    }
  }, [user]);

  const loadQueue = async () => {
    if (!user) return;
    const { data } = await db.from("queues").select("*").eq("user_id", user.id).order("created_at", { ascending: true });
    if (data) {
      // Group by date and assign queue numbers
      const dateCounters: Record<string, number> = {};
      const mapped = data.map((q: any) => {
        const dateKey = q.created_at?.split("T")[0] || "";
        dateCounters[dateKey] = (dateCounters[dateKey] || 0) + 1;
        const queueNum = `A${String(dateCounters[dateKey]).padStart(3, "0")}`;
        return {
          id: q.id,
          queueNumber: queueNum,
          name: q.name,
          phone: q.phone || "",
          plate: q.plate || "",
          service: q.service,
          status: q.status as QueueItem["status"],
          estimatedTime: q.estimated_time || "20 menit",
          createdAt: new Date(q.created_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
        };
      });
      // Reverse to show newest first
      setQueue(mapped.reverse());
    }
  };

  const loadServices = async () => {
    if (!user) return;
    const { data } = await db.from("services").select("*").eq("user_id", user.id).eq("active", true);
    if (data) setServices(data);
  };

  const handleStatusChange = async (id: string, status: QueueItem["status"]) => {
    await db.from("queues").update({ status }).eq("id", id);
    setQueue((prev) => prev.map((item) => (item.id === id ? { ...item, status } : item)));
    toast({
      title: "Status diperbarui",
      description: `Status antrian berhasil diubah ke ${status === "processing" ? "Diproses" : "Selesai"}`,
    });
  };

  const handleAddQueue = async () => {
    if (!newName || !newPhone || !newPlate || !newService || !user) return;
    const service = services.find((s: any) => s.id === newService);
    const { data, error } = await db.from("queues").insert({
      user_id: user.id,
      name: newName,
      phone: newPhone,
      plate: newPlate,
      service: service?.name || "",
      status: "waiting",
      estimated_time: service?.duration || "20 menit",
    }).select().single();
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    if (data) {
      const newItem: QueueItem = {
        id: data.id,
        name: data.name,
        phone: data.phone || "",
        plate: data.plate || "",
        service: data.service,
        status: data.status as QueueItem["status"],
        estimatedTime: data.estimated_time || "20 menit",
        createdAt: new Date(data.created_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
      };
      setQueue((prev) => [newItem, ...prev]);
    }
    setNewName(""); setNewPhone(""); setNewPlate(""); setNewService("");
    setDialogOpen(false);
    toast({ title: "Antrian ditambahkan", description: `${newName} berhasil masuk antrian` });
  };

  const filtered = filter === "all" ? queue : queue.filter((q) => q.status === filter);

  return (
    <div className="page-container">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ListOrdered className="w-5 h-5 text-primary" />
          <h1 className="text-xl font-bold text-foreground">Antrian</h1>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <button className="flex items-center gap-1.5 bg-primary text-primary-foreground text-xs font-semibold px-4 py-2 rounded-xl">
              <Plus className="w-4 h-4" /> Tambah
            </button>
          </DialogTrigger>
          <DialogContent className="max-w-sm mx-4">
            <DialogHeader>
              <DialogTitle>Tambah Antrian Baru</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 mt-2">
              <div>
                <Label className="text-xs">Nama Pelanggan</Label>
                <Input placeholder="Masukkan nama" value={newName} onChange={(e) => setNewName(e.target.value)} />
              </div>
              <div>
                <Label className="text-xs">No. HP</Label>
                <Input placeholder="08xx-xxxx-xxxx" value={newPhone} onChange={(e) => setNewPhone(e.target.value)} />
              </div>
              <div>
                <Label className="text-xs">Plat Motor</Label>
                <Input placeholder="B 1234 ABC" value={newPlate} onChange={(e) => setNewPlate(e.target.value)} />
              </div>
              <div>
                <Label className="text-xs">Paket Layanan</Label>
                <Select value={newService} onValueChange={setNewService}>
                  <SelectTrigger><SelectValue placeholder="Pilih paket" /></SelectTrigger>
                  <SelectContent>
                    {services.map((s: any) => (
                      <SelectItem key={s.id} value={s.id}>{s.name} - Rp {s.price.toLocaleString("id-ID")}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <button
                onClick={handleAddQueue}
                className="w-full bg-primary text-primary-foreground font-semibold py-2.5 rounded-xl text-sm"
              >
                Tambah ke Antrian
              </button>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>

      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {[
          { key: "all", label: "Semua" },
          { key: "waiting", label: "Menunggu" },
          { key: "processing", label: "Diproses" },
          { key: "done", label: "Selesai" },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`text-xs font-medium px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
              filter === f.key
                ? "bg-primary text-primary-foreground"
                : "bg-card text-muted-foreground border border-border/50"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map((item, i) => (
          <QueueCard key={item.id} item={item} onStatusChange={handleStatusChange} index={i} />
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground text-sm">
            Tidak ada antrian
          </div>
        )}
      </div>
    </div>
  );
};

export default QueuePage;

import { useState } from "react";
import { motion } from "framer-motion";
import { ListOrdered, Plus } from "lucide-react";
import QueueCard, { QueueItem } from "@/components/QueueCard";
import { mockQueue } from "@/data/mockData";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { mockServices } from "@/data/mockData";
import { useToast } from "@/hooks/use-toast";

const QueuePage = () => {
  const [queue, setQueue] = useState<QueueItem[]>(mockQueue);
  const [filter, setFilter] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newPlate, setNewPlate] = useState("");
  const [newService, setNewService] = useState("");
  const { toast } = useToast();

  const handleStatusChange = (id: string, status: QueueItem["status"]) => {
    setQueue((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status } : item))
    );
    toast({
      title: "Status diperbarui",
      description: `Status antrian berhasil diubah ke ${status === "processing" ? "Diproses" : "Selesai"}`,
    });
  };

  const handleAddQueue = () => {
    if (!newName || !newPhone || !newPlate || !newService) return;
    const service = mockServices.find(s => s.id === newService);
    const newItem: QueueItem = {
      id: Date.now().toString(),
      name: newName,
      phone: newPhone,
      plate: newPlate,
      service: service?.name || "",
      status: "waiting",
      estimatedTime: service?.duration || "20 menit",
      createdAt: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
    };
    setQueue(prev => [newItem, ...prev]);
    setNewName(""); setNewPhone(""); setNewPlate(""); setNewService("");
    setDialogOpen(false);
    toast({ title: "Antrian ditambahkan", description: `${newItem.name} berhasil masuk antrian` });
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
                    {mockServices.filter(s => s.active).map(s => (
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

      {/* Filter Tabs */}
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

      {/* Queue List */}
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

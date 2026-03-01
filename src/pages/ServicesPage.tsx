import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Droplets, Plus, Pencil, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

interface Service {
  id: string;
  name: string;
  price: number;
  duration: string;
  active: boolean;
}

const db = supabase as any;

const ServicesPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [services, setServices] = useState<Service[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [duration, setDuration] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchServices = async () => {
    if (!user) return;
    const { data } = await db.from("services").select("*").eq("user_id", user.id).order("created_at");
    setServices(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchServices(); }, [user]);

  const handleSave = async () => {
    if (!user || !name || !price) return;
    const payload = { name, price: parseInt(price), duration: duration || "20 menit", user_id: user.id };
    
    if (editing) {
      await db.from("services").update(payload).eq("id", editing.id);
      toast({ title: "Paket diperbarui" });
    } else {
      await db.from("services").insert(payload);
      toast({ title: "Paket ditambahkan" });
    }
    resetForm();
    fetchServices();
  };

  const handleDelete = async (id: string) => {
    await db.from("services").delete().eq("id", id);
    toast({ title: "Paket dihapus" });
    fetchServices();
  };

  const handleToggle = async (id: string, active: boolean) => {
    await db.from("services").update({ active: !active }).eq("id", id);
    fetchServices();
  };

  const openEdit = (s: Service) => {
    setEditing(s);
    setName(s.name);
    setPrice(s.price.toString());
    setDuration(s.duration);
    setDialogOpen(true);
  };

  const resetForm = () => {
    setEditing(null);
    setName("");
    setPrice("");
    setDuration("");
    setDialogOpen(false);
  };

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(val);

  return (
    <div className="page-container">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Droplets className="w-5 h-5 text-primary" />
            <h1 className="text-xl font-bold text-foreground">Paket Layanan</h1>
          </div>
          <button
            onClick={() => { resetForm(); setDialogOpen(true); }}
            className="flex items-center gap-1.5 bg-primary text-primary-foreground text-xs font-semibold px-4 py-2 rounded-xl"
          >
            <Plus className="w-4 h-4" /> Tambah
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12 text-muted-foreground text-sm">Memuat...</div>
        ) : services.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-sm">Belum ada paket layanan. Tambahkan paket pertama Anda!</div>
        ) : (
          <div className="space-y-3">
            {services.map((s, i) => (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`bg-card rounded-2xl p-4 border border-border/50 shadow-sm ${!s.active ? "opacity-60" : ""}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{s.name}</p>
                    <p className="text-xs text-muted-foreground">{s.duration}</p>
                  </div>
                  <p className="text-sm font-bold text-primary">{formatCurrency(s.price)}</p>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-border/30">
                  <div className="flex items-center gap-2">
                    <Switch checked={s.active} onCheckedChange={() => handleToggle(s.id, s.active)} />
                    <span className="text-[11px] text-muted-foreground">{s.active ? "Aktif" : "Nonaktif"}</span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(s)} className="p-2 rounded-lg bg-primary/10 text-primary">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleDelete(s.id)} className="p-2 rounded-lg bg-destructive/10 text-destructive">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-sm mx-4">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Paket" : "Tambah Paket Baru"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            <div>
              <Label className="text-xs">Nama Paket</Label>
              <Input placeholder="Cuci Biasa" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">Harga (Rp)</Label>
              <Input type="number" placeholder="25000" value={price} onChange={(e) => setPrice(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">Durasi</Label>
              <Input placeholder="20 menit" value={duration} onChange={(e) => setDuration(e.target.value)} />
            </div>
            <button onClick={handleSave} className="w-full bg-primary text-primary-foreground font-semibold py-2.5 rounded-xl text-sm">
              {editing ? "Simpan Perubahan" : "Tambah Paket"}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ServicesPage;

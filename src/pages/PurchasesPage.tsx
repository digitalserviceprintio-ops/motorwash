import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ShoppingCart, Plus, Pencil, Trash2, ChevronLeft, Package, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const db = supabase as any;

interface Purchase {
  id: string;
  item_name: string;
  quantity: number;
  unit: string;
  unit_price: number;
  total_price: number;
  supplier: string | null;
  notes: string | null;
  purchase_date: string;
  created_at: string;
}

const PurchasesPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Purchase | null>(null);
  const [detailOpen, setDetailOpen] = useState<Purchase | null>(null);
  const [form, setForm] = useState({ item_name: "", quantity: "1", unit: "pcs", unit_price: "", supplier: "", notes: "", purchase_date: new Date().toISOString().split("T")[0] });

  useEffect(() => { if (user) loadPurchases(); }, [user]);

  const loadPurchases = async () => {
    if (!user) return;
    const { data } = await db.from("purchases").select("*").eq("user_id", user.id).order("purchase_date", { ascending: false });
    if (data) setPurchases(data);
  };

  const resetForm = () => setForm({ item_name: "", quantity: "1", unit: "pcs", unit_price: "", supplier: "", notes: "", purchase_date: new Date().toISOString().split("T")[0] });

  const openAdd = () => { resetForm(); setEditing(null); setDialogOpen(true); };
  const openEdit = (p: Purchase) => {
    setEditing(p);
    setForm({ item_name: p.item_name, quantity: String(p.quantity), unit: p.unit, unit_price: String(p.unit_price), supplier: p.supplier || "", notes: p.notes || "", purchase_date: p.purchase_date });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.item_name || !form.unit_price || !user) return;
    const qty = parseInt(form.quantity) || 1;
    const price = parseInt(form.unit_price) || 0;
    const payload = { user_id: user.id, item_name: form.item_name, quantity: qty, unit: form.unit, unit_price: price, total_price: qty * price, supplier: form.supplier || null, notes: form.notes || null, purchase_date: form.purchase_date };

    if (editing) {
      const { error } = await db.from("purchases").update(payload).eq("id", editing.id);
      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
      toast({ title: "Pembelian diperbarui" });
    } else {
      const { error } = await db.from("purchases").insert(payload);
      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
      toast({ title: "Pembelian ditambahkan" });
    }
    setDialogOpen(false);
    loadPurchases();
  };

  const handleDelete = async (id: string) => {
    await db.from("purchases").delete().eq("id", id);
    toast({ title: "Pembelian dihapus" });
    loadPurchases();
  };

  const formatCurrency = (val: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(val);
  const totalSpending = purchases.reduce((a, b) => a + b.total_price, 0);

  return (
    <div className="page-container">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate("/")} className="w-8 h-8 rounded-xl bg-card border border-border/50 flex items-center justify-center">
            <ChevronLeft className="w-4 h-4 text-foreground" />
          </button>
          <div className="flex items-center gap-2 flex-1">
            <ShoppingCart className="w-5 h-5 text-primary" />
            <h1 className="text-xl font-bold text-foreground">Pembelian Bahan</h1>
          </div>
          <button onClick={openAdd} className="flex items-center gap-1.5 bg-primary text-primary-foreground text-xs font-semibold px-3 py-2 rounded-xl">
            <Plus className="w-4 h-4" /> Tambah
          </button>
        </div>

        {/* Summary */}
        <div className="bg-gradient-to-r from-primary to-accent rounded-2xl p-4 mb-5 text-primary-foreground">
          <p className="text-xs opacity-80">Total Pengeluaran</p>
          <p className="text-2xl font-bold">{formatCurrency(totalSpending)}</p>
          <p className="text-xs opacity-70 mt-1">{purchases.length} item tercatat</p>
        </div>

        {/* List */}
        <div className="space-y-2">
          {purchases.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">Belum ada pembelian</p>}
          {purchases.map((p, i) => (
            <motion.div key={p.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
              className="bg-card rounded-xl p-3.5 border border-border/50 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Package className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0" onClick={() => setDetailOpen(p)}>
                  <p className="text-sm font-semibold text-foreground">{p.item_name}</p>
                  <p className="text-xs text-muted-foreground">{p.quantity} {p.unit} × {formatCurrency(p.unit_price)}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar className="w-3 h-3 text-muted-foreground" />
                    <p className="text-[10px] text-muted-foreground">{new Date(p.purchase_date).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-foreground">{formatCurrency(p.total_price)}</p>
                  <div className="flex gap-1 mt-1.5 justify-end">
                    <button onClick={() => openEdit(p)} className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center"><Pencil className="w-3.5 h-3.5 text-primary" /></button>
                    <button onClick={() => handleDelete(p.id)} className="w-7 h-7 rounded-lg bg-destructive/10 flex items-center justify-center"><Trash2 className="w-3.5 h-3.5 text-destructive" /></button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-sm mx-4">
          <DialogHeader><DialogTitle>{editing ? "Edit Pembelian" : "Tambah Pembelian"}</DialogTitle></DialogHeader>
          <div className="space-y-3 mt-2">
            <div><Label className="text-xs">Nama Barang</Label><Input placeholder="Sabun cuci, shampo, dll" value={form.item_name} onChange={(e) => setForm({ ...form, item_name: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-2">
              <div><Label className="text-xs">Jumlah</Label><Input type="number" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} /></div>
              <div><Label className="text-xs">Satuan</Label><Input placeholder="pcs, liter, kg" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} /></div>
            </div>
            <div><Label className="text-xs">Harga Satuan (Rp)</Label><Input type="number" value={form.unit_price} onChange={(e) => setForm({ ...form, unit_price: e.target.value })} /></div>
            <div><Label className="text-xs">Supplier</Label><Input placeholder="Nama toko/supplier" value={form.supplier} onChange={(e) => setForm({ ...form, supplier: e.target.value })} /></div>
            <div><Label className="text-xs">Tanggal</Label><Input type="date" value={form.purchase_date} onChange={(e) => setForm({ ...form, purchase_date: e.target.value })} /></div>
            <div><Label className="text-xs">Catatan</Label><Input placeholder="Catatan tambahan" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
            <button onClick={handleSave} className="w-full bg-primary text-primary-foreground font-semibold py-2.5 rounded-xl text-sm">{editing ? "Simpan Perubahan" : "Tambah Pembelian"}</button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={!!detailOpen} onOpenChange={() => setDetailOpen(null)}>
        <DialogContent className="max-w-sm mx-4">
          <DialogHeader><DialogTitle>Detail Pembelian</DialogTitle></DialogHeader>
          {detailOpen && (
            <div className="space-y-3 mt-2">
              <div className="bg-muted/50 rounded-xl p-3 space-y-2">
                <div className="flex justify-between"><span className="text-xs text-muted-foreground">Barang</span><span className="text-sm font-semibold text-foreground">{detailOpen.item_name}</span></div>
                <div className="flex justify-between"><span className="text-xs text-muted-foreground">Jumlah</span><span className="text-sm text-foreground">{detailOpen.quantity} {detailOpen.unit}</span></div>
                <div className="flex justify-between"><span className="text-xs text-muted-foreground">Harga Satuan</span><span className="text-sm text-foreground">{formatCurrency(detailOpen.unit_price)}</span></div>
                <div className="flex justify-between border-t border-border pt-2"><span className="text-xs font-semibold text-muted-foreground">Total</span><span className="text-sm font-bold text-primary">{formatCurrency(detailOpen.total_price)}</span></div>
              </div>
              <div className="bg-muted/50 rounded-xl p-3 space-y-2">
                <div className="flex justify-between"><span className="text-xs text-muted-foreground">Supplier</span><span className="text-sm text-foreground">{detailOpen.supplier || "-"}</span></div>
                <div className="flex justify-between"><span className="text-xs text-muted-foreground">Tanggal</span><span className="text-sm text-foreground">{new Date(detailOpen.purchase_date).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</span></div>
                {detailOpen.notes && <div className="flex justify-between"><span className="text-xs text-muted-foreground">Catatan</span><span className="text-sm text-foreground">{detailOpen.notes}</span></div>}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PurchasesPage;

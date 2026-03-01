import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Settings, Store, Clock, MapPin, Phone, Shield, ChevronRight, Droplets, LogOut, Percent, DollarSign } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { ensureBusinessSettings } from "@/lib/supabase-helpers";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const db = supabase as any;

const SettingsPage = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [settings, setSettings] = useState<any>(null);
  const [editDialog, setEditDialog] = useState<{ key: string; label: string; value: string } | null>(null);
  const [editValue, setEditValue] = useState("");
  const [passwordDialog, setPasswordDialog] = useState(false);
  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    if (user) loadSettings();
  }, [user]);

  const loadSettings = async () => {
    if (!user) return;
    const data = await ensureBusinessSettings(user.id);
    setSettings(data);
  };

  const handleSave = async () => {
    if (!editDialog || !user) return;
    await db.from("business_settings").update({ [editDialog.key]: editValue }).eq("user_id", user.id);
    toast({ title: "Berhasil disimpan" });
    setEditDialog(null);
    loadSettings();
  };

  const handleChangePassword = async () => {
    if (!newPassword) return;
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Password diperbarui" });
      setPasswordDialog(false);
      setNewPassword("");
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  const settingsItems = [
    { icon: Store, label: "Nama Usaha", key: "business_name", value: settings?.business_name || "CuciKu Motor Wash", group: "business" },
    { icon: Clock, label: "Jam Operasional", key: "operating_hours", value: settings?.operating_hours || "08:00 - 17:00", group: "business" },
    { icon: MapPin, label: "Alamat", key: "address", value: settings?.address || "Jl. Merdeka No. 123, Jakarta", group: "business" },
    { icon: Phone, label: "Nomor Kontak", key: "phone", value: settings?.phone || "0812-3456-7890", group: "business" },
    { icon: DollarSign, label: "Pajak (%)", key: "tax_rate", value: settings?.tax_rate?.toString() || "0", group: "business" },
    { icon: Percent, label: "Service Charge (%)", key: "service_charge", value: settings?.service_charge?.toString() || "0", group: "business" },
  ];

  return (
    <div className="page-container">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="flex items-center gap-2 mb-6">
          <Settings className="w-5 h-5 text-primary" />
          <h1 className="text-xl font-bold text-foreground">Pengaturan</h1>
        </div>

        {/* Business Profile Card */}
        <div className="bg-card rounded-2xl p-5 border border-border/50 shadow-sm mb-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
            <Droplets className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-lg font-bold text-foreground">{settings?.business_name || "CuciKu Motor Wash"}</h2>
          <p className="text-xs text-muted-foreground mt-1">{settings?.address || "Jl. Merdeka No. 123, Jakarta"}</p>
          <p className="text-xs text-muted-foreground">{user?.email}</p>
        </div>

        {/* Settings Groups */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1 mb-2">Informasi Usaha</p>
          {settingsItems.map((item, i) => (
            <motion.button
              key={item.label}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => { setEditDialog({ key: item.key, label: item.label, value: item.value }); setEditValue(item.value); }}
              className="w-full flex items-center gap-3 bg-card rounded-xl p-3.5 border border-border/50 shadow-sm text-left"
            >
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <item.icon className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{item.label}</p>
                <p className="text-xs text-muted-foreground truncate">{item.value}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
            </motion.button>
          ))}

          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1 mt-6 mb-2">Akun & Keamanan</p>
          
          <motion.button
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => setPasswordDialog(true)}
            className="w-full flex items-center gap-3 bg-card rounded-xl p-3.5 border border-border/50 shadow-sm text-left"
          >
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Shield className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">Keamanan Akun</p>
              <p className="text-xs text-muted-foreground">Ubah password</p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
          </motion.button>

          <motion.button
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => navigate("/layanan")}
            className="w-full flex items-center gap-3 bg-card rounded-xl p-3.5 border border-border/50 shadow-sm text-left"
          >
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Droplets className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">Paket Layanan</p>
              <p className="text-xs text-muted-foreground">Kelola paket cuci motor</p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
          </motion.button>

          <motion.button
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={handleLogout}
            className="w-full flex items-center gap-3 bg-card rounded-xl p-3.5 border border-destructive/30 shadow-sm text-left mt-4"
          >
            <div className="w-9 h-9 rounded-xl bg-destructive/10 flex items-center justify-center shrink-0">
              <LogOut className="w-4 h-4 text-destructive" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-destructive">Keluar</p>
              <p className="text-xs text-muted-foreground">Logout dari akun</p>
            </div>
          </motion.button>
        </div>
      </motion.div>

      {/* Edit Dialog */}
      <Dialog open={!!editDialog} onOpenChange={() => setEditDialog(null)}>
        <DialogContent className="max-w-sm mx-4">
          <DialogHeader>
            <DialogTitle>Edit {editDialog?.label}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            <div>
              <Label className="text-xs">{editDialog?.label}</Label>
              <Input value={editValue} onChange={(e) => setEditValue(e.target.value)} />
            </div>
            <button onClick={handleSave} className="w-full bg-primary text-primary-foreground font-semibold py-2.5 rounded-xl text-sm">
              Simpan
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Password Dialog */}
      <Dialog open={passwordDialog} onOpenChange={setPasswordDialog}>
        <DialogContent className="max-w-sm mx-4">
          <DialogHeader>
            <DialogTitle>Ubah Password</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            <div>
              <Label className="text-xs">Password Baru</Label>
              <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} minLength={6} />
            </div>
            <button onClick={handleChangePassword} className="w-full bg-primary text-primary-foreground font-semibold py-2.5 rounded-xl text-sm">
              Simpan Password
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SettingsPage;

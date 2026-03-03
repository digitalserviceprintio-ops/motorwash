import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Shield, Key, CalendarClock, CheckCircle2, AlertTriangle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const db = supabase as any;

const VALID_LICENSE_KEYS = [
  "CUCIKU-PRO-2026-ABCD",
  "CUCIKU-PRO-2026-EFGH",
  "CUCIKU-PRO-2026-IJKL",
  "CUCIKU-ENTERPRISE-2026-MNOP",
  "CUCIKU-ENTERPRISE-2026-QRST",
];

const LicensePage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [license, setLicense] = useState<any>(null);
  const [licenseKey, setLicenseKey] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) loadLicense();
  }, [user]);

  const loadLicense = async () => {
    if (!user) return;
    const { data } = await db.from("licenses").select("*").eq("user_id", user.id).maybeSingle();
    if (data) {
      setLicense(data);
    } else {
      // Create trial license
      const { data: newLicense } = await db.from("licenses").insert({ user_id: user.id }).select().single();
      setLicense(newLicense);
    }
    setLoading(false);
  };

  const trialDaysLeft = license
    ? Math.max(0, Math.ceil((new Date(license.trial_end).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;

  const isTrialExpired = trialDaysLeft <= 0 && !license?.is_active;
  const isActivated = license?.is_active;

  const handleActivate = async () => {
    if (!licenseKey.trim() || !user) return;
    if (!VALID_LICENSE_KEYS.includes(licenseKey.trim().toUpperCase())) {
      toast({ title: "Lisensi tidak valid", description: "Kunci lisensi yang Anda masukkan tidak ditemukan.", variant: "destructive" });
      return;
    }
    const { error } = await db.from("licenses").update({
      license_key: licenseKey.trim().toUpperCase(),
      is_active: true,
      activated_at: new Date().toISOString(),
    }).eq("user_id", user.id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Lisensi diaktifkan!", description: "Aplikasi Anda sudah aktif sepenuhnya." });
    setLicenseKey("");
    loadLicense();
  };

  if (loading) return <div className="page-container flex items-center justify-center"><p className="text-muted-foreground">Memuat...</p></div>;

  return (
    <div className="page-container">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="flex items-center gap-2 mb-6">
          <Shield className="w-5 h-5 text-primary" />
          <h1 className="text-xl font-bold text-foreground">Lisensi Aplikasi</h1>
        </div>

        {/* Status Card */}
        <div className={`rounded-2xl p-5 border shadow-sm mb-6 text-center ${
          isActivated ? "bg-success/10 border-success/30" : isTrialExpired ? "bg-destructive/10 border-destructive/30" : "bg-warning/10 border-warning/30"
        }`}>
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-3" style={{
            background: isActivated ? "hsl(var(--success) / 0.15)" : isTrialExpired ? "hsl(var(--destructive) / 0.15)" : "hsl(var(--warning) / 0.15)"
          }}>
            {isActivated ? <CheckCircle2 className="w-8 h-8 text-success" /> : isTrialExpired ? <AlertTriangle className="w-8 h-8 text-destructive" /> : <CalendarClock className="w-8 h-8 text-warning" />}
          </div>
          <h2 className="text-lg font-bold text-foreground">
            {isActivated ? "Lisensi Aktif" : isTrialExpired ? "Trial Berakhir" : "Masa Trial"}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {isActivated
              ? `Diaktifkan pada ${new Date(license.activated_at).toLocaleDateString("id-ID")}`
              : isTrialExpired
              ? "Masa trial 30 hari Anda telah berakhir"
              : `${trialDaysLeft} hari tersisa dari 30 hari trial`}
          </p>
          {isActivated && license.license_key && (
            <p className="text-xs text-muted-foreground mt-2 font-mono">Key: {license.license_key}</p>
          )}
        </div>

        {/* Trial Progress */}
        {!isActivated && (
          <div className="bg-card rounded-2xl p-4 border border-border/50 shadow-sm mb-6">
            <p className="text-xs font-semibold text-muted-foreground mb-2">Progress Trial</p>
            <div className="w-full bg-muted rounded-full h-2.5">
              <div
                className="h-2.5 rounded-full transition-all"
                style={{
                  width: `${Math.max(0, ((30 - trialDaysLeft) / 30) * 100)}%`,
                  background: isTrialExpired ? "hsl(var(--destructive))" : "hsl(var(--primary))"
                }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">{30 - trialDaysLeft} dari 30 hari terpakai</p>
          </div>
        )}

        {/* Activation Form */}
        {!isActivated && (
          <div className="bg-card rounded-2xl p-5 border border-border/50 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Key className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-bold text-foreground">Aktivasi Lisensi</h3>
            </div>
            <div className="space-y-3">
              <div>
                <Label className="text-xs">Kunci Lisensi</Label>
                <Input
                  placeholder="CUCIKU-PRO-2026-XXXX"
                  value={licenseKey}
                  onChange={(e) => setLicenseKey(e.target.value.toUpperCase())}
                  className="font-mono"
                />
              </div>
              <button
                onClick={handleActivate}
                className="w-full bg-primary text-primary-foreground font-semibold py-2.5 rounded-xl text-sm"
              >
                Aktifkan Lisensi
              </button>
              <p className="text-[11px] text-muted-foreground text-center">
                Hubungi admin untuk mendapatkan kunci lisensi
              </p>
            </div>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 bg-card rounded-2xl p-5 border border-border/50 shadow-sm">
          <h3 className="text-sm font-bold text-foreground mb-3">Fitur Lisensi</h3>
          <div className="space-y-2">
            {[
              { label: "Kelola antrian tanpa batas", included: true },
              { label: "Export laporan PDF & Excel", included: isActivated },
              { label: "Manajemen promo & diskon", included: isActivated },
              { label: "Koneksi printer thermal", included: isActivated },
              { label: "Backup data otomatis", included: isActivated },
              { label: "Dukungan prioritas", included: isActivated },
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-2">
                <CheckCircle2 className={`w-4 h-4 ${f.included ? "text-success" : "text-muted-foreground/30"}`} />
                <span className={`text-xs ${f.included ? "text-foreground" : "text-muted-foreground"}`}>{f.label}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LicensePage;

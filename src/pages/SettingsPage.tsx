import { motion } from "framer-motion";
import { Settings, Store, Clock, MapPin, Phone, Shield, ChevronRight, Droplets } from "lucide-react";

const settingsItems = [
  { icon: Store, label: "Nama Usaha", value: "CuciKu Motor Wash", group: "business" },
  { icon: Clock, label: "Jam Operasional", value: "08:00 - 17:00", group: "business" },
  { icon: MapPin, label: "Alamat", value: "Jl. Merdeka No. 123, Jakarta", group: "business" },
  { icon: Phone, label: "Nomor Kontak", value: "0812-3456-7890", group: "business" },
  { icon: Shield, label: "Keamanan Akun", value: "Ubah password", group: "account" },
  { icon: Droplets, label: "Paket Layanan", value: "5 paket aktif", group: "services" },
];

const SettingsPage = () => {
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
          <h2 className="text-lg font-bold text-foreground">CuciKu Motor Wash</h2>
          <p className="text-xs text-muted-foreground mt-1">Jl. Merdeka No. 123, Jakarta</p>
        </div>

        {/* Settings Groups */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1 mb-2">
            Informasi Usaha
          </p>
          {settingsItems
            .filter((s) => s.group === "business")
            .map((item, i) => (
              <motion.button
                key={item.label}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
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

          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1 mt-6 mb-2">
            Akun & Keamanan
          </p>
          {settingsItems
            .filter((s) => s.group === "account" || s.group === "services")
            .map((item, i) => (
              <motion.button
                key={item.label}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: (i + 4) * 0.05 }}
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
        </div>
      </motion.div>
    </div>
  );
};

export default SettingsPage;

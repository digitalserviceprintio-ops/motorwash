import { useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, ListOrdered, Receipt, BarChart3, Settings } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

const navItems = [
  { path: "/", icon: LayoutDashboard, label: "Dashboard" },
  { path: "/antrian", icon: ListOrdered, label: "Antrian" },
  { path: "/laporan", icon: BarChart3, label: "Laporan" },
  { path: "/pengaturan", icon: Settings, label: "Pengaturan" },
];

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const isTransaksiActive = location.pathname === "/transaksi";

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
            onClick={() => setMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      <nav className="fixed bottom-0 left-0 right-0 z-50 px-2 pb-safe">
        <div className="max-w-lg mx-auto relative">
          {/* Floating Action Button - Transaksi */}
          <div className="absolute left-1/2 -translate-x-1/2 -top-6 z-10">
            <AnimatePresence>
              {menuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 20, scale: 0.8 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  className="absolute bottom-16 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
                >
                  {[
                    { label: "Semua Transaksi", action: () => navigate("/transaksi") },
                    { label: "Transaksi Lunas", action: () => navigate("/transaksi") },
                  ].map((item, i) => (
                    <motion.button
                      key={item.label}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      onClick={() => {
                        item.action();
                        setMenuOpen(false);
                      }}
                      className="whitespace-nowrap px-4 py-2.5 rounded-full bg-card border border-border/50 shadow-lg text-sm font-medium text-foreground hover:bg-accent transition-colors"
                    >
                      {item.label}
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                if (menuOpen) {
                  setMenuOpen(false);
                } else {
                  navigate("/transaksi");
                }
              }}
              onContextMenu={(e) => {
                e.preventDefault();
                setMenuOpen(!menuOpen);
              }}
              className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-colors border-4 border-background ${
                isTransaksiActive || menuOpen
                  ? "bg-primary text-primary-foreground"
                  : "bg-primary/90 text-primary-foreground"
              }`}
            >
              <motion.div
                animate={{ rotate: menuOpen ? 45 : 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <Receipt className="w-6 h-6" />
              </motion.div>
            </motion.button>
          </div>

          {/* Bottom bar */}
          <div className="bg-card border-t border-border/60 rounded-t-2xl flex items-center justify-around pt-2 pb-1">
            {navItems.map((item, index) => {
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`relative flex flex-col items-center py-1 px-3 min-w-0 flex-1 ${
                    index >= 2 ? "ml-8" : index === 1 ? "mr-8" : ""
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute -top-2 w-8 h-1 rounded-full bg-primary"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <item.icon
                    className={`w-5 h-5 transition-colors ${
                      isActive ? "text-primary" : "text-muted-foreground"
                    }`}
                  />
                  <span
                    className={`text-[10px] mt-0.5 font-medium transition-colors ${
                      isActive ? "text-primary" : "text-muted-foreground"
                    }`}
                  >
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>
    </>
  );
};

export default BottomNav;

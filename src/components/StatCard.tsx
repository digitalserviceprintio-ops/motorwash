import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  subtitle?: string;
  variant?: "default" | "gradient";
}

const StatCard = ({ icon: Icon, label, value, subtitle, variant = "default" }: StatCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl p-4 ${
        variant === "gradient"
          ? "stat-card-gradient"
          : "bg-card border border-border/50 shadow-sm"
      }`}
    >
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${
        variant === "gradient"
          ? "bg-primary-foreground/20"
          : "bg-primary/10"
      }`}>
        <Icon className={`w-5 h-5 ${
          variant === "gradient" ? "text-primary-foreground" : "text-primary"
        }`} />
      </div>
      <p className={`text-xs font-medium mb-1 ${
        variant === "gradient" ? "text-primary-foreground/80" : "text-muted-foreground"
      }`}>
        {label}
      </p>
      <p className={`text-xl font-bold ${
        variant === "gradient" ? "text-primary-foreground" : "text-foreground"
      }`}>
        {value}
      </p>
      {subtitle && (
        <p className={`text-xs mt-1 ${
          variant === "gradient" ? "text-primary-foreground/70" : "text-muted-foreground"
        }`}>
          {subtitle}
        </p>
      )}
    </motion.div>
  );
};

export default StatCard;

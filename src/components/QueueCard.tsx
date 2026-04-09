import { motion } from "framer-motion";
import { Clock, Phone, User, Bike, Hash } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface QueueItem {
  id: string;
  queueNumber?: string;
  name: string;
  phone: string;
  plate: string;
  service: string;
  status: "waiting" | "processing" | "done" | "cancelled";
  estimatedTime: string;
  createdAt: string;
}

const statusConfig = {
  waiting: { label: "Menunggu", className: "bg-warning/15 text-warning border-warning/30" },
  processing: { label: "Diproses", className: "bg-info/15 text-info border-info/30" },
  done: { label: "Selesai", className: "bg-success/15 text-success border-success/30" },
  cancelled: { label: "Dibatalkan", className: "bg-destructive/15 text-destructive border-destructive/30" },
};

interface QueueCardProps {
  item: QueueItem;
  onStatusChange: (id: string, status: QueueItem["status"]) => void;
  index: number;
}

const nextStatus: Record<string, QueueItem["status"]> = {
  waiting: "processing",
  processing: "done",
};

const QueueCard = ({ item, onStatusChange, index }: QueueCardProps) => {
  const config = statusConfig[item.status];
  const canAdvance = item.status === "waiting" || item.status === "processing";

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-card rounded-2xl p-4 border border-border/50 shadow-sm"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            {item.queueNumber && (
              <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-md">
                {item.queueNumber}
              </span>
            )}
            <User className="w-4 h-4 text-muted-foreground" />
            <span className="font-semibold text-sm text-foreground">{item.name}</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Phone className="w-3 h-3" />
              {item.phone}
            </span>
            <span className="flex items-center gap-1">
              <Bike className="w-3 h-3" />
              {item.plate}
            </span>
          </div>
        </div>
        <Badge variant="outline" className={`text-[10px] font-semibold border ${config.className}`}>
          {config.label}
        </Badge>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-primary">{item.service}</p>
          <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
            <Clock className="w-3 h-3" />
            Est. {item.estimatedTime}
          </p>
        </div>
        {canAdvance && (
          <button
            onClick={() => onStatusChange(item.id, nextStatus[item.status])}
            className="text-xs font-semibold bg-primary text-primary-foreground px-4 py-2 rounded-xl hover:opacity-90 transition-opacity"
          >
            {item.status === "waiting" ? "Mulai" : "Selesai"}
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default QueueCard;

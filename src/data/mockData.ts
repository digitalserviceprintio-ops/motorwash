import { QueueItem } from "@/components/QueueCard";

export const mockQueue: QueueItem[] = [
  { id: "1", name: "Budi Santoso", phone: "0812-3456-7890", plate: "B 1234 ABC", service: "Cuci + Wax", status: "processing", estimatedTime: "30 menit", createdAt: "09:15" },
  { id: "2", name: "Andi Pratama", phone: "0856-7890-1234", plate: "D 5678 DEF", service: "Cuci Biasa", status: "waiting", estimatedTime: "20 menit", createdAt: "09:30" },
  { id: "3", name: "Sari Dewi", phone: "0878-1234-5678", plate: "F 9012 GHI", service: "Paket Premium", status: "waiting", estimatedTime: "45 menit", createdAt: "09:45" },
  { id: "4", name: "Rudi Hermawan", phone: "0821-5678-9012", plate: "B 3456 JKL", service: "Cuci Mesin", status: "done", estimatedTime: "35 menit", createdAt: "08:30" },
  { id: "5", name: "Lisa Anggraini", phone: "0813-9012-3456", plate: "D 7890 MNO", service: "Cuci Detail", status: "done", estimatedTime: "40 menit", createdAt: "08:00" },
];

export const mockTransactions = [
  { id: "T001", customer: "Budi Santoso", service: "Cuci + Wax", amount: 50000, status: "paid" as const, method: "Cash", date: "2026-03-01" },
  { id: "T002", customer: "Rudi Hermawan", service: "Cuci Mesin", amount: 75000, status: "paid" as const, method: "QRIS", date: "2026-03-01" },
  { id: "T003", customer: "Lisa Anggraini", service: "Cuci Detail", amount: 100000, status: "paid" as const, method: "Transfer", date: "2026-03-01" },
  { id: "T004", customer: "Andi Pratama", service: "Cuci Biasa", amount: 25000, status: "unpaid" as const, method: "Cash", date: "2026-03-01" },
  { id: "T005", customer: "Sari Dewi", service: "Paket Premium", amount: 150000, status: "unpaid" as const, method: "E-wallet", date: "2026-03-01" },
];

export const mockServices = [
  { id: "S1", name: "Cuci Biasa", price: 25000, duration: "20 menit", active: true },
  { id: "S2", name: "Cuci + Wax", price: 50000, duration: "30 menit", active: true },
  { id: "S3", name: "Cuci Detail", price: 100000, duration: "40 menit", active: true },
  { id: "S4", name: "Cuci Mesin", price: 75000, duration: "35 menit", active: true },
  { id: "S5", name: "Paket Premium", price: 150000, duration: "45 menit", active: true },
];

export const weeklyRevenue = [
  { day: "Sen", revenue: 450000 },
  { day: "Sel", revenue: 380000 },
  { day: "Rab", revenue: 520000 },
  { day: "Kam", revenue: 410000 },
  { day: "Jum", revenue: 690000 },
  { day: "Sab", revenue: 850000 },
  { day: "Min", revenue: 720000 },
];

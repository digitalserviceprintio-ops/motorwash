import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Printer, Droplets } from "lucide-react";
import { useRef } from "react";

interface ReceiptData {
  id: string;
  customer: string;
  service: string;
  amount: number;
  method: string;
  date: string;
  businessName?: string;
  address?: string;
  phone?: string;
}

interface ReceiptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: ReceiptData | null;
}

const ReceiptDialog = ({ open, onOpenChange, data }: ReceiptDialogProps) => {
  const receiptRef = useRef<HTMLDivElement>(null);

  if (!data) return null;

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(val);

  const handlePrint = () => {
    const content = receiptRef.current;
    if (!content) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`
      <html><head><title>Struk</title>
      <style>
        body { font-family: 'Courier New', monospace; padding: 20px; max-width: 300px; margin: 0 auto; }
        .center { text-align: center; }
        .bold { font-weight: bold; }
        .divider { border-top: 1px dashed #333; margin: 8px 0; }
        .row { display: flex; justify-content: space-between; font-size: 12px; margin: 4px 0; }
        h2 { margin: 4px 0; font-size: 16px; }
        p { margin: 2px 0; font-size: 11px; }
      </style></head><body>
        ${content.innerHTML}
        <script>window.print(); window.close();</script>
      </body></html>
    `);
    printWindow.document.close();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xs mx-4">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Printer className="w-4 h-4" /> Struk Pembayaran
          </DialogTitle>
        </DialogHeader>
        <div ref={receiptRef} className="bg-card rounded-xl p-4 border border-border/50 font-mono text-xs">
          <div className="center text-center mb-3">
            <div className="flex justify-center mb-2">
              <Droplets className="w-6 h-6 text-primary" />
            </div>
            <h2 className="bold font-bold text-sm">{data.businessName || "CuciKu Motor Wash"}</h2>
            <p className="text-muted-foreground">{data.address || "Jl. Merdeka No. 123, Jakarta"}</p>
            <p className="text-muted-foreground">{data.phone || "0812-3456-7890"}</p>
          </div>
          <div className="divider border-t border-dashed border-border my-2" />
          <div className="row flex justify-between"><span>No. Transaksi</span><span>{data.id.slice(0, 8).toUpperCase()}</span></div>
          <div className="row flex justify-between"><span>Tanggal</span><span>{data.date}</span></div>
          <div className="divider border-t border-dashed border-border my-2" />
          <div className="row flex justify-between"><span>Pelanggan</span><span>{data.customer}</span></div>
          <div className="row flex justify-between"><span>Layanan</span><span>{data.service}</span></div>
          <div className="row flex justify-between"><span>Metode</span><span>{data.method}</span></div>
          <div className="divider border-t border-dashed border-border my-2" />
          <div className="row flex justify-between font-bold text-sm">
            <span>Total</span><span>{formatCurrency(data.amount)}</span>
          </div>
          <div className="divider border-t border-dashed border-border my-2" />
          <p className="text-center text-muted-foreground mt-2">Terima kasih telah menggunakan layanan kami!</p>
        </div>
        <button onClick={handlePrint} className="w-full bg-primary text-primary-foreground font-semibold py-2.5 rounded-xl text-sm flex items-center justify-center gap-2 mt-2">
          <Printer className="w-4 h-4" /> Cetak Struk
        </button>
      </DialogContent>
    </Dialog>
  );
};

export default ReceiptDialog;

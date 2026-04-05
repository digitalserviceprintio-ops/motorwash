import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Printer, Droplets } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const db = supabase as any;

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
  queueNumber?: string;
}

interface ReceiptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: ReceiptData | null;
}

const ReceiptDialog = ({ open, onOpenChange, data }: ReceiptDialogProps) => {
  const receiptRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const [footnote, setFootnote] = useState("");
  const [promos, setPromos] = useState<any[]>([]);

  useEffect(() => {
    if (open && user) loadPromos();
  }, [open, user]);

  const loadPromos = async () => {
    if (!user) return;
    const { data: promoData } = await db
      .from("promos")
      .select("*")
      .eq("user_id", user.id)
      .eq("active", true)
      .limit(3);
    if (promoData && promoData.length > 0) {
      const lines = promoData.map((p: any) => {
        const disc = p.discount_type === "percent" ? `${p.discount_value}%` : `Rp ${p.discount_value.toLocaleString("id-ID")}`;
        const until = p.valid_until ? ` s/d ${new Date(p.valid_until).toLocaleDateString("id-ID")}` : "";
        return `Kode: ${p.code} - Diskon ${disc}${until}`;
      });
      setFootnote(lines.join("\n"));
    } else {
      setFootnote("");
    }
    setPromos(promoData || []);
  };

  if (!data) return null;

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(val);

  const handlePrint = () => {
    const content = receiptRef.current;
    if (!content) return;

    // Check if Bluetooth printer is connected
    const printerType = localStorage.getItem("cuciku_printer_type");
    const printerId = localStorage.getItem("cuciku_printer");

    if (printerType === "bluetooth" && printerId) {
      // For Bluetooth, use ESC/POS-style text approach
      handleBluetoothPrint();
      return;
    }

    // Fallback: browser print
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
        .footnote { margin-top: 8px; padding-top: 8px; border-top: 1px dashed #333; font-size: 10px; text-align: center; white-space: pre-line; }
      </style></head><body>
        ${content.innerHTML}
        <script>window.print(); window.close();<\/script>
      </body></html>
    `);
    printWindow.document.close();
  };

  const handleBluetoothPrint = async () => {
    try {
      const device = await (navigator as any).bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: ["000018f0-0000-1000-8000-00805f9b34fb", "e7810a71-73ae-499d-8c15-faa9aef0c3f2"],
      });
      const server = await device.gatt?.connect();
      if (!server) return;

      // Try common thermal printer services
      const serviceUUIDs = ["000018f0-0000-1000-8000-00805f9b34fb", "e7810a71-73ae-499d-8c15-faa9aef0c3f2"];
      let characteristic: any = null;

      for (const uuid of serviceUUIDs) {
        try {
          const service = await server.getPrimaryService(uuid);
          const chars = await service.getCharacteristics();
          characteristic = chars.find((c: any) => c.properties.write || c.properties.writeWithoutResponse);
          if (characteristic) break;
        } catch { /* try next */ }
      }

      if (!characteristic) {
        // Fallback to browser print
        handlePrint();
        return;
      }

      const encoder = new TextEncoder();
      const lines = [
        "\x1B\x40", // Initialize
        "\x1B\x61\x01", // Center align
        `${data.businessName || "CuciKu Motor Wash"}\n`,
        `${data.address || ""}\n`,
        `${data.phone || ""}\n`,
        "================================\n",
        "\x1B\x61\x00", // Left align
        `No: ${data.id.slice(0, 8).toUpperCase()}\n`,
        `Tgl: ${data.date}\n`,
        "--------------------------------\n",
        `Pelanggan: ${data.customer}\n`,
        `Layanan: ${data.service}\n`,
        `Metode: ${data.method}\n`,
        "--------------------------------\n",
        `TOTAL: ${formatCurrency(data.amount)}\n`,
        "================================\n",
        "\x1B\x61\x01",
        "Terima kasih!\n",
      ];

      if (footnote) {
        lines.push("--------------------------------\n");
        lines.push(footnote + "\n");
      }

      lines.push("\n\n\n\x1D\x56\x00"); // Feed + cut

      const text = lines.join("");
      const bytes = encoder.encode(text);

      // Send in chunks of 20 bytes
      for (let i = 0; i < bytes.length; i += 20) {
        const chunk = bytes.slice(i, i + 20);
        await characteristic.writeValue(chunk);
      }

      server.disconnect();
    } catch {
      // Fallback to browser print on any error
      const printWindow = window.open("", "_blank");
      if (!printWindow) return;
      const content = receiptRef.current;
      if (!content) return;
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
          .footnote { margin-top: 8px; padding-top: 8px; border-top: 1px dashed #333; font-size: 10px; text-align: center; white-space: pre-line; }
        </style></head><body>
          ${content.innerHTML}
          <script>window.print(); window.close();<\/script>
        </body></html>
      `);
      printWindow.document.close();
    }
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
          {data.queueNumber && (
            <div className="row flex justify-between font-bold"><span>No. Antrian</span><span className="text-primary">{data.queueNumber}</span></div>
          )}
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
          {footnote && (
            <div className="footnote border-t border-dashed border-border mt-2 pt-2 text-center text-[10px] text-muted-foreground whitespace-pre-line">
              <p className="font-semibold text-foreground mb-1">🎉 Promo</p>
              {footnote}
            </div>
          )}
        </div>
        <button onClick={handlePrint} className="w-full bg-primary text-primary-foreground font-semibold py-2.5 rounded-xl text-sm flex items-center justify-center gap-2 mt-2">
          <Printer className="w-4 h-4" /> Cetak Struk
        </button>
      </DialogContent>
    </Dialog>
  );
};

export default ReceiptDialog;

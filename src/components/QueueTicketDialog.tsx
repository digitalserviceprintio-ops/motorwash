import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Printer, Download, Droplets } from "lucide-react";
import { useRef } from "react";
import { toPng } from "html-to-image";
import { useToast } from "@/hooks/use-toast";

export interface QueueTicketData {
  queueNumber: string;
  name: string;
  plate: string;
  phone?: string;
  service: string;
  createdAt: string; // formatted time
  date?: string;
  businessName?: string;
  address?: string;
  estimatedTime?: string;
  // Ticket format settings
  title?: string;
  logoUrl?: string;
  footer?: string;
  fontSize?: "small" | "medium" | "large";
  showAddress?: boolean;
  showPhone?: boolean;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: QueueTicketData | null;
}

const QueueTicketDialog = ({ open, onOpenChange, data }: Props) => {
  const ticketRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  if (!data) return null;

  const handleDownload = async () => {
    if (!ticketRef.current) return;
    try {
      const dataUrl = await toPng(ticketRef.current, { pixelRatio: 2, backgroundColor: "#ffffff" });
      const link = document.createElement("a");
      link.download = `tiket-antrian-${data.queueNumber}.png`;
      link.href = dataUrl;
      link.click();
      toast({ title: "Tiket diunduh", description: `${data.queueNumber} berhasil disimpan` });
    } catch (e: any) {
      toast({ title: "Gagal unduh", description: e.message, variant: "destructive" });
    }
  };

  const handlePrint = async () => {
    const printerType = localStorage.getItem("cuciku_printer_type");
    const printerId = localStorage.getItem("cuciku_printer");

    if (printerType === "bluetooth" && printerId) {
      try {
        const device = await (navigator as any).bluetooth.requestDevice({
          acceptAllDevices: true,
          optionalServices: ["000018f0-0000-1000-8000-00805f9b34fb", "e7810a71-73ae-499d-8c15-faa9aef0c3f2"],
        });
        const server = await device.gatt?.connect();
        if (!server) return;
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
          browserPrint();
          return;
        }
        const encoder = new TextEncoder();
        const lines = [
          "\x1B\x40",
          "\x1B\x61\x01", // center
          `${data.businessName || "CuciKu Motor Wash"}\n`,
          ...(data.showAddress !== false && data.address ? [`${data.address}\n`] : []),
          "================================\n",
          `${data.title || "TIKET ANTRIAN"}\n`,
          "\x1B\x21\x30", // double size
          `${data.queueNumber}\n`,
          "\x1B\x21\x00", // normal
          "================================\n",
          "\x1B\x61\x00", // left
          `Nama    : ${data.name}\n`,
          `Plat    : ${data.plate}\n`,
          ...(data.showPhone && data.phone ? [`HP      : ${data.phone}\n`] : []),
          `Layanan : ${data.service}\n`,
          `Masuk   : ${data.createdAt}\n`,
          ...(data.estimatedTime ? [`Estimasi: ${data.estimatedTime}\n`] : []),
          "--------------------------------\n",
          "\x1B\x61\x01",
          `${data.footer || "Mohon menunggu giliran Anda"}\n`,
          "Terima kasih!\n",
          "\n\n\n\x1D\x56\x00",
        ];
        const bytes = encoder.encode(lines.join(""));
        for (let i = 0; i < bytes.length; i += 20) {
          await characteristic.writeValue(bytes.slice(i, i + 20));
        }
        server.disconnect();
        toast({ title: "Tiket dicetak", description: data.queueNumber });
        return;
      } catch {
        browserPrint();
      }
    } else {
      browserPrint();
    }
  };

  const browserPrint = () => {
    const content = ticketRef.current;
    if (!content) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`
      <html><head><title>Tiket Antrian ${data.queueNumber}</title>
      <style>
        body { font-family: 'Courier New', monospace; padding: 20px; max-width: 320px; margin: 0 auto; }
        .center { text-align: center; }
        .qnum { font-size: 56px; font-weight: 900; letter-spacing: 4px; margin: 12px 0; }
        .row { display: flex; justify-content: space-between; font-size: 13px; margin: 6px 0; }
        .divider { border-top: 1px dashed #333; margin: 10px 0; }
        h2 { margin: 4px 0; font-size: 16px; }
        p { margin: 2px 0; font-size: 12px; }
      </style></head><body>${content.innerHTML}
      <script>window.print(); window.close();<\/script>
      </body></html>
    `);
    w.document.close();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xs mx-4">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Printer className="w-4 h-4" /> Tiket Antrian
          </DialogTitle>
        </DialogHeader>
        <div ref={ticketRef} className="bg-card rounded-xl p-4 border border-border/50 font-mono text-xs">
          <div className="center text-center mb-2">
            <div className="flex justify-center mb-1">
              <Droplets className="w-6 h-6 text-primary" />
            </div>
            <h2 className="font-bold text-sm">{data.businessName || "CuciKu Motor Wash"}</h2>
            {data.address && <p className="text-muted-foreground">{data.address}</p>}
          </div>
          <div className="divider border-t border-dashed border-border my-2" />
          <p className="text-center text-[11px] text-muted-foreground">NOMOR ANTRIAN</p>
          <p className="qnum text-center text-5xl font-extrabold text-primary tracking-widest my-2">
            {data.queueNumber}
          </p>
          <div className="divider border-t border-dashed border-border my-2" />
          <div className="row flex justify-between"><span>Nama</span><span className="font-semibold">{data.name}</span></div>
          <div className="row flex justify-between"><span>Plat Motor</span><span className="font-semibold">{data.plate || "-"}</span></div>
          {data.phone && <div className="row flex justify-between"><span>No. HP</span><span>{data.phone}</span></div>}
          <div className="row flex justify-between"><span>Layanan</span><span>{data.service}</span></div>
          <div className="row flex justify-between"><span>Waktu Masuk</span><span>{data.createdAt}</span></div>
          {data.estimatedTime && <div className="row flex justify-between"><span>Estimasi</span><span>{data.estimatedTime}</span></div>}
          <div className="divider border-t border-dashed border-border my-2" />
          <p className="text-center text-muted-foreground">Mohon menunggu giliran Anda</p>
          <p className="text-center text-muted-foreground">Terima kasih 🙏</p>
        </div>
        <div className="grid grid-cols-2 gap-2 mt-2">
          <button onClick={handleDownload} className="bg-card border border-border text-foreground font-semibold py-2.5 rounded-xl text-sm flex items-center justify-center gap-2">
            <Download className="w-4 h-4" /> Unduh
          </button>
          <button onClick={handlePrint} className="bg-primary text-primary-foreground font-semibold py-2.5 rounded-xl text-sm flex items-center justify-center gap-2">
            <Printer className="w-4 h-4" /> Cetak
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QueueTicketDialog;

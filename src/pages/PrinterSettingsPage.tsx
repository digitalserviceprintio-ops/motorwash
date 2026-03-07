import { useState } from "react";
import { motion } from "framer-motion";
import { Printer, Bluetooth, Wifi, Usb, ChevronLeft, Check, RefreshCw, Smartphone, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface PrinterDevice {
  id: string;
  name: string;
  type: "bluetooth" | "wifi" | "usb";
  connected: boolean;
  device?: any;
}

const PrinterSettingsPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [scanning, setScanning] = useState(false);
  const [printers, setPrinters] = useState<PrinterDevice[]>([]);
  const [connectedPrinter, setConnectedPrinter] = useState<string | null>(
    localStorage.getItem("cuciku_printer") || null
  );
  const [paperSize, setPaperSize] = useState(localStorage.getItem("cuciku_paper_size") || "58mm");
  const [autoPrint, setAutoPrint] = useState(localStorage.getItem("cuciku_auto_print") === "true");
  const [btSupported] = useState(() => typeof navigator !== "undefined" && "bluetooth" in (navigator as any));
  const [testPrinting, setTestPrinting] = useState(false);

  const handleBluetoothScan = async () => {
    if (!btSupported) {
      toast({ title: "Bluetooth tidak didukung", description: "Gunakan Chrome di Android atau desktop.", variant: "destructive" });
      return;
    }
    setScanning(true);
    try {
      const device = await (navigator as any).bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: ["000018f0-0000-1000-8000-00805f9b34fb", "e7810a71-73ae-499d-8c15-faa9aef0c3f2"],
      });
      if (device) {
        const newPrinter: PrinterDevice = {
          id: device.id,
          name: device.name || "Bluetooth Printer",
          type: "bluetooth",
          connected: false,
          device,
        };
        setPrinters((prev) => {
          const exists = prev.find((p) => p.id === device.id);
          return exists ? prev : [...prev, newPrinter];
        });
        toast({ title: "Perangkat ditemukan", description: device.name || "Bluetooth Printer" });
      }
    } catch (err: any) {
      if (err.name !== "NotFoundError") {
        toast({ title: "Gagal scan", description: err.message, variant: "destructive" });
      }
    }
    setScanning(false);
  };

  const handleSimulatedScan = () => {
    setScanning(true);
    setTimeout(() => {
      setPrinters((prev) => [
        ...prev.filter((p) => p.type === "bluetooth"),
        { id: "wifi-1", name: "Epson TM-T82X (Wi-Fi)", type: "wifi", connected: false },
        { id: "usb-1", name: "USB POS Printer", type: "usb", connected: false },
      ]);
      setScanning(false);
    }, 1500);
  };

  const handleConnect = async (printer: PrinterDevice) => {
    if (printer.type === "bluetooth" && printer.device) {
      try {
        const server = await printer.device.gatt?.connect();
        if (server) {
          toast({ title: "Terhubung via Bluetooth", description: `${printer.name} siap digunakan` });
        }
      } catch (err: any) {
        toast({ title: "Gagal menghubungkan", description: err.message, variant: "destructive" });
        return;
      }
    }
    setConnectedPrinter(printer.id);
    localStorage.setItem("cuciku_printer", printer.id);
    localStorage.setItem("cuciku_printer_name", printer.name);
    localStorage.setItem("cuciku_printer_type", printer.type);
    toast({ title: "Printer terhubung", description: `Berhasil terhubung ke ${printer.name}` });
  };

  const handleDisconnect = () => {
    const bt = printers.find((p) => p.id === connectedPrinter && p.device);
    if (bt?.device?.gatt?.connected) bt.device.gatt.disconnect();
    setConnectedPrinter(null);
    localStorage.removeItem("cuciku_printer");
    localStorage.removeItem("cuciku_printer_name");
    localStorage.removeItem("cuciku_printer_type");
    toast({ title: "Printer terputus" });
  };

  const handlePaperSize = (size: string) => { setPaperSize(size); localStorage.setItem("cuciku_paper_size", size); };
  const handleAutoPrint = () => { const v = !autoPrint; setAutoPrint(v); localStorage.setItem("cuciku_auto_print", String(v)); };

  const handleTestPrint = () => {
    const printerType = localStorage.getItem("cuciku_printer_type");
    if (printerType === "bluetooth") {
      handleBluetoothTestPrint();
    } else {
      window.print();
      toast({ title: "Test print dikirim" });
    }
  };

  const handleBluetoothTestPrint = async () => {
    if (!btSupported) {
      toast({ title: "Bluetooth tidak didukung", variant: "destructive" });
      return;
    }
    setTestPrinting(true);
    try {
      const device = await (navigator as any).bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: ["000018f0-0000-1000-8000-00805f9b34fb", "e7810a71-73ae-499d-8c15-faa9aef0c3f2"],
      });
      const server = await device.gatt?.connect();
      if (!server) { setTestPrinting(false); return; }

      const serviceUUIDs = ["000018f0-0000-1000-8000-00805f9b34fb", "e7810a71-73ae-499d-8c15-faa9aef0c3f2"];
      let characteristic: any = null;

      for (const uuid of serviceUUIDs) {
        try {
          const service = await server.getPrimaryService(uuid);
          const chars = await service.getCharacteristics();
          characteristic = chars.find((c: any) => c.properties.write || c.properties.writeWithoutResponse);
          if (characteristic) break;
        } catch { /* next */ }
      }

      if (!characteristic) {
        toast({ title: "Gagal menemukan karakteristik printer", variant: "destructive" });
        server.disconnect();
        setTestPrinting(false);
        return;
      }

      const encoder = new TextEncoder();
      const now = new Date().toLocaleString("id-ID");
      const text = [
        "\x1B\x40",
        "\x1B\x61\x01",
        "================================\n",
        "     TEST PRINT - CuciKu\n",
        "================================\n",
        "\x1B\x61\x00",
        `Waktu: ${now}\n`,
        `Kertas: ${paperSize}\n`,
        `Printer: ${device.name || "BT Printer"}\n`,
        "--------------------------------\n",
        "\x1B\x61\x01",
        "Printer terhubung dengan baik!\n",
        "================================\n",
        "\n\n\n\x1D\x56\x00",
      ].join("");

      const bytes = encoder.encode(text);
      for (let i = 0; i < bytes.length; i += 20) {
        await characteristic.writeValue(bytes.slice(i, i + 20));
      }

      server.disconnect();
      toast({ title: "Test print Bluetooth berhasil!", description: `Dikirim ke ${device.name}` });
    } catch (err: any) {
      toast({ title: "Gagal test print", description: err.message, variant: "destructive" });
    }
    setTestPrinting(false);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "bluetooth": return Bluetooth;
      case "wifi": return Wifi;
      default: return Usb;
    }
  };

  return (
    <div className="page-container">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate("/pengaturan")} className="w-8 h-8 rounded-xl bg-card border border-border/50 flex items-center justify-center">
            <ChevronLeft className="w-4 h-4 text-foreground" />
          </button>
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-primary" />
            <h1 className="text-xl font-bold text-foreground">Pengaturan Printer</h1>
          </div>
        </div>

        {/* Connected Printer */}
        {connectedPrinter && (
          <div className="bg-success/10 border border-success/30 rounded-2xl p-4 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-success" />
                <div>
                  <p className="text-sm font-semibold text-foreground">{localStorage.getItem("cuciku_printer_name") || "Printer"}</p>
                  <p className="text-xs text-muted-foreground">Terhubung via {localStorage.getItem("cuciku_printer_type") || "unknown"}</p>
                </div>
              </div>
              <button onClick={handleDisconnect} className="text-xs text-destructive font-medium px-3 py-1.5 rounded-lg bg-destructive/10">Putuskan</button>
            </div>
          </div>
        )}

        {/* Bluetooth Scan */}
        <div className="space-y-2 mb-4">
          <button onClick={handleBluetoothScan} disabled={scanning}
            className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground font-semibold py-3 rounded-xl text-sm">
            <Bluetooth className={`w-4 h-4 ${scanning ? "animate-pulse" : ""}`} />
            {scanning ? "Mencari perangkat..." : "Cari Printer Bluetooth"}
          </button>
          {!btSupported && (
            <div className="flex items-start gap-2 bg-warning/10 border border-warning/30 rounded-xl p-3">
              <Smartphone className="w-4 h-4 text-warning shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground">Web Bluetooth tidak tersedia. Gunakan <strong>Chrome</strong> di Android atau desktop.</p>
            </div>
          )}
          <button onClick={handleSimulatedScan} disabled={scanning}
            className="w-full flex items-center justify-center gap-2 bg-card text-foreground font-semibold py-3 rounded-xl text-sm border border-border/50">
            <RefreshCw className={`w-4 h-4 ${scanning ? "animate-spin" : ""}`} />
            Cari Printer Wi-Fi / USB
          </button>
        </div>

        {/* Found Printers */}
        {printers.length > 0 && (
          <div className="mb-6">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1 mb-2">Printer Ditemukan</p>
            <div className="space-y-2">
              {printers.map((printer, i) => {
                const Icon = getTypeIcon(printer.type);
                const isConnected = connectedPrinter === printer.id;
                return (
                  <motion.div key={printer.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-3 bg-card rounded-xl p-3.5 border border-border/50 shadow-sm">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center"><Icon className="w-4 h-4 text-primary" /></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{printer.name}</p>
                      <p className="text-xs text-muted-foreground capitalize">{printer.type}</p>
                    </div>
                    <button onClick={() => isConnected ? handleDisconnect() : handleConnect(printer)}
                      className={`text-xs font-semibold px-3 py-1.5 rounded-lg ${isConnected ? "bg-success/10 text-success" : "bg-primary/10 text-primary"}`}>
                      {isConnected ? "Terhubung" : "Hubungkan"}
                    </button>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* Paper Size */}
        <div className="mb-6">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1 mb-2">Ukuran Kertas</p>
          <div className="flex gap-2">
            {["58mm", "80mm", "A4"].map((size) => (
              <button key={size} onClick={() => handlePaperSize(size)}
                className={`flex-1 text-sm font-medium py-2.5 rounded-xl transition-colors ${paperSize === size ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground border border-border/50"}`}>
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* Auto Print */}
        <div className="bg-card rounded-xl p-3.5 border border-border/50 shadow-sm mb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Auto Print</p>
              <p className="text-xs text-muted-foreground">Cetak struk otomatis saat transaksi selesai</p>
            </div>
            <button onClick={handleAutoPrint} className={`w-11 h-6 rounded-full transition-colors relative ${autoPrint ? "bg-primary" : "bg-muted"}`}>
              <div className={`w-5 h-5 rounded-full bg-white shadow absolute top-0.5 transition-transform ${autoPrint ? "translate-x-5" : "translate-x-0.5"}`} />
            </button>
          </div>
        </div>

        {/* Test Print Buttons */}
        <div className="space-y-2">
          <button onClick={handleTestPrint} disabled={testPrinting}
            className="w-full flex items-center justify-center gap-2 bg-card text-foreground font-semibold py-3 rounded-xl text-sm border border-border/50">
            <Printer className="w-4 h-4" /> {testPrinting ? "Mengirim..." : "Test Print"}
          </button>
          {btSupported && (
            <button onClick={handleBluetoothTestPrint} disabled={testPrinting}
              className="w-full flex items-center justify-center gap-2 bg-primary/10 text-primary font-semibold py-3 rounded-xl text-sm border border-primary/30">
              <Bluetooth className={`w-4 h-4 ${testPrinting ? "animate-pulse" : ""}`} />
              <FileText className="w-4 h-4" />
              {testPrinting ? "Mengirim ke Bluetooth..." : "Test Print Bluetooth"}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default PrinterSettingsPage;

// Web Bluetooth API type declarations
interface BluetoothDevice {
  id: string;
  name?: string;
  gatt?: BluetoothRemoteGATTServer;
}

interface BluetoothRemoteGATTServer {
  connected: boolean;
  connect(): Promise<BluetoothRemoteGATTServer>;
  disconnect(): void;
}

interface BluetoothRequestDeviceOptions {
  acceptAllDevices?: boolean;
  optionalServices?: string[];
  filters?: Array<{ services?: string[]; name?: string; namePrefix?: string }>;
}

interface Navigator {
  bluetooth: {
    requestDevice(options: BluetoothRequestDeviceOptions): Promise<BluetoothDevice>;
  };
}

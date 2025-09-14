import { useState } from "react";
import { BarcodeScanner } from "../BarcodeScanner";
import { Button } from "@/components/ui/button";

export default function BarcodeScannerExample() {
  const [showScanner, setShowScanner] = useState(false);
  const [lastScanned, setLastScanned] = useState<string>("");

  const handleScan = (barcode: string) => {
    console.log('Barcode scanned:', barcode);
    setLastScanned(barcode);
    setShowScanner(false);
  };

  const handleClose = () => {
    setShowScanner(false);
  };

  return (
    <div className="p-4 space-y-4">
      {!showScanner && (
        <>
          <Button onClick={() => setShowScanner(true)} data-testid="button-open-scanner">
            Open Barcode Scanner
          </Button>
          {lastScanned && (
            <p className="text-sm">Last scanned: <code>{lastScanned}</code></p>
          )}
        </>
      )}
      
      {showScanner && (
        <BarcodeScanner onScan={handleScan} onClose={handleClose} />
      )}
    </div>
  );
}